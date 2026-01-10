// This component renders a line chart displaying weekly attendance trends
// It uses Recharts library for data visualization

// Import chart components from Recharts library
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Sample data for weekly attendance percentages
const data = [
  { day: "Mon", attendance: 95 }, // Monday attendance percentage
  { day: "Tue", attendance: 97 }, // Tuesday attendance percentage
  { day: "Wed", attendance: 94 }, // Wednesday attendance percentage
  { day: "Thu", attendance: 98 }, // Thursday attendance percentage
  { day: "Fri", attendance: 96 }, // Friday attendance percentage
  { day: "Sat", attendance: 45 }, // Saturday attendance percentage (lower)
  { day: "Sun", attendance: 20 }, // Sunday attendance percentage (lowest)
];

// Main component function for attendance chart
export function AttendanceChart() {
  return (
    <div className="card">
      {/* Chart title */}
      <h3 style={{ marginBottom: "1.5rem", fontSize: "1.125rem", fontWeight: 600 }}>Weekly Attendance Trend</h3>
      {/* Responsive container for chart responsiveness */}
      <ResponsiveContainer width="100%" height={300}>
        {/* Line chart component */}
        <LineChart data={data}>
          {/* Grid lines for chart background */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          {/* X-axis configuration */}
          <XAxis
            dataKey="day" // Data key for x-axis labels
            stroke="#6b7280" // Axis line color
            style={{ fontSize: '0.875rem' }} // Font size for labels
          />
          {/* Y-axis configuration */}
          <YAxis
            stroke="#6b7280" // Axis line color
            style={{ fontSize: '0.875rem' }} // Font size for labels
          />
          {/* Tooltip configuration for hover information */}
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff', // White background
              border: '1px solid #e5e7eb', // Light border
              borderRadius: '0.5rem', // Rounded corners
              fontSize: '0.875rem' // Font size
            }}
          />
          {/* Line configuration */}
          <Line
            type="monotone" // Smooth curve type
            dataKey="attendance" // Data key for line values
            stroke="#2563eb" // Blue line color
            strokeWidth={3} // Line thickness
            dot={{ fill: '#2563eb', r: 4 }} // Data point styling
            activeDot={{ r: 6 }} // Active/hover point size
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
