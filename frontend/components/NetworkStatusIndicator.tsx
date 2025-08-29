import React from 'react';
import { usePWA } from '../hooks/usePWA';

interface NetworkStatusIndicatorProps {
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  pendingChanges?: number;
  onSync?: () => void;
}

const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  syncStatus = 'idle',
  pendingChanges = 0,
  onSync
}) => {
  const { isOnline, updateAvailable, updateServiceWorker } = usePWA();

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: 1000
    }}>
      {/* Network status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        backgroundColor: isOnline ? '#d4edda' : '#f8d7da',
        color: isOnline ? '#155724' : '#721c24'
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          marginRight: '8px',
          backgroundColor: isOnline ? '#28a745' : '#dc3545'
        }}></span>
        {isOnline ? 'Online' : 'Offline'}
      </div>
      
      {/* Sync status */}
      {syncStatus !== 'idle' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          backgroundColor: '#d1ecf1',
          color: '#0c5460'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            marginRight: '8px',
            backgroundColor: syncStatus === 'syncing' ? '#ffc107' : '#28a745'
          }}></span>
          {syncStatus === 'syncing' ? 'Syncing...' : 
           syncStatus === 'success' ? 'Sync complete' : 'Sync failed'}
        </div>
      )}
      
      {/* Pending changes */}
      {pendingChanges > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          backgroundColor: '#e2e3e5',
          color: '#383d41'
        }}>
          {pendingChanges} pending change{pendingChanges !== 1 ? 's' : ''}
        </div>
      )}
      
      {/* Update available */}
      {updateAvailable && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          backgroundColor: '#fff3cd',
          color: '#856404'
        }}>
          Update available
          <button 
            onClick={updateServiceWorker}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginLeft: '10px'
            }}
          >
            Update
          </button>
        </div>
      )}
      
      {/* Manual sync button */}
      {!isOnline && pendingChanges > 0 && (
        <button 
          onClick={onSync} 
          disabled={syncStatus === 'syncing'}
          style={{
            backgroundColor: syncStatus === 'syncing' ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            marginTop: '5px'
          }}
        >
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync when online'}
        </button>
      )}
    </div>
  );
};

export default NetworkStatusIndicator;