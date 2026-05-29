import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineCloudUpload,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineX,
  HiOutlineCheckCircle,
} from 'react-icons/hi';
import { uploadBill } from '../services/api';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const UploadPage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err.code === 'file-too-large') {
        toast.error('File too large. Max size is 10MB.');
      } else if (err.code === 'file-invalid-type') {
        toast.error('Invalid file type. Use PDF, JPG, or PNG.');
      } else {
        toast.error(err.message);
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setUploadComplete(false);
      setProgress(0);

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: MAX_SIZE,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);

    try {
      const response = await uploadBill(selectedFile, (p) => setProgress(p));

      if (response.data.success) {
        setUploadComplete(true);
        toast.success('Bill uploaded! Processing started.');

        // Navigate to dashboard after 2 seconds
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Upload failed. Please try again.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setProgress(0);
    setUploadComplete(false);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (type) => {
    if (type === 'application/pdf') {
      return <HiOutlineDocumentText className="w-12 h-12 text-red-400" />;
    }
    return <HiOutlinePhotograph className="w-12 h-12 text-cyan-400" />;
  };

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">
          Upload Your Bill
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Upload a PDF, JPG, or PNG bill and our OCR engine will automatically
          extract key details like invoice number, date, amounts, and more.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Dropzone */}
        {!selectedFile && (
          <div
            {...getRootProps()}
            className={`dropzone p-12 text-center animate-slideUp ${
              isDragActive ? 'active' : ''
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isDragActive
                    ? 'bg-indigo-500/20 scale-110'
                    : 'bg-white/5'
                }`}
              >
                <HiOutlineCloudUpload
                  className={`w-10 h-10 transition-colors ${
                    isDragActive ? 'text-indigo-400' : 'text-slate-500'
                  }`}
                />
              </div>
              {isDragActive ? (
                <p className="text-indigo-400 font-semibold text-lg">
                  Drop your file here...
                </p>
              ) : (
                <>
                  <div>
                    <p className="text-slate-300 font-semibold text-lg">
                      Drag & drop your bill here
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                      or{' '}
                      <span className="text-indigo-400 underline cursor-pointer">
                        browse files
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-3 mt-2">
                    {['PDF', 'JPG', 'PNG'].map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1 rounded-lg bg-white/5 text-xs text-slate-400 font-medium"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs">Max file size: 10MB</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* File Preview */}
        {selectedFile && (
          <div className="glass-card p-6 animate-slideUp">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300">
                Selected File
              </h3>
              {!uploading && (
                <button
                  onClick={clearFile}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* File icon or image preview */}
              <div className="shrink-0">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-xl border border-white/10"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-white/5 flex items-center justify-center">
                    {getFileIcon(selectedFile.type)}
                  </div>
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatSize(selectedFile.size)} &bull;{' '}
                  {selectedFile.type.split('/')[1]?.toUpperCase()}
                </p>

                {/* Progress bar */}
                {(uploading || uploadComplete) && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">
                        {uploadComplete ? 'Upload Complete' : 'Uploading...'}
                      </span>
                      <span className="text-indigo-400">{progress}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          uploadComplete
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                            : 'bg-gradient-to-r from-indigo-500 to-cyan-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Button */}
            {!uploadComplete && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <HiOutlineCloudUpload className="w-5 h-5" />
                    Upload & Extract Data
                  </>
                )}
              </button>
            )}

            {/* Success Message */}
            {uploadComplete && (
              <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <HiOutlineCheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-400">
                    Bill uploaded successfully!
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Redirecting to dashboard...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
          {[
            {
              icon: '📄',
              title: 'Smart OCR',
              desc: 'Tesseract.js for scanned bills, pdf-parse for text PDFs',
            },
            {
              icon: '🔍',
              title: 'E-Commerce Extract',
              desc: 'Order, AWB, SKU, platform, delivery partner, payment & more',
            },
            {
              icon: '📦',
              title: 'Multi-Bill PDFs',
              desc: 'Auto-splits PDFs with multiple bills into separate records',
            },
            {
              icon: '↩️',
              title: 'Return Detection',
              desc: 'Auto-detects return bills with RTO type, status & claims',
            },
            {
              icon: '🛒',
              title: 'Platform Detect',
              desc: 'Amazon, Flipkart, Meesho, Myntra auto-detected',
            },
            {
              icon: '💾',
              title: 'Save & Search',
              desc: 'All data stored in MongoDB, filterable dashboard',
            },
          ].map((item) => (
            <div key={item.title} className="glass-card p-5 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h4 className="text-sm font-semibold text-slate-200">
                {item.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
