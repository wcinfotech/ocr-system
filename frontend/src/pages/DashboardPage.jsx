import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineTrendingUp,
  HiOutlineUserGroup,
  HiOutlineCurrencyRupee,
  HiOutlineInboxIn,
  HiOutlineCloudUpload,
  HiOutlineRefresh,
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineClock,
  HiOutlineArrowRight,
  HiOutlineReceiptRefund,
} from 'react-icons/hi';
import { useData } from '../context/DataContext';
import SEO from '../components/SEO';

const platformMetadata = {
  amazon: {
    name: 'Amazon',
    borderColor: 'border-amber-200',
    bgColor: 'bg-gradient-to-br from-amber-50/60 to-orange-50/20',
    barColor: 'bg-amber-500',
    textColor: 'text-amber-800'
  },
  flipkart: {
    name: 'Flipkart',
    borderColor: 'border-blue-200',
    bgColor: 'bg-gradient-to-br from-blue-50/60 to-sky-50/20',
    barColor: 'bg-blue-500',
    textColor: 'text-blue-800'
  },
  meesho: {
    name: 'Meesho',
    borderColor: 'border-pink-200',
    bgColor: 'bg-gradient-to-br from-pink-50/60 to-rose-50/20',
    barColor: 'bg-pink-500',
    textColor: 'text-pink-800'
  },
  myntra: {
    name: 'Myntra',
    borderColor: 'border-rose-200',
    bgColor: 'bg-gradient-to-br from-rose-50/60 to-red-50/20',
    barColor: 'bg-rose-500',
    textColor: 'text-rose-800'
  },
  ajio: {
    name: 'AJIO',
    borderColor: 'border-slate-200',
    bgColor: 'bg-gradient-to-br from-slate-50/60 to-zinc-50/20',
    barColor: 'bg-slate-700',
    textColor: 'text-slate-800'
  },
  jiomart: {
    name: 'JioMart',
    borderColor: 'border-emerald-200',
    bgColor: 'bg-gradient-to-br from-emerald-50/60 to-teal-50/20',
    barColor: 'bg-emerald-500',
    textColor: 'text-emerald-800'
  },
  generic_gst: {
    name: 'Generic GST',
    borderColor: 'border-violet-200',
    bgColor: 'bg-gradient-to-br from-violet-50/60 to-purple-50/20',
    barColor: 'bg-violet-500',
    textColor: 'text-violet-800'
  },
  other: {
    name: 'Other Platforms',
    borderColor: 'border-purple-200',
    bgColor: 'bg-gradient-to-br from-purple-50/60 to-fuchsia-50/20',
    barColor: 'bg-purple-500',
    textColor: 'text-purple-800'
  }
};

