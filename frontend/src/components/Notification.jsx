import React from 'react';

/**
 * Notification Toast Component
 * Usage: <Notification notifications={[]} onRemove={(id) => {}} />
 */
const Notification = ({ notifications, onRemove }) => {
  return (
    <div className="notification-container" role="alert" aria-live="polite">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`notification notification-${notif.type}`}
          onClick={() => onRemove(notif.id)}
          title="Click to dismiss"
        >
          <span className="notification-icon">
            {notif.type === 'success' && '✅'}
            {notif.type === 'error' && '❌'}
            {notif.type === 'info' && 'ℹ️'}
          </span>
          <div className="notification-body">
            <div className="notification-title">
              {notif.type === 'success' && 'Success'}
              {notif.type === 'error' && 'Error'}
              {notif.type === 'info' && 'Info'}
            </div>
            <div className="notification-message">{notif.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;
