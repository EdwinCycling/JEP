import React from 'react';
import { useJEPStore } from '../store';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  Info,
  Settings
} from 'lucide-react';

export default function FeatureSetsEditor() {
  const { model, updateModel, addNotification, addChangelog, showDialog } = useJEPStore();
  const extension = model?.extension;

  if (!extension) return null;

  // We'll manage extension-level feature settings if they exist, 
  // or provide a general UI to understand how they work across the extension.
  // Note: According to types, many elements have these fields.
  
  const handleUpdateExtensionAttr = (key: string, value: any) => {
    updateModel((m) => {
      if (m.extension) {
        (m.extension as any)[key] = value;
      }
    });
    addChangelog(`Extensie eigenschap '${key}' bijgewerkt naar: ${value}`);
  };

  const handleAddFeatureset = (type: 'mandatory' | 'forbidden') => {
    const key = type === 'mandatory' ? 'mandatoryfeaturesets' : 'forbiddenfeaturesets';
    updateModel((m) => {
      if (!m.extension) return;
      const current = (m.extension as any)[key] || { featureset: [] };
      const featuresets = Array.isArray(current.featureset) ? [...current.featureset] : [current.featureset].filter(Boolean);
      featuresets.push("NEW_FEATURE");
      (m.extension as any)[key] = { featureset: featuresets };
    });
    addChangelog(`Nieuwe ${type === 'mandatory' ? 'verplichte' : 'verboden'} featureset toegevoegd.`);
    addNotification(`Nieuwe ${type === 'mandatory' ? 'verplichte' : 'verboden'} featureset toegevoegd.`, "success");
  };

  const handleRemoveFeatureset = (type: 'mandatory' | 'forbidden', index: number) => {
    const key = type === 'mandatory' ? 'mandatoryfeaturesets' : 'forbiddenfeaturesets';
    
    const current = (extension as any)[key];
    if (!current || !current.featureset) return;
    const featuresets = Array.isArray(current.featureset) ? [...current.featureset] : [current.featureset];
    const removed = featuresets[index];

    showDialog({
      type: 'confirm',
      title: 'Featureset Verwijderen',
      message: `Weet je zeker dat je de featureset '${removed}' wilt verwijderen?`,
      onConfirm: () => {
        updateModel((m) => {
          if (!m.extension) return;
          const current = (m.extension as any)[key];
          if (!current || !current.featureset) return;
          const featuresets = Array.isArray(current.featureset) ? [...current.featureset] : [current.featureset];
          featuresets.splice(index, 1);
          (m.extension as any)[key] = { featureset: featuresets };
        });
        addChangelog(`${type === 'mandatory' ? 'Verplichte' : 'Verboden'} featureset '${removed}' verwijderd.`);
      }
    });
  };

  const handleUpdateFeaturesetValue = (type: 'mandatory' | 'forbidden', index: number, value: string) => {
    const key = type === 'mandatory' ? 'mandatoryfeaturesets' : 'forbiddenfeaturesets';
    updateModel((m) => {
      if (!m.extension) return;
      const current = (m.extension as any)[key];
      if (!current || !current.featureset) return;
      const featuresets = Array.isArray(current.featureset) ? [...current.featureset] : [current.featureset];
      featuresets[index] = value;
      (m.extension as any)[key] = { featureset: featuresets };
    });
    addChangelog(`${type === 'mandatory' ? 'Verplichte' : 'Verboden'} featureset bijgewerkt naar: ${value}`);
  };

  const mandatoryFS = Array.isArray(extension.mandatoryfeaturesets?.featureset) 
    ? extension.mandatoryfeaturesets.featureset 
    : [extension.mandatoryfeaturesets?.featureset].filter(Boolean);

  const forbiddenFS = Array.isArray(extension.forbiddenfeaturesets?.featureset) 
    ? extension.forbiddenfeaturesets.featureset 
    : [extension.forbiddenfeaturesets?.featureset].filter(Boolean);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-exact-beige/30">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-exact-purple/10 rounded-2xl">
            <Settings className="w-8 h-8 text-exact-purple" />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-exact-dark">Feature Sets & Wetgeving</h2>
            <p className="text-gray-500 font-sans">Beheer de beschikbaarheid van je extensie op basis van licenties en regio's.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Legislation Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Globe className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-heading font-semibold text-exact-dark">Wetgeving (Legislation)</h3>
            </div>
            <p className="text-sm text-gray-500 font-sans leading-relaxed">
              Specificeer voor welke landen deze extensie verplicht is. Gebruik ISO landcodes gescheiden door komma's.
            </p>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Verplichte Wetgeving
              </label>
              <input
                type="text"
                value={extension.mandatorylegislation || ""}
                onChange={(e) => handleUpdateExtensionAttr('mandatorylegislation', e.target.value)}
                placeholder="Bijv: NL, BE, LU"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-exact-purple focus:border-transparent outline-none transition-all font-sans"
              />
            </div>
            <div className="p-4 bg-blue-50 rounded-xl flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 font-sans italic">
                Laat dit veld leeg als de extensie voor alle wetgevingen beschikbaar moet zijn.
              </p>
            </div>
          </motion.div>

          {/* Feature Check Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4"
          >
            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-heading font-semibold text-exact-dark">Feature Check</h3>
            </div>
            <p className="text-sm text-gray-500 font-sans leading-relaxed">
              Bepaalt hoe de verplichte en verboden feature sets worden geëvalueerd.
            </p>
            <div className="space-y-3">
              {['All', 'Any', 'None'].map((type) => (
                <label key={type} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${extension["@_featurecheck"] === type ? 'border-exact-purple bg-purple-50' : 'border-gray-50 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="featurecheck"
                    value={type}
                    checked={extension["@_featurecheck"] === type}
                    onChange={(e) => handleUpdateExtensionAttr('@_featurecheck', e.target.value)}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${extension["@_featurecheck"] === type ? 'border-exact-purple' : 'border-gray-300'}`}>
                    {extension["@_featurecheck"] === type && <div className="w-2 h-2 bg-exact-purple rounded-full" />}
                  </div>
                  <span className={`text-sm font-semibold ${extension["@_featurecheck"] === type ? 'text-exact-purple' : 'text-gray-600'}`}>
                    {type === 'All' ? 'Alle (All)' : type === 'Any' ? 'Eén van (Any)' : 'Geen (None)'}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>

          {/* Mandatory Feature Sets */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-heading font-semibold text-exact-dark">Verplichte Features</h3>
              </div>
              <button 
                onClick={() => handleAddFeatureset('mandatory')}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 flex-1">
              {mandatoryFS.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-100 rounded-xl">
                  <p className="text-sm text-gray-400 font-sans italic">Geen verplichte features gedefinieerd.</p>
                </div>
              ) : (
                mandatoryFS.map((fs, i) => (
                  <div key={i} className="flex items-center space-x-2 group">
                    <input
                      type="text"
                      value={fs}
                      onChange={(e) => handleUpdateFeaturesetValue('mandatory', i, e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                    />
                    <button 
                      onClick={() => handleRemoveFeatureset('mandatory', i)}
                      className="p-2 text-gray-400 hover:text-exact-red hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Forbidden Feature Sets */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-5 h-5 text-exact-red" />
                <h3 className="text-lg font-heading font-semibold text-exact-dark">Verboden Features</h3>
              </div>
              <button 
                onClick={() => handleAddFeatureset('forbidden')}
                className="p-2 text-exact-red hover:bg-red-50 rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 flex-1">
              {forbiddenFS.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-100 rounded-xl">
                  <p className="text-sm text-gray-400 font-sans italic">Geen verboden features gedefinieerd.</p>
                </div>
              ) : (
                forbiddenFS.map((fs, i) => (
                  <div key={i} className="flex items-center space-x-2 group">
                    <input
                      type="text"
                      value={fs}
                      onChange={(e) => handleUpdateFeaturesetValue('forbidden', i, e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-exact-red focus:border-transparent outline-none transition-all font-mono text-sm"
                    />
                    <button 
                      onClick={() => handleRemoveFeatureset('forbidden', i)}
                      className="p-2 text-gray-400 hover:text-exact-red hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Technical Documentation Link */}
        <div className="p-6 bg-gray-900 rounded-2xl text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Info className="w-6 h-6 text-exact-purple" />
            <h3 className="text-lg font-heading font-semibold">Ontwikkelaars Informatie</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm opacity-80 font-sans leading-relaxed">
            <div>
              <p className="font-bold text-white mb-2">Mandatory Legislation</p>
              <p>Beperkt de extensie tot specifieke landversies van Exact Online. Als de huidige administratie niet voldoet aan deze wetgeving, zal de extensie niet geladen worden.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-2">Feature Sets</p>
              <p>Feature sets komen overeen met specifieke modules of licentie-niveaus. Je kunt hiermee functionaliteit aan- of uitzetten op basis van wat de klant heeft aangeschaft.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
