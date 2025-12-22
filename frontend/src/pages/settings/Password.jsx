// src/pages/settings/Password.jsx
import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

export default function Password() {
  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded shadow max-w-md">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <form className="space-y-3">
          <Input label="Current password" type="password" />
          <Input label="New password" type="password" />
          <Input label="Confirm new password" type="password" />
          <div className="flex justify-end">
            <Button>Change</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
