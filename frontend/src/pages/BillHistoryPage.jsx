import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineRefresh,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlineExternalLink,
  HiOutlineReceiptRefund,
} from 'react-icons/hi';
import { getBills, deleteBill, exportBills } from '../services/api';

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

const BillHistoryPage = () => {
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
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, pages: 0 });
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchBills = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: pagination.limit,
          sortBy,
          sortOrder,
        };
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
      } catch (error) {
        toast.error('Failed to load bills');
      } finally {
        setLoading(false);
      }
    },
    [search, startDate, endDate, platform, billType, sortBy, sortOrder, pagination.limit]
  );

  useEffect(() => {
    fetchBills(1);
  }, [search, startDate, endDate, platform, billType, sortBy, sortOrder]);

  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteBill(deletingId);
      toast.success('Bill deleted successfully');
      fetchBills(pagination.page);
    } catch (error) {
      toast.error('Failed to delete bill');
    } finally {
      setShowDeleteModal(false);
      setDeletingId(null);
    }
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
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleSearchSubmit = (e) => {
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

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const StatusBadge = ({ status }) => (
    <span className={`badge badge-${status}`}>
      {status === 'processing' && <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5 animate-pulse" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  const TypeBadge = ({ type }) => (
    <span className={`badge ${type === 'return' ? 'badge-failed' : 'badge-completed'} flex items-center gap-1.5`}>
      {type === 'return' ? (
        <>
          <HiOutlineReceiptRefund className="w-3.5 h-3.5" />
          <span>Return</span>
        </>
      ) : (
        <>
          <HiOutlineDocumentText className="w-3.5 h-3.5" />
          <span>Regular</span>
        </>
      )}
    </span>
  );

  const PlatformBadge = ({ name }) => {
    if (!name) return <span className="text-slate-400">—</span>;
    const colors = {
      amazon: 'bg-amber-100 text-amber-800 border-amber-200',
      flipkart: 'bg-blue-100 text-blue-800 border-blue-200',
      meesho: 'bg-pink-100 text-pink-800 border-pink-200',
      myntra: 'bg-rose-100 text-rose-800 border-rose-200',
      jiomart: 'bg-sky-100 text-sky-800 border-sky-200',
      ajio: 'bg-purple-100 text-purple-800 border-purple-200',
      personal: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <span className={`badge border ${colors[name] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </span>
    );
  };

  const fmt = (v) => v || '—';
  const fmtAmt = (a) => (a != null ? `₹${a.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Bill History</h2>
          <p className="text-sm text-slate-500 mt-1">
            Search, sort, filter, and export all extracted invoices
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all shadow-sm"
            title="Export CSV"
          >
            <HiOutlineDownload className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-all shadow-sm ${showFilters
                ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            title="Filters"
          >
            <HiOutlineFilter className="w-5 h-5" />
          </button>
          <button onClick={() => fetchBills(pagination.page)} className="btn-primary flex items-center gap-2">
            <HiOutlineRefresh className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearchSubmit} className="glass-card p-5 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by vendor, invoice no, order no, AWB, SKU..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary px-6 whitespace-nowrap">
            Search
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</span>
              <div className="relative">
                <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="date"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  className="input-field pl-9 w-44"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</span>
              <div className="relative">
                <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="date"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                  className="input-field pl-9 w-44"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform</span>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="input-field w-44"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</span>
              <select
                value={billType}
                onChange={(e) => setBillType(e.target.value)}
                className="input-field w-40"
              >
                <option value="">All Types</option>
                <option value="regular">Regular</option>
                <option value="return">Return</option>
              </select>
            </div>

            {(searchInput || startDateInput || endDateInput || platform || billType) && (
              <div className="flex items-end pb-1.5">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors whitespace-nowrap"
                >
                  ✕ Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Table & Data */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-16 w-full" />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <div className="glass-card p-16 text-center bg-white">
          <HiOutlineDocumentText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">No bills found</p>
          <p className="text-slate-400 text-sm mt-1">Try modifying your search or upload new bills</p>
          <Link to="/" className="btn-primary inline-block mt-6">
            Upload Bill
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="table-container shadow-sm">
            <table>
              <thead>
                <tr>
                  <th className="cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('billType')}>
                    Type {sortBy === 'billType' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('supplierPlatform')}>
                    Platform {sortBy === 'supplierPlatform' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Invoice No.</th>
                  <th>Order No.</th>
                  <th className="cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('parsedBillDate')}>
                    Date {sortBy === 'parsedBillDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Vendor</th>
                  <th className="cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('amount')}>
                    Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
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
                    <td>
                      <TypeBadge type={bill.billType} />
                    </td>
                    <td>
                      <PlatformBadge name={bill.supplierPlatform} />
                    </td>
                    <td className="font-mono text-xs text-slate-800 font-medium">{fmt(bill.invoiceNumber)}</td>
                    <td className="font-mono text-xs text-slate-500">{fmt(bill.orderNumber)}</td>
                    <td className="text-slate-600 text-xs whitespace-nowrap">{fmt(bill.billDate)}</td>
                    <td className="text-slate-800 max-w-[140px] truncate font-medium">{fmt(bill.vendorName)}</td>
                    <td className="font-bold text-slate-900 whitespace-nowrap">{fmtAmt(bill.amount)}</td>
                    <td className="font-mono text-xs text-slate-500 max-w-[120px] truncate" title={bill.awbNumber || ''}>
                      {fmt(bill.awbNumber)}
                    </td>
                    <td className="text-xs text-slate-600">{fmt(bill.deliveryPartner)}</td>
                    <td>
                      <span
                        className={`badge border ${bill.payment === 'COD' || bill.payment === 'Cash on Delivery'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                      >
                        {bill.payment || '—'}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-slate-500 max-w-[120px] truncate" title={bill.sku || ''}>
                      {fmt(bill.sku)}
                    </td>
                    <td className="text-center font-semibold text-slate-700">{bill.totalQty || bill.qty || '—'}</td>
                    <td>
                      <StatusBadge status={bill.status} />
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        {bill.cloudinaryUrl && (
                          <a
                            href={bill.cloudinaryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors"
                            title="View File"
                          >
                            <HiOutlineExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <Link
                          to={`/bill/${bill._id}`}
                          className="p-2 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors"
                          title="View Details"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => confirmDelete(bill._id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total bills)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchBills(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                >
                  <HiOutlineChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchBills(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                >
                  <HiOutlineChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl border border-slate-100 animate-slideUp">
            <h3 className="text-lg font-bold text-slate-900">Confirm Delete</h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to delete this bill? This action will permanently remove it from the database and delete any stored files.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger px-4 py-2 rounded-xl text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillHistoryPage;
