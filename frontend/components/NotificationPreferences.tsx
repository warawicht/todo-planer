import React, { useState, useEffect } from 'react';

interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  taskRemindersEnabled: boolean;
  timeBlockAlertsEnabled: boolean;
  deadlineWarningsEnabled: boolean;
  productivitySummariesEnabled: boolean;
  systemAlertsEnabled: boolean;
}

const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    taskRemindersEnabled: true,
    timeBlockAlertsEnabled: true,
    deadlineWarningsEnabled: true,
    productivitySummariesEnabled: true,
    systemAlertsEnabled: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // In a real implementation, this would fetch preferences from the API
  useEffect(() => {
    // Simulate fetching preferences
    const fetchPreferences = async () => {
      // This would be an API call in a real implementation
      const mockPreferences: NotificationPreferences = {
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        taskRemindersEnabled: true,
        timeBlockAlertsEnabled: true,
        deadlineWarningsEnabled: true,
        productivitySummariesEnabled: true,
        systemAlertsEnabled: true,
      };
      setPreferences(mockPreferences);
    };

    fetchPreferences();
  }, []);

  const handleChange = (field: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // In a real implementation, this would be an API call
      // await api.put('/notification-preferences', preferences);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="notification-preferences">
      <h2>Notification Preferences</h2>
      
      <div className="preference-section">
        <h3>Notification Channels</h3>
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.emailEnabled}
              onChange={(e) => handleChange('emailEnabled', e.target.checked)}
            />
            Email Notifications
          </label>
        </div>
        
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.pushEnabled}
              onChange={(e) => handleChange('pushEnabled', e.target.checked)}
            />
            Push Notifications
          </label>
        </div>
        
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.inAppEnabled}
              onChange={(e) => handleChange('inAppEnabled', e.target.checked)}
            />
            In-App Notifications
          </label>
        </div>
      </div>
      
      <div className="preference-section">
        <h3>Quiet Hours</h3>
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.quietHoursEnabled}
              onChange={(e) => handleChange('quietHoursEnabled', e.target.checked)}
            />
            Enable Quiet Hours
          </label>
        </div>
        
        {preferences.quietHoursEnabled && (
          <div className="quiet-hours-settings">
            <div className="time-input">
              <label>Start Time:</label>
              <input
                type="time"
                value={preferences.quietHoursStart}
                onChange={(e) => handleChange('quietHoursStart', e.target.value)}
              />
            </div>
            
            <div className="time-input">
              <label>End Time:</label>
              <input
                type="time"
                value={preferences.quietHoursEnd}
                onChange={(e) => handleChange('quietHoursEnd', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="preference-section">
        <h3>Notification Types</h3>
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.taskRemindersEnabled}
              onChange={(e) => handleChange('taskRemindersEnabled', e.target.checked)}
            />
            Task Reminders
          </label>
        </div>
        
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.timeBlockAlertsEnabled}
              onChange={(e) => handleChange('timeBlockAlertsEnabled', e.target.checked)}
            />
            Time Block Alerts
          </label>
        </div>
        
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.deadlineWarningsEnabled}
              onChange={(e) => handleChange('deadlineWarningsEnabled', e.target.checked)}
            />
            Deadline Warnings
          </label>
        </div>
        
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.productivitySummariesEnabled}
              onChange={(e) => handleChange('productivitySummariesEnabled', e.target.checked)}
            />
            Productivity Summaries
          </label>
        </div>
        
        <div className="preference-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.systemAlertsEnabled}
              onChange={(e) => handleChange('systemAlertsEnabled', e.target.checked)}
            />
            System Alerts
          </label>
        </div>
      </div>
      
      <div className="save-section">
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="save-button"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
        {saveSuccess && <span className="success-message">Preferences saved successfully!</span>}
      </div>
      
      <style jsx>{`
        .notification-preferences {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .preference-section {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 4px;
        }
        
        .preference-section h3 {
          margin-top: 0;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        
        .preference-item {
          margin: 15px 0;
        }
        
        .preference-item label {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .preference-item input[type="checkbox"] {
          margin-right: 10px;
        }
        
        .quiet-hours-settings {
          margin-top: 15px;
          padding-left: 20px;
        }
        
        .time-input {
          margin: 10px 0;
        }
        
        .time-input label {
          display: inline-block;
          width: 100px;
          margin-right: 10px;
        }
        
        .time-input input {
          padding: 5px;
          border: 1px solid #ddd;
          border-radius: 3px;
        }
        
        .save-section {
          text-align: center;
          margin-top: 30px;
        }
        
        .save-button {
          padding: 10px 20px;
          background-color: #4a76d4;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .save-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .success-message {
          margin-left: 15px;
          color: #28a745;
        }
      `}</style>
    </div>
  );
};

export default NotificationPreferences;