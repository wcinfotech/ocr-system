import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch, HiOutlineTrash, HiOutlineEye, HiOutlineRefresh,
  HiOutlineDocumentText, HiOutlineCalendar, HiOutlineChevronLeft,
  HiOutlineChevronRight, HiOutlineFilter,
} from 'react-icons/hi';
import { getBills, deleteBill } from '../services/api';

const PLATFORMS = [
  { value: '', label: 'All Platforms' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'flipkart', label: 'Flipkart' },
  { value: 'meesho', label: 'Meesho' },
  { value: 'myntra', label: 'Myntra' },
  { value: 'snapdeal', label: 'Snapdeal' },
  { value: 'jiomart', label: 'JioMart' },
  { value: 'ajio', label: 'Ajio' },
  { value: 'personal', label: 'Personal' },
  { value: 'other', label: 'Other' },
];

const DashboardPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [platform, setPlatform] = useState('');
  const [billType, setBillType] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 25, pages: 0 });
  const [deleting, setDeleting] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

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
      if (data.success) {
        setBills(data.data);
        setPagination(data.pagination);
      }
    } catch {
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  }, [search, startDate, endDate, platform, billType, pagination.limit]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bill?')) return;
    setDeleting(id);
    try {
      await deleteBill(id);
      toast.success('Bill deleted');
      fetchBills(pagination.page);
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const handleSearch = (e) => { e.preventDefault(); fetchBills(1); };
  const clearFilters = () => {
    setSearch(''); setStartDate(''); setEndDate('');
    setPlatform(''); setBillType('');
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
      amazon: 'bg-amber-500/15 text-amber-400',
      flipkart: 'bg-blue-500/15 text-blue-400',
      meesho: 'bg-pink-500/15 text-pink-400',
      myntra: 'bg-rose-500/15 text-rose-400',
      jiomart: 'bg-sky-500/15 text-sky-400',
      ajio: 'bg-purple-500/15 text-purple-400',
      personal: 'bg-slate-500/15 text-slate-400',
    };
    return (
      <span className={`badge ${colors[name] || 'bg-slate-500/15 text-slate-400'}`}>
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </span>
    );
  };

  const fmt = (v) => v || '—';
  const fmtAmt = (a) => a != null ? `₹${a.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Bill Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">{pagination.total} total bill{pagination.total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl glass-card transition-colors ${showFilters ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}>
            <HiOutlineFilter className="w-5 h-5" />
          </button>
          <button onClick={() => fetchBills(pagination.page)} className="btn-primary flex items-center gap-2">
            <HiOutlineRefresh className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="glass-card p-4 mb-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input type="text" placeholder="Search vendor, invoice, order, AWB..."
              value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap">Search</button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
            <div className="relative">
              <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="input-field pl-9 w-40" />
            </div>
            <span className="text-slate-600 self-center">to</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field w-40" />

            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="input-field w-40">
              {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>

            <select value={billType} onChange={(e) => setBillType(e.target.value)} className="input-field w-36">
              <option value="">All Types</option>
              <option value="regular">Regular</option>
              <option value="return">Return</option>
            </select>

            {(search || startDate || endDate || platform || billType) && (
              <button type="button" onClick={clearFilters}
                className="text-xs text-red-400 hover:text-red-300 self-center whitespace-nowrap">✕ Clear All</button>
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
                  <th>Type</th>
                  <th>Platform</th>
                  <th>Invoice No.</th>
                  <th>Order No.</th>
                  <th>Date</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>AWB</th>
                  <th>Delivery</th>
                  <th>Payment</th>
                  <th>SKU</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
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
                    <td className="font-mono text-xs text-slate-400 max-w-[100px] truncate">{fmt(bill.awbNumber)}</td>
                    <td className="text-xs text-slate-400">{fmt(bill.deliveryPartner)}</td>
                    <td><span className={`badge ${bill.payment === 'COD' || bill.payment === 'Cash on Delivery' ? 'badge-medium' : 'badge-completed'}`}>
                      {bill.payment || '—'}</span></td>
                    <td className="font-mono text-xs text-slate-400 max-w-[90px] truncate">{fmt(bill.sku)}</td>
                    <td className="text-center text-slate-300">{bill.qty || '—'}</td>
                    <td><StatusBadge status={bill.status} /></td>
                    <td>
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link to={`/bill/${bill._id}`}
                          className="p-2 rounded-lg hover:bg-indigo-500/15 text-slate-400 hover:text-indigo-400 transition-colors" title="View">
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

          {/* Multi-bill indicator */}
          {bills.some(b => b.totalBillsInFile > 1) && (
            <p className="text-xs text-slate-600 mt-2">
              💡 Some uploads contained multiple bills — each row is a separate extracted bill.
            </p>
          )}

          {/* Pagination */}
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
