import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

export interface LeavePolicySettings {
  id?: number;
  exclude_sundays_from_leave: boolean;
  created_at?: string;
  updated_at?: string;
}

export const getLeavePolicy = async (): Promise<{ success: boolean; settings?: LeavePolicySettings; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'Authentication token not found. Please log in again.' };
    }

    const response = await axios.get(`${API_ENDPOINT}/leave-policy`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      settings: response.data.data?.settings || response.data.settings,
    };
  } catch (error: any) {
    console.error('Error fetching leave policy:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch leave policy',
    };
  }
};

export const updateLeavePolicy = async (excludeSundaysFromLeave: boolean): Promise<{ success: boolean; settings?: LeavePolicySettings; message?: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'Authentication token not found. Please log in again.' };
    }

    const response = await axios.patch(`${API_ENDPOINT}/leave-policy`, {
      settings: {
        exclude_sundays_from_leave: excludeSundaysFromLeave,
      },
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      settings: response.data.data?.settings || response.data.settings,
      message: response.data.message || 'Leave policy updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating leave policy:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update leave policy',
    };
  }
};
