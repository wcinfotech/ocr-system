import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft, HiOutlineTrash, HiOutlineDocumentText,
  HiOutlineRefresh, HiOutlineClipboardCopy,
} from 'react-icons/hi';
import { getBillById, deleteBill } from '../services/api';

const BillDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRawText, setShowRawText] = useState(false);

  const fetchBill = async () => {
    setLoading(true);
    try {
      const { data } = await getBillById(id);
      if (data.success) setBill(data.data);
    } catch { toast.error('Bill not found'); navigate('/dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchBill();
    const interval = setInterval(async () => {
      try {
        const { data } = await getBillById(id);
        if (data.success && data.data.status !== 'processing') {
          setBill(data.data);
          clearInterval(interval);
        }
      } catch { clearInterval(interval); }
    }, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this bill permanently?')) return;
    try { await deleteBill(id); toast.success('Deleted'); navigate('/dashboard'); }
    catch { toast.error('Failed to delete'); }
  };

  const copyText = () => {
    if (bill?.rawExtractedText) {
      navigator.clipboard.writeText(bill.rawExtractedText);
      toast.success('Copied to clipboard');
    }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><div className="spinner" /></div>;
  if (!bill) return null;

  const ConfBadge = ({ level }) => <span className={`badge badge-${level} ml-2 text-[10px]`}>{level}</span>;

  const Row = ({ label, value, confidence, mono, color }) => (
    <div className="flex items-start justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-slate-500 shrink-0 w-32">{label}</span>
      <div className="flex items-center gap-2 text-right">
        <span className={`text-sm font-medium ${
          value ? (mono ? 'font-mono text-cyan-400' : color || 'text-slate-200') : 'text-slate-600 italic'
        }`}>
          {value || 'Not found'}
        </span>
        {confidence && <ConfBadge level={confidence} />}
      </div>
    </div>
  );

  const fmtAmt = (a) => a != null ? `₹${a.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : null;

  const platformColors = {
    amazon: 'text-amber-400', flipkart: 'text-blue-400', meesho: 'text-pink-400',
    myntra: 'text-rose-400', personal: 'text-slate-300',
  };

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold gradient-text">Bill Details</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500">{bill.originalFileName}</span>
              {bill.totalBillsInFile > 1 && (
                <span className="badge badge-processing text-[10px]">Bill {bill.billIndex} of {bill.totalBillsInFile}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchBill} className="p-2 rounded-xl glass-card text-slate-400 hover:text-indigo-400 transition-colors">
            <HiOutlineRefresh className="w-5 h-5" />
          </button>
          <button onClick={handleDelete} className="btn-danger flex items-center gap-2">
            <HiOutlineTrash className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Processing / Error banners */}
      {bill.status === 'processing' && (
        <div className="glass-card p-4 mb-6 flex items-center gap-3 border-indigo-500/30">
          <div className="spinner w-6 h-6 border-2" />
          <div>
            <p className="text-sm font-medium text-indigo-400">Processing...</p>
            <p className="text-xs text-slate-500">OCR extraction in progress. Auto-refreshing.</p>
          </div>
        </div>
      )}
      {bill.status === 'failed' && (
        <div className="glass-card p-4 mb-6 border-red-500/30 bg-red-500/5">
          <p className="text-sm font-medium text-red-400">Processing Failed</p>
          <p className="text-xs text-slate-500 mt-1">{bill.errorMessage || 'Unknown error'}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bill Info */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <HiOutlineDocumentText className="w-4 h-4 text-indigo-400" />
              {bill.billType === 'return' ? 'Return Bill Information' : 'Bill Information'}
            </h3>
            <Row label="Bill Type" value={bill.billType === 'return' ? '↩ Return' : '📦 Regular'}
              color={bill.billType === 'return' ? 'text-red-400' : 'text-emerald-400'} />
            <Row label="Invoice No." value={bill.invoiceNumber} confidence={bill.extractionConfidence?.invoiceNumber} mono />
            <Row label="Order No." value={bill.orderNumber} confidence={bill.extractionConfidence?.orderNumber} mono />
            <Row label="Date" value={bill.billDate} confidence={bill.extractionConfidence?.billDate} />
            <Row label="Amount" value={fmtAmt(bill.amount)} confidence={bill.extractionConfidence?.amount} color="text-emerald-400" />
            <Row label="Vendor" value={bill.vendorName} confidence={bill.extractionConfidence?.vendorName} />
            <Row label="Vendor Details" value={bill.vendorDetails} />
            <Row label="GST Number" value={bill.gstNumber} mono />
            <Row label="Tax Amount" value={fmtAmt(bill.taxAmount)} />
          </div>

          {/* E-Commerce Details */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">🛒 E-Commerce Details</h3>
            <Row label="Platform" value={bill.supplierPlatform ? bill.supplierPlatform.charAt(0).toUpperCase() + bill.supplierPlatform.slice(1) : null}
              confidence={bill.extractionConfidence?.supplierPlatform}
              color={platformColors[bill.supplierPlatform] || 'text-slate-200'} />
            <Row label="AWB No." value={bill.awbNumber} confidence={bill.extractionConfidence?.awbNumber} mono />
            <Row label="Delivery Partner" value={bill.deliveryPartner} confidence={bill.extractionConfidence?.deliveryPartner} />
            <Row label="Payment" value={bill.payment} confidence={bill.extractionConfidence?.payment}
              color={bill.payment === 'COD' ? 'text-amber-400' : 'text-emerald-400'} />
            <Row label="SKU" value={bill.sku} confidence={bill.extractionConfidence?.sku} mono />
            <Row label="Quantity" value={bill.qty?.toString()} confidence={bill.extractionConfidence?.qty} />
          </div>

          {/* Return Details (only for return bills) */}
          {bill.billType === 'return' && (
            <div className="glass-card p-6 border-red-500/10">
              <h3 className="text-sm font-semibold text-red-400 mb-4">↩ Return Details</h3>
              <Row label="Return Date" value={bill.returnDate} />
              <Row label="Return Type" value={bill.returnType} color="text-amber-400" />
              <Row label="Return Status" value={bill.returnStatus}
                color={bill.returnStatus === 'Success' ? 'text-emerald-400' : bill.returnStatus === 'Failed' ? 'text-red-400' : 'text-amber-400'} />
              <Row label="Claim Amount" value={fmtAmt(bill.claimAmount)} color="text-cyan-400" />
              <Row label="Claim Status" value={bill.claimStatus} />
            </div>
          )}

          {/* Raw Text */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300">Raw Extracted Text</h3>
              <div className="flex gap-2">
                <button onClick={copyText} className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition-colors">
                  <HiOutlineClipboardCopy className="w-3.5 h-3.5" /> Copy
                </button>
                <button onClick={() => setShowRawText(!showRawText)} className="text-xs text-indigo-400 hover:text-indigo-300">
                  {showRawText ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {showRawText && (
              <pre className="text-xs text-slate-400 bg-black/30 rounded-xl p-4 max-h-96 overflow-auto whitespace-pre-wrap font-mono leading-relaxed">
                {bill.rawExtractedText || 'No text extracted'}
              </pre>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* File Info */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">File Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-slate-300 font-mono uppercase">{bill.fileType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className={`badge badge-${bill.status}`}>{bill.status}</span>
              </div>
              {bill.totalBillsInFile > 1 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Bill #</span>
                  <span className="text-slate-300 text-xs">{bill.billIndex} of {bill.totalBillsInFile}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Uploaded</span>
                <span className="text-slate-300 text-xs">{new Date(bill.createdAt).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Confidence */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Extraction Confidence</h3>
            <div className="space-y-2">
              {bill.extractionConfidence && Object.entries(bill.extractionConfidence).map(([field, level]) => (
                <div key={field} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className={`badge badge-${level} text-[10px]`}>{level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetailPage;
