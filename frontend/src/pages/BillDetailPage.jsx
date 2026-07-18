import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineRefresh,
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineReceiptRefund,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { getBillById, deleteBill, updateBill, reprocessBill } from '../services/api';

const BillDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
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
      navigate('/app/dashboard');
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
            toast.success('Invoice reprocessing completed!');
          }
        } catch {
          clearInterval(interval);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [bill?.status]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this bill permanently? This removes database files and cloud storage.')) return;
    try {
      await deleteBill(id);
      toast.success('Bill deleted successfully');
      navigate('/app/dashboard');
    } catch {
      toast.error('Failed to delete bill');
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
        toast.success('Invoice details updated');
        setBill(data.data);
        setEditMode(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save changes');
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="spinner w-12 h-12" />
        <span className="text-sm text-slate-500 font-semibold">Loading invoice details...</span>
      </div>
    );
  }

  if (!bill) return null;

  const ConfBadge = ({ level }) => {
    if (typeof level === 'number') {
      const cls =
        level >= 80
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : level >= 40
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-red-50 text-red-700 border-red-200';
      return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold ${cls} ml-2 shrink-0`}>
          {level}%
        </span>
      );
    }
    return null;
  };

  const platformColors = {
    amazon: 'text-amber-600',
    flipkart: 'text-blue-600',
    meesho: 'text-pink-600',
    myntra: 'text-rose-600',
    ajio: 'text-purple-600',
    shopify: 'text-emerald-600',
    generic_gst: 'text-indigo-600',
    other: 'text-slate-600',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/app/dashboard"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Invoice Workspace</h2>
              <span
                className={`badge border capitalize ${
                  bill.status === 'completed'
                    ? 'badge-completed'
                    : bill.status === 'failed'
                    ? 'badge-failed'
                    : 'badge-processing'
                }`}
              >
                {bill.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              ID: <span className="font-mono">{bill._id}</span> &bull; {bill.originalFileName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {bill.status !== 'processing' && bill.originalFile && bill.originalFile !== '(Temporary - Deleted after extraction)' && (
            <button
              onClick={handleReprocess}
              disabled={reprocessing}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/20 flex items-center gap-2 text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${reprocessing ? 'animate-spin' : ''}`} />
              Reprocess OCR
            </button>
          )}

          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-sm ${
              editMode
                ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                : 'btn-primary py-2 shadow-sm'
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

          <button
            onClick={handleDelete}
            className="px-3.5 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 flex items-center gap-2 text-xs font-bold transition-all shadow-sm"
          >
            <HiOutlineTrash className="w-4 h-4" /> Delete Bill
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-5">
          {/* Processing and Error alerts */}
          {bill.status === 'processing' && (
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 flex items-center gap-3">
              <div className="spinner w-5 h-5 border-2 border-indigo-200 border-t-indigo-600" />
              <div>
                <p className="text-xs font-bold text-indigo-700">OCR running in background...</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Polling database state for updates every 3 seconds.</p>
              </div>
            </div>
          )}

          {bill.errorMessage && (
            <div
              className={`p-4 rounded-xl border border-l-4 flex items-start gap-2.5 ${
                bill.errorMessage.startsWith('Duplicate')
                  ? 'border-amber-200 border-l-amber-500 bg-amber-50/40 text-amber-800'
                  : 'border-red-200 border-l-red-500 bg-red-50/40 text-red-800'
              }`}
            >
              <HiOutlineExclamationCircle className={`w-5 h-5 shrink-0 mt-0.5 ${bill.errorMessage.startsWith('Duplicate') ? 'text-amber-500' : 'text-red-500'}`} />
              <div>
                <p className="text-xs font-bold">{bill.errorMessage.startsWith('Duplicate') ? 'System Alert' : 'Parsing Alert'}</p>
                <p className="text-[11px] text-slate-500 mt-1">{bill.errorMessage}</p>
              </div>
            </div>
          )}

          {/* Tab Contents */}
          <div className="space-y-4">
            <form onSubmit={handleSave} className="space-y-4">
                <div className="glass-card bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800">Structured Data</h4>
                    {editMode && (
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <HiOutlineCheck className="w-4 h-4" /> Save Corrections
                      </button>
                    )}
                  </div>

                  <div className="space-y-3.5">
                    {/* Bill Type Selector */}
                    <div className="grid grid-cols-3 items-center pb-2.5 border-b border-slate-100 last:border-0">
                      <span className="text-xs font-semibold text-slate-400">Bill Type</span>
                      <div className="col-span-2">
                        {editMode ? (
                          <select
                            value={formData.billType}
                            onChange={(e) => setFormData({ ...formData, billType: e.target.value })}
                            className="input-field py-1 text-xs"
                          >
                            <option value="regular">Regular Invoice</option>
                            <option value="return">Return Note</option>
                          </select>
                        ) : (
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1.5 ${
                              bill.billType === 'return' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {bill.billType === 'return' ? (
                              <>
                                <HiOutlineReceiptRefund className="w-3.5 h-3.5" />
                                <span>Return Note</span>
                              </>
                            ) : (
                              <>
                                <HiOutlineDocumentText className="w-3.5 h-3.5" />
                                <span>Regular Invoice</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Platform Selector */}
                    <div className="grid grid-cols-3 items-center pb-2.5 border-b border-slate-100 last:border-0">
                      <span className="text-xs font-semibold text-slate-400">Platform</span>
                      <div className="col-span-2">
                        {editMode ? (
                          <select
                            value={formData.platform}
                            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                            className="input-field py-1 text-xs"
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
                            <span
                              className={`text-xs font-bold capitalize ${
                                platformColors[bill.platform || bill.supplierPlatform] || 'text-slate-700'
                              }`}
                            >
                              {bill.platform || bill.supplierPlatform || 'Other'}
                            </span>
                            <ConfBadge level={bill.extractionConfidence?.supplierPlatform} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fields List */}
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
                      { label: 'Quantity', key: 'qty', isQty: true },
                    ].map((row) => {
                      const val = editMode ? formData[row.key] : bill[row.key];
                      const confidence = bill.extractionConfidence?.[row.key === 'paymentMode' ? 'payment' : row.key];

                      return (
                        <div
                          key={row.key}
                          className="grid grid-cols-3 items-center pb-2.5 border-b border-slate-100 last:border-0"
                        >
                          <span className="text-xs font-semibold text-slate-400">{row.label}</span>
                          <div className="col-span-2 flex items-center min-w-0">
                            {editMode ? (
                              <input
                                type={row.isAmount ? 'number' : row.isQty ? 'number' : 'text'}
                                step={row.isAmount ? '0.01' : '1'}
                                value={val}
                                onChange={(e) => setFormData({ ...formData, [row.key]: e.target.value })}
                                className="input-field py-1 text-xs font-mono"
                              />
                            ) : (
                              <>
                                <span
                                  className={`text-xs truncate ${
                                    val
                                      ? row.mono
                                        ? 'font-mono font-bold text-slate-800'
                                        : 'font-bold text-slate-700'
                                      : 'text-slate-400 italic'
                                  }`}
                                >
                                  {row.isAmount && val != null
                                    ? `₹${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                    : val || 'Not detected'}
                                </span>
                                {val && <ConfBadge level={confidence} />}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Delivery Type */}
                    <div className="grid grid-cols-3 items-center pb-2.5 last:border-0">
                      <span className="text-xs font-semibold text-slate-400">Delivery Type</span>
                      <div className="col-span-2">
                        {editMode ? (
                          <select
                            value={formData.deliveryType}
                            onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value })}
                            className="input-field py-1 text-xs"
                          >
                            <option value="PREPAID">Prepaid</option>
                            <option value="COD">COD</option>
                          </select>
                        ) : (
                          <span
                            className={`badge border text-[10px] ${
                              bill.deliveryType === 'COD'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {bill.deliveryType || 'PREPAID'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Multi Items */}
                {bill.items && bill.items.length > 0 && (
                  <div className="glass-card bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center justify-between">
                      <span>Structured Line Items</span>
                      <span className="badge badge-completed text-[10px]">{bill.items.length} items</span>
                    </h4>
                    <div className="table-container max-h-[250px] overflow-auto border border-slate-100 rounded-xl">
                      <table>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>SKU / Item Name</th>
                            <th>Qty</th>
                            <th>Taxable</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bill.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="font-mono text-slate-400">{idx + 1}</td>
                              <td className="font-mono font-bold text-slate-700 max-w-[150px] truncate" title={item.sku || item.description}>
                                {item.sku || item.description || '—'}
                              </td>
                              <td className="font-semibold text-center">{item.qty || 1}</td>
                              <td className="text-right font-mono text-slate-500">
                                {item.taxableValue != null ? `₹${item.taxableValue}` : '—'}
                              </td>
                              <td className="text-right font-mono font-bold text-emerald-600">
                                {item.total != null ? `₹${item.total}` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Return settled details */}
                {bill.billType === 'return' && (
                  <div className="glass-card bg-white border border-red-100 rounded-2xl p-5 shadow-sm space-y-3">
                    <h4 className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                      <HiOutlineReceiptRefund className="w-4 h-4 text-red-600" />
                      <span>Return Claim Details</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg border border-red-50 bg-red-50/10">
                        <span className="text-slate-400 block mb-0.5">Return Date</span>
                        <span className="text-slate-700 font-bold">{bill.returnDate || '—'}</span>
                      </div>
                      <div className="p-2.5 rounded-lg border border-red-50 bg-red-50/10">
                        <span className="text-slate-400 block mb-0.5">Return Status</span>
                        <span className={`font-bold ${bill.returnStatus === 'Success' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {bill.returnStatus || '—'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg border border-red-50 bg-red-50/10">
                        <span className="text-slate-400 block mb-0.5">Claim Amount</span>
                        <span className="text-slate-700 font-bold">
                          {bill.claimAmount != null ? `₹${bill.claimAmount.toLocaleString('en-IN')}` : '—'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg border border-red-50 bg-red-50/10">
                        <span className="text-slate-400 block mb-0.5">Settlement State</span>
                        <span className="text-slate-500 font-medium">{bill.claimStatus || '—'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetailPage;
