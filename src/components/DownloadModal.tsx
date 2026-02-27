import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download } from 'lucide-react';

interface DownloadModalProps {
  defaultFilename: string;
  onDownload: (filename: string) => void;
  onClose: () => void;
}

export default function DownloadModal({ defaultFilename, onDownload, onClose }: DownloadModalProps) {
  const [filename, setFilename] = useState(defaultFilename);

  const handleDownload = () => {
    let finalName = filename.trim();
    if (!finalName.endsWith('.xml')) {
      finalName += '.xml';
    }
    onDownload(finalName);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
            <h2 className="text-xl font-heading font-semibold text-exact-dark">
              Download XML
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
              Bestandsnaam
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={filename.replace(/\.xml$/, '')}
                onChange={(e) => setFilename(e.target.value)}
                className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-exact-blue focus:ring-exact-blue sm:text-sm px-4 py-2 border font-sans"
                placeholder="MijnExtensie"
              />
              <span className="ml-2 text-gray-500 font-mono">.xml</span>
            </div>
            
            <p className="mt-4 text-sm text-gray-500 font-sans">
              Het bestand wordt opgeslagen in je standaard <span className="font-medium text-gray-700">Downloads</span> map.
            </p>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-exact-beige/30 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-blue transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-exact-blue border border-transparent rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-blue transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Opslaan
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
