import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, HelpCircle, MessageSquare, X } from 'lucide-react';
import { useJEPStore } from '../store';

export default function GlobalDialog() {
  const { dialog, closeDialog } = useJEPStore();
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (dialog?.isOpen && dialog.type === 'prompt') {
      setInputValue(dialog.defaultValue || '');
    }
  }, [dialog]);

  if (!dialog) return null;

  const handleConfirm = () => {
    if (dialog.onConfirm) {
      dialog.onConfirm(dialog.type === 'prompt' ? inputValue : undefined);
    }
    closeDialog();
  };

  const handleCancel = () => {
    if (dialog.onCancel) {
      dialog.onCancel();
    }
    closeDialog();
  };

  const icons = {
    alert: <AlertCircle className="w-6 h-6 text-amber-500" />,
    confirm: <HelpCircle className="w-6 h-6 text-blue-500" />,
    prompt: <MessageSquare className="w-6 h-6 text-exact-purple" />
  };

  return (
    <AnimatePresence>
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <div className="flex items-center space-x-3">
                {icons[dialog.type]}
                <h2 className="text-lg font-heading font-semibold text-exact-dark">
                  {dialog.title}
                </h2>
              </div>
              <button
                onClick={handleCancel}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600 font-sans leading-relaxed">
                {dialog.message}
              </p>

              {dialog.type === 'prompt' && (
                <input
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-exact-purple focus:ring-0 transition-all font-sans"
                  placeholder="Voer waarde in..."
                />
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
              {(dialog.type === 'confirm' || dialog.type === 'prompt') && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition-all"
                >
                  Annuleren
                </button>
              )}
              <button
                onClick={handleConfirm}
                className={`px-6 py-2 text-sm font-bold text-white rounded-xl transition-all shadow-md ${
                  dialog.type === 'alert' ? 'bg-amber-500 hover:bg-amber-600' : 
                  dialog.type === 'confirm' ? 'bg-blue-600 hover:bg-blue-700' : 
                  'bg-exact-purple hover:bg-purple-700'
                }`}
              >
                {dialog.type === 'confirm' ? 'Ja, doorgaan' : 'OK'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
