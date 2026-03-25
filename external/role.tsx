import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Shield, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Checkbox } from "@/app/components/ui/checkbox";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { useForm } from "react-hook-form";

// Types
interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of permission IDs
  createdAt: string;
  updatedAt: string;
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

// Mock permissions data
const MOCK_PERMISSIONS: Permission[] = [
  // Employee Management
  { id: "emp_view", name: "View Employees", description: "View employee list and details", module: "Employee Management" },
  { id: "emp_create", name: "Create Employees", description: "Add new employees to the system", module: "Employee Management" },
  { id: "emp_edit", name: "Edit Employees", description: "Modify employee information", module: "Employee Management" },
  { id: "emp_delete", name: "Delete Employees", description: "Remove employees from the system", module: "Employee Management" },
  
  // Attendance Management
  { id: "att_view", name: "View Attendance", description: "View attendance records", module: "Attendance Management" },
  { id: "att_manage", name: "Manage Attendance", description: "Edit and approve attendance", module: "Attendance Management" },
  { id: "att_report", name: "Attendance Reports", description: "Generate attendance reports", module: "Attendance Management" },
  
  // Leave Management
  { id: "leave_view", name: "View Leave Requests", description: "View all leave requests", module: "Leave Management" },
  { id: "leave_approve", name: "Approve Leave", description: "Approve or reject leave requests", module: "Leave Management" },
  { id: "leave_create", name: "Create Leave", description: "Submit leave requests", module: "Leave Management" },
  
  // Payroll Management
  { id: "payroll_view", name: "View Payroll", description: "View payroll information", module: "Payroll Management" },
  { id: "payroll_process", name: "Process Payroll", description: "Run payroll processing", module: "Payroll Management" },
  { id: "payroll_reports", name: "Payroll Reports", description: "Generate payroll reports", module: "Payroll Management" },
  
  // Role & Permission Management
  { id: "role_view", name: "View Roles", description: "View all system roles", module: "Role Management" },
  { id: "role_create", name: "Create Roles", description: "Create new roles", module: "Role Management" },
  { id: "role_edit", name: "Edit Roles", description: "Modify existing roles", module: "Role Management" },
  { id: "role_delete", name: "Delete Roles", description: "Remove roles from system", module: "Role Management" },
  
  // System Administration
  { id: "sys_settings", name: "System Settings", description: "Configure system settings", module: "System Administration" },
  { id: "sys_users", name: "User Management", description: "Manage system users", module: "System Administration" },
  { id: "sys_audit", name: "Audit Logs", description: "View system audit logs", module: "System Administration" },
];

// Mock roles data
const INITIAL_MOCK_ROLES: Role[] = [
  {
    id: "1",
    name: "Super Admin",
    description: "Full system access with all permissions",
    permissions: MOCK_PERMISSIONS.map(p => p.id),
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "HR Manager",
    description: "Manage employees, attendance, and leave",
    permissions: ["emp_view", "emp_create", "emp_edit", "att_view", "att_manage", "leave_view", "leave_approve"],
    createdAt: "2026-01-16T10:00:00Z",
    updatedAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "3",
    name: "Employee",
    description: "Basic employee access",
    permissions: ["emp_view", "att_view", "leave_create", "leave_view"],
    createdAt: "2026-01-17T10:00:00Z",
    updatedAt: "2026-01-17T10:00:00Z",
  },
  {
    id: "4",
    name: "Payroll Specialist",
    description: "Manage payroll and generate reports",
    permissions: ["emp_view", "payroll_view", "payroll_process", "payroll_reports"],
    createdAt: "2026-01-18T10:00:00Z",
    updatedAt: "2026-01-18T10:00:00Z",
  },
];

// Mock API service
const mockApi = {
  getRoles: async (): Promise<Role[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const stored = localStorage.getItem("roles");
    return stored ? JSON.parse(stored) : INITIAL_MOCK_ROLES;
  },

  getPermissions: async (): Promise<Permission[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_PERMISSIONS;
  },

  createRole: async (data: RoleFormData): Promise<Role> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const roles = await mockApi.getRoles();
    const newRole: Role = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      permissions: data.permissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedRoles = [...roles, newRole];
    localStorage.setItem("roles", JSON.stringify(updatedRoles));
    return newRole;
  },

  updateRole: async (id: string, data: RoleFormData): Promise<Role> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const roles = await mockApi.getRoles();
    const updatedRoles = roles.map(role =>
      role.id === id
        ? { ...role, ...data, updatedAt: new Date().toISOString() }
        : role
    );
    localStorage.setItem("roles", JSON.stringify(updatedRoles));
    return updatedRoles.find(r => r.id === id)!;
  },

  deleteRole: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const roles = await mockApi.getRoles();
    const updatedRoles = roles.filter(role => role.id !== id);
    localStorage.setItem("roles", JSON.stringify(updatedRoles));
  },
};

