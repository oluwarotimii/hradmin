// This component displays a list of recently hired employees
// It shows their names, positions, departments, and hire dates

// Import Calendar icon from Lucide React for date display
import { Calendar } from "lucide-react";

// Mock data array containing recent hire information
const recentHires = [
  { id: 1, name: "Emma Watson", avatar: "EW", position: "Product Manager", department: "Product", date: "Oct 15, 2025" },
  { id: 2, name: "Noah Smith", avatar: "NS", position: "Data Analyst", department: "Analytics", date: "Oct 18, 2025" },
  { id: 3, name: "Olivia Davis", avatar: "OD", position: "Customer Success", department: "Support", date: "Oct 20, 2025" },
  { id: 4, name: "Liam Johnson", avatar: "LJ", position: "DevOps Engineer", department: "Engineering", date: "Oct 22, 2025" },
  { id: 5, name: "Ava Williams", avatar: "AW", position: "Content Writer", department: "Marketing", date: "Oct 25, 2025" },
];

// Main component function for displaying recent hires
export function RecentHires() {
  // Main render return
  return (
    // Card container with padding
    <div className="card p-6">
      {/* Section title */}
      <h3 className="mb-4">Recent Hires</h3>
      {/* Container for hire list with vertical spacing */}
      <div className="space-y-4">
        {/* Map through recent hires data to create list items */}
        {recentHires.map((hire) => (
          // Individual hire item with flex layout
          <div key={hire.id} className="flex items-center justify-between">
            {/* Left side: Employee information */}
            <div className="flex items-center gap-3">
              {/* Employee avatar with initials */}
              <div className="avatar">{hire.avatar}</div>
              {/* Employee name and position */}
              <div>
                {/* Employee name with bold styling */}
                <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{hire.name}</div>
                {/* Job position with muted text */}
                <div className="text-sm text-muted">{hire.position}</div>
              </div>
            </div>
            {/* Right side: Department and hire date */}
            <div className="text-right">
              {/* Department badge */}
              <span className="badge badge-secondary">{hire.department}</span>
              {/* Hire date with calendar icon */}
              <div className="flex items-center gap-1 mt-1 text-sm text-muted" style={{ justifyContent: "flex-end" }}>
                {/* Calendar icon */}
                <Calendar className="w-3 h-3" />
                {/* Hire date text */}
                {hire.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
