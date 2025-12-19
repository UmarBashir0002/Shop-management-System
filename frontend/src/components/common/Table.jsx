// src/components/common/Table.jsx
export default function Table({ children, className = '' }) {
  return (
    <div className={`overflow-auto bg-white rounded shadow ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  )
}
