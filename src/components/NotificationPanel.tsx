// This component renders a slide-out notification panel
// It displays system notifications with read/unread status and allows marking them as read

// Import React hooks for state management
import { useState } from 'react';
// Import Lucide React icons for UI elements
import { X, Bell, Check } from 'lucide-react';
// Import notification data and types from staff data
import { mockNotifications, Notification } from '../data/staffData';

// Interface defining props for the NotificationPanel component
interface NotificationPanelProps {
  isOpen?: boolean; // Whether the panel is open (defaults to true)
  onClose: () => void; // Function to call when closing the panel
}

// Main component function for notification panel
export function NotificationPanel({ isOpen = true, onClose }: NotificationPanelProps) {
  // State for notifications array
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  // Calculate count of unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Handler to mark a specific notification as read
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Handler to mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Main render return
  return (
    <>
      {/* Overlay backdrop that closes panel when clicked */}
      <div
        className="notification-overlay"
        onClick={onClose}
      ></div>

      {/* Main notification panel */}
      <div className="notification-panel">
        {/* Panel header */}
        <div className="notification-header">
          {/* Header content with bell icon and title */}
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" style={{ color: '#2563eb' }} />
            <div>
              <h3 style={{ marginBottom: '0.125rem' }}>Notifications</h3>
              <p className="text-xs text-muted">{unreadCount} unread</p>
            </div>
          </div>
          {/* Header actions */}
          <div className="flex items-center gap-2">
            {/* Mark all as read button - only shown if there are unread notifications */}
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-ghost"
                onClick={markAllAsRead}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                <Check className="w-3 h-3 mr-1" />
                Mark all read
              </button>
            )}
            {/* Close button */}
            <button className="btn btn-ghost btn-icon" style={{ width: '2rem', height: '2rem' }} onClick={onClose}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications list container */}
        <div className="notification-list">
          {/* Empty state when no notifications */}
          {notifications.length === 0 ? (
            <div className="notification-empty">
              <Bell className="w-12 h-12" style={{ color: '#e5e7eb' }} />
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>No notifications</p>
            </div>
          ) : (
            // Map through notifications to create notification items
            notifications.map((notification) => (
              // Individual notification item
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                {/* Unread indicator */}
                <div className="notification-indicator">
                  {!notification.read && <div className="notification-dot"></div>}
                </div>
                {/* Notification content */}
                <div className="notification-content">
                  {/* Header with staff name and timestamp */}
                  <div className="flex items-start justify-between gap-2" style={{ marginBottom: '0.25rem' }}>
                    <p style={{ fontWeight: notification.read ? 400 : 600, fontSize: '0.875rem' }}>
                      {notification.staffName}
                    </p>
                    <span className="text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>
                      {notification.timestamp}
                    </span>
                  </div>
                  {/* Action description */}
                  <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
                    {notification.action}
                  </p>
                  {/* Additional details */}
                  <p className="text-xs text-muted">{notification.details}</p>
                  {/* Section badge */}
                  <div className="notification-badge" style={{ marginTop: '0.5rem' }}>
                    {notification.section}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}