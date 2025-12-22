import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useItemQuery } from "../../hooks/useProducts";
import Button from "../../components/common/Button";
import { ArrowLeftIcon, CubeIcon, TagIcon, BanknotesIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: item, isLoading } = useItemQuery(id);

  if (isLoading) return <div className="p-10 text-center text-slate-500">Loading Product...</div>;
  if (!item) return <div className="p-10 text-center text-red-500">Product not found.</div>;

  return (
    <DashboardLayout>
      {/* 1. Back Navigation & Action Header */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors font-medium group"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </button>
        
        <Button onClick={() => navigate(`/products/${id}/edit`)}>
          Edit Product
        </Button>
      </div>

      {/* 2. Main Detail Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-slate-50 p-8 border-b border-slate-200 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                {item.type}
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">{item.name}</h1>
            <p className="text-slate-500 text-lg">{item.brand}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400 font-medium">Selling Price</p>
            <p className="text-4xl font-black text-indigo-600">${item.salePrice.toLocaleString()}</p>
          </div>
        </div>

        {/* 3. Detail Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
              <BanknotesIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-tighter">Cost Price</p>
              <p className="text-xl font-bold text-slate-800">${item.costPrice.toLocaleString()}</p>
              <p className="text-xs text-green-600 font-medium mt-1">
                Margin: ${ (item.salePrice - item.costPrice).toLocaleString() }
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
              <ShoppingCartIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-tighter">Inventory</p>
              <p className={`text-xl font-bold ${item.quantity < 5 ? 'text-red-600' : 'text-slate-800'}`}>
                {item.quantity} Units
              </p>
              <p className="text-xs text-slate-500 mt-1">Available in Stock</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
              <CubeIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-tighter">Product ID</p>
              <p className="text-xl font-mono font-bold text-slate-800">#{item.id}</p>
              <p className="text-xs text-slate-500 mt-1">System Reference</p>
            </div>
          </div>

        </div>

        {/* 4. Footer Message */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
          <p className="text-xs text-slate-400 italic">
            Last updated: {new Date().toLocaleDateString()} — Ensure stock counts match physical inventory.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}