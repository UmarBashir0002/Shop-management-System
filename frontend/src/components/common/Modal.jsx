// src/components/common/Modal.jsx
import { Dialog } from '@headlessui/react'

export default function Modal({ open, onClose, title, children }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded shadow-lg p-6">
          {title && <Dialog.Title className="text-lg font-semibold mb-3">{title}</Dialog.Title>}
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
