import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch, HiOutlineTrash, HiOutlineEye, HiOutlineRefresh,
  HiOutlineDocumentText, HiOutlineCalendar, HiOutlineChevronLeft,
  HiOutlineChevronRight, HiOutlineFilter, HiOutlineDownload,
  HiOutlineExternalLink,
} from 'react-icons/hi';
import { getBills, deleteBill, exportBills, getStats } from '../services/api';

const PLATFORMS = [
  { value: '', label: 'All Platforms' },
  { value: 'amazon', label: 'Amazon' }, { value: 'flipkart', label: 'Flipkart' },
  { value: 'meesho', label: 'Meesho' }, { value: 'myntra', label: 'Myntra' },
  { value: 'snapdeal', label: 'Snapdeal' }, { value: 'jiomart', label: 'JioMart' },
  { value: 'ajio', label: 'Ajio' }, { value: 'personal', label: 'Personal' },
  { value: 'other', label: 'Other' },
];

const DashboardPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [platform, setPlatform] = useState('');
  const [billType, setBillType] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 25, pages: 0 });
  const [deleting, setDeleting] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchBills = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: pagination.limit };
      if (search) params.search = search;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (platform) params.platform = platform;
      if (billType) params.billType = billType;
      const { data } = await getBills(params);
      if (data.success) { setBills(data.data); setPagination(data.pagination); }
    } catch { toast.error('Failed to load bills'); }
    finally { setLoading(false); }
  }, [search, startDate, endDate, platform, billType, pagination.limit]);

  const fetchStats = async () => {
    try {
      const { data } = await getStats();
      if (data.success) setStats(data.data);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchBills(); fetchStats(); }, [fetchBills]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bill?')) return;
    setDeleting(id);
    try { await deleteBill(id); toast.success('Bill deleted'); fetchBills(pagination.page); fetchStats(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (platform) params.platform = platform;
      if (billType) params.billType = billType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      params.format = 'csv';
      const response = await exportBills(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bills_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded!');
    } catch { toast.error('Export failed'); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setStartDate(startDateInput);
    setEndDate(endDateInput);
  };

  const clearFilters = () => {
    setSearchInput('');
    setStartDateInput('');
    setEndDateInput('');
    setSearch('');
    setStartDate('');
    setEndDate('');
    setPlatform('');
    setBillType('');
  };

  const StatusBadge = ({ status }) => (
    <span className={`badge badge-${status}`}>
      {status === 'processing' && <span className="w-2 h-2 rounded-full bg-indigo-400 mr-1.5 animate-pulse" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  const TypeBadge = ({ type }) => (
    <span className={`badge ${type === 'return' ? 'badge-failed' : 'badge-completed'}`}>
      {type === 'return' ? '↩ Return' : '📦 Regular'}
    </span>
  );

  const PlatformBadge = ({ name }) => {
    if (!name) return <span className="text-slate-600">—</span>;
    const colors = {
      amazon: 'bg-amber-500/15 text-amber-400', flipkart: 'bg-blue-500/15 text-blue-400',
      meesho: 'bg-pink-500/15 text-pink-400', myntra: 'bg-rose-500/15 text-rose-400',
      jiomart: 'bg-sky-500/15 text-sky-400', ajio: 'bg-purple-500/15 text-purple-400',
      personal: 'bg-slate-500/15 text-slate-400',
    };
    return <span className={`badge ${colors[name] || 'bg-slate-500/15 text-slate-400'}`}>{name.charAt(0).toUpperCase() + name.slice(1)}</span>;
  };

  const fmt = (v) => v || '—';
  const fmtAmt = (a) => a != null ? `₹${a.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';

  return (
    <div className="animate-fadeIn">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Bills', value: stats.total, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Completed', value: stats.completed, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Processing', value: stats.processing, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Failed', value: stats.failed, color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map(s => (
            <div key={s.label} className={`glass-card p-4 ${s.bg}`}>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Bill Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">{pagination.total} total bill{pagination.total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="p-2.5 rounded-xl glass-card text-slate-400 hover:text-emerald-400 transition-colors" title="Export CSV">
            <HiOutlineDownload className="w-5 h-5" />
          </button>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl glass-card transition-colors ${showFilters ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}>
            <HiOutlineFilter className="w-5 h-5" />
          </button>
          <button onClick={() => { fetchBills(pagination.page); fetchStats(); }} className="btn-primary flex items-center gap-2">
            <HiOutlineRefresh className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="glass-card p-4 mb-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input type="text" placeholder="Search vendor, invoice, order, AWB, SKU..."
              value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="input-field pl-9" />
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap">Search</button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
            <div className="relative">
              <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input type="date" value={startDateInput} onChange={(e) => setStartDateInput(e.target.value)} className="input-field pl-9 w-40" />
            </div>
            <span className="text-slate-600 self-center">to</span>
            <input type="date" value={endDateInput} onChange={(e) => setEndDateInput(e.target.value)} className="input-field w-40" />
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="input-field w-40">
              {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <select value={billType} onChange={(e) => setBillType(e.target.value)} className="input-field w-36">
              <option value="">All Types</option>
              <option value="regular">Regular</option>
              <option value="return">Return</option>
            </select>
            {(searchInput || startDateInput || endDateInput || platform || billType) && (
              <button type="button" onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 self-center whitespace-nowrap">✕ Clear All</button>
            )}
          </div>
        )}
      </form>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-14 w-full" />)}</div>
      ) : bills.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <HiOutlineDocumentText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-medium">No bills found</p>
          <p className="text-slate-600 text-sm mt-1">Upload your first bill to get started</p>
          <Link to="/" className="btn-primary inline-block mt-6">Upload Bill</Link>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th><th>Platform</th><th>Invoice No.</th><th>Order No.</th>
                  <th>Date</th><th>Vendor</th><th>Amount</th><th>AWB</th>
                  <th>Delivery</th><th>Payment</th><th>SKU</th>
                  {/* <th>Items</th> */}<th>Qty</th><th>Status</th><th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill._id} className="group">
                    <td><TypeBadge type={bill.billType} /></td>
                    <td><PlatformBadge name={bill.supplierPlatform} /></td>
                    <td className="font-mono text-xs text-cyan-400">{fmt(bill.invoiceNumber)}</td>
                    <td className="font-mono text-xs text-indigo-300">{fmt(bill.orderNumber)}</td>
                    <td className="text-slate-400 text-xs whitespace-nowrap">{fmt(bill.billDate)}</td>
                    <td className="text-slate-200 max-w-[140px] truncate">{fmt(bill.vendorName)}</td>
                    <td className="font-semibold text-emerald-400 whitespace-nowrap">{fmtAmt(bill.amount)}</td>
                    <td className="font-mono text-xs text-slate-400 max-w-[120px] truncate" title={bill.awbNumber || ''}>{fmt(bill.awbNumber)}</td>
                    <td className="text-xs text-slate-400">{fmt(bill.deliveryPartner)}</td>
                    <td><span className={`badge ${bill.payment === 'COD' || bill.payment === 'Cash on Delivery' ? 'badge-medium' : 'badge-completed'}`}>
                      {bill.payment || '—'}</span></td>
                    <td className="font-mono text-xs text-slate-400 max-w-[120px] truncate" title={bill.sku || ''}>
                      {fmt(bill.sku)}
                    </td>
                    {/* <td className="text-center">
                      {bill.totalItems > 0 ? (
                        <span className="badge bg-indigo-500/15 text-indigo-400">{bill.totalItems}</span>
                      ) : '—'}
                    </td> */}
                    <td className="text-center text-slate-300">{bill.totalQty || bill.qty || '—'}</td>
                    <td><StatusBadge status={bill.status} /></td>
                    <td>
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {bill.cloudinaryUrl && (
                          <a href={bill.cloudinaryUrl} target="_blank" rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-sky-500/15 text-slate-400 hover:text-sky-400 transition-colors" title="View File">
                            <HiOutlineExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <Link to={`/bill/${bill._id}`} className="p-2 rounded-lg hover:bg-indigo-500/15 text-slate-400 hover:text-indigo-400 transition-colors" title="View">
                          <HiOutlineEye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(bill._id)} disabled={deleting === bill._id}
                          className="p-2 rounded-lg hover:bg-red-500/15 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-30" title="Delete">
                          {deleting === bill._id
                            ? <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                            : <HiOutlineTrash className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {bills.some(b => b.totalBillsInFile > 1) && (
            <p className="text-xs text-slate-600 mt-2">💡 Some uploads contained multiple bills — each row is a separate extracted bill.</p>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.pages}</p>
              <div className="flex gap-2">
                <button onClick={() => fetchBills(pagination.page - 1)} disabled={pagination.page <= 1}
                  className="p-2 rounded-lg glass-card text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                  <HiOutlineChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => fetchBills(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
                  className="p-2 rounded-lg glass-card text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                  <HiOutlineChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
