// src/services/shiftSchedulingService.ts

import { apiServices } from './apiServices';
import {
  ShiftTemplate,
  CreateShiftTemplateRequest,
  UpdateShiftTemplateRequest,
  EmployeeShiftAssignment,
  AssignShiftToEmployeeRequest,
  UpdateEmployeeShiftAssignmentRequest,
  ScheduleRequest,
  CreateScheduleRequestRequest,
  UpdateScheduleRequestRequest,
  TimeOffBank,
  CreateTimeOffBankRequest,
  ShiftException,
  CreateShiftExceptionRequest,
  UpdateShiftExceptionRequest,
  ApiResponse
} from './apiInterfaces';

export type {
  ShiftTemplate,
  CreateShiftTemplateRequest,
  UpdateShiftTemplateRequest,
  EmployeeShiftAssignment,
  AssignShiftToEmployeeRequest,
  UpdateEmployeeShiftAssignmentRequest,
  ScheduleRequest,
  CreateScheduleRequestRequest,
  UpdateScheduleRequestRequest,
  TimeOffBank,
  CreateTimeOffBankRequest,
  ShiftException,
  CreateShiftExceptionRequest,
  UpdateShiftExceptionRequest,
  ApiResponse
};

class ShiftSchedulingService {
  // Shift Template methods
  async getShiftTemplates() {
    try {
      console.log('[ShiftService] Fetching shift templates...');
      const response = await apiServices.getShiftTemplates();
      console.log('[ShiftService] Retrieved', response.data?.shiftTemplates?.length || 0, 'templates');
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error fetching shift templates:', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async getShiftTemplateById(id: number) {
    try {
      console.log('[ShiftService] Fetching shift template', id);
      const response = await apiServices.getShiftTemplateById(id);
      console.log('[ShiftService] Retrieved template:', response.data?.shiftTemplate?.name);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error fetching shift template', id + ':', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async createShiftTemplate(data: CreateShiftTemplateRequest) {
    try {
      console.log('[ShiftService] Creating shift template:', data);
      const response = await apiServices.createShiftTemplate(data);
      console.log('[ShiftService] Created template:', response.data?.shiftTemplate?.id);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error creating shift template:', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async updateShiftTemplate(id: number, data: UpdateShiftTemplateRequest) {
    try {
      console.log('[ShiftService] Updating shift template', id, data);
      const response = await apiServices.updateShiftTemplate(id, data);
      console.log('[ShiftService] Updated template:', id);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error updating shift template', id + ':', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async deleteShiftTemplate(id: number) {
    try {
      console.log('[ShiftService] Deleting shift template', id);
      const response = await apiServices.deleteShiftTemplate(id);
      console.log('[ShiftService] Deleted template:', id);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error deleting shift template', id + ':', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  // Employee Shift Assignment methods
  async getEmployeeShiftAssignments(page: number = 1, limit: number = 1000) {
    try {
      console.log('[ShiftService] Fetching employee shift assignments... (page:', page, 'limit:', limit + ')');
      const response = await apiServices.getEmployeeShiftAssignments(page, limit);
      const assignments = response.data?.employeeShiftAssignments || [];
      console.log('[ShiftService] Retrieved', assignments.length, 'assignments');
      console.log('[ShiftService] Pagination:', response.data?.pagination);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error fetching employee shift assignments:', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async getEmployeeShiftAssignmentById(id: number) {
    try {
      console.log('[ShiftService] Fetching employee shift assignment', id);
      const response = await apiServices.getEmployeeShiftAssignmentById(id);
      console.log('[ShiftService] Retrieved assignment:', id);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error fetching employee shift assignment', id + ':', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async assignShiftToEmployee(data: AssignShiftToEmployeeRequest) {
    try {
      console.log('[ShiftService] Assigning shift to employee:', data);
      const response = await apiServices.assignShiftToEmployee(data);
      console.log('[ShiftService] Assigned shift to employee:', data.user_id);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error assigning shift to employee:', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async updateEmployeeShiftAssignment(id: number, data: UpdateEmployeeShiftAssignmentRequest) {
    try {
      console.log('[ShiftService] Updating employee shift assignment', id, data);
      const response = await apiServices.updateEmployeeShiftAssignment(id, data);
      console.log('[ShiftService] Updated assignment:', id);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error updating employee shift assignment', id + ':', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async bulkAssignShifts(assignments: AssignShiftToEmployeeRequest[]) {
    try {
      console.log('[ShiftService] Bulk assigning', assignments.length, 'shifts...');
      const response = await apiServices.bulkAssignShifts(assignments);
      console.log('[ShiftService] Bulk assigned', assignments.length, 'shifts successfully');
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error bulk assigning shifts:', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  // Schedule Request methods
  async getScheduleRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
    requestType?: string;
    userId?: number;
  }) {
    try {
      console.log('[ShiftService] Fetching schedule requests...', params);
      const response = await apiServices.getScheduleRequests(params);
      console.log('[ShiftService] Retrieved', response.data?.scheduleRequests?.length || 0, 'requests');
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error fetching schedule requests:', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async getScheduleRequestById(id: number) {
    try {
      console.log('[ShiftService] Fetching schedule request', id);
      const response = await apiServices.getScheduleRequestById(id);
      console.log('[ShiftService] Retrieved request:', id);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error fetching schedule request', id + ':', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async createScheduleRequest(data: CreateScheduleRequestRequest) {
    try {
      console.log('[ShiftService] Creating schedule request:', data);
      const response = await apiServices.createScheduleRequest(data);
      console.log('[ShiftService] Created request:', response.data?.scheduleRequest?.id);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error creating schedule request:', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async updateScheduleRequest(id: number, data: UpdateScheduleRequestRequest) {
    try {
      console.log('[ShiftService] Updating schedule request', id, data);
      const response = await apiServices.updateScheduleRequest(id, data);
      console.log('[ShiftService] Updated request:', id);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error updating schedule request', id + ':', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async cancelScheduleRequest(id: number) {
    try {
      console.log('[ShiftService] Cancelling schedule request', id);
      const response = await apiServices.cancelScheduleRequest(id);
      console.log('[ShiftService] Cancelled request:', id);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error cancelling schedule request', id + ':', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async approveScheduleRequest(id: number) {
    try {
      console.log('[ShiftService] Approving schedule request', id);
      const response = await apiServices.approveScheduleRequest(id);
      console.log('[ShiftService] Approved request:', id);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error approving schedule request', id + ':', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async rejectScheduleRequest(id: number) {
    try {
      console.log('[ShiftService] Rejecting schedule request', id);
      const response = await apiServices.rejectScheduleRequest(id);
      console.log('[ShiftService] Rejected request:', id);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error rejecting schedule request', id + ':', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  // Time Off Bank methods
  async getTimeOffBanks(params?: {
    userId?: number;
    page?: number;
    limit?: number;
  }) {
    try {
      console.log('[ShiftService] Fetching time off banks...', params);
      const response = await apiServices.getTimeOffBanks(params);
      console.log('[ShiftService] Retrieved', response.data?.timeOffBanks?.length || 0, 'time off banks');
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error fetching time off banks:', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async getMyTimeOffBankBalance() {
    try {
      console.log('[ShiftService] Fetching my time off bank balance');
      const response = await apiServices.getMyTimeOffBankBalance();
      console.log('[ShiftService] Balance:', response.data?.timeOffBank?.balance_hours, 'hours');
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error fetching my time off bank balance:', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async createTimeOffBank(data: CreateTimeOffBankRequest) {
    try {
      console.log('[ShiftService] Creating time off bank:', data);
      const response = await apiServices.createTimeOffBank(data);
      console.log('[ShiftService] Created time off bank:', response.data?.timeOffBank?.id);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error creating time off bank:', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async getAllShiftExceptions(params?: { startDate?: string; endDate?: string; }) {
    try {
      console.log('[ShiftService] Fetching all shift exceptions...', params);
      const response = await apiServices.getAllShiftExceptions(params);
      console.log('[ShiftService] Retrieved', response.data?.exceptions?.length || 0, 'exceptions');
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error fetching all shift exceptions:', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async getShiftExceptions(userId: number, params?: { startDate?: string; endDate?: string; }) {
    try {
      console.log('[ShiftService] Fetching shift exceptions for user', userId, params);
      const response = await apiServices.getShiftExceptions(userId, params);
      console.log('[ShiftService] Retrieved', response.data?.exceptions?.length || 0, 'exceptions');
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error fetching shift exceptions:', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async getShiftExceptionById(id: number) {
    try {
      console.log('[ShiftService] Fetching shift exception', id);
      const response = await apiServices.getShiftExceptionById(id);
      console.log('[ShiftService] Retrieved exception:', id);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error fetching shift exception', id + ':', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async createShiftException(data: CreateShiftExceptionRequest) {
    try {
      console.log('[ShiftService] Creating shift exception:', data);
      const response = await apiServices.createShiftException(data);
      console.log('[ShiftService] Created exception:', response.data?.exception?.id);
      return response;
    } catch (error: any) {
      console.error('[ShiftService] Error creating shift exception:', error.message);
      console.error('[ShiftService] Response:', error.response?.data);
      throw error;
    }
  }

  async updateShiftException(id: number, data: UpdateShiftExceptionRequest) {
    try {
      const response = await apiServices.updateShiftException(id, data);
      return response;
    } catch (error) {
      console.error(`Error updating shift exception with id ${id}:`, error);
      throw error;
    }
  }

  async deleteShiftException(id: number) {
    try {
      const response = await apiServices.deleteShiftException(id);
      return response;
    } catch (error) {
      console.error(`Error deleting shift exception with id ${id}:`, error);
      throw error;
    }
  }

  // Helper methods
  async getShiftAssignmentsForUser(userId: number) {
    try {
      const allAssignments = await this.getEmployeeShiftAssignments();
      if (allAssignments.success && allAssignments.data) {
        const filteredAssignments = allAssignments.data.employeeShiftAssignments.filter(
          (assignment: EmployeeShiftAssignment) => assignment.user_id === userId
        );
        return {
          success: true,
          message: 'User shift assignments retrieved successfully',
          data: { employeeShiftAssignments: filteredAssignments }
        };
      }
      return allAssignments;
    } catch (error) {
      console.error(`Error fetching shift assignments for user ${userId}:`, error);
      throw error;
    }
  }

  async getActiveShiftAssignmentForUser(userId: number) {
    try {
      const userAssignments = await this.getShiftAssignmentsForUser(userId);
      if (userAssignments.success && userAssignments.data) {
        const activeAssignment = userAssignments.data.employeeShiftAssignments.find(
          (assignment: EmployeeShiftAssignment) => assignment.status === 'active'
        );
        return {
          success: true,
          message: 'Active shift assignment retrieved successfully',
          data: { employeeShiftAssignment: activeAssignment }
        };
      }
      return userAssignments;
    } catch (error) {
      console.error(`Error fetching active shift assignment for user ${userId}:`, error);
      throw error;
    }
  }

  async getScheduleRequestsForUser(userId: number) {
    try {
      const response = await this.getScheduleRequests({ userId });
      return response;
    } catch (error) {
      console.error(`Error fetching schedule requests for user ${userId}:`, error);
      throw error;
    }
  }

  async getTimeOffBanksForUser(userId: number) {
    try {
      const response = await this.getTimeOffBanks({ userId });
      return response;
    } catch (error) {
      console.error(`Error fetching time off banks for user ${userId}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance of the Shift Scheduling service
export const shiftSchedulingService = new ShiftSchedulingService();

export default ShiftSchedulingService;