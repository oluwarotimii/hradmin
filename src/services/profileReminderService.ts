import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
}

export interface EligibleStaff {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  designation?: string;
  department?: string;
  profile_completion: number;
  must_change_password: boolean;
  reason: string;
  email_status?: string;
}

export interface PreviewResponse {
  success: boolean;
  data: {
    total: number;
    must_change_password_count: number;
    incomplete_profile_count: number;
    staff: EligibleStaff[];
  };
}

export interface SendResponse {
  success: boolean;
  message: string;
  data: {
    sent: number;
    failed: number;
    total: number;
    staff: (EligibleStaff & { email_status: string })[];
  };
}

export const getEligibleStaff = async (): Promise<PreviewResponse> => {
  const response = await axios.get(`${API_ENDPOINT}/profile-reminder/preview`, getAuthHeaders());
  return response.data;
};

export const sendReminder = async (subject: string, message: string): Promise<SendResponse> => {
  const response = await axios.post(`${API_ENDPOINT}/profile-reminder/send`, { subject, message }, getAuthHeaders());
  return response.data;
};
