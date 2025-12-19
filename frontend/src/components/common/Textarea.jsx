// src/components/common/Textarea.jsx
export default function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <textarea
        {...props}
        rows={4}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}
