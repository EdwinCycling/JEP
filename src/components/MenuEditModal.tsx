import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';

interface MenuEditModalProps {
  type: 'tab' | 'section' | 'subsection' | 'link' | 'quickmenuextension';
  initialData?: any;
  onSave: (data: any) => void;
  onClose: () => void;
}

export default function MenuEditModal({ type, initialData, onSave, onClose }: MenuEditModalProps) {
  const [id, setId] = useState('');
  const [caption, setCaption] = useState('');
  const [href, setHref] = useState('');
  const [showInNewTab, setShowInNewTab] = useState(false);
  const [existing, setExisting] = useState(false);
  const [menuId, setMenuId] = useState('');
  
  // Advanced features
  const [mandatoryLegislation, setMandatoryLegislation] = useState('');
  const [mandatoryFeaturesets, setMandatoryFeaturesets] = useState('');
  const [forbiddenFeaturesets, setForbiddenFeaturesets] = useState('');
  const [featureCheck, setFeatureCheck] = useState<'All' | 'Any' | 'None'>('None');
  const [translationId, setTranslationId] = useState('');

  const { model } = useJEPStore();
  const translations = model?.extension?.translationextensions?.translation || [];
  const translationIds = (Array.isArray(translations) ? translations : [translations]).map(t => t["@_id"]).filter(Boolean);

  useEffect(() => {
    if (initialData) {
      setId(initialData['@_id'] || '');
      setCaption(initialData['@_caption'] || '');
      setHref(initialData['@_href'] || '');
      setShowInNewTab(initialData['@_showinnewtab'] === 'true' || initialData['@_showinnewtab'] === true);
      setExisting(initialData['@_existing'] === 'true' || initialData['@_existing'] === true);
      setMenuId(initialData['@_menuid'] || '');
      setTranslationId(initialData['@_translationid'] || '');
      
      setMandatoryLegislation(initialData.mandatorylegislation || '');
      
      const mfs = initialData.mandatoryfeaturesets?.featureset;
      setMandatoryFeaturesets(Array.isArray(mfs) ? mfs.join(', ') : (mfs || ''));
      
      const ffs = initialData.forbiddenfeaturesets?.featureset;
      setForbiddenFeaturesets(Array.isArray(ffs) ? ffs.join(', ') : (ffs || ''));
      
      setFeatureCheck(initialData['@_featurecheck'] || 'None');
    }
  }, [initialData]);

  const handleSave = () => {
    const data: any = {
      '@_existing': existing ? 'true' : 'false'
    };
    
    if (type === 'quickmenuextension') {
      data['@_menuid'] = menuId;
    } else {
      data['@_id'] = id;
      data['@_caption'] = caption;
      if (translationId) {
        data['@_translationid'] = translationId;
      }
    }

    if (type === 'link') {
      data['@_href'] = href;
      if (showInNewTab) {
        data['@_showinnewtab'] = 'true';
      }
    }

    if (mandatoryLegislation) data.mandatorylegislation = mandatoryLegislation;
    if (mandatoryFeaturesets) {
      data.mandatoryfeaturesets = { featureset: mandatoryFeaturesets.split(',').map(s => s.trim()).filter(Boolean) };
    }
    if (forbiddenFeaturesets) {
      data.forbiddenfeaturesets = { featureset: forbiddenFeaturesets.split(',').map(s => s.trim()).filter(Boolean) };
    }
    if (featureCheck !== 'None') {
      data['@_featurecheck'] = featureCheck;
    }

    onSave(data);
  };

  const getTitle = () => {
    const action = initialData ? 'Bewerken' : 'Toevoegen';
    switch (type) {
      case 'tab': return `Tab ${action}`;
      case 'section': return `Sectie ${action}`;
      case 'subsection': return `Subsectie ${action}`;
      case 'link': return `Link ${action}`;
      case 'quickmenuextension': return `Quick Menu ${action}`;
      default: return 'Bewerken';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-heading font-semibold text-exact-dark">
              {getTitle()}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {type === 'quickmenuextension' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu ID</label>
                <input
                  type="text"
                  value={menuId}
                  onChange={(e) => setMenuId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-blue focus:border-exact-blue"
                  placeholder="Bijv. MyQuickMenu"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                  <input
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-blue focus:border-exact-blue"
                    placeholder="Unieke identificatie"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Naam (Caption)</label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-blue focus:border-exact-blue"
                    placeholder="Weergavenaam in het menu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vertaling (Translation ID)</label>
                  <div className="relative">
                    <select
                      value={translationId}
                      onChange={(e) => setTranslationId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-blue focus:border-exact-blue bg-white"
                    >
                      <option value="">-- Geen vertaling --</option>
                      {translationIds.map(tid => (
                        <option key={tid} value={tid}>{tid}</option>
                      ))}
                    </select>
                    <div className="mt-1 flex items-center space-x-2">
                      <input 
                        type="text"
                        value={translationId}
                        onChange={(e) => setTranslationId(e.target.value)}
                        placeholder="Of voer handmatig ID in..."
                        className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded italic text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {type === 'link' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL (Href)</label>
                  <input
                    type="text"
                    value={href}
                    onChange={(e) => setHref(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-blue focus:border-exact-blue"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="showInNewTab"
                    checked={showInNewTab}
                    onChange={(e) => setShowInNewTab(e.target.checked)}
                    className="h-4 w-4 text-exact-blue focus:ring-exact-blue border-gray-300 rounded"
                  />
                  <label htmlFor="showInNewTab" className="ml-2 block text-sm text-gray-700">
                    Open in nieuw tabblad (showinnewtab)
                  </label>
                </div>
              </>
            )}

            <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
              <input
                type="checkbox"
                id="existing"
                checked={existing}
                onChange={(e) => setExisting(e.target.checked)}
                className="h-4 w-4 text-exact-blue focus:ring-exact-blue border-gray-300 rounded"
              />
              <label htmlFor="existing" className="ml-2 block text-sm text-gray-700">
                Bestaand item (existing="true")
              </label>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h4 className="text-xs font-bold text-exact-purple uppercase tracking-wider">Geavanceerde Beperkingen</h4>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Wetgeving (MandatoryLegislation)</label>
                <input
                  type="text"
                  value={mandatoryLegislation}
                  onChange={(e) => setMandatoryLegislation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Bijv. Belgium, Netherlands"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Verplichte Featuresets</label>
                  <input
                    type="text"
                    value={mandatoryFeaturesets}
                    onChange={(e) => setMandatoryFeaturesets(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Account, GeneralPro"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Verboden Featuresets</label>
                  <input
                    type="text"
                    value={forbiddenFeaturesets}
                    onChange={(e) => setForbiddenFeaturesets(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Account"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Feature Check Mode</label>
                <select 
                  value={featureCheck} 
                  onChange={(e) => setFeatureCheck(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="None">Geen (None)</option>
                  <option value="All">Allemaal (All)</option>
                  <option value="Any">Ten minste één (Any)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-blue"
            >
              Annuleren
            </button>
            <button
              onClick={handleSave}
              disabled={type === 'quickmenuextension' ? !menuId : !id || !caption}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-exact-blue border border-transparent rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-blue disabled:opacity-50"
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
