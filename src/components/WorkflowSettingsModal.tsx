import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings2, Save } from 'lucide-react';
import { JEPWorkflowDefinition } from '../types';

interface WorkflowSettingsModalProps {
  workflow: JEPWorkflowDefinition;
  onClose: () => void;
  onSave: (updatedWorkflow: JEPWorkflowDefinition) => void;
}

export default function WorkflowSettingsModal({ workflow, onClose, onSave }: WorkflowSettingsModalProps) {
  const [name, setName] = useState(workflow["@_name"]);
  const [description, setDescription] = useState(workflow["@_description"] || "");
  const [descriptionPlural, setDescriptionPlural] = useState(workflow["@_descriptionplural"] || "");

  const handleSave = () => {
    onSave({
      ...workflow,
      "@_name": name,
      "@_description": description,
      "@_descriptionplural": descriptionPlural,
    });
    onClose();
  };

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
            <div className="flex items-center space-x-2 text-exact-blue">
              <Settings2 className="w-5 h-5" />
              <h2 className="text-lg font-heading font-semibold text-exact-dark">
                Workflow Instellingen
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
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Technisch Naam (ID)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-blue focus:border-exact-blue outline-none transition-all font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Omschrijving (Enkelvoud)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-blue focus:border-exact-blue outline-none transition-all font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Omschrijving (Meervoud)
              </label>
              <input
                type="text"
                value={descriptionPlural}
                onChange={(e) => setDescriptionPlural(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-blue focus:border-exact-blue outline-none transition-all font-sans"
              />
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-exact-blue rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Opslaan
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
