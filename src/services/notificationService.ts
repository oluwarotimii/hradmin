import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  created_at: string;
  opened_at: string | null;
}

function authHeaders() {
  const token = localStorage.getItem('authToken');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// GET /api/notifications/my-notifications
export const getMyNotifications = async (limit: number = 30): Promise<{
  success: boolean;
  notifications?: AppNotification[];
  message?: string;
}> => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/notifications/my-notifications`, {
      headers: authHeaders(),
      params: { limit },
    });
    return { success: true, notifications: response.data?.data?.notifications ?? [] };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Failed to load notifications' };
  }
};

// PATCH /api/notifications/:id/read
export const markNotificationAsRead = async (id: number): Promise<{ success: boolean; message?: string }> => {
  try {
    await axios.patch(`${API_ENDPOINT}/notifications/${id}/read`, {}, { headers: authHeaders() });
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Failed to mark notification as read' };
  }
};

// POST /api/notifications/broadcast — gated by notifications:broadcast.
// Pass recipientUserIds omitted/empty to send to every active staff member.
export const sendSpecialNote = async (
  title: string,
  message: string,
  recipientUserIds?: number[]
): Promise<{ success: boolean; sentCount?: number; message?: string }> => {
  try {
    const response = await axios.post(
      `${API_ENDPOINT}/notifications/broadcast`,
      { title, message, recipientUserIds },
      { headers: authHeaders() }
    );
    return { success: true, sentCount: response.data?.data?.sentCount, message: response.data?.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Failed to send note' };
  }
};
