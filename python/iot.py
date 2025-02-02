import adafruit_dht
import board
from mfrc522 import SimpleMFRC522
import RPi.GPIO as GPIO
import time
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import json
import random
import hashlib

# Initialize AWS IoT client
client = AWSIoTMQTTClient("RaspberryPiClient")
client.configureEndpoint("al7os2hrhzii1-ats.iot.us-east-1.amazonaws.com", 8883)
client.configureCredentials(
    "/home/saketh/AgriProject/AmazonRootCA1.pem",
    "/home/saketh/AgriProject/da551083848343e65e79db2c891b366f7f6401150e7f838be1c3033fc3978000-private.pem.key",
    "/home/saketh/AgriProject/da551083848343e65e79db2c891b366f7f6401150e7f838be1c3033fc3978000-certificate.pem.crt"
)

client.configureOfflinePublishQueueing(-1)  # Infinite offline publish queueing
client.configureDrainingFrequency(2)  # Draining: 2 Hz
client.configureConnectDisconnectTimeout(10)  # 10 sec
client.configureMQTTOperationTimeout(5)  # 5 sec

# Connect to AWS IoT
client.connect()

# Initialize the DHT sensor
dht_device = adafruit_dht.DHT11(board.D4)  # DHT11 data pin connected to GPIO4

# Configure HW198 sensor alert pin
HW198_ALERT_PIN = 18  # Alert pin connected to GPIO 17
GPIO.setmode(GPIO.BCM)
GPIO.setup(HW198_ALERT_PIN, GPIO.IN)

# Initialize the RFID reader
rfid_reader = SimpleMFRC522()

# Define registered RFID tag UIDs (replace with actual UIDs)
registered_uids = ["291982990831"]  # Example UIDs

# Signal handler for cleanup
def cleanup():
    GPIO.cleanup()
    print("Cleaned up GPIO and exited.")

# Function to publish data to AWS IoT
def publish_to_aws(temperature, humidity, gas_alert, token_balance, token_id):
    data = {
        "temperature": temperature,
        "humidity": humidity,
        "gas_alert": gas_alert,
        "timestamp": int(time.time()),
        "token_balance": token_balance,
        "token_id": token_id,  # Include random hash token ID
          }
    client.publish("sensor/data", json.dumps(data), 1)
    print("Published data to AWS IoT:", data)

class TokenSimulator:
    def __init__(self):
        self.associated_account = "8Hmk5Kn1dHRU7xZV7CZGk2sPbzt4KQeL4f83N6Wn9TfS"
        self.balance = 0
        self.decimals = 9

    def mint_tokens(self, amount):
        self.balance += amount
        print(f"Minting {amount} tokens to {self.associated_account}.")

    def check_balance(self):
        return self.balance

    def generate_random_token_id(self):
        # Generate a random string and hash it to create a token ID
        random_string = str(random.random()).encode('utf-8')
        token_id = hashlib.sha256(random_string).hexdigest()
        return token_id  # Return the random hash as the token ID

try:
    print("Waiting for a registered RFID tag to start sensor readings...")

    # Wait until a registered RFID tag is detected
    data_transfer_started = False
    while not data_transfer_started:
        uid = rfid_reader.read_id_no_block()  # Non-blocking read
        if uid:
            uid_str = str(uid)
            print("RFID tag detected with UID:", uid_str)
            
            if uid_str in registered_uids:
                print("Registered tag detected. Starting data transfer...")
                data_transfer_started = True
            else:
                print("Unregistered tag. Data transfer will not start.")

    # Initialize the token simulator
    token_simulator = TokenSimulator()

    # Main loop for reading sensor data and publishing to AWS IoT once a registered RFID tag is detected
    while data_transfer_started:
        try:
            # Read DHT11 sensor data
            temperature = dht_device.temperature
            humidity = dht_device.humidity
            if humidity is not None and temperature is not None:
                print(f"DHT11 - Temperature: {temperature:.1f}°C, Humidity: {humidity:.1f}%")

            # Check HW198 sensor alert signal with stabilization
            gas_alert = False
            alert_start_time = None
            while GPIO.input(HW198_ALERT_PIN) == GPIO.HIGH:
                if alert_start_time is None:
                    alert_start_time = time.time()
                elif time.time() - alert_start_time > 2:  # Alert high for more than 2 seconds
                    gas_alert = True
                    print("HW198 Alert: Gas level detected above threshold!")
                    break
            else:
                print("HW198: Gas level below threshold")

            # Mint tokens and check balance
            token_simulator.mint_tokens(random.randint(50, 150))  # Mint between 50 to 150 tokens
            token_balance = token_simulator.check_balance()
            token_id = token_simulator.generate_random_token_id()  # Get a random token ID

            # Publish the data to AWS IoT
            publish_to_aws(temperature, humidity, gas_alert, token_balance, token_id)

            # Delay between sensor readings
            time.sleep(2)

        except RuntimeError as error:
            print("DHT sensor reading error:", error.args[0])
        except KeyboardInterrupt:
            print("Program interrupted.")
            cleanup()
            break

except KeyboardInterrupt:
    print("Program interrupted.")
    cleanup()
finally:
    cleanup()