const getPlatformMeta = (plat) => {
  const key = String(plat).toLowerCase();
  return platformMetadata[key] || {
    name: plat ? plat.toUpperCase() : 'Other Channel',
    borderColor: 'border-slate-200',
    bgColor: 'bg-gradient-to-br from-slate-50/60 to-zinc-50/20',
    barColor: 'bg-slate-500',
    textColor: 'text-slate-800'
  };
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { stats, recentBills, loadingDashboard: loading, fetchDashboardData } = useData();

  useEffect(() => {
    fetchDashboardData(true); // silent background reload on tab mount
  }, [fetchDashboardData]);

  const loadData = () => {
    fetchDashboardData(false); // full loading indicator/toast on manual click
  };

  const onQuickDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      navigate('/app/upload', { state: { preloadedFiles: acceptedFiles } });
    }
  }, [navigate]);

  const { getRootProps: getQuickRootProps, getInputProps: getQuickInputProps, isDragActive: isQuickDragActive } = useDropzone({
    onDrop: onQuickDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/tiff': ['.tiff', '.tif'],
      'image/bmp': ['.bmp'],
      'image/heic': ['.heic'],
      'application/zip': ['.zip'],
    },
    multiple: true,
  });

  const getActivityTimeline = () => {
    if (recentBills.length === 0) return [];
    
    return recentBills.map((bill) => {
      const timeStr = new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = new Date(bill.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      let title = '';
      let desc = '';
      let type = ''; // success, error, warning

      if (bill.status === 'completed') {
        title = `Invoice processed successfully`;
        desc = `Extracted ₹${bill.amount?.toLocaleString('en-IN') || 0} from ${bill.vendorName || 'Unknown Vendor'}`;
        type = 'success';
      } else if (bill.status === 'failed') {
        title = `Extraction failed`;
        desc = bill.errorMessage ? `Error: ${bill.errorMessage.slice(0, 60)}...` : `Could not extract text from ${bill.originalFileName}`;
        type = 'error';
      } else {
        title = `Document upload processing`;
        desc = `Running OCR and extraction pipeline for ${bill.originalFileName}`;
        type = 'processing';
      }

      return {
        id: bill._id,
        title,
        desc,
        time: `${dateStr} at ${timeStr}`,
        type,
      };
    });
  };

  const activityFeed = getActivityTimeline();

  const fmtAmt = (a) => (a != null ? `₹${a.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '₹0.00');

  if (loading && !stats) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="h-10 w-48 skeleton" />
          <div className="h-10 w-24 skeleton" />
        </div>
        
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 skeleton w-full rounded-2xl" />
          ))}
        </div>

        {/* Platform stats skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-36 skeleton" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-56 skeleton w-full rounded-2xl" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 skeleton w-full rounded-2xl" />
          <div className="h-96 skeleton w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <SEO title="Dashboard" />
      {/* Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time analytics and OCR extraction summaries
          </p>
        </div>
        <button
          onClick={loadData}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <HiOutlineRefresh className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {[
          {
            label: 'Total Bills',
            value: stats?.total || 0,
            icon: HiOutlineInboxIn,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
          },
          {
            label: "Today's Bills",
            value: stats?.todayCount || 0,
            icon: HiOutlineCalendar,
            color: 'text-sky-600',
            bg: 'bg-sky-50',
          },
          {
            label: 'Monthly Bills',
            value: stats?.monthCount || 0,
            icon: HiOutlineDocumentText,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
          },
          {
            label: 'Total Vendors',
            value: stats?.totalVendors || 0,
            icon: HiOutlineUserGroup,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Total Amount',
            value: fmtAmt(stats?.totalAmount),
            icon: HiOutlineCurrencyRupee,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            isAmount: true,
          },
          {
            label: 'Success Rate',
            value: `${stats?.successRate || 0}%`,
            icon: HiOutlineTrendingUp,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="glass-card p-5 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex flex-col justify-between animate-fadeIn"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className={`font-extrabold text-slate-900 tracking-tight ${s.isAmount ? 'text-lg sm:text-xl' : 'text-2xl'}`}>
                  {s.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform-wise Performance Analytics */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Platform Performance</h3>
          <p className="text-xs text-slate-400 font-medium">Channel-wise bill processing, return values, and estimated profit margins</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
          {(() => {
            const sortedPlatformStats = stats?.platformStats && stats.platformStats.length > 0
              ? [...stats.platformStats].sort((a, b) => {
                  if ((b.count || 0) !== (a.count || 0)) {
                    return (b.count || 0) - (a.count || 0);
                  }
                  return String(a._id || '').localeCompare(String(b._id || ''));
                })
              : [];

            if (sortedPlatformStats.length === 0) {
              return (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs font-medium bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
                  No platform analytics available. Upload bills to generate performance insights.
                </div>
              );
            }

            return sortedPlatformStats.map((plat) => {
              const meta = getPlatformMeta(plat._id);
              
              // Calculate values
              const totalCount = plat.count || 0;
              const regCount = plat.regularCount || 0;
              const retCount = plat.returnCount || 0;
              
              const regAmt = plat.regularAmount || 0;
              const retAmt = plat.returnAmount || 0;
              
              // Estimated Net Profit / Value = Regular Amount (Sales) - Return Amount (Claims/Returns)
              const netValue = regAmt - retAmt;
              const isProfitPositive = netValue >= 0;
              
              // Return rate (returns vs total invoices)
              const returnRate = totalCount > 0 ? Math.round((retCount / totalCount) * 100) : 0;

              return (
                <div 
                  key={plat._id} 
                  className={`glass-card p-5 bg-white border ${meta.borderColor} rounded-2xl shadow-sm hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 ${meta.bgColor} flex flex-col justify-between`}
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100/60">
                      <span className={`text-xs font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md ${meta.textColor} bg-white/80 shadow-xs`}>
                        {meta.name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {totalCount} {totalCount === 1 ? 'Bill' : 'Bills'}
                      </span>
                    </div>

                    {/* Net Value (Profit) */}
                    <div className="my-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Net profit</span>
                      <h4 className={`text-xl font-extrabold tracking-tight ${isProfitPositive ? 'text-emerald-600' : 'text-rose-600'} mt-1`}>
                        {isProfitPositive ? '' : '-'}{fmtAmt(Math.abs(netValue))}
                      </h4>
                    </div>

                    {/* Return Rate Progress Bar */}
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-[9px] font-bold">
                        <span className="text-slate-400 uppercase">Return Rate</span>
                        <span className={`${returnRate > 30 ? 'text-amber-600' : 'text-slate-500'} font-mono`}>
                          {returnRate}% ({retCount} items)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200/50 rounded-full overflow-hidden border border-slate-200/20">
                        <div 
                          style={{ width: `${returnRate}%` }} 
                          className={`h-full rounded-full ${meta.barColor} transition-all duration-500`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100/60 bg-white/40 rounded-xl p-3">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Sales / Orders</span>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">{fmtAmt(regAmt)}</span>
                      <span className="text-[9px] font-semibold text-slate-400 block font-mono">{regCount} completed</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Returns / Claims</span>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">{fmtAmt(retAmt)}</span>
                      <span className="text-[9px] font-semibold text-slate-400 block font-mono">{retCount} returns</span>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bills List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Recent Bills</h3>
            <Link
              to="/app/history"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              View all history
              <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-card bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            {recentBills.length === 0 ? (
              <div className="p-12 text-center">
                <HiOutlineDocumentText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 text-sm font-semibold">No bills uploaded yet</p>
                <Link to="/app/upload" className="text-xs text-indigo-600 hover:underline mt-1 inline-block">
                  Upload your first bill
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentBills.map((bill) => (
                  <div key={bill._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          bill.billType === 'return'
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}
                      >
                        {bill.billType === 'return' ? (
                          <HiOutlineReceiptRefund className="w-5 h-5 text-red-600" />
                        ) : (
                          <HiOutlineDocumentText className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {bill.vendorName || bill.originalFileName || 'Unknown Vendor'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="font-mono">{bill.invoiceNumber || 'No invoice #'}</span>
                          <span>&bull;</span>
                          <span>{bill.billDate || 'No date'}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-slate-900">
                          {bill.amount != null ? `₹${bill.amount.toLocaleString('en-IN')}` : '—'}
                        </p>
                        <span
                          className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 uppercase ${
                            bill.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : bill.status === 'failed'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {bill.status}
                        </span>
                      </div>
                      <Link
                        to={`/app/bill/${bill._id}`}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <HiOutlineEye className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets Column */}
        <div className="space-y-8">
          {/* Quick Upload Action */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Quick Upload</h3>
            <div
              {...getQuickRootProps()}
              className={`glass-card border shadow-sm rounded-2xl p-5 text-center flex flex-col items-center cursor-pointer select-none transition-all duration-200 ${
                isQuickDragActive
                  ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/10 scale-[1.02]'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input {...getQuickInputProps()} />
              <div className="flex flex-col items-center w-full pointer-events-none">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-200 ${
                    isQuickDragActive ? 'bg-indigo-600 text-white scale-110 shadow-md shadow-indigo-500/30' : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  <HiOutlineCloudUpload className={`w-6 h-6 ${isQuickDragActive ? 'animate-bounce' : ''}`} />
                </div>
                <h4 className={`text-sm font-bold transition-colors ${isQuickDragActive ? 'text-indigo-600' : 'text-slate-800'}`}>
                  {isQuickDragActive ? 'Drop Bills to Upload' : 'Process Invoices'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
                  {isQuickDragActive ? 'Release mouse to start parsing' : 'Select invoices or drag them here to trigger background OCR parsing'}
                </p>
                <div className="mt-4 btn-primary text-xs w-full py-2.5 flex items-center justify-center gap-1">
                  <span>Select Files</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
            <div className="glass-card bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
              {activityFeed.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">No recent activity detected.</div>
              ) : (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {activityFeed.map((item, itemIdx) => {
                      let Icon = HiOutlineClock;
                      let iconColor = 'text-amber-500';
                      let iconBg = 'bg-amber-50';

                      if (item.type === 'success') {
                        Icon = HiOutlineCheckCircle;
                        iconColor = 'text-emerald-500';
                        iconBg = 'bg-emerald-50';
                      } else if (item.type === 'error') {
                        Icon = HiOutlineExclamationCircle;
                        iconColor = 'text-red-500';
                        iconBg = 'bg-red-50';
                      }

                      return (
                        <li key={item.id}>
                          <div className="relative pb-8">
                            {itemIdx !== activityFeed.length - 1 ? (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span
                                  className={`h-8 w-8 rounded-full ${iconBg} flex items-center justify-center ring-8 ring-white`}
                                >
                                  <Icon className={`w-5 h-5 ${iconColor}`} aria-hidden="true" />
                                </span>
                              </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-xs font-bold text-slate-800">{item.title}</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                                <span className="text-[9px] font-semibold text-slate-400 block mt-1 uppercase">
                                  {item.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
