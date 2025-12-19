// src/components/common/EmptyState.jsx
export default function EmptyState({ title = 'No items', subtitle = '' }) {
  return (
    <div className="bg-white border border-dashed border-gray-200 rounded p-8 text-center">
      <div className="text-xl font-medium mb-2">{title}</div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
    </div>
  )
}
