import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useItemQuery } from "../../hooks/useProducts";
import Button from "../../components/common/Button";
import { 
  ArrowLeftIcon, 
  CubeIcon, 
  BanknotesIcon, 
  ShoppingCartIcon 
} from "@heroicons/react/24/outline";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Destructure 'refetch' to force a manual update from the server
  const { data: item, isLoading, refetch } = useItemQuery(id);

  /** * FIX: This effect runs every time the component mounts (when you open the page).
   * It forces React Query to fetch the most recent data from the database,
   * bypassing any old "stale" pricing stored in the cache.
   */
  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  if (isLoading) return (
    <DashboardLayout>
      <div className="p-20 text-center text-slate-500 animate-pulse font-medium">
        Loading Product Details...
      </div>
    </DashboardLayout>
  );
  
  if (!item) return (
    <DashboardLayout>
      <div className="p-20 text-center text-red-500 font-bold">
        Product not found.
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      {/* 1. Back Navigation & Action Header */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between px-4 md:px-0">
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
        <div className="bg-slate-50 p-8 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider border border-indigo-200">
                {item.category?.name || item.type || 'General'}
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{item.name}</h1>
            <p className="text-slate-500 text-lg font-medium">{item.brand}</p>
          </div>
          <div className="text-left md:text-right bg-white p-4 rounded-xl border border-slate-100 shadow-sm md:shadow-none md:border-none md:bg-transparent min-w-[200px]">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Selling Price</p>
            <p className="text-4xl font-black text-indigo-600">Rs. {item.salePrice?.toLocaleString()}</p>
          </div>
        </div>

        {/* 3. Detail Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-50 rounded-xl text-slate-600 border border-slate-100">
              <BanknotesIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cost Price</p>
              <p className="text-xl font-bold text-slate-800">Rs. {item.costPrice?.toLocaleString()}</p>
              <p className="text-xs text-green-600 font-bold mt-1 bg-green-50 px-2 py-0.5 rounded inline-block">
                Profit: Rs. { (item.salePrice - item.costPrice).toLocaleString() }
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-50 rounded-xl text-slate-600 border border-slate-100">
              <ShoppingCartIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Inventory</p>
              <p className={`text-xl font-bold ${item.quantity < 5 ? 'text-red-600' : 'text-slate-800'}`}>
                {item.quantity} Units
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">Available in Stock</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-50 rounded-xl text-slate-600 border border-slate-100">
              <CubeIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Product ID</p>
              <p className="text-xl font-mono font-bold text-slate-800">#{item.id}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">System Reference</p>
            </div>
          </div>

        </div>

        {/* 4. Footer Message */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-between items-center">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Verified Digital Record
          </p>
          <p className="text-[10px] text-slate-400 italic font-medium uppercase">
            Last Checked: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}