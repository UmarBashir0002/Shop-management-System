// src/components/common/Loader.jsx
import React from "react";

export default function Loader({ size = 6 }) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className={`animate-spin rounded-full h-${size} w-${size} border-b-2 border-indigo-600`} />
    </div>
  );
}
