// src/components/common/Loader.jsx
export default function Loader({ size = 5, text = '' }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`animate-spin rounded-full border-4 border-t-transparent border-gray-300 w-${size} h-${size}`} />
      {text && <span>{text}</span>}
    </div>
  )
}
