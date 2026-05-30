import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineCloudUpload, HiOutlineDocumentText, HiOutlinePhotograph,
  HiOutlineX, HiOutlineCheckCircle,
} from 'react-icons/hi';
import { uploadBills } from '../services/api';

const MAX_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 20;

const UploadPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [batchResult, setBatchResult] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err.code === 'file-too-large') toast.error('File too large. Max 50MB per file.');
      else if (err.code === 'file-invalid-type') toast.error('Invalid file type. Use PDF, JPG, or PNG.');
      else toast.error(err.message);
      return;
    }
    setFiles(prev => {
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
    accept: { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxSize: MAX_SIZE,
    multiple: true,
  });

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
        setTimeout(() => navigate('/dashboard'), 2500);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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

  const getFileIcon = (type) => {
    if (type === 'application/pdf') return <HiOutlineDocumentText className="w-8 h-8 text-red-400" />;
    return <HiOutlinePhotograph className="w-8 h-8 text-cyan-400" />;
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">Upload Bills</h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Drag & drop multiple PDFs, JPGs, or PNGs. Our OCR engine extracts invoice details, SKUs, items, and more automatically.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`dropzone p-10 text-center animate-slideUp ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragActive ? 'bg-indigo-500/20 scale-110' : 'bg-white/5'}`}>
              <HiOutlineCloudUpload className={`w-10 h-10 transition-colors ${isDragActive ? 'text-indigo-400' : 'text-slate-500'}`} />
            </div>
            {isDragActive ? (
              <p className="text-indigo-400 font-semibold text-lg">Drop your files here...</p>
            ) : (
              <>
                <div>
                  <p className="text-slate-300 font-semibold text-lg">Drag & drop bills here</p>
                  <p className="text-slate-500 text-sm mt-1">
                    or <span className="text-indigo-400 underline cursor-pointer">browse files</span>
                    <span className="text-slate-600 ml-2">• Up to {MAX_FILES} files</span>
                  </p>
                </div>
                <div className="flex gap-3 mt-2">
                  {['PDF', 'JPG', 'PNG'].map((type) => (
                    <span key={type} className="px-3 py-1 rounded-lg bg-white/5 text-xs text-slate-400 font-medium">{type}</span>
                  ))}
                </div>
                <p className="text-slate-600 text-xs">Max 50MB per file</p>
              </>
            )}
          </div>
        </div>

        {/* File Queue */}
        {files.length > 0 && (
          <div className="glass-card p-6 animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
                <span className="text-slate-500 font-normal ml-2">({formatSize(totalSize)})</span>
              </h3>
              {!uploading && (
                <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] group">
                  <div className="shrink-0">{getFileIcon(file.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatSize(file.size)} • {file.type.split('/')[1]?.toUpperCase()}</p>
                  </div>
                  {!uploading && (
                    <button onClick={() => removeFile(index)} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                      <HiOutlineX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Progress */}
            {(uploading || uploadComplete) && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{uploadComplete ? 'Upload Complete' : 'Uploading...'}</span>
                  <span className="text-indigo-400">{progress}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${uploadComplete ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-cyan-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            {!uploadComplete && (
              <button onClick={handleUpload} disabled={uploading}
                className="btn-primary w-full mt-5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {uploading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing {files.length} file(s)...</>
                ) : (
                  <><HiOutlineCloudUpload className="w-5 h-5" /> Upload & Extract ({files.length} file{files.length !== 1 ? 's' : ''})</>
                )}
              </button>
            )}

            {/* Success */}
            {uploadComplete && (
              <div className="mt-5 flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <HiOutlineCheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-400">
                    {batchResult?.totalFiles || files.length} file(s) uploaded successfully!
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Redirecting to dashboard...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
          {[
            { icon: '📄', title: 'Smart OCR', desc: 'Sharp preprocessing + Tesseract.js with auto-fallback' },
            { icon: '🔍', title: 'Multi-Item Parse', desc: 'Extracts multiple SKUs, quantities, and line items per bill' },
            { icon: '📦', title: 'Batch Upload', desc: 'Upload up to 20 files at once with progress tracking' },
            { icon: '↩️', title: 'Return Detection', desc: 'Auto-detects return bills with RTO type & claims' },
            { icon: '🛒', title: 'Platform Detect', desc: 'Amazon, Flipkart, Meesho, Myntra auto-detected' },
            { icon: '📊', title: 'Export & Stats', desc: 'CSV export and analytics dashboard built-in' },
          ].map((item) => (
            <div key={item.title} className="glass-card p-5 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h4 className="text-sm font-semibold text-slate-200">{item.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
