// src/components/common/Textarea.jsx
import React from "react";

export default function Textarea({ label, error, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <textarea className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-400 border-gray-200 ${error ? "border-red-500" : ""}`} {...props} />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
