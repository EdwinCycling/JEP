import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Info, CheckCircle2 } from 'lucide-react';

interface SimulationInfoModalProps {
  onClose: () => void;
  onStart: () => void;
}

export default function SimulationInfoModal({ onClose, onStart }: SimulationInfoModalProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
            <div className="flex items-center space-x-2 text-emerald-600">
              <Play className="w-5 h-5" />
              <h2 className="text-lg font-heading font-semibold text-exact-dark">
                Workflow Simulatie
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-exact-dark mb-1">Wat is een simulatie?</h3>
                <p className="text-sm text-gray-600 font-sans leading-relaxed">
                  Met de simulatie kun je de workflow doorlopen alsof je een gebruiker bent. Je kunt van stage naar stage springen via de gedefinieerde acties.
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Test de logische overgangen (Actions)</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Bekijk welke velden zichtbaar/aanpasbaar zijn per stage</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Geen effect op echte data</span>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-emerald-50 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Later
            </button>
            <button
              onClick={() => {
                onStart();
                onClose();
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Simulatie
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
