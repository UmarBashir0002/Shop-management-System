// src/pages/settings/Profile.jsx
import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useAuth from "../../hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded shadow max-w-md">
        <h3 className="text-lg font-semibold mb-3">Profile</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <div><strong>Username:</strong> {user?.username}</div>
          <div><strong>Joined:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
