import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Loader from "../../components/common/Loader";
import { 
  BanknotesIcon, 
  ShoppingCartIcon, 
  CubeIcon, 
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  BriefcaseIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useOrdersQuery } from "../../hooks/useOrders";
import { useItemsQuery } from "../../hooks/useProducts";

export default function Dashboard() {
  const navigate = useNavigate();
  
  // --- DATE FILTER STATE ---
  // Default: Start of current month to today
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const { data: orders, isLoading: ordersLoading } = useOrdersQuery();
  const { data: itemsData, isLoading: itemsLoading } = useItemsQuery();

  const allOrders = useMemo(() => (Array.isArray(orders) ? orders : orders?.data || []), [orders]);
  const allItems = useMemo(() => (Array.isArray(itemsData) ? itemsData : itemsData?.data || []), [itemsData]);

  // --- FILTERED DATA ---
  const filteredOrders = useMemo(() => {
    return allOrders.filter(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      return orderDate >= dateRange.start && orderDate <= dateRange.end;
    });
  }, [allOrders, dateRange]);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    // 1. Revenue & Orders based on selected dates (Already working)
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalPaid = filteredOrders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
    const pendingAmount = totalRevenue - totalPaid;

    // 2. NEW: Filter Items by Date Range for Investment
    const filteredItems = allItems.filter(item => {
      const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });

    // 3. Investment based on FILTERED items
    const totalInvestment = filteredItems.reduce((sum, item) => {
      return sum + ((Number(item.costPrice) || 0) * (Number(item.quantity) || 0));
    }, 0);

    // 4. Low Stock based on FILTERED items
    const lowStockCount = filteredItems.filter(i => (i.quantity || 0) <= 5).length;

    return { 
      totalRevenue, 
      totalPaid, 
      pendingAmount, 
      lowStockCount, 
      orderCount: filteredOrders.length,
      totalInvestment 
    };
  }, [filteredOrders, allItems, dateRange]);

  // --- CHART DATA: Dynamic based on range ---
  const chartData = useMemo(() => {
    try {
      const days = [];
      let current = new Date(dateRange.start);
      const end = new Date(dateRange.end);

      while (current <= end) {
        days.push({
          date: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: 0,
          fullDate: current.toDateString()
        });
        current.setDate(current.getDate() + 1);
      }

      filteredOrders.forEach(order => {
        const orderDate = new Date(order.createdAt).toDateString();
        const dayEntry = days.find(d => d.fullDate === orderDate);
        if (dayEntry) {
          dayEntry.amount += (parseFloat(order.total) || 0);
        }
      });
      return days;
    } catch (err) {
      return [err];
    }
  }, [filteredOrders, dateRange]);

  if (ordersLoading || itemsLoading) return <DashboardLayout><div className="flex justify-center py-20"><Loader /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        
        {/* Header & Date Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Overview</h1>
            <p className="text-slate-500 font-medium">Analytics for filtered period</p>
          </div>

          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 text-slate-400 ml-2" />
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
              className="border-none focus:ring-0 text-sm font-bold text-slate-700 cursor-pointer"
            />
            <span className="text-slate-300 font-bold">to</span>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
              className="border-none focus:ring-0 text-sm font-bold text-slate-700 cursor-pointer"
            />
          </div>
        </div>

        {/* 1. Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="Total Investment" value={`Rs. ${stats.totalInvestment.toLocaleString()}`} icon={<BriefcaseIcon className="w-6 h-6 text-blue-600"/>} color="bg-blue-50" subtitle="All Stock" />
          <StatCard title="Revenue" value={`Rs. ${stats.totalRevenue.toLocaleString()}`} icon={<BanknotesIcon className="w-6 h-6 text-emerald-600"/>} color="bg-emerald-50" subtitle="In Range" />
          <StatCard title="Unpaid" value={`Rs. ${stats.pendingAmount.toLocaleString()}`} icon={<ClockIcon className="w-6 h-6 text-orange-600"/>} color="bg-orange-50" subtitle="In Range" />
          <StatCard title="Orders" value={stats.orderCount} icon={<ShoppingCartIcon className="w-6 h-6 text-indigo-600"/>} color="bg-indigo-50" subtitle="In Range" />
          <StatCard title="Low Stock" value={stats.lowStockCount} icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-600"/>} color="bg-red-50" subtitle="Alerts" />
        </div>

        {/* 2. Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
              <ArrowTrendingUpIcon className="w-5 h-5 text-indigo-500" /> Sales Performance
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#0F172A] p-8 rounded-3xl shadow-xl text-white">
            <h3 className="font-bold mb-6 text-slate-400 uppercase text-xs tracking-widest">Payment Status</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Collected', value: stats.totalPaid },
                      { name: 'Pending', value: stats.pendingAmount }
                    ]}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f97316" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center text-sm text-slate-400">
                <span>Collected</span>
                <span className="font-bold text-white">Rs. {stats.totalPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-400">
                <span>Outstanding</span>
                <span className="font-bold text-white">Rs. {stats.pendingAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Recent Transactions</h3>
              <button onClick={() => navigate('/orders')} className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
            </div>
            <div className="divide-y divide-slate-50">
              {filteredOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">#{order.id}</div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Rs. {order.total.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black border ${
                    order.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CubeIcon className="w-5 h-5 text-red-500" /> Stock Alerts
              </h3>
            </div>
            <div className="p-6">
              {allItems.filter(i => i.quantity <= 5).slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center justify-between mb-4 last:mb-0 bg-red-50 p-3 rounded-2xl border border-red-100">
                  <span className="text-sm font-bold text-slate-700">{item.name}</span>
                  <span className="text-xs font-black text-red-600">Only {item.quantity} left</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{title}</h3>
      <p className="text-xl font-black text-slate-900 mt-1">{value}</p>
      <p className="text-[10px] text-slate-400 mt-1 italic">{subtitle}</p>
    </div>
  );
}