// src/components/common/Input.jsx
import React from 'react'

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <input
        {...props}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}
