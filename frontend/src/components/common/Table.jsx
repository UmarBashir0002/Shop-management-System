// src/components/common/Table.jsx
import React from "react";
import EmptyState from "./EmptyState";

export default function Table({ columns = [], data = [], isLoading = false }) {
  if (isLoading) {
    return <div className="p-4 text-center text-gray-600">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No records" />;
  }

  return (
    <div className="overflow-auto bg-white rounded-md shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key || c.title} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {columns.map((c) => (
                <td key={(c.key || c.title) + row.id} className="px-4 py-3 text-sm text-gray-700">
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
