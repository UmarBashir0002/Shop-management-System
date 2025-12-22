// src/components/common/Table.jsx
import React from "react";
import EmptyState from "./EmptyState";

export default function Table({ columns = [], data = [], isLoading = false }) {
  // 1. Loading state takes priority
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading records...</p>
      </div>
    );
  }

  // 2. Hard check for undefined, null, or empty array
  // This ensures that even if null is passed, we show the EmptyState
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <EmptyState title="No records found" />;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((c, index) => (
              <th 
                key={c.key || c.title || index} 
                className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest"
              >
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="hover:bg-slate-50/50 transition-colors">
              {columns.map((c, colIndex) => (
                <td 
                  key={`${c.key || c.title}-${row.id || rowIndex}-${colIndex}`} 
                  className="px-6 py-4 text-sm text-slate-600"
                >
                  {/* Safely render data: priority to render(), then key, then empty string */}
                  {c.render ? c.render(row) : (row[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}