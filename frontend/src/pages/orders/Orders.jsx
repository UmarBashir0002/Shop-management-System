import React, { useMemo, useState, useEffect } from "react"; // 1. Added useState & useEffect
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { EyeIcon, PencilSquareIcon, TrashIcon, PlusIcon, CalendarIcon } from "@heroicons/react/24/outline";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { useOrdersQuery, useDeleteOrder } from "../../hooks/useOrders";
import OrderTable from "./OrderTable";

export default function OrderList() {
  const navigate = useNavigate();
  const [filterRange, setFilterRange] = useState("all"); // 2. Filter State
  const { data, isLoading, isError, error, refetch } = useOrdersQuery();
  const deleteMutation = useDeleteOrder();

  // Refresh data on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // 3. Filter Logic
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
      title: "Order",
      key: "id",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">#{row.id}</span>
          <span className="text-xs text-slate-400">{new Date(row.createdAt).toLocaleString()}</span>
        </div>
      ),
    },
    {
      title: "Items",
      key: "items",
      render: (row) => {
        const items = row?.items ?? row?.OrderItem ?? [];
        return (
          <div className="text-sm text-slate-600 max-w-xs truncate">
            {items.length > 0 ? items.map((it, idx) => (
              <span key={idx} className="inline-block mr-2">
                {it.name ?? `#${it.itemId}`} x{it.quantity}
              </span>
            )) : <span className="text-xs text-gray-400">—</span>}
          </div>
        );
      },
    },
    {
      title: "Total",
      key: "total",
      render: (row) => <span className="font-semibold text-green-600">Rs. {row.total}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (row) => (
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/orders/${row.id}`)} title="View">
            <EyeIcon className="w-5 h-5 text-slate-400 hover:text-indigo-600" />
          </button>
          <button onClick={() => navigate(`/orders/${row.id}/edit`)} title="Edit">
            <PencilSquareIcon className="w-5 h-5 text-slate-400 hover:text-blue-600" />
          </button>
          <button
            onClick={() => {
              if (!confirm("Delete this order?")) return;
              deleteMutation.mutate(row.id);
            }}
            title="Delete"
            className="disabled:opacity-50"
            disabled={deleteMutation.isPending}
          >
            <TrashIcon className="w-5 h-5 text-slate-400 hover:text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orders</h1>
          <p className="text-slate-500 text-sm">View and filter your transactions.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 4. Date Filter Dropdown */}
          <div className="relative">
            <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={filterRange}
              onChange={(e) => setFilterRange(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer shadow-sm hover:border-slate-300 transition-all"
            >
              <option value="all">All Time</option>
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <Button 
            onClick={() => navigate("/orders/new")} 
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            New Order
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredOrders.length > 0 ? (
          <OrderTable columns={columns} data={filteredOrders} />
        ) : (
          <div className="p-20 text-center">
            <p className="text-slate-400 mb-2">No orders found for this period.</p>
            <button 
              onClick={() => setFilterRange("all")} 
              className="text-indigo-600 text-sm font-bold hover:underline"
            >
              Show all orders
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}