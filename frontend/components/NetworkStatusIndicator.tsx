import React from 'react';
import { usePWA } from '../hooks/usePWA';
import 'styled-jsx';

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
    <div className="network-status-indicator">
      <style jsx>{`
        .network-status-indicator {
          position: fixed;
          bottom: 20px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 1000;
        }
        
        .status-badge {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .online {
          background-color: #d4edda;
          color: #155724;
        }
        
        .offline {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .sync-status {
          background-color: #d1ecf1;
          color: #0c5460;
        }
        
        .update-available {
          background-color: #fff3cd;
          color: #856404;
        }
        
        .pending-changes {
          background-color: #e2e3e5;
          color: #383d41;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
        }
        
        .dot-online {
          background-color: #28a745;
        }
        
        .dot-offline {
          background-color: #dc3545;
        }
        
        .dot-syncing {
          background-color: #ffc107;
        }
        
        .sync-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 5px;
        }
        
        .sync-button:hover {
          background-color: #0056b3;
        }
        
        .sync-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
      
      {/* Network status */}
      <div className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
        <span className={`status-dot dot-${isOnline ? 'online' : 'offline'}`}></span>
        {isOnline ? 'Online' : 'Offline'}
      </div>
      
      {/* Sync status */}
      {syncStatus !== 'idle' && (
        <div className="status-badge sync-status">
          <span className={`status-dot dot-${syncStatus === 'syncing' ? 'syncing' : 'online'}`}></span>
          {syncStatus === 'syncing' ? 'Syncing...' : 
           syncStatus === 'success' ? 'Sync complete' : 'Sync failed'}
        </div>
      )}
      
      {/* Pending changes */}
      {pendingChanges > 0 && (
        <div className="status-badge pending-changes">
          {pendingChanges} pending change{pendingChanges !== 1 ? 's' : ''}
        </div>
      )}
      
      {/* Update available */}
      {updateAvailable && (
        <div className="status-badge update-available">
          Update available
          <button className="sync-button" onClick={updateServiceWorker}>
            Update
          </button>
        </div>
      )}
      
      {/* Manual sync button */}
      {!isOnline && pendingChanges > 0 && (
        <button className="sync-button" onClick={onSync} disabled={syncStatus === 'syncing'}>
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync when online'}
        </button>
      )}
    </div>
  );
};

export default NetworkStatusIndicator;