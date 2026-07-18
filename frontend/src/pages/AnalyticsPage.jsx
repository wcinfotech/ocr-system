import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineChartBar,
  HiOutlineRefresh,
  HiOutlineArrowUp,
  HiOutlineUser,
  HiOutlineCurrencyRupee,
  HiOutlineShoppingBag,
  HiOutlineDocumentReport,
} from 'react-icons/hi';
import { useData } from '../context/DataContext';
import SEO from '../components/SEO';

const AnalyticsPage = () => {
  const { analytics, loadingAnalytics: loading, fetchAnalyticsData } = useData();

  useEffect(() => {
    fetchAnalyticsData(true); // silent background load on tab mount
  }, [fetchAnalyticsData]);

  const processAnalytics = (allBills) => {
    if (!allBills || allBills.length === 0) {
      setAnalytics(null);
      return;
    }

    const completedBills = allBills.filter(b => b.status === 'completed');

    // 1. Core KPIs
    const totalAmount = completedBills.reduce((sum, b) => sum + (b.amount || 0), 0);
    const avgAmount = completedBills.length > 0 ? totalAmount / completedBills.length : 0;

    // Vendor counts
    const vendorCounts = {};
    completedBills.forEach(b => {
      const v = b.vendorName || 'Unknown';
      vendorCounts[v] = (vendorCounts[v] || 0) + 1;
    });
    let peakVendor = 'N/A';
    let maxVendorCount = 0;
    Object.entries(vendorCounts).forEach(([vendor, count]) => {
      if (count > maxVendorCount) {
        maxVendorCount = count;
        peakVendor = vendor;
      }
    });

    // Platform counts
    const platformCounts = {};
    completedBills.forEach(b => {
      const p = b.platform || b.supplierPlatform || 'other';
      platformCounts[p] = (platformCounts[p] || 0) + 1;
    });
    let topPlatform = 'N/A';
    let maxPlatformCount = 0;
    Object.entries(platformCounts).forEach(([plat, count]) => {
      if (count > maxPlatformCount) {
        maxPlatformCount = count;
        topPlatform = plat;
      }
    });

    // Return rates
    const totalCount = allBills.length;
    const returnCount = allBills.filter(b => b.billType === 'return').length;
    const returnRate = totalCount > 0 ? (returnCount / totalCount) * 100 : 0;

    // 2. Bills per month (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = {};

    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyData[key] = { count: 0, amount: 0 };
    }

    allBills.forEach(b => {
      const date = b.createdAt ? new Date(b.createdAt) : null;
      if (date) {
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
        if (monthlyData[key] !== undefined) {
          monthlyData[key].count += 1;
          if (b.status === 'completed' && b.amount) {
            monthlyData[key].amount += b.amount;
          }
        }
      }
    });

    // 3. Bills per day (last 7 days trend)
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      dailyData.push({ label: key, dateStr: d.toDateString(), count: 0 });
    }

    allBills.forEach(b => {
      const date = b.createdAt ? new Date(b.createdAt) : null;
      if (date) {
        const dateStr = date.toDateString();
        const found = dailyData.find(item => item.dateStr === dateStr);
        if (found) {
          found.count += 1;
        }
      }
    });

    // 4. Vendor distribution (Top 5 + Others)
    const vendorAmounts = {};
    completedBills.forEach(b => {
      const v = b.vendorName || 'Unknown';
      vendorAmounts[v] = (vendorAmounts[v] || 0) + (b.amount || 0);
    });
    const sortedVendors = Object.entries(vendorAmounts)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    const top5Vendors = sortedVendors.slice(0, 5);
    const otherVendorsAmount = sortedVendors.slice(5).reduce((sum, v) => sum + v.amount, 0);
    const vendorChartData = [...top5Vendors];
    if (otherVendorsAmount > 0) {
      vendorChartData.push({ name: 'Others', amount: otherVendorsAmount });
    }

    // 5. Amount distribution buckets
    const amountBuckets = [
      { label: 'Under ₹1k', min: 0, max: 1000, count: 0 },
      { label: '₹1k - ₹5k', min: 1000, max: 5000, count: 0 },
      { label: '₹5k - ₹10k', min: 5000, max: 10000, count: 0 },
      { label: 'Above ₹10k', min: 10000, max: Infinity, count: 0 },
    ];
    completedBills.forEach(b => {
      const amt = b.amount || 0;
      const bucket = amountBuckets.find(bucket => amt >= bucket.min && amt < bucket.max);
      if (bucket) bucket.count += 1;
    });

    setAnalytics({
      avgAmount,
      peakVendor,
      topPlatform,
      returnRate,
      monthly: Object.entries(monthlyData).map(([label, val]) => ({ label, count: val.count, amount: val.amount })),
      daily: dailyData,
      vendors: vendorChartData,
      amounts: amountBuckets,
    });
  };

  // Helper to draw clean SVG charts
  const drawLineChartPath = (data, width, height, padding) => {
    if (!data || data.length === 0) return '';
    const maxVal = Math.max(...data.map(d => d.count), 4);
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((d, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = height - padding - (d.count / maxVal) * chartHeight;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="h-10 w-48 skeleton" />
          <div className="h-10 w-24 skeleton" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 skeleton w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 skeleton w-full" />
          <div className="h-96 skeleton w-full" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="glass-card p-16 text-center bg-white space-y-4">
        <HiOutlineDocumentReport className="w-16 h-16 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">No Analytics Available</h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Please upload and complete processing some invoices to view distributions and monthly trends.
        </p>
      </div>
    );
  }

  // Color arrays for donut charts
  const donutColors = ['#4f46e5', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

  return (
    <div className="space-y-8 animate-fadeIn">
      <SEO title="Analytics" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">
            Visual metrics, vendor distributions, and processing throughput
          </p>
        </div>
        <button
          onClick={fetchAnalyticsData}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <HiOutlineRefresh className="w-4 h-4" /> Reload Metrics
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Avg Invoice Amount',
            value: `₹${analytics.avgAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
            desc: 'Average value of extracted bills',
            icon: HiOutlineCurrencyRupee,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
          },
          {
            label: 'Peak Vendor',
            value: analytics.peakVendor,
            desc: 'Highest invoice count supplier',
            icon: HiOutlineUser,
            color: 'text-sky-600',
            bg: 'bg-sky-50',
          },
          {
            label: 'Top Platform',
            value: analytics.topPlatform.toUpperCase(),
            desc: 'Dominant seller channel',
            icon: HiOutlineShoppingBag,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Return Note Rate',
            value: `${analytics.returnRate.toFixed(1)}%`,
            desc: 'RTO claims compared to sales',
            icon: HiOutlineArrowUp,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="glass-card p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                <h4 className="text-xl font-extrabold text-slate-900 truncate mt-0.5">{kpi.value}</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">{kpi.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart: Recent Upload Trends */}
        <div className="glass-card bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Upload Trends</h3>
            <p className="text-xs text-slate-400 font-medium">Invoices scanned daily over the last 7 days</p>
          </div>

          <div className="relative h-64 w-full flex items-end">
            {/* SVG Line chart */}
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="#f1f5f9" strokeWidth="2" />

              {/* Line path */}
              <path
                d={drawLineChartPath(analytics.daily, 500, 200, 40)}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dots & Values */}
              {analytics.daily.map((d, idx) => {
                const maxVal = Math.max(...analytics.daily.map(d => d.count), 4);
                const x = 40 + (idx / 6) * 440;
                const y = 200 - 40 - (d.count / maxVal) * 120;
                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#4f46e5"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={y - 10}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-indigo-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {d.count}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* X Axis Labels */}
            <div className="absolute bottom-0 left-0 right-0 px-8 flex justify-between text-[10px] font-bold text-slate-400">
              {analytics.daily.map((d, i) => (
                <span key={i}>{d.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart: Bills per Month */}
        <div className="glass-card bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Monthly Processing Vol</h3>
            <p className="text-xs text-slate-400 font-medium">Invoices scanned monthly during the past 6 months</p>
          </div>

          <div className="h-64 w-full flex items-end justify-between px-4 pt-6 pb-2 relative">
            {/* Grid background lines */}
            <div className="absolute inset-x-0 bottom-8 top-6 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-slate-100 w-full" />
              <div className="border-b border-slate-100 w-full" />
              <div className="border-b border-slate-100 w-full" />
            </div>

            {analytics.monthly.map((m, idx) => {
              const maxCount = Math.max(...analytics.monthly.map(mo => mo.count), 4);
              const heightPct = (m.count / maxCount) * 80; // keep max height at 80%

              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full flex justify-center items-end h-40">
                    <div
                      style={{ height: `${Math.max(heightPct, 3)}%` }}
                      className="w-8 sm:w-10 rounded-t-lg bg-indigo-600/10 border-t-2 border-indigo-600 group-hover:bg-indigo-600 group-hover:shadow-lg group-hover:shadow-indigo-600/15 transition-all duration-300 flex items-start justify-center relative"
                    >
                      <span className="absolute -top-6 text-[10px] font-extrabold text-slate-700 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        {m.count}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Donut Chart: Vendor Distribution */}
        <div className="glass-card bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Vendor Spend Distribution</h3>
            <p className="text-xs text-slate-400 font-medium">Breakdown of invoice amount across top suppliers</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
            {/* Custom SVG Donut */}
            <div className="relative w-40 h-40 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                {(() => {
                  const total = analytics.vendors.reduce((sum, v) => sum + v.amount, 0);
                  let accumulatedPercent = 0;

                  return analytics.vendors.map((v, i) => {
                    const pct = total > 0 ? (v.amount / total) * 100 : 0;
                    const strokeDasharray = `${pct} ${100 - pct}`;
                    const strokeDashoffset = -accumulatedPercent;
                    accumulatedPercent += pct;

                    return (
                      <circle
                        key={v.name}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={donutColors[i % donutColors.length]}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        pathLength="100"
                        className="transition-all duration-500 hover:stroke-[14px] cursor-pointer"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Spend</span>
                <span className="text-sm font-extrabold text-slate-800 mt-0.5">
                  ₹{analytics.vendors.reduce((sum, v) => sum + v.amount, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Legends */}
            <div className="flex-1 space-y-2.5 w-full min-w-0">
              {analytics.vendors.map((v, idx) => {
                const total = analytics.vendors.reduce((sum, vend) => sum + vend.amount, 0);
                const pct = total > 0 ? (v.amount / total) * 100 : 0;

                return (
                  <div key={v.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: donutColors[idx % donutColors.length] }}
                      />
                      <span className="text-slate-700 font-bold truncate pr-2">{v.name}</span>
                    </div>
                    <div className="text-right shrink-0 font-mono font-semibold text-slate-500">
                      ₹{v.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({pct.toFixed(0)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Amount Distribution Buckets */}
        <div className="glass-card bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Invoice Amount Spread</h3>
            <p className="text-xs text-slate-400 font-medium">Frequency distribution of invoices by bill value</p>
          </div>

          <div className="space-y-4 py-2">
            {analytics.amounts.map((bucket, idx) => {
              const totalAmountCount = analytics.amounts.reduce((sum, b) => sum + b.count, 0);
              const pct = totalAmountCount > 0 ? (bucket.count / totalAmountCount) * 100 : 0;

              return (
                <div key={bucket.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{bucket.label}</span>
                    <span className="text-slate-500 font-mono">
                      {bucket.count} bill{bucket.count !== 1 ? 's' : ''} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
