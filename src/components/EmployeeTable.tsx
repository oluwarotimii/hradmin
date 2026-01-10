// This component renders a table displaying employee information
// It shows employee details including name, department, position, status, and actions

// Import Lucide React icon for actions menu
import { MoreHorizontal } from "lucide-react";
// Import data function to get employee table data
import { getEmployeeTableData } from "../data/staffData";

// Main component function for employee table
export function EmployeeTable() {
  // Get employee data from staff data module
  const employees = getEmployeeTableData();

  // Main render return with table structure
  return (
    // Table container with border styling
    <div className="rounded-lg border">
      {/* HTML table element */}
      <table className="table">
        {/* Table header */}
        <thead className="table-header">
          <tr>
            {/* Header cells for each column */}
            <th className="table-header-cell">Employee</th>
            <th className="table-header-cell">Department</th>
            <th className="table-header-cell">Position</th>
            <th className="table-header-cell">Status</th>
            <th className="table-header-cell right">Actions</th>
          </tr>
        </thead>
        {/* Table body */}
        <tbody>
          {/* Map over employees array to create table rows */}
          {employees.map((employee) => (
            // Table row for each employee
            <tr key={employee.id} className="table-row">
              {/* Employee information cell with avatar and details */}
              <td className="table-cell">
                <div className="employee-info">
                  {/* Employee avatar */}
                  <div className="avatar">{employee.avatar}</div>
                  {/* Employee name and email details */}
                  <div className="employee-details">
                    <div className="employee-name">{employee.name}</div>
                    <div className="employee-email">{employee.email}</div>
                  </div>
                </div>
              </td>
              {/* Department cell */}
              <td className="table-cell">{employee.department}</td>
              {/* Position cell */}
              <td className="table-cell">{employee.position}</td>
              {/* Status cell with conditional badge styling */}
              <td className="table-cell">
                <span className={employee.status === "Active" ? "badge badge-default" : "badge badge-secondary"}>
                  {employee.status}
                </span>
              </td>
              {/* Actions cell with menu button */}
              <td className="table-cell right">
                <button className="btn btn-ghost btn-sm">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
