// This component renders a pie chart displaying the distribution of employees across different departments
// It uses Recharts library for visualization and shows percentage breakdowns

// Import Recharts components for pie chart visualization
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
// Import data function to get department chart data
import { getDepartmentChartData } from "../data/staffData";

// Define color palette for pie chart segments
// Uses a predefined array of 11 colors for department visualization
const COLORS = ["#2563eb", "#a855f7", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#f97316", "#0ea5e9", "#8b5cf6", "#84cc16", "#ef4444"];

// Main component function for department chart
export function DepartmentChart() {
  // Get department data from staff data module
  const data = getDepartmentChartData();

  // Main render return with pie chart
  return (
    // Card container for the chart
    <div className="card">
      {/* Chart title with styling */}
      <h3 style={{ marginBottom: "1.5rem", fontSize: "1.125rem", fontWeight: 600 }}>Employees by Department</h3>
      {/* Responsive container for chart responsiveness */}
      <ResponsiveContainer width="100%" height={300}>
        {/* Pie chart component from Recharts */}
        <PieChart>
          {/* Pie component with data and configuration */}
          <Pie
            data={data} // Data source for the pie chart
            cx="50%" // Center X position (50% of container)
            cy="50%" // Center Y position (50% of container)
            labelLine={false} // Disable label lines connecting to segments
            // Custom label function showing department name and percentage
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100} // Outer radius of the pie chart
            fill="#8884d8" // Default fill color (overridden by Cell components)
            dataKey="value" // Key for data values in the data array
          >
            {/* Map over data to create colored cells for each department */}
            {data.map((entry, index) => (
              // Cell component for each pie segment with unique color
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          {/* Tooltip component for hover information */}
          <Tooltip
            // Custom styling for tooltip appearance
            contentStyle={{
              backgroundColor: '#ffffff', // White background
              border: '1px solid #e5e7eb', // Light gray border
              borderRadius: '0.5rem', // Rounded corners
              fontSize: '0.875rem' // Small font size
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
