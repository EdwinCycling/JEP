import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Link as LinkIcon, ArrowRight, Database, Layout } from 'lucide-react';

interface ConnectionsModalProps {
  entity: any;
  allEntities: any[];
  onClose: () => void;
}

export default function ConnectionsModal({ entity, allEntities, onClose }: ConnectionsModalProps) {
  const connections = entity.property?.filter((p: any) => p["@_refersto"] || p["@_referstocustomentity"]) || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LinkIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-semibold text-exact-dark">
                  Koppelingen voor {entity["@_description"] || entity["@_name"]}
                </h2>
                <p className="text-xs text-gray-500 font-sans">
                  Overzicht van alle relaties tussen velden en andere entiteiten.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
            {connections.length > 0 ? (
              <div className="space-y-4">
                {connections.map((conn: any, i: number) => {
                  const target = conn["@_refersto"] || conn["@_referstocustomentity"];
                  const targetEntity = allEntities.find(e => e["@_name"] === target);
                  
                  return (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-bold text-exact-dark">{conn["@_caption"] || conn["@_name"]}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{conn["@_name"]}</p>
                        </div>
                        
                        <div className="flex flex-col items-center px-4">
                          <div className="h-px w-12 bg-gray-300 relative">
                            <ArrowRight className="w-3 h-3 text-gray-400 absolute -right-1 -top-1.5" />
                          </div>
                          <span className="text-[9px] text-gray-400 mt-1 uppercase tracking-tighter">Verwijst naar</span>
                        </div>

                        <div>
                          <p className="text-sm font-bold text-blue-600">
                            {targetEntity ? (targetEntity["@_description"] || targetEntity["@_name"]) : target}
                          </p>
                          <div className="flex items-center space-x-1">
                            {conn["@_referstocustomentity"] ? (
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Custom Entity</span>
                            ) : (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Standaard Entity</span>
                            )}
                            <span className="text-[10px] text-gray-400 font-mono">{target}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                          <Database className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LinkIcon className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Geen koppelingen</h3>
                <p className="text-gray-500 mt-2">Deze entiteit heeft momenteel geen velden die naar andere entiteiten verwijzen.</p>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-exact-blue rounded-lg hover:bg-blue-800 transition-colors"
            >
              Sluiten
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
