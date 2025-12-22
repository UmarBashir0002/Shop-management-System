import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useOrderQuery } from "../../hooks/useOrders"; // 🔁 Changed to useOrders hook
import Button from "../../components/common/Button";
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  HashtagIcon, 
  BanknotesIcon, 
  ShoppingBagIcon 
} from "@heroicons/react/24/outline";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrderQuery(id); // 🔁 Fetching order data

  if (isLoading) return <div className="p-10 text-center text-slate-500">Loading Order...</div>;
  if (!order) return <div className="p-10 text-center text-red-500">Order not found.</div>;

  // Defensive check for items list (backend might return .items or .OrderItem)
  const items = order.items ?? order.OrderItem ?? [];

  return (
    <DashboardLayout>
      {/* 1. Back Navigation & Action Header */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors font-medium group"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Orders
        </button>
        
        <Button onClick={() => navigate(`/orders/edit/${id}`)}>
          Edit Order
        </Button>
      </div>

      {/* 2. Main Order Detail Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-slate-50 p-8 border-b border-slate-200 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                Retail Order
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                Completed
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Order #{order.id}</h1>
            <p className="text-slate-500 text-lg flex items-center gap-2 mt-1">
              <CalendarIcon className="w-5 h-5" />
              {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400 font-medium">Total Amount</p>
            <p className="text-4xl font-black text-indigo-600">Rs. {order.total.toLocaleString()}</p>
          </div>
        </div>

        {/* 3. Items Table Section */}
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold uppercase text-sm tracking-wider">
            <ShoppingBagIcon className="w-5 h-5 text-indigo-500" />
            Order Items ({items.length})
          </div>
          
          <div className="overflow-hidden border border-slate-100 rounded-xl">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-800">{it.item?.name || it.name || "Unknown Item"}</p>
                      <p className="text-xs text-slate-400 font-mono">ID: {it.itemId}</p>
                    </td>
                    <td className="px-4 py-4 text-center text-slate-600">Rs. {it.price}</td>
                    <td className="px-4 py-4 text-center text-slate-600">x{it.quantity}</td>
                    <td className="px-4 py-4 text-right font-bold text-slate-800">
                      Rs. {(it.price * it.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Order Metadata Summary */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white shadow-sm rounded-lg text-slate-600 border border-slate-100">
              <HashtagIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-tighter">System Reference</p>
              <p className="text-xl font-mono font-bold text-slate-800 tracking-wider">ORD-{order.id}-{new Date(order.createdAt).getFullYear()}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-white shadow-sm rounded-lg text-slate-600 border border-slate-100">
              <BanknotesIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-tighter">Payment Status</p>
              <p className="text-xl font-bold text-green-600 italic">Fully Paid</p>
            </div>
          </div>
        </div>

        {/* 5. Footer Message */}
        <div className="bg-slate-100 px-8 py-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500 font-medium">
            This order was processed through the Shop Management System. 
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}