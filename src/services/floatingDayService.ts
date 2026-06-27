import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

export interface FloatingDayRequest {
  id: number;
  user_id: number;
  time_off_bank_id: number;
  program_name?: string;
  user_name?: string;
  date: string;
  reason: string | null;
  status: 'pending' | 'cleared' | 'approved' | 'rejected' | 'cancelled';
  cleared_by: number | null;
  cleared_by_name?: string;
  cleared_at: string | null;
  approved_by: number | null;
  approved_by_name?: string;
  approved_at: string | null;
  rejected_by: number | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

const authHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export const floatingDayService = {
  getAll: async (params?: { status?: string }): Promise<{ success: boolean; data?: { requests: FloatingDayRequest[] }; message?: string }> => {
    try {
      const response = await axios.get(`${API_ENDPOINT}/floating-days`, { ...authHeaders(), params });
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch requests' };
    }
  },

  getCleared: async (): Promise<{ success: boolean; data?: { requests: FloatingDayRequest[] }; message?: string }> => {
    try {
      const response = await axios.get(`${API_ENDPOINT}/floating-days/cleared`, authHeaders());
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch cleared requests' };
    }
  },

  approve: async (id: number): Promise<{ success: boolean; message: string; data?: { requestId: number } }> => {
    try {
      const response = await axios.put(`${API_ENDPOINT}/floating-days/${id}/approve`, {}, authHeaders());
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to approve request' };
    }
  },

  reject: async (id: number, rejection_reason: string): Promise<{ success: boolean; message: string; data?: { requestId: number } }> => {
    try {
      const response = await axios.put(`${API_ENDPOINT}/floating-days/${id}/reject`, { rejection_reason }, authHeaders());
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to reject request' };
    }
  },
};
