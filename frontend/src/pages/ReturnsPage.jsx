import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  HiOutlineRefresh,
  HiOutlineQrcode,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineCurrencyRupee,
  HiOutlineSearch,
  HiOutlineCloudUpload,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineLink,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlineCamera,
  HiOutlineTruck,
  HiOutlineUser,
  HiOutlineCheck,
} from 'react-icons/hi';
import {
  getReturns,
  getReturnStats,
  scanReturn,
  matchReturnManually,
  unmatchReturn,
  getBills,
  uploadBill,
  getBatchStatus,
  deleteBill,
  getReturnComparison,
} from '../services/api';
import SEO from '../components/SEO';

const courierBadgeStyles = {
  Shadowfax: 'bg-purple-100 text-purple-700 border-purple-200',
  Xpressbees: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Delhivery: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Ekart: 'bg-blue-100 text-blue-700 border-blue-200',
  'Amazon Shipping': 'bg-amber-100 text-amber-700 border-amber-200',
  Default: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function ReturnsPage() {
  // State
  const [returns, setReturns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'matched', 'unmatched'
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Scanner state
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [uploadingReturn, setUploadingReturn] = useState(false);

  // Comparison Modal state
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // Manual Match Modal state
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [salesBillsOptions, setSalesBillsOptions] = useState([]);
  const [matchSearch, setMatchSearch] = useState('');
  const [matchingLoading, setMatchingLoading] = useState(false);

  // Fetch Return Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await getReturnStats();
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching return stats:', err);
    }
  }, []);

  // Fetch Return Bills
  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReturns({
        page,
        limit: 15,
        search,
        status: activeTab,
        platform: platformFilter,
      });
      if (res.data?.success) {
        setReturns(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching returns:', err);
      toast.error('Failed to load return bills');
    } finally {
      setLoading(false);
    }
  }, [page, search, activeTab, platformFilter]);

  useEffect(() => {
    fetchReturns();
    fetchStats();
  }, [fetchReturns, fetchStats]);

  // Handle Live Code Search / Barcode Reader input
  const handleLiveScan = async (codeToTest) => {
    const code = codeToTest || manualCodeInput;
    if (!code || !code.trim()) {
      toast.error('Please enter or scan a barcode/QR code');
      return;
    }
    setScanning(true);
    setScanResult(null);
    try {
      const res = await scanReturn(code.trim());
      if (res.data?.success) {
        setScanResult(res.data);
        if (res.data.matched) {
          toast.success(`Match Found! Order #${res.data.salesBill.orderNumber}`);
        } else {
          toast.error(res.data.message || 'No matching sales bill found');
        }
      }
    } catch (err) {
      console.error('Error scanning return:', err);
      toast.error('Failed to process barcode scan');
    } finally {
      setScanning(false);
    }
  };

  // Dropzone for upload return slip image with batch completion polling
  const onDropReturnFile = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setUploadingReturn(true);
    const toastId = toast.loading(`Reading & uploading return slip ${file.name}...`);
    try {
      const res = await uploadBill(file);
      if (res.data?.success) {
        const batchId = res.data.data?.batchId;
        if (batchId) {
          let attempts = 0;
          let done = false;
          while (attempts < 15 && !done) {
            attempts++;
            await new Promise((r) => setTimeout(r, 1000));
            try {
              const statusRes = await getBatchStatus(batchId);
              if (statusRes.data?.success && statusRes.data.data?.isComplete) {
                done = true;
              }
            } catch (e) {
              /* ignore polling error */
            }
          }
        }
        toast.success('Return slip processed & matched!', { id: toastId });
        setShowScannerModal(false);
        fetchReturns();
        fetchStats();
      }
    } catch (err) {
      console.error('Error uploading return slip:', err);
      toast.error('Failed to process return slip', { id: toastId });
    } finally {
      setUploadingReturn(false);
    }
  }, [fetchReturns, fetchStats]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropReturnFile,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  // Open Comparison View
  const handleOpenComparison = async (returnId) => {
    setComparisonLoading(true);
    setShowComparisonModal(true);
    try {
      const res = await getReturnComparison(returnId);
      if (res.data?.success) {
        setComparisonData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching comparison:', err);
      toast.error('Failed to load side-by-side comparison');
    } finally {
      setComparisonLoading(false);
    }
  };

  // Open Manual Match Modal
  const handleOpenMatchModal = async (rBill) => {
    setSelectedReturn(rBill);
    setShowMatchModal(true);
    setMatchSearch('');
    try {
      const res = await getBills({ limit: 50, status: 'completed' });
      if (res.data?.success) {
        setSalesBillsOptions(res.data.data.filter(b => b.billType !== 'return'));
      }
    } catch (err) {
      console.error('Error fetching sales bills:', err);
    }
  };

  // Confirm Manual Link
  const handleConfirmMatch = async (salesBillId) => {
    if (!selectedReturn || !salesBillId) return;
    setMatchingLoading(true);
    try {
      const res = await matchReturnManually(selectedReturn._id, salesBillId);
      if (res.data?.success) {
        toast.success('Return matched with sales bill!');
        setShowMatchModal(false);
        fetchReturns();
        fetchStats();
      }
    } catch (err) {
      console.error('Match error:', err);
      toast.error('Failed to match return bill');
    } finally {
      setMatchingLoading(false);
    }
  };

  // Handle Unlink
  const handleUnmatch = async (returnBillId) => {
    if (!window.confirm('Are you sure you want to unlink this return slip?')) return;
    try {
      const res = await unmatchReturn(returnBillId);
      if (res.data?.success) {
        toast.success('Return bill unlinked');
        fetchReturns();
        fetchStats();
        if (showComparisonModal) setShowComparisonModal(false);
      }
    } catch (err) {
      console.error('Unmatch error:', err);
      toast.error('Failed to unlink return bill');
    }
  };

  // Handle Delete Return
  const handleDeleteReturn = async (returnId) => {
    if (!window.confirm('Delete this return slip record?')) return;
    try {
      await deleteBill(returnId);
      toast.success('Return slip deleted');
      fetchReturns();
      fetchStats();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete return slip');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <SEO
        title="Return Bills & Matching Hub | Escannora"
        description="Match shipping return slips (Meesho, Xpressbees, Delhivery, Ekart) with original sales bills."
      />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 font-semibold text-xs rounded-full uppercase tracking-wider">
              Return Management System
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Return Reconciliation & Matching</h1>
          <p className="text-sm text-slate-500 mt-1">
            Auto-detect QR/Barcodes from return labels (Meesho RVP, Xpressbees DTO, Delhivery RVP, Ekart) & compare with sales invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setScanResult(null);
              setManualCodeInput('');
              setShowScannerModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all transform hover:-translate-y-0.5"
          >
            <HiOutlineQrcode className="w-5 h-5" />
            Scan / Read Barcode
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Returns */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Return Slips</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalReturns ?? 0}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Rate: <span className="font-semibold text-slate-700">{stats?.returnRatePercent ?? 0}%</span> of total orders
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
            <HiOutlineRefresh className="w-6 h-6" />
          </div>
        </div>

        {/* Reconciled Matches */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reconciled Matches</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats?.matchedReturns ?? 0}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              {stats?.matchRatePercent ?? 100}% Matched with Sales
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <HiOutlineCheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Unmatched Returns */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unmatched Slips</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats?.unmatchedReturns ?? 0}</h3>
            <p className="text-xs text-amber-600 font-medium mt-1">Pending Bill Pairing</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <HiOutlineExclamationCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Claim Pending */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Return Claim Value</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              ₹{(stats?.totalClaimValue ?? 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Reconciliation Total</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <HiOutlineCurrencyRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Returns List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls Header */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-xl w-fit">
            <button
              onClick={() => { setActiveTab('all'); setPage(1); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Returns ({stats?.totalReturns ?? 0})
            </button>
            <button
              onClick={() => { setActiveTab('matched'); setPage(1); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'matched' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Matched ({stats?.matchedReturns ?? 0})
            </button>
            <button
              onClick={() => { setActiveTab('unmatched'); setPage(1); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'unmatched' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unmatched ({stats?.unmatchedReturns ?? 0})
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <HiOutlineSearch className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Order #, AWB, Barcode..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={platformFilter}
              onChange={(e) => { setPlatformFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Courier Platforms</option>
              <option value="meesho">Meesho / Shadowfax</option>
              <option value="flipkart">Flipkart / Ekart</option>
              <option value="other">Xpressbees / Delhivery</option>
              <option value="amazon">Amazon</option>
            </select>
          </div>
        </div>

        {/* Returns Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Loading return bills...
            </div>
          ) : returns.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
                <HiOutlineRefresh className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No Return Slips Found</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Scan or upload your return shipping labels (Meesho, Xpressbees, Delhivery, Ekart) to automatically match them with your sales invoices.
              </p>
              <button
                onClick={() => setShowScannerModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm shadow-md"
              >
                <HiOutlineQrcode className="w-4 h-4" /> Scan Return Label
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                  <th className="py-3.5 px-6">Return Tracking / AWB</th>
                  <th className="py-3.5 px-4">Order Number</th>
                  <th className="py-3.5 px-4">Courier Partner</th>
                  <th className="py-3.5 px-4">Match Status</th>
                  <th className="py-3.5 px-4">Paired Sales Invoice</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.map((rBill) => {
                  const isMatched = rBill.ocrMetadata?.isMatched || !!rBill.matchedSalesBill;
                  const courier = rBill.deliveryPartner || rBill.courierPartner || 'Courier';
                  const badgeClass = courierBadgeStyles[courier] || courierBadgeStyles.Default;

                  return (
                    <tr key={rBill._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Tracking / AWB */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 font-mono">
                          {rBill.awbNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(rBill.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </div>
                      </td>

                      {/* Order Number */}
                      <td className="py-4 px-4 font-mono text-slate-700">
                        {rBill.orderNumber || 'N/A'}
                      </td>

                      {/* Courier */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}>
                          <HiOutlineTruck className="w-3.5 h-3.5" />
                          {courier}
                        </span>
                      </td>

                      {/* Match Status */}
                      <td className="py-4 px-4">
                        {isMatched ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                            <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                            Matched ({rBill.ocrMetadata?.matchType || 'Linked'})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
                            <HiOutlineExclamationCircle className="w-4 h-4 text-amber-600" />
                            Unmatched
                          </span>
                        )}
                      </td>

                      {/* Paired Sales Invoice */}
                      <td className="py-4 px-4">
                        {rBill.matchedSalesBill ? (
                          <div>
                            <p className="font-semibold text-slate-800">
                              Inv: {rBill.matchedSalesBill.invoiceNumber || 'N/A'}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                              ₹{(rBill.matchedSalesBill.amount || 0).toLocaleString('en-IN')} &bull; {rBill.matchedSalesBill.platform || 'Sales'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No bill paired</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenComparison(rBill._id)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <HiOutlineEye className="w-3.5 h-3.5" />
                          Compare
                        </button>

                        {!isMatched ? (
                          <button
                            onClick={() => handleOpenMatchModal(rBill)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <HiOutlineLink className="w-3.5 h-3.5" />
                            Match
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnmatch(rBill._id)}
                            className="px-2.5 py-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors"
                            title="Unlink match"
                          >
                            Unlink
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteReturn(rBill._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete return slip"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50 text-sm">
            <span className="text-slate-500">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg disabled:opacity-50 text-xs font-semibold"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg disabled:opacity-50 text-xs font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* LIVE SCANNER & RETURN SLIP UPLOAD MODAL */}
      {/* ════════════════════════════════════════════ */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-lg sm:max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <HiOutlineQrcode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Return Barcode / QR Code Scanner</h3>
                  <p className="text-xs text-slate-500">Scan or upload Meesho, Xpressbees, Delhivery, Ekart return labels</p>
                </div>
              </div>
              <button
                onClick={() => setShowScannerModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Option A: Upload Return Slip File */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Option 1: Upload Return Label Image / PDF</label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
                    isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <HiOutlineCloudUpload className="w-8 h-8 text-blue-500 mx-auto mb-1.5" />
                  <p className="text-sm font-semibold text-slate-800">
                    {uploadingReturn ? 'Extracting QR/Barcode & Matching...' : 'Drag & Drop Return Slip image here, or browse'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Supports JPG, PNG, WEBP, PDF (Meesho, Xpressbees, Delhivery, Ekart)</p>
                </div>
              </div>

              {/* Option B: Enter / Scan Barcode Value */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Option 2: Live Barcode / Order ID Entry</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter/Scan AWB e.g. FMPR0921104669, 300819630367710720_1_RET..."
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLiveScan()}
                    className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleLiveScan()}
                    disabled={scanning}
                    className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {scanning ? 'Searching...' : 'Scan & Pair'}
                  </button>
                </div>
              </div>

              {/* Live Scan Result Banner */}
              {scanResult && (
                <div className={`p-4 rounded-2xl border ${
                  scanResult.matched ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                }`}>
                  {scanResult.matched ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                        <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
                        Exact Match Found! ({scanResult.matchType})
                      </div>
                      <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-emerald-100 font-mono">
                        <p><strong>Matched Sales Invoice:</strong> {scanResult.salesBill.invoiceNumber || 'N/A'}</p>
                        <p><strong>Order ID:</strong> {scanResult.salesBill.orderNumber || 'N/A'}</p>
                        <p><strong>Customer / Vendor:</strong> {scanResult.salesBill.vendorName || 'N/A'}</p>
                        <p><strong>Amount:</strong> ₹{(scanResult.salesBill.amount || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
                      <HiOutlineExclamationCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      {scanResult.message}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowScannerModal(false)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs"
              >
                Close Scanner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════ */}
      {/* SIDE-BY-SIDE COMPARISON MODAL */}
      {/* ════════════════════════════════════════════ */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  VS
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Side-by-Side Return Comparison</h3>
                  <p className="text-xs text-slate-500">Verify return slip details directly against the paired sales bill</p>
                </div>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {comparisonLoading ? (
                <div className="py-12 text-center text-slate-500">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  Loading comparison data...
                </div>
              ) : comparisonData ? (
                <div className="space-y-6">
                  {/* Match Status Header Card */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    comparisonData.isMatched ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {comparisonData.isMatched ? (
                        <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <HiOutlineExclamationCircle className="w-6 h-6 text-amber-600" />
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {comparisonData.isMatched ? 'Bills Reconciled & Linked' : 'Return Slip Unmatched'}
                        </h4>
                        <p className="text-xs text-slate-600">
                          {comparisonData.isMatched
                            ? `Match Criteria: ${comparisonData.matchReason} (Confidence: ${comparisonData.matchConfidence}%)`
                            : 'No matching sales invoice found in database yet.'}
                        </p>
                      </div>
                    </div>

                    {comparisonData.isMatched && (
                      <button
                        onClick={() => handleUnmatch(comparisonData.returnBill._id)}
                        className="px-3 py-1.5 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-xl text-xs font-semibold"
                      >
                        Unlink Match
                      </button>
                    )}
                  </div>

                  {/* Side-by-Side Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Original Sales Bill */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                          Original Sales Invoice
                        </span>
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                          {comparisonData.salesBill?.platform || 'Sales'}
                        </span>
                      </div>

                      {comparisonData.salesBill ? (
                        <div className="space-y-2.5 text-xs text-slate-700">
                          <p className="flex justify-between">
                            <span className="text-slate-400">Invoice Number:</span>
                            <span className="font-bold text-slate-900">{comparisonData.salesBill.invoiceNumber || 'N/A'}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">Order Number:</span>
                            <span className="font-mono text-slate-900">{comparisonData.salesBill.orderNumber || 'N/A'}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">Tracking AWB:</span>
                            <span className="font-mono text-slate-900">{comparisonData.salesBill.awbNumber || 'N/A'}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">Vendor / Seller:</span>
                            <span className="font-semibold text-slate-900">{comparisonData.salesBill.vendorName || 'N/A'}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">Bill Date:</span>
                            <span>{comparisonData.salesBill.billDate || 'N/A'}</span>
                          </p>
                          <p className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-slate-900">
                            <span>Invoice Amount:</span>
                            <span className="text-blue-600">₹{(comparisonData.salesBill.amount || 0).toLocaleString('en-IN')}</span>
                          </p>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-400 italic">
                          No sales invoice linked to this return slip.
                        </div>
                      )}
                    </div>

                    {/* Right: Return Slip Received */}
                    <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-purple-200 pb-3">
                        <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                          Return Slip Received
                        </span>
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                          {comparisonData.returnBill.deliveryPartner || 'Courier'}
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs text-slate-700">
                        <p className="flex justify-between">
                          <span className="text-slate-400">Return AWB / Barcode:</span>
                          <span className="font-bold font-mono text-purple-900">{comparisonData.returnBill.awbNumber || 'N/A'}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-400">Return Order ID:</span>
                          <span className="font-mono text-slate-900">{comparisonData.returnBill.orderNumber || 'N/A'}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-400">Seller / Return To:</span>
                          <span className="font-semibold text-slate-900">{comparisonData.returnBill.vendorName || comparisonData.returnBill.sellerName || 'N/A'}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-400">Customer Name:</span>
                          <span>{comparisonData.returnBill.customerName || 'N/A'}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-400">Return Status:</span>
                          <span className="font-semibold text-emerald-600">{comparisonData.returnBill.returnStatus || 'Received'}</span>
                        </p>
                        <p className="flex justify-between pt-2 border-t border-purple-200 font-bold text-sm text-slate-900">
                          <span>Return Claim Value:</span>
                          <span className="text-purple-700">
                            ₹{(comparisonData.returnBill.claimAmount || comparisonData.returnBill.amount || 0).toLocaleString('en-IN')}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setShowComparisonModal(false)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════ */}
      {/* MANUAL MATCH MODAL */}
      {/* ════════════════════════════════════════════ */}
      {showMatchModal && selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Manually Pair Return Slip</h3>
              <button onClick={() => setShowMatchModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-100 rounded-xl text-xs space-y-1 font-mono">
                <p><strong>Return AWB:</strong> {selectedReturn.awbNumber || 'N/A'}</p>
                <p><strong>Return Order #:</strong> {selectedReturn.orderNumber || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Sales Bill to Pair</label>
                <input
                  type="text"
                  placeholder="Filter sales bills by Invoice #, Order #..."
                  value={matchSearch}
                  onChange={(e) => setMatchSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm mb-3"
                />

                <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2">
                  {salesBillsOptions
                    .filter(b => !matchSearch || (b.invoiceNumber || '').includes(matchSearch) || (b.orderNumber || '').includes(matchSearch))
                    .map((sBill) => (
                      <div
                        key={sBill._id}
                        onClick={() => handleConfirmMatch(sBill._id)}
                        className="p-3 hover:bg-blue-50 border border-slate-100 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-xs text-slate-900">Invoice: {sBill.invoiceNumber || 'N/A'}</p>
                          <p className="text-[11px] text-slate-500">Order: {sBill.orderNumber || 'N/A'} &bull; ₹{(sBill.amount || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold">
                          Link
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowMatchModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
