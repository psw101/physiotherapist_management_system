"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

// Import the entire Recharts library dynamically to avoid SSR issues
const RechartsComponent = dynamic(() => import('./RechartsWrapper'), { ssr: false });

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("sales");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  // Only using PDF export format
  const exportFormat = "pdf";
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  // Generate mock data for reports
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Mock monthly product sales data with revenue
      const mockSalesData = [
        { month: "Jan", sales: Math.floor(Math.random() * 50) + 10, revenue: 0 },
        { month: "Feb", sales: Math.floor(Math.random() * 50) + 10, revenue: 0 },
        { month: "Mar", sales: Math.floor(Math.random() * 50) + 10, revenue: 0 },
        { month: "Apr", sales: Math.floor(Math.random() * 50) + 10, revenue: 0 },
        { month: "May", sales: Math.floor(Math.random() * 50) + 10, revenue: 0 },
        { month: "Jun", sales: Math.floor(Math.random() * 50) + 10, revenue: 0 },
        { month: "Jul", sales: Math.floor(Math.random() * 50) + 10, revenue: 0 },
        { month: "Aug", sales: Math.floor(Math.random() * 50) + 10, revenue: 0 },
        { month: "Sep", sales: Math.floor(Math.random() * 50) + 10, revenue: 0 },
        { month: "Oct", sales: Math.floor(Math.random() * 50) + 10, revenue: 0 },
        { month: "Nov", sales: Math.floor(Math.random() * 50) + 10, revenue: 0 },
        { month: "Dec", sales: Math.floor(Math.random() * 50) + 10, revenue: 0 }
      ];

      // Calculate revenue for each month
      mockSalesData.forEach(item => {
        item.revenue = item.sales * (Math.floor(Math.random() * 1000) + 500);
      });

      // Mock monthly revenue data
      const mockRevenueData = mockSalesData.map(item => ({
        month: item.month,
        revenue: item.sales * (Math.floor(Math.random() * 1000) + 500)
      }));

      setSalesData(mockSalesData);
      setRevenueData(mockRevenueData);
      setLoading(false);
    }
  }, [year]);

  const handleExport = () => {
    try {
      // Create the export URL with the year parameter
      const url = `/api/admin/reports/export?type=${activeTab}&format=pdf&year=${year}`;

      // Open PDF in a new window (it will show a print button)
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  // This will run only on the client side
  if (typeof window === 'undefined' || loading) {
    return <div className="p-6">Loading reports...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Monthly Reports</h1>

        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border rounded p-2"
          >
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>

          <button
            onClick={handleExport}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-1"
          >
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <p>
          View and export monthly sales and revenue reports for your clinic.
        </p>
      </div>

      <div className="mb-4 border-b">
        <div className="flex">
          <button
            className={`px-4 py-2 ${activeTab === 'sales' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            Monthly Product Sales
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'revenue' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            Monthly Revenue
          </button>
        </div>
      </div>

      <div className="py-4">
        {activeTab === 'sales' && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Monthly Product Sales Report - {year}</h2>
            <div className="h-80">
              {typeof window !== 'undefined' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 'auto']} />
                    <Tooltip formatter={(value, name) => {
                      if (name === "Revenue (Rs.)") return `Rs. ${value.toLocaleString()}`;
                      return value;
                    }} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      name="Number of Products Sold"
                      yAxisId="left"
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#82ca9d"
                      activeDot={{ r: 8 }}
                      name="Revenue (Rs.)"
                      yAxisId="right"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Monthly Sales Data</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Month</th>
                      <th className="py-2 px-4 border-b">Number of Products Sold</th>
                      <th className="py-2 px-4 border-b">Revenue (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-2 px-4 border-b">{item.month}</td>
                        <td className="py-2 px-4 border-b text-center">{item.sales}</td>
                        <td className="py-2 px-4 border-b text-right">Rs. {item.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Monthly Revenue Report - {year}</h2>
            <div className="h-80">
              {typeof window !== 'undefined' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `Rs. ${value}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#82ca9d"
                      activeDot={{ r: 8 }}
                      name="Revenue (Rs.)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Monthly Revenue Data</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Month</th>
                      <th className="py-2 px-4 border-b">Revenue (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-2 px-4 border-b">{item.month}</td>
                        <td className="py-2 px-4 border-b text-right">Rs. {item.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
