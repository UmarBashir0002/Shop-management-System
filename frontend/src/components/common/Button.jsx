// src/components/common/Button.jsx
import React from "react";

export default function Button({ children, className = "", disabled, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition ${
        disabled ? "opacity-60 cursor-not-allowed bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700 text-white"
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