// Role Form Modal Component
function RoleFormModal({
  open,
  onClose,
  role,
  permissions,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  role?: Role;
  permissions: Permission[];
  onSuccess: () => void;
}) {
  const isEditMode = !!role;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<RoleFormData>({
    defaultValues: {
      name: role?.name || "",
      description: role?.description || "",
      permissions: role?.permissions || [],
    },
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role?.permissions || []);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      });
      setSelectedPermissions(role.permissions);
    } else {
      reset({ name: "", description: "", permissions: [] });
      setSelectedPermissions([]);
    }
    setError("");
  }, [role, reset, open]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const onSubmit = async (data: RoleFormData) => {
    try {
      setError("");
      const formData = { ...data, permissions: selectedPermissions };

      if (selectedPermissions.length === 0) {
        setError("Please select at least one permission");
        return;
      }

      if (isEditMode) {
        await mockApi.updateRole(role.id, formData);
      } else {
        await mockApi.createRole(formData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {isEditMode ? "Edit Role" : "Create New Role"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the role details and permissions"
              : "Create a new role and assign permissions"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 pb-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-900">{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Role name is required",
                  minLength: {
                    value: 2,
                    message: "Role name must be at least 2 characters",
                  },
                })}
                className={errors.name ? "border-red-500" : ""}
                placeholder="e.g., HR Manager"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe the role's responsibilities and access level"
                rows={3}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Permissions *</Label>
                <Badge variant="secondary">
                  {selectedPermissions.length} selected
                </Badge>
              </div>

              <ScrollArea className="h-64 border rounded-lg p-3">
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([module, perms]) => (
                    <div key={module}>
                      <h4 className="font-semibold text-sm text-gray-900 mb-2 sticky top-0 bg-white py-1">
                        {module}
                      </h4>
                      <div className="space-y-2 pl-2">
                        {perms.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-start gap-2 p-2 rounded hover:bg-gray-50"
                          >
                            <Checkbox
                              id={permission.id}
                              checked={selectedPermissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={permission.id}
                                className="text-sm font-medium text-gray-900 cursor-pointer"
                              >
                                {permission.name}
                              </label>
                              <p className="text-xs text-gray-600">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {isEditMode ? "Update Role" : "Create Role"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Main Role Management Component
export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [rolesData, permissionsData] = await Promise.all([
        mockApi.getRoles(),
        mockApi.getPermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedRole(undefined);
    setModalOpen(true);
  };

  const handleEditClick = (role: Role) => {
    setSelectedRole(role);
    setModalOpen(true);
  };

  const handleDeleteClick = async (role: Role) => {
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      try {
        setError("");
        await mockApi.deleteRole(role.id);
        showSuccess(`Role "${role.name}" deleted successfully`);
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete role");
      }
    }
  };

  const handleModalSuccess = async () => {
    showSuccess(selectedRole ? "Role updated successfully" : "Role created successfully");
    await loadData();
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const getPermissionCount = (permissionIds: string[]) => {
    return permissionIds.length;
  };

  const getPermissionNames = (permissionIds: string[]) => {
    return permissions
      .filter(p => permissionIds.includes(p.id))
      .map(p => p.name);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading role management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Role Management
            </h1>
            <p className="text-gray-600">
              Manage user roles and permissions
            </p>
          </div>
          <Button onClick={handleCreateClick} size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            Create New Role
          </Button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-900">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-900">{error}</AlertDescription>
          </Alert>
        )}

        {/* Roles Table */}
        <Card className="overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Role Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Permissions Count
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Shield className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600 font-medium">No roles found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Create your first role to get started
                      </p>
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr
                      key={role.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            {role.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 max-w-md">
                          {role.description || "No description"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="gap-1">
                          {getPermissionCount(role.permissions)} permissions
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(role)}
                            className="gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(role)}
                            className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Permissions Summary */}
        <Card className="mt-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Available Permissions Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              permissions.reduce((acc, p) => {
                acc[p.module] = (acc[p.module] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([module, count]) => (
              <div key={module} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Shield className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{module}</p>
                  <p className="text-xs text-gray-600">{count} permissions</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Role Form Modal */}
        <RoleFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          role={selectedRole}
          permissions={permissions}
          onSuccess={handleModalSuccess}
        />
      </div>
    </div>
  );
}
