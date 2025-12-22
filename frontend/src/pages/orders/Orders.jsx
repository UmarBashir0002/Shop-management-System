import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { 
  EyeIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  PlusIcon, 
  CalendarIcon,
  BanknotesIcon 
} from "@heroicons/react/24/outline";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { useOrdersQuery, useDeleteOrder } from "../../hooks/useOrders";
import OrderTable from "./OrderTable";

export default function OrderList() {
  const navigate = useNavigate();
  const [filterRange, setFilterRange] = useState("all");
  const { data, isLoading, isError, error, refetch } = useOrdersQuery();
  const deleteMutation = useDeleteOrder();

  // Refresh data on mount to catch database changes
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Filter Logic
  const filteredOrders = useMemo(() => {
    let rawOrders = [];
    if (Array.isArray(data)) rawOrders = data;
    else if (data?.data) rawOrders = data.data;

    if (filterRange === "all") return rawOrders;

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    return rawOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      
      if (filterRange === "day") {
        return orderDate >= startOfToday;
      }
      
      if (filterRange === "week") {
        const lastWeek = new Date();
        lastWeek.setDate(now.getDate() - 7);
        return orderDate >= lastWeek;
      }

      if (filterRange === "month") {
        const lastMonth = new Date();
        lastMonth.setMonth(now.getMonth() - 1);
        return orderDate >= lastMonth;
      }

      return true;
    });
  }, [data, filterRange]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[320px]">
          <Loader />
          <p className="mt-4 text-slate-500 animate-pulse">Loading orders...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-white rounded shadow">
          <p className="text-red-600">Failed to load orders: {error?.message}</p>
        </div>
      </DashboardLayout>
    );
  }

  const columns = [
    {
      title: "Order Info",
      key: "id",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">#{row.id}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400">
            {new Date(row.createdAt).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      title: "Payment Status",
      key: "status",
      render: (row) => {
        const colors = {
          PAID: "bg-green-100 text-green-700 border-green-200",
          PARTIAL: "bg-orange-100 text-orange-700 border-orange-200",
          UNPAID: "bg-red-100 text-red-700 border-red-200",
        };
        return (
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${colors[row.status] || colors.PAID}`}>
            {row.status || "PAID"}
          </span>
        );
      },
    },
    {
      title: "Finances",
      key: "total",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">Rs. {row.total?.toLocaleString()}</span>
          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
            <span>Paid: Rs. {row.paidAmount?.toLocaleString() || 0}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Balance",
      key: "balance",
      render: (row) => {
        const balance = (row.total || 0) - (row.paidAmount || 0);
        return (
          <span className={`font-bold text-sm ${balance > 0 ? 'text-red-500' : 'text-slate-400'}`}>
            {balance > 0 ? `Rs. ${balance.toLocaleString()}` : "Settled"}
          </span>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (row) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/orders/${row.id}`)} 
            className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors group"
            title="View Details"
          >
            <EyeIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
          </button>
          <button 
            onClick={() => navigate(`/orders/${row.id}/edit`)} 
            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors group"
            title="Edit Order"
          >
            <PencilSquareIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
          </button>
          <button
            onClick={() => {
              if (!confirm("Are you sure? This will delete the order and restore product stock.")) return;
              deleteMutation.mutate(row.id);
            }}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group disabled:opacity-30"
            disabled={deleteMutation.isPending}
            title="Delete Order"
          >
            <TrashIcon className="w-5 h-5 text-slate-400 group-hover:text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Orders</h1>
          <p className="text-slate-500 text-sm font-medium">Manage transactions and track partial payments.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter Dropdown */}
          <div className="relative">
            <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={filterRange}
              onChange={(e) => setFilterRange(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer shadow-sm hover:border-slate-300 transition-all"
            >
              <option value="all">All Transactions</option>
              <option value="day">Today's Sales</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <Button 
            onClick={() => navigate("/orders/new")} 
            className="flex items-center gap-2 bg-indigo-600 shadow-indigo-200 shadow-lg"
          >
            <PlusIcon className="w-5 h-5" />
            New Order
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredOrders.length > 0 ? (
          <OrderTable columns={columns} data={filteredOrders} />
        ) : (
          <div className="p-24 text-center">
            <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
              <BanknotesIcon className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium mb-2">No orders found for the selected period.</p>
            <button 
              onClick={() => setFilterRange("all")} 
              className="text-indigo-600 text-sm font-black hover:text-indigo-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}