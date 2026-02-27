import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, FileCode, Check } from 'lucide-react';

import { useJEPStore } from '../store';

interface XsdManagerModalProps {
  onClose: () => void;
}

export default function XsdManagerModal({ onClose }: XsdManagerModalProps) {
  const addNotification = useJEPStore((state) => state.addNotification);
  const [xsdContent, setXsdContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchXsd();
  }, []);

  const fetchXsd = async () => {
    try {
      const res = await fetch('/api/xsd');
      if (res.ok) {
        const data = await res.json();
        setXsdContent(data.xsd);
      } else {
        setXsdContent('Geen XSD bestand gevonden.');
      }
    } catch (error) {
      console.error(error);
      setXsdContent('Fout bij ophalen XSD.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('xsdFile', file);

      const res = await fetch('/api/xsd', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setXsdContent(data.xsd);
        addNotification('XSD succesvol bijgewerkt!', 'success');
      } else {
        addNotification('Fout bij uploaden XSD.', 'error');
      }
    } catch (error) {
      console.error(error);
      addNotification('Fout bij uploaden XSD.', 'error');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
            <div className="flex items-center space-x-3">
              <FileCode className="w-5 h-5 text-exact-blue" />
              <h2 className="text-xl font-heading font-semibold text-exact-dark">
                Beheer XSD Schema
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              {successMsg && (
                <span className="text-sm text-green-600 font-medium flex items-center font-sans">
                  <Check className="w-4 h-4 mr-1" />
                  {successMsg}
                </span>
              )}
              <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-exact-dark bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-blue cursor-pointer transition-colors">
                <Upload className="w-4 h-4 mr-1.5 text-exact-blue" />
                {isUploading ? 'Bezig...' : 'Upload Nieuwe XSD'}
                <input
                  type="file"
                  accept=".xsd"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-0 flex-1 overflow-auto bg-slate-900">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-slate-400 font-sans">
                Laden...
              </div>
            ) : (
              <pre className="p-6 text-sm font-mono text-slate-300 whitespace-pre-wrap break-all">
                <code>{xsdContent}</code>
              </pre>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-exact-beige/30 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-exact-blue border border-transparent rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-blue transition-colors"
            >
              Sluiten
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
