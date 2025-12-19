// src/components/common/Button.jsx
export default function Button({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium shadow-sm transition disabled:opacity-50 ' +
        className
      }
    >
      {children}
    </button>
  )
}
