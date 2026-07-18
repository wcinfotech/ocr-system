import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineCloudUpload,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlineArchive,
  HiOutlineSearch,
  HiOutlineReceiptRefund,
  HiOutlineShoppingBag,
  HiOutlineChartBar,
} from 'react-icons/hi';
import { uploadBills } from '../services/api';
import { useData } from '../context/DataContext';
import SEO from '../components/SEO';

const MAX_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 20;

const UploadPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [batchResult, setBatchResult] = useState(null);

  // Handle files preloaded from quick-upload on dashboard
  useEffect(() => {
    if (location.state?.preloadedFiles) {
      const preloaded = location.state.preloadedFiles;
      setFiles((prev) => {
        const combined = [...prev, ...preloaded];
        if (combined.length > MAX_FILES) {
          toast.error(`Max ${MAX_FILES} files at once.`);
          return combined.slice(0, MAX_FILES);
        }
        return combined;
      });
      // Clear route state to prevent re-adding on back navigation/refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err.code === 'file-too-large') toast.error('File too large. Max 50MB per file.');
      else if (err.code === 'file-invalid-type') toast.error('Invalid file type. Use PDF, JPG, PNG, or ZIP.');
      else toast.error(err.message);
      return;
    }
    setFiles((prev) => {
      const combined = [...prev, ...acceptedFiles];
      if (combined.length > MAX_FILES) {
        toast.error(`Max ${MAX_FILES} files at once.`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
    setUploadComplete(false);
    setProgress(0);
    setBatchResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/tiff': ['.tiff', '.tif'],
      'image/bmp': ['.bmp'],
      'image/heic': ['.heic'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    maxSize: MAX_SIZE,
    multiple: true,
  });

  const { fetchDashboardData, fetchHistoryData } = useData();

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);
    try {
      const response = await uploadBills(files, (p) => setProgress(p));
      if (response.data.success) {
        setUploadComplete(true);
        setBatchResult(response.data.data);
        toast.success(`${files.length} file(s) uploaded! Processing started.`);
        fetchDashboardData(true);
        fetchHistoryData({}, true);
        setTimeout(() => navigate('/app/dashboard'), 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setProgress(0);
    setUploadComplete(false);
    setBatchResult(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (file) => {
    const type = file.type || '';
    const name = file.name.toLowerCase();
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      return <HiOutlineDocumentText className="w-8 h-8 text-red-500" />;
    }
    if (type.includes('zip') || name.endsWith('.zip')) {
      return <HiOutlineArchive className="w-8 h-8 text-amber-500 shrink-0" />;
    }
    return <HiOutlinePhotograph className="w-8 h-8 text-indigo-500" />;
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <SEO title="Upload Invoices" />
      {/* Page Title */}
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Upload Bills</h2>
        <p className="text-slate-500 text-sm max-w-lg mx-auto mt-2">
          Drag & drop multiple PDFs, JPGs, or ZIP archives. Our high-performance OCR engine extracts invoice details, SKUs, items, and more automatically.
        </p>
      </div>

      <div className="space-y-6">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`dropzone p-12 text-center shadow-sm ${
            isDragActive ? 'active border-indigo-500 bg-indigo-50/20' : 'bg-white border-slate-200'
          }`}
        >
          <input {...getInputProps()} />
          <div className={`flex flex-col items-center gap-4 ${isDragActive ? 'pointer-events-none' : ''}`}>
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isDragActive ? 'bg-indigo-600/10 scale-110' : 'bg-slate-50'
              }`}
            >
              <HiOutlineCloudUpload className={`w-8 h-8 ${isDragActive ? 'text-indigo-600' : 'text-slate-400'}`} />
            </div>
            {isDragActive ? (
              <p className="text-indigo-600 font-bold text-lg">Drop your files here...</p>
            ) : (
              <>
                <div>
                  <p className="text-slate-700 font-bold text-lg">Drag & drop bills here</p>
                  <p className="text-slate-500 text-sm mt-1">
                    or <span className="text-indigo-600 font-semibold hover:underline cursor-pointer">browse files</span>
                    <span className="text-slate-400 ml-2">&bull; Up to {MAX_FILES} files</span>
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-1">
                  {['PDF', 'JPG', 'PNG', 'WEBP', 'ZIP'].map((type) => (
                    <span
                      key={type}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[10px] text-slate-500 font-bold tracking-wider"
                    >
                      {type}
                    </span>
                  ))}
                </div>
                <p className="text-slate-400 text-xs mt-1">Max 50MB per file &bull; ZIP file extraction supported</p>
              </>
            )}
          </div>
        </div>

        {/* File Queue */}
        {files.length > 0 && (
          <div className="glass-card p-6 bg-white border-slate-200 shadow-sm rounded-2xl animate-slideUp">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
                <span className="text-slate-400 font-medium ml-2">({formatSize(totalSize)})</span>
              </h3>
              {!uploading && (
                <button
                  onClick={clearAll}
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 group hover:bg-slate-50 transition-colors"
                >
                  <div className="shrink-0">{getFileIcon(file)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      {formatSize(file.size)} &bull; {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </p>
                  </div>
                  {!uploading && (
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors md:opacity-0 group-hover:opacity-100"
                    >
                      <HiOutlineX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Progress */}
            {(uploading || uploadComplete) && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-500">{uploadComplete ? 'Upload Complete' : 'Uploading...'}</span>
                  <span className="text-indigo-600">{progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      uploadComplete ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            {!uploadComplete && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="btn-primary w-full mt-5 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing {files.length} file(s)...
                  </>
                ) : (
                  <>
                    <HiOutlineCloudUpload className="w-5 h-5" />
                    Upload & Extract ({files.length} file{files.length !== 1 ? 's' : ''})
                  </>
                )}
              </button>
            )}

            {/* Success */}
            {uploadComplete && (
              <div className="mt-5 flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-800">
                    {batchResult?.totalFiles || files.length} file(s) uploaded successfully!
                  </p>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">
                    Redirecting to your dashboard...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10">
          {[
            { icon: HiOutlineDocumentText, color: 'text-indigo-600', bg: 'bg-indigo-50', title: 'Smart OCR', desc: 'Pre-processed sharp image scanning with auto-fallback engine' },
            { icon: HiOutlineSearch, color: 'text-sky-600', bg: 'bg-sky-50', title: 'Multi-Item Parser', desc: 'Extracts SKU list, quantities, tax breakdowns, and payment modes' },
            { icon: HiOutlineCloudUpload, color: 'text-violet-600', bg: 'bg-violet-50', title: 'Batch uploads', desc: 'Upload up to 20 files at once with asynchronous batch queues' },
            { icon: HiOutlineReceiptRefund, color: 'text-red-600', bg: 'bg-red-50', title: 'Return Detection', desc: 'Automated return bill marking (RTO) and original order reconciliation' },
            { icon: HiOutlineShoppingBag, color: 'text-amber-600', bg: 'bg-amber-50', title: 'Platform Detection', desc: 'Amazon, Flipkart, Meesho, Myntra, Ajio and custom GST formats' },
            { icon: HiOutlineChartBar, color: 'text-emerald-600', bg: 'bg-emerald-50', title: 'Export & Stats', desc: 'Instant CSV downloads, statistics cards, and custom visualization' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="glass-card p-5 bg-white text-center border border-slate-200/80 shadow-sm rounded-2xl flex flex-col items-center">
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                <p className="text-xs text-slate-400 font-medium mt-1 leading-normal">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
