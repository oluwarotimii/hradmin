// This component renders a slide-out notification panel
// It displays real notifications (from notification_logs, via the backend)
// with read/unread status and allows marking them as read

import { useEffect, useState } from 'react';
import { X, Bell, Check } from 'lucide-react';
import { AppNotification, getMyNotifications, markNotificationAsRead } from '../services/notificationService';

interface NotificationPanelProps {
  isOpen?: boolean; // Whether the panel is open (defaults to true)
  onClose: () => void; // Function to call when closing the panel
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}

// Turns "leave_request_approved" into "Leave Request Approved" for the section badge.
function humanizeType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function NotificationPanel({ isOpen = true, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const unreadCount = notifications.filter((n) => !n.opened_at).length;

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getMyNotifications(30).then((res) => {
      if (res.success) setNotifications(res.notifications ?? []);
      setLoading(false);
    });
  }, [isOpen]);

  const markAsRead = (id: number) => {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.opened_at) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, opened_at: new Date().toISOString() } : n))
    );
    markNotificationAsRead(id);
  };

  const markAllAsRead = () => {
    const unread = notifications.filter((n) => !n.opened_at);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, opened_at: n.opened_at ?? new Date().toISOString() }))
    );
    unread.forEach((n) => markNotificationAsRead(n.id));
  };

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
          {loading ? (
            <div className="notification-empty">
              <p className="text-muted">Loading…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <Bell className="w-12 h-12" style={{ color: '#e5e7eb' }} />
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.opened_at ? 'unread' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                {/* Unread indicator */}
                <div className="notification-indicator">
                  {!notification.opened_at && <div className="notification-dot"></div>}
                </div>
                {/* Notification content */}
                <div className="notification-content">
                  {/* Header with title and timestamp */}
                  <div className="flex items-start justify-between gap-2" style={{ marginBottom: '0.25rem' }}>
                    <p style={{ fontWeight: notification.opened_at ? 400 : 600, fontSize: '0.875rem' }}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>
                      {timeAgo(notification.created_at)}
                    </span>
                  </div>
                  {/* Message body */}
                  <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
                    {notification.message}
                  </p>
                  {/* Notification type badge */}
                  <div className="notification-badge" style={{ marginTop: '0.5rem' }}>
                    {humanizeType(notification.notification_type)}
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
