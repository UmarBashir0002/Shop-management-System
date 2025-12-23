import React, { useMemo, useRef, forwardRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Loader from '../../components/common/Loader'
import { 
  ArrowLeftIcon, 
  PrinterIcon, 
  CheckBadgeIcon,
  BanknotesIcon,
  ExclamationCircleIcon,
  ScaleIcon
} from '@heroicons/react/24/outline'
import { useOrderQuery } from '../../hooks/useOrders'

// --- 1. THE NARROW SLIP COMPONENT ---
const PrintableReceipt = forwardRef(({ order, metrics }, ref) => {
  if (!order) return null;
  const items = order?.items ?? order?.OrderItem ?? [];

  return (
    <div ref={ref} className="thermal-slip">
      {/* HEADER */}
      <div className="receipt-header">
        <h1>Machine Traders</h1>
        <p>1st Floor City Plaza College Road</p>
        <p>Rawalpindi. Tel: 051-5775470-71</p>
      </div>

      {/* METADATA */}
      <div className="receipt-row font-bold border-b-dashed">
        <span>SO: {order.id}</span>
        <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="receipt-row italic">
        <span>Customer: {order.customerName || 'Walk-in'}</span>
      </div>

      {/* TABLE */}
      <table className="receipt-table">
        <thead>
          <tr>
            <th>Sr.</th>
            <th>Particulars</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td className="text-left font-bold">{it.item?.name || it.name}</td>
              <td>{it.quantity}</td>
              <td>{it.price}</td>
              <td className="font-bold">{(it.quantity * it.price).toFixed(0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALS */}
      <div className="receipt-totals">
        <div className="receipt-row">
          <span>Total Item Qty:</span>
          <span>{items.reduce((acc, curr) => acc + curr.quantity, 0)}</span>
        </div>
        <div className="receipt-row grand-total">
          <span>Total Bill:</span>
          <span>Rs. {metrics.total.toLocaleString()}</span>
        </div>
        <div className="receipt-row font-bold">
          <span>Received Amount:</span>
          <span>Rs. {metrics.paid.toLocaleString()}</span>
        </div>
      </div>

      {/* STAMP */}
      <div className="stamp-container">
        <div className="paid-stamp">
          PAID
          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* FOOTER */}
      <div className="receipt-footer">
        <p>DEALS IN PHOTO COPIERS, PRINTERS, TONERS, DRUMS & INK</p>
        <p className="font-bold underline uppercase">House of Office Equipments</p>
      </div>

      {/* CSS STYLES FOR NARROW PRINTING */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media screen {
          .thermal-slip { display: none; }
        }
        @media print {
          @page { 
            size: 80mm auto; 
            margin: 0; 
          }
          body { 
            margin: 0; 
            padding: 0;
            -webkit-print-color-adjust: exact; 
          }
          .thermal-slip {
            display: block !important;
            width: 72mm; /* Slightly less than 80mm to account for printer margins */
            padding: 4mm;
            font-family: 'Courier New', Courier, monospace;
            font-size: 10pt;
            color: #000;
            background: #fff;
            margin: 0 auto;
          }
          .receipt-header { text-align: center; border-bottom: 2px solid #000; margin-bottom: 5px; padding-bottom: 5px; }
          .receipt-header h1 { font-size: 16pt; margin: 0; text-transform: uppercase; font-weight: 900; }
          .receipt-header p { font-size: 8pt; margin: 0; }
          
          .receipt-row { display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 9pt; }
          .border-b-dashed { border-bottom: 1px dashed #000; margin-bottom: 5px; padding-bottom: 2px; }
          
          .receipt-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          .receipt-table th { border-bottom: 1px solid #000; text-align: left; font-size: 8pt; padding: 2px 0; }
          .receipt-table td { font-size: 9pt; padding: 4px 0; text-align: center; vertical-align: top; }
          .receipt-table .text-left { text-align: left; }
          
          .grand-total { border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 0; font-size: 12pt; font-weight: 900; margin: 5px 0; }
          
          .stamp-container { text-align: center; padding: 20px 0; }
          .paid-stamp { 
            display: inline-block; border: 3px solid rgba(220, 38, 38, 0.6); color: rgba(220, 38, 38, 0.6);
            padding: 5px 15px; border-radius: 10px; font-weight: 900; font-size: 20pt; transform: rotate(-15deg); 
          }
          .paid-stamp span { display: block; font-size: 8pt; border-top: 1px solid rgba(220, 38, 38, 0.4); }

          .receipt-footer { text-align: center; font-size: 7pt; margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; }
          /* Hide standard elements */
          nav, header, footer, .no-print, .dashboard-nav, button { display: none !important; }
        }
      `}} />
    </div>
  );
});

// --- 2. MAIN PAGE (Design Kept Exactly Same) ---
export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const printRef = useRef()
  const { data: order, isLoading } = useOrderQuery(id)

  const orderItems = useMemo(() => order?.items ?? order?.OrderItem ?? [], [order])
  
  const metrics = useMemo(() => {
    const total = orderItems.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0)
    const paid = Number(order?.paidAmount || 0)
    const balance = total - paid
    const percentage = total > 0 ? (paid / total) * 100 : 0
    
    return { total, paid, balance, percentage }
  }, [orderItems, order])

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  if (isLoading) return <DashboardLayout><div className="flex justify-center py-20"><Loader /></div></DashboardLayout>

  return (
    <DashboardLayout>
      {/* Hidden Print Logic */}
      <PrintableReceipt ref={printRef} order={order} metrics={metrics} />

      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/orders')} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition-all shadow-sm">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Order #{id}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`flex h-2 w-2 rounded-full ${metrics.balance > 0 ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {metrics.balance > 0 ? 'Payment Incomplete' : 'Settled'}
                </span>
              </div>
            </div>
          </div>

          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 rounded-xl text-white font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            <CheckBadgeIcon className="w-4 h-4" /> Update Status
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
          
          {/* LEFT: ITEMS TABLE */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden mb-6">
              <div className="p-2">
                <table className="w-full">
                  <thead className="border-b border-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-left">Product</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-center">Qty</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orderItems.map((it, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 font-bold text-slate-800">{it.item?.name || it.name}</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-500">x{it.quantity}</td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">Rs. {(it.price * it.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: CRITICAL FINANCIAL DETAILS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Payment Ledger</h4>
              
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg"><BanknotesIcon className="w-5 h-5 text-slate-600" /></div>
                    <span className="text-sm font-bold text-slate-600">Grand Total</span>
                  </div>
                  <span className="font-black text-slate-900 italic">Rs. {metrics.total.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg"><CheckBadgeIcon className="w-5 h-5 text-green-600" /></div>
                    <span className="text-sm font-bold text-slate-600">Amount Paid</span>
                  </div>
                  <span className="font-black text-green-600">Rs. {metrics.paid.toLocaleString()}</span>
                </div>

                <div className={`flex justify-between items-center p-4 rounded-2xl ${metrics.balance > 0 ? 'bg-red-50 ring-1 ring-red-100' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${metrics.balance > 0 ? 'bg-white text-red-600' : 'bg-white text-slate-400'}`}>
                      {metrics.balance > 0 ? <ExclamationCircleIcon className="w-5 h-5" /> : <ScaleIcon className="w-5 h-5" />}
                    </div>
                    <span className={`text-sm font-bold ${metrics.balance > 0 ? 'text-red-700' : 'text-slate-600'}`}>Balance Due</span>
                  </div>
                  <span className={`font-black text-lg ${metrics.balance > 0 ? 'text-red-600' : 'text-slate-900'}`}>Rs. {metrics.balance.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                  <span className="text-slate-400 font-black">Collection Progress</span>
                  <span className="text-indigo-600">{metrics.percentage.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${metrics.balance > 0 ? 'bg-amber-400' : 'bg-green-500'}`} 
                    style={{ width: `${metrics.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePrint}
              className="w-full py-4 bg-[#0F172A] hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
            >
              <PrinterIcon className="w-5 h-5 text-slate-400" />
              Generate Official Receipt
            </button>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}