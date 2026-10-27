import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg p-6 overflow-hidden text-left align-middle transition-all transform rounded-xl border border-slate-700/80 bg-slate-900/95 shadow-2xl shadow-indigo-950/50">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            {isDanger && <AlertTriangle className="w-5 h-5 text-rose-400" />}
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 text-slate-300 text-sm">{children}</div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-all shadow-md ${
                isDanger
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/50'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/50'
              }`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
