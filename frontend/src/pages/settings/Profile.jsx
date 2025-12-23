// src/pages/settings/Profile.jsx
import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useAuth from "../../hooks/useAuth";
import { User, Mail, Calendar, ShieldCheck, Fingerprint, Lock, X } from "lucide-react";
import api from "../../api/axios"; // Ensure axios is installed



export default function Profile() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const getInitials = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.username) return user.username.charAt(0).toUpperCase();
    return "?";
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    // Client-side validation
    if (formData.newPassword !== formData.confirmNewPassword) {
      return setStatus({ loading: false, error: "New passwords do not match!", success: "" });
    }

    try {
      // Replace with your actual API endpoint
      await api.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      setStatus({ loading: false, error: "", success: "Password changed successfully!" });
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
        setStatus({ loading: false, error: "", success: "" });
      }, 2000);
    } catch (err) {
      setStatus({ 
        loading: false, 
        error: err.response?.data?.message || "Failed to update password", 
        success: "" 
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-12 px-4 relative">
        {/* Main Card */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>

          <div className="px-8 pb-10">
            <div className="relative flex flex-col items-center -mt-20 mb-10">
              <div className="h-32 w-32 rounded-[2.5rem] bg-white p-2 shadow-xl">
                <div className="h-full w-full rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-600 text-4xl font-black border border-indigo-100">
                  {getInitials()}
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{user?.name || "Member Profile"}</h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold uppercase tracking-widest border border-green-100">Active</span>
                  <p className="text-gray-500 font-medium">@{user?.username}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfileItem icon={<User size={18} />} label="Full Name" value={user?.name || "Not set"} />
              <ProfileItem icon={<Fingerprint size={18} />} label="Username" value={user?.username} />
              <ProfileItem icon={<Mail size={18} />} label="Email Address" value={user?.email || "No email linked"} />
              <ProfileItem icon={<Calendar size={18} />} label="Member Since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"} />
            </div>

            {/* Change Password Trigger */}
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-gray-200 active:scale-95"
              >
                <Lock size={18} />
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Security Update</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={20}/></button>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <PasswordField label="Current Password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} />
                  <PasswordField label="New Password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} />
                  <PasswordField label="Confirm New Password" name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleInputChange} />
                  
                  {status.error && <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl">{status.error}</p>}
                  {status.success && <p className="text-green-500 text-xs font-bold bg-green-50 p-3 rounded-xl">{status.success}</p>}

                  <button 
                    disabled={status.loading}
                    type="submit"
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {status.loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function ProfileItem({ icon, label, value }) {
  return (
    <div className="p-4 rounded-2xl border border-gray-50 bg-gray-50/30">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-indigo-400">{icon}</span>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-gray-700 font-semibold pl-8">{value}</p>
    </div>
  );
}

function PasswordField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">{label}</label>
      <input 
        type="password"
        name={name}
        required
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
        placeholder="••••••••"
      />
    </div>
  );
}