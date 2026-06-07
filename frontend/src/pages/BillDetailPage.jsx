import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft, HiOutlineTrash, HiOutlineDocumentText,
  HiOutlineRefresh, HiOutlineClipboardCopy, HiOutlinePencil,
  HiOutlineCheck, HiOutlineX, HiOutlineDownload,
} from 'react-icons/hi';
import { getBillById, deleteBill, updateBill, reprocessBill } from '../services/api';

const BillDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRawText, setShowRawText] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);

  // Form state for manual corrections
  const [formData, setFormData] = useState({
    billType: 'regular',
    invoiceNumber: '',
    orderNumber: '',
    billDate: '',
    amount: '',
    vendorName: '',
    gstNumber: '',
    taxAmount: '',
    platform: '',
    awbNumber: '',
    deliveryPartner: '',
    paymentMode: '',
    deliveryType: 'PREPAID',
    sku: '',
    qty: 1,
  });

  const fetchBill = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await getBillById(id);
      if (data.success) {
        setBill(data.data);
        initForm(data.data);
      }
    } catch (err) {
      toast.error('Bill not found');
      navigate('/dashboard');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const initForm = (billData) => {
    setFormData({
      billType: billData.billType || 'regular',
      invoiceNumber: billData.invoiceNumber || '',
      orderNumber: billData.orderNumber || '',
      billDate: billData.billDate || '',
      amount: billData.amount != null ? billData.amount.toString() : '',
      vendorName: billData.vendorName || '',
      gstNumber: billData.gstNumber || '',
      taxAmount: billData.taxAmount != null ? billData.taxAmount.toString() : '',
      platform: billData.platform || billData.supplierPlatform || 'other',
      awbNumber: billData.awbNumber || '',
      deliveryPartner: billData.deliveryPartner || '',
      paymentMode: billData.paymentMode || billData.payment || '',
      deliveryType: billData.deliveryType || 'PREPAID',
      sku: billData.sku || '',
      qty: billData.qty != null ? billData.qty : 1,
    });
  };

  useEffect(() => {
    fetchBill();
  }, [id]);

  // Polling for processing status
  useEffect(() => {
    let interval;
    if (bill && bill.status === 'processing') {
      interval = setInterval(async () => {
        try {
          const { data } = await getBillById(id);
          if (data.success && data.data.status !== 'processing') {
            setBill(data.data);
            initForm(data.data);
            setReprocessing(false);
            clearInterval(interval);
            toast.success('Reprocessing completed!');
          }
        } catch {
          clearInterval(interval);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [bill?.status]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this bill permanently?')) return;
    try {
      await deleteBill(id);
      toast.success('Deleted successfully');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleReprocess = async () => {
    setReprocessing(true);
    try {
      const { data } = await reprocessBill(id);
      if (data.success) {
        toast.success('Reprocessing started in background...');
        setBill({ ...bill, status: 'processing' });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reprocessing failed to start');
      setReprocessing(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await updateBill(id, formData);
      if (data.success) {
        toast.success('Corrections saved successfully');
        setBill(data.data);
        setEditMode(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save changes');
    }
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bill, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bill_${bill.invoiceNumber || id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyText = () => {
    if (bill?.rawExtractedText) {
      navigator.clipboard.writeText(bill.rawExtractedText);
      toast.success('Copied to clipboard');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="spinner w-12 h-12" />
      <span className="text-sm text-slate-400">Loading invoice data...</span>
    </div>
  );

  if (!bill) return null;

  const ConfBadge = ({ level }) => {
    if (typeof level === 'number') {
      const cls = level >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                  level >= 40 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                  'bg-red-500/10 text-red-400 border border-red-500/25';
      return <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${cls} ml-2 shrink-0`}>{level}%</span>;
    }
    return null;
  };

  const platformColors = {
    amazon: 'text-amber-400', flipkart: 'text-blue-400', meesho: 'text-pink-400',
    myntra: 'text-rose-400', ajio: 'text-cyan-400', shopify: 'text-emerald-400',
    generic_gst: 'text-purple-400', other: 'text-slate-400'
  };

  return (
    <div className="animate-fadeIn max-w-[900px] mx-auto px-4 sm:px-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2.5 rounded-xl glass-card text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold gradient-text">Invoice Details</h2>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                bill.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                bill.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                {bill.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{bill.originalFileName || 'Extracted Bill'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {bill.status !== 'processing' && bill.originalFile && (
            <button
              onClick={handleReprocess}
              disabled={reprocessing}
              title="Reprocess Bill"
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white flex items-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${reprocessing ? 'animate-spin' : ''}`} />
              Reprocess
            </button>
          )}
          
          <button
            onClick={handleDownloadJSON}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white flex items-center gap-2 text-sm transition-all"
          >
            <HiOutlineDownload className="w-4 h-4" />
            Export JSON
          </button>

          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all ${
              editMode
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/15'
            }`}
          >
            {editMode ? (
              <>
                <HiOutlineX className="w-4 h-4" /> Cancel Edit
              </>
            ) : (
              <>
                <HiOutlinePencil className="w-4 h-4" /> Edit Fields
              </>
            )}
          </button>

          <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-600/10 border border-red-500/25 text-red-400 hover:bg-red-600/20 flex items-center gap-2 text-sm transition-all font-semibold">
            <HiOutlineTrash className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Processing Status */}
      {bill.status === 'processing' && (
        <div className="glass-card p-4 mb-6 flex items-center gap-3 border-indigo-500/30 bg-indigo-500/5">
          <div className="spinner w-5 h-5 border-2" />
          <div>
            <p className="text-sm font-semibold text-indigo-400">OCR Extraction in progress...</p>
            <p className="text-xs text-slate-500">Intelligently pre-processing image layers, reading barcodes, and extracting tables.</p>
          </div>
        </div>
      )}

      {bill.errorMessage && (
        <div className={`glass-card p-4 mb-6 border-l-4 ${
          bill.errorMessage.startsWith('Duplicate')
            ? 'border-yellow-500/40 bg-yellow-500/5 text-yellow-400'
            : 'border-red-500/40 bg-red-500/5 text-red-400'
        }`}>
          <p className="text-sm font-bold flex items-center gap-2">
            ⚠️ {bill.errorMessage.startsWith('Duplicate') ? 'System Notice' : 'Processing Issue'}
          </p>
          <p className="text-xs text-slate-400 mt-1">{bill.errorMessage}</p>
        </div>
      )}

      {/* Confidence Summary Bar */}
      {bill.confidence != null && (
        <div className="glass-card p-4 mb-6 flex items-center justify-between border border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
              bill.confidence >= 70 ? 'bg-emerald-500/15 text-emerald-400' :
              bill.confidence >= 40 ? 'bg-amber-500/15 text-amber-400' :
              'bg-red-500/15 text-red-400'
            }`}>
              {bill.confidence}%
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Extraction Confidence</p>
              <p className="text-xs text-slate-500">
                {bill.ocrUsed ? 'OCR was used' : 'Text-based extraction'} · {bill.pagesProcessed || 0} page(s) processed
              </p>
            </div>
          </div>
          {bill.processingTimeMs > 0 && (
            <span className="text-xs text-slate-600 font-mono">{(bill.processingTimeMs / 1000).toFixed(1)}s</span>
          )}
        </div>
      )}

      {/* Extracted Fields */}
      <form onSubmit={handleSave}>
        <div className="glass-card p-6 border border-white/5 relative mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <HiOutlineDocumentText className="w-4 h-4 text-indigo-400" />
              Extracted Fields
            </h3>
            {editMode && (
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/10 transition-all"
              >
                <HiOutlineCheck className="w-4 h-4" /> Save Corrections
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Bill Type Selector */}
            <div className="grid grid-cols-3 items-center pb-3 border-b border-white/5">
              <span className="text-xs text-slate-500">Bill Type</span>
              <div className="col-span-2">
                {editMode ? (
                  <select
                    value={formData.billType}
                    onChange={(e) => setFormData({ ...formData, billType: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="regular">📦 Regular Invoice</option>
                    <option value="return">↩ Return Note</option>
                  </select>
                ) : (
                  <span className={`text-sm font-semibold ${bill.billType === 'return' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {bill.billType === 'return' ? '↩ Return Note' : '📦 Regular Invoice'}
                  </span>
                )}
              </div>
            </div>

            {/* Platform Selection */}
            <div className="grid grid-cols-3 items-center pb-3 border-b border-white/5">
              <span className="text-xs text-slate-500">Platform</span>
              <div className="col-span-2">
                {editMode ? (
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="amazon">Amazon</option>
                    <option value="flipkart">Flipkart</option>
                    <option value="meesho">Meesho</option>
                    <option value="ajio">Ajio</option>
                    <option value="myntra">Myntra</option>
                    <option value="shopify">Shopify</option>
                    <option value="generic_gst">Generic GST Invoice</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <div className="flex items-center">
                    <span className={`text-sm font-semibold capitalize ${platformColors[bill.platform || bill.supplierPlatform] || 'text-slate-200'}`}>
                      {bill.platform || bill.supplierPlatform || 'Other'}
                    </span>
                    <ConfBadge level={bill.extractionConfidence?.supplierPlatform} />
                  </div>
                )}
              </div>
            </div>

            {/* Edit Rows */}
            {[
              { label: 'Invoice No.', key: 'invoiceNumber', mono: true },
              { label: 'Order ID', key: 'orderNumber', mono: true },
              { label: 'Invoice Date', key: 'billDate' },
              { label: 'Total Amount', key: 'amount', isAmount: true },
              { label: 'Vendor Name', key: 'vendorName' },
              { label: 'GST Number', key: 'gstNumber', mono: true },
              { label: 'Tax Amount', key: 'taxAmount', isAmount: true },
              { label: 'AWB / Waybill', key: 'awbNumber', mono: true },
              { label: 'Delivery Partner', key: 'deliveryPartner' },
              { label: 'Payment Mode', key: 'paymentMode' },
              { label: 'SKU Code', key: 'sku', mono: true },
              { label: 'Item Quantity', key: 'qty', isQty: true },
            ].map((row) => {
              const val = editMode ? formData[row.key] : bill[row.key];
              const confidence = bill.extractionConfidence?.[row.key === 'paymentMode' ? 'payment' : row.key];
              
              return (
                <div key={row.key} className="grid grid-cols-3 items-center pb-3 border-b border-white/5 last:border-0">
                  <span className="text-xs text-slate-500 capitalize">{row.label}</span>
                  <div className="col-span-2 flex items-center">
                    {editMode ? (
                      <input
                        type={row.isAmount ? 'number' : row.isQty ? 'number' : 'text'}
                        step={row.isAmount ? '0.01' : '1'}
                        value={val}
                        onChange={(e) => setFormData({ ...formData, [row.key]: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500 font-mono"
                      />
                    ) : (
                      <>
                        <span className={`text-sm font-semibold truncate ${
                          val ? (row.mono ? 'font-mono text-cyan-400' : 'text-slate-200') : 'text-slate-600 italic'
                        }`}>
                          {row.isAmount && val != null ? `₹${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : val || 'Not detected'}
                        </span>
                        {val && <ConfBadge level={confidence} />}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Delivery Type (Prepaid / COD) */}
            <div className="grid grid-cols-3 items-center pt-1">
              <span className="text-xs text-slate-500">Delivery Type</span>
              <div className="col-span-2">
                {editMode ? (
                  <select
                    value={formData.deliveryType}
                    onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="PREPAID">Prepaid</option>
                    <option value="COD">COD</option>
                  </select>
                ) : (
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    bill.deliveryType === 'COD' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                  }`}>
                    {bill.deliveryType || 'PREPAID'}
                  </span>
                )}
              </div>
            </div>

            {/* Customer Info */}
            {(bill.customerName || bill.shippingAddress) && (
              <div className="pt-3 border-t border-white/5">
                <p className="text-xs text-slate-500 mb-2 font-semibold">Customer & Shipping</p>
                {bill.customerName && (
                  <p className="text-sm text-slate-200 mb-1"><span className="text-slate-500 text-xs mr-2">Name:</span>{bill.customerName}</p>
                )}
                {bill.shippingAddress && (
                  <p className="text-xs text-slate-400 leading-relaxed"><span className="text-slate-500 mr-2">Address:</span>{bill.shippingAddress}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Line Items Table */}
      {bill.items && bill.items.length > 0 && (
        <div className="glass-card p-6 border border-white/5 mb-6">
          <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center justify-between">
            <span>📦 Multi-Item Lines</span>
            <span className="text-xs text-slate-500 font-mono">Count: {bill.items.length}</span>
          </h3>
          <div className="table-container max-h-[300px] overflow-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-semibold">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2">SKU / Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Taxable</th>
                  <th className="py-2 text-right font-bold text-emerald-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-white/5 last:border-0 text-slate-300">
                    <td className="py-2.5 pr-2 text-slate-600 font-mono">{idx + 1}</td>
                    <td className="py-2.5 font-mono text-cyan-400 pr-4 truncate max-w-[200px]" title={item.sku || item.description}>
                      {item.sku || item.description || '—'}
                    </td>
                    <td className="py-2.5 text-center font-mono">{item.qty || 1}</td>
                    <td className="py-2.5 text-right font-mono text-slate-400">{item.taxableValue != null ? `₹${item.taxableValue}` : '—'}</td>
                    <td className="py-2.5 text-right font-mono font-semibold text-emerald-400">{item.total != null ? `₹${item.total}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Return Info */}
      {bill.billType === 'return' && (
        <div className="glass-card p-6 border border-red-500/10 mb-6">
          <h3 className="text-sm font-bold text-red-400 mb-4">↩ Return Claim Settlement</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-xs text-slate-500">Return Date</span>
              <span className="text-sm text-slate-300 font-semibold">{bill.returnDate || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-xs text-slate-500">Type</span>
              <span className="text-sm text-slate-300 font-semibold">{bill.returnType || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-xs text-slate-500">Status</span>
              <span className={`text-sm font-semibold ${
                bill.returnStatus === 'Success' ? 'text-emerald-400' : 'text-red-400'
              }`}>{bill.returnStatus || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-xs text-slate-500">Claim Amount</span>
              <span className="text-sm font-bold text-cyan-400">
                {bill.claimAmount != null ? `₹${bill.claimAmount.toLocaleString('en-IN')}` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Settlement</span>
              <span className="text-xs text-slate-400">{bill.claimStatus || '—'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Raw Text */}
      <div className="glass-card p-6 border border-white/5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-300">Raw Parsed Text Engine</h3>
          <div className="flex gap-2">
            <button onClick={copyText} className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition-all">
              <HiOutlineClipboardCopy className="w-3.5 h-3.5" /> Copy Raw
            </button>
            <button onClick={() => setShowRawText(!showRawText)} className="text-xs text-indigo-400 hover:text-indigo-300">
              {showRawText ? 'Hide Block' : 'Show Block'}
            </button>
          </div>
        </div>
        {showRawText && (
          <pre className="text-xs text-slate-400 bg-black/35 rounded-xl p-4 max-h-60 overflow-auto whitespace-pre-wrap font-mono leading-relaxed border border-white/5">
            {bill.rawExtractedText || 'No text extracted'}
          </pre>
        )}
      </div>
    </div>
  );
};

export default BillDetailPage;
