// src/components/common/EmptyState.jsx
import React from "react";

export default function EmptyState({ title = "No data", message = "" }) {
  return (
    <div className="p-8 text-center text-gray-500">
      <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 7l6 6-6 6"/>
      </svg>
      <h4 className="mt-4 text-lg font-medium text-gray-900">{title}</h4>
      {message && <p className="mt-1 text-sm">{message}</p>}
    </div>
  );
}
