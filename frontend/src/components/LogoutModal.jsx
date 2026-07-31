import { createPortal } from 'react-dom';
import { HiOutlineLogout } from 'react-icons/hi';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 animate-scaleUp relative overflow-hidden text-center">
        {/* Top red accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-rose-600" />

        <div className="mx-auto w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100/50 shadow-inner mb-4">
          <HiOutlineLogout className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mb-2">
          Confirm Logout
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          Are you sure you want to log out of your account? You will need to log back in to access your dashboard and bills.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all border border-slate-200/60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl transition-all shadow-md shadow-red-500/10 hover:shadow-red-500/20 active:scale-[0.98]"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutModal;
