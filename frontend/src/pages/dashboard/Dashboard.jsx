// src/pages/dashboard/Dashboard.jsx
import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Total Items</h3>
          <p className="text-2xl font-semibold mt-2">—</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Total Orders</h3>
          <p className="text-2xl font-semibold mt-2">—</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Low Stock</h3>
          <p className="text-2xl font-semibold mt-2">—</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
