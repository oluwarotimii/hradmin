// This component displays a card with pending leave requests
// It shows employee information and provides approve/decline action buttons

// Import Lucide React icons for approve and decline buttons
import { Check, X } from "lucide-react";

// Mock data for pending leave requests
// Contains sample leave request information for demonstration
const leaveRequests = [
  { id: 1, name: "Alex Thompson", avatar: "AT", type: "Vacation", duration: "5 days", dates: "Nov 1-5, 2025", status: "Pending" },
  { id: 2, name: "Maria Garcia", avatar: "MG", type: "Sick Leave", duration: "2 days", dates: "Oct 28-29, 2025", status: "Pending" },
  { id: 3, name: "Tom Harris", avatar: "TH", type: "Personal", duration: "1 day", dates: "Nov 3, 2025", status: "Pending" },
  { id: 4, name: "Sophie Turner", avatar: "ST", type: "Vacation", duration: "3 days", dates: "Nov 8-10, 2025", status: "Pending" },
];

// Main component function for leave request card
export function LeaveRequestCard() {
  // Main render return
  return (
    // Card container with padding
    <div className="card p-6">
      {/* Card title */}
      <h3 className="mb-4">Pending Leave Requests</h3>
      {/* Container for request items with vertical spacing */}
      <div className="space-y-4">
        {/* Map through leave requests to create individual request cards */}
        {leaveRequests.map((request) => (
          // Individual request container with border and padding
          <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
            {/* Employee information section */}
            <div className="flex items-center gap-3">
              {/* Employee avatar with initials */}
              <div className="avatar">{request.avatar}</div>
              {/* Employee details */}
              <div>
                {/* Employee name */}
                <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{request.name}</div>
                {/* Leave type and duration */}
                <div className="text-sm text-muted">
                  {request.type} • {request.duration}
                </div>
                {/* Leave dates */}
                <div className="text-sm text-muted">{request.dates}</div>
              </div>
            </div>
            {/* Action buttons section */}
            <div className="flex gap-2">
              {/* Approve button with green styling */}
              <button className="btn btn-outline btn-sm green">
                <Check className="w-4 h-4" />
              </button>
              {/* Decline button with red styling */}
              <button className="btn btn-outline btn-sm red">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
