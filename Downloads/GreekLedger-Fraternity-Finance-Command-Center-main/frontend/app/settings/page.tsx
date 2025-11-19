'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('/api/settings', settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleSendTestReminder = async () => {
    try {
      const response = await axios.post('/api/notifications/send-bulk-reminders');
      toast.success(`Sent reminders to ${response.data.results.length} members`);
    } catch (error) {
      toast.error('Failed to send reminders');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Chapter Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Chapter Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Chapter Name</label>
              <input
                type="text"
                className="input"
                value={settings?.chapterName || ''}
                onChange={(e) => setSettings({ ...settings, chapterName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Semester Dues Amount</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={settings?.semesterDuesAmount || 0}
                onChange={(e) => setSettings({ ...settings, semesterDuesAmount: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Minimum Reserve Threshold</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={settings?.minReserveThreshold || 0}
                onChange={(e) => setSettings({ ...settings, minReserveThreshold: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Late Fee Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Late Fee Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Late Fee Percentage (0-1, e.g., 0.05 for 5%)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={settings?.lateFeePercentage || 0}
                onChange={(e) => setSettings({ ...settings, lateFeePercentage: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Grace Period (days)</label>
              <input
                type="number"
                className="input"
                value={settings?.lateFeeGracePeriod || 0}
                onChange={(e) => setSettings({ ...settings, lateFeeGracePeriod: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Email Notification Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Email Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailEnabled"
                className="mr-3 h-4 w-4"
                checked={settings?.emailEnabled || false}
                onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
              />
              <label htmlFor="emailEnabled" className="font-medium">Enable Email Notifications</label>
            </div>
            {settings?.emailEnabled && (
              <>
                <div>
                  <label className="label">SMTP Host</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., smtp.gmail.com"
                    value={settings?.emailHost || ''}
                    onChange={(e) => setSettings({ ...settings, emailHost: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">SMTP Port</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="587 or 465"
                    value={settings?.emailPort || ''}
                    onChange={(e) => setSettings({ ...settings, emailPort: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Email Username</label>
                  <input
                    type="email"
                    className="input"
                    value={settings?.emailUser || ''}
                    onChange={(e) => setSettings({ ...settings, emailUser: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Email Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={settings?.emailPassword || ''}
                    onChange={(e) => setSettings({ ...settings, emailPassword: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Discord Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Discord Integration</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="discordEnabled"
                className="mr-3 h-4 w-4"
                checked={settings?.discordEnabled || false}
                onChange={(e) => setSettings({ ...settings, discordEnabled: e.target.checked })}
              />
              <label htmlFor="discordEnabled" className="font-medium">Enable Discord Notifications</label>
            </div>
            {settings?.discordEnabled && (
              <>
                <div>
                  <label className="label">Discord Bot Token</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="Your Discord bot token"
                    value={settings?.discordBotToken || ''}
                    onChange={(e) => setSettings({ ...settings, discordBotToken: e.target.value })}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Create a bot at{' '}
                    <a
                      href="https://discord.com/developers/applications"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      Discord Developer Portal
                    </a>
                  </p>
                </div>
                <div>
                  <label className="label">Discord Channel ID</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Channel ID for notifications"
                    value={settings?.discordChannelId || ''}
                    onChange={(e) => setSettings({ ...settings, discordChannelId: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reminder Frequency */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Reminder Settings</h2>
          <div>
            <label className="label">Reminder Frequency</label>
            <select
              className="input"
              value={settings?.reminderFrequency || 'WEEKLY'}
              onChange={(e) => setSettings({ ...settings, reminderFrequency: e.target.value })}
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleSendTestReminder}
              className="btn-secondary"
            >
              Send Test Reminder Now
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button type="submit" className="btn-primary">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

