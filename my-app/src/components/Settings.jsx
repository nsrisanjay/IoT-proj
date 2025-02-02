// components/Settings.js
import React from 'react';
import './Settings.css';

function Settings() {
  const handleSave = () => {
    // Handle saving settings
    alert('Settings saved!');
  };

  return (
    <div className="settings">
      <h1>Settings</h1>
      <form onSubmit={handleSave}>
        <label>
          AWS Region:
          <input type="text" name="region" defaultValue="us-east-1" />
        </label>
        <br />
        <label>
          Identity Pool ID:
          <input type="text" name="identityPoolId" defaultValue="us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
        </label>
        <br />
        <button type="submit">Save Settings</button>
      </form>
    </div>
  );
}

export default Settings;
