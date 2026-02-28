import React from 'react';
import { useJEPStore } from '../store';
import { motion } from 'motion/react';
import { 
  Settings, 
  Languages, 
  Plus, 
  Trash2, 
  Info,
  Globe,
  Database,
  ChevronRight,
  ChevronDown,
  Type,
  Calendar,
  CheckSquare,
  Hash
} from 'lucide-react';
import { JEPTranslation, JEPDivisionSettingsTab } from '../types';

export default function SettingsEditor() {
  const { model, updateModel, addChangelog, addNotification, showDialog } = useJEPStore();
  
  const translations = model?.extension?.translationextensions?.translation || [];
  const translationsArray = Array.isArray(translations) ? translations : [translations].filter(Boolean);

  const divisionSettings = model?.extension?.divisionsettingsextensions?.tab || [];
  const divisionSettingsArray = Array.isArray(divisionSettings) ? divisionSettings : [divisionSettings].filter(Boolean);

  // Translation Handlers
  const handleAddTranslation = () => {
    const newId = `TRANS_${Date.now()}`;
    updateModel((draft) => {
      if (!draft.extension) return;
      if (!draft.extension.translationextensions) draft.extension.translationextensions = { translation: [] };
      let trans = draft.extension.translationextensions.translation;
      if (!Array.isArray(trans)) {
        draft.extension.translationextensions.translation = [trans].filter(Boolean);
        trans = draft.extension.translationextensions.translation;
      }
      trans.push({
        "@_id": newId,
        language: [
          { "@_code": "nl-NL", "#text": "Nieuwe tekst" },
          { "@_code": "en-EN", "#text": "New text" }
        ]
      });
    });
    addChangelog(`Nieuwe vertaling toegevoegd: ${newId}`);
    addNotification("Vertaling toegevoegd.", "success");
  };

  const handleUpdateTranslationText = (transId: string, langCode: string, text: string) => {
    updateModel((draft) => {
      const trans = draft.extension.translationextensions?.translation;
      const transList = Array.isArray(trans) ? trans : [trans];
      const target = transList.find(t => t["@_id"] === transId);
      if (target) {
        const lang = Array.isArray(target.language) ? target.language : [target.language];
        const langItem = lang.find(l => l["@_code"] === langCode);
        if (langItem) langItem["#text"] = text;
      }
    });
  };

  const handleRemoveTranslation = (transId: string) => {
    showDialog({
      type: 'confirm',
      title: 'Vertaling Verwijderen',
      message: `Weet je zeker dat je de vertaling '${transId}' wilt verwijderen?`,
      onConfirm: () => {
        updateModel((draft) => {
          const trans = draft.extension.translationextensions?.translation;
          if (Array.isArray(trans)) {
            draft.extension.translationextensions.translation = trans.filter(t => t["@_id"] !== transId);
          } else {
            delete draft.extension.translationextensions;
          }
        });
        addChangelog(`Vertaling '${transId}' verwijderd.`);
      }
    });
  };

  // Division Settings Handlers
  const handleAddDivisionTab = () => {
    const newId = `TAB_${Date.now()}`;
    updateModel((draft) => {
      if (!draft.extension) return;
      if (!draft.extension.divisionsettingsextensions) draft.extension.divisionsettingsextensions = { tab: [] };
      let tabs = draft.extension.divisionsettingsextensions.tab;
      if (!Array.isArray(tabs)) {
        draft.extension.divisionsettingsextensions.tab = [tabs].filter(Boolean);
        tabs = draft.extension.divisionsettingsextensions.tab;
      }
      tabs.push({
        "@_id": newId,
        "@_caption": "Nieuw Tabblad",
        section: [{
          "@_id": `SEC_${Date.now()}`,
          "@_caption": "Nieuwe Sectie",
          setting: []
        }]
      });
    });
    addChangelog(`Nieuw division tabblad toegevoegd: ${newId}`);
    addNotification("Division tabblad toegevoegd.", "success");
  };

  const handleRemoveDivisionTab = (tabId: string) => {
    showDialog({
      type: 'confirm',
      title: 'Tabblad Verwijderen',
      message: `Weet je zeker dat je het tabblad '${tabId}' wilt verwijderen?`,
      onConfirm: () => {
        updateModel((draft) => {
          const tabs = draft.extension.divisionsettingsextensions?.tab;
          if (Array.isArray(tabs)) {
            draft.extension.divisionsettingsextensions.tab = tabs.filter(t => t["@_id"] !== tabId);
          } else {
            delete draft.extension.divisionsettingsextensions;
          }
        });
        addChangelog(`Division tabblad '${tabId}' verwijderd.`);
      }
    });
  };

  const handleAddSetting = (tabIdx: number, secIdx: number) => {
    updateModel((draft) => {
      const tabs = draft.extension.divisionsettingsextensions?.tab;
      const tabList = Array.isArray(tabs) ? tabs : [tabs];
      const tab = tabList[tabIdx];
      const sections = Array.isArray(tab.section) ? tab.section : [tab.section];
      const section = sections[secIdx];
      
      if (!section.setting) section.setting = [];
      const settings = Array.isArray(section.setting) ? section.setting : [section.setting];
      
      settings.push({
        "@_id": `SET_${Date.now()}`,
        "@_caption": "Nieuwe Instelling",
        "@_type": "boolean",
        "@_defaultvalue": "true"
      });
      
      section.setting = settings;
    });
    addNotification("Instelling toegevoegd.", "success");
  };

  const handleUpdateSetting = (tabIdx: number, secIdx: number, setIdx: number, key: string, value: any) => {
    updateModel((draft) => {
      const tabs = draft.extension.divisionsettingsextensions?.tab;
      const tabList = Array.isArray(tabs) ? tabs : [tabs];
      const tab = tabList[tabIdx];
      const sections = Array.isArray(tab.section) ? tab.section : [tab.section];
      const section = sections[secIdx];
      const settings = Array.isArray(section.setting) ? section.setting : [section.setting];
      (settings[setIdx] as any)[key] = value;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-exact-beige/30">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-exact-dark">Instellingen & Vertalingen</h1>
              <p className="text-sm text-gray-500 font-sans">Beheer division settings en meertalige teksten voor je extensie.</p>
            </div>
          </div>
        </div>

        {/* Division Settings Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-5 h-5 text-exact-gold" />
              <h2 className="text-lg font-heading font-bold text-exact-dark">Division Settings (Administratie Instellingen)</h2>
            </div>
            <button 
              onClick={handleAddDivisionTab}
              className="inline-flex items-center px-4 py-2 bg-exact-blue text-white rounded-xl hover:bg-blue-800 transition-all shadow-md font-bold text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tab Toevoegen
            </button>
          </div>
          
          <div className="space-y-6">
            {divisionSettingsArray.length > 0 ? (
              divisionSettingsArray.map((tab: any, tIdx: number) => (
                <motion.div 
                  key={tIdx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <LayoutGrid className="w-4 h-4 text-exact-gold" />
                      </div>
                      <div>
                        <input 
                          type="text"
                          value={tab["@_caption"]}
                          onChange={(e) => {
                            updateModel((draft) => {
                              const tabs = draft.extension.divisionsettingsextensions.tab;
                              (Array.isArray(tabs) ? tabs : [tabs])[tIdx]["@_caption"] = e.target.value;
                            });
                          }}
                          className="font-bold text-exact-dark bg-transparent border-none focus:ring-0 p-0 text-lg"
                        />
                        <p className="text-[10px] text-gray-400 font-mono uppercase">Tab ID: {tab["@_id"]}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveDivisionTab(tab["@_id"])}
                      className="p-2 text-gray-400 hover:text-exact-red hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6 space-y-8">
                    {(Array.isArray(tab.section) ? tab.section : [tab.section]).map((sec: any, sIdx: number) => (
                      <div key={sIdx} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                            <ChevronRight className="w-3 h-3 mr-1" /> {sec["@_caption"]}
                          </h4>
                          <button 
                            onClick={() => handleAddSetting(tIdx, sIdx)}
                            className="text-[10px] font-bold text-exact-blue hover:underline"
                          >
                            + Instelling Toevoegen
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(Array.isArray(sec.setting) ? sec.setting : [sec.setting].filter(Boolean)).map((setting: any, setIdx: number) => (
                            <div key={setIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group">
                              <div className="flex justify-between items-start">
                                <div className="space-y-1 flex-1">
                                  <input 
                                    type="text"
                                    value={setting["@_caption"]}
                                    onChange={(e) => handleUpdateSetting(tIdx, sIdx, setIdx, "@_caption", e.target.value)}
                                    className="text-sm font-bold text-exact-dark bg-transparent border-none focus:ring-0 p-0 w-full"
                                  />
                                  <p className="text-[9px] text-gray-400 font-mono">ID: {setting["@_id"]}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <select 
                                    value={setting["@_type"]}
                                    onChange={(e) => handleUpdateSetting(tIdx, sIdx, setIdx, "@_type", e.target.value)}
                                    className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 outline-none"
                                  >
                                    <option value="boolean">Ja/Nee</option>
                                    <option value="string">Tekst</option>
                                    <option value="integer">Getal</option>
                                    <option value="date">Datum</option>
                                  </select>
                                  <button 
                                    onClick={() => {
                                      updateModel((draft) => {
                                        const tabs = draft.extension.divisionsettingsextensions.tab;
                                        const tab = (Array.isArray(tabs) ? tabs : [tabs])[tIdx];
                                        const section = (Array.isArray(tab.section) ? tab.section : [tab.section])[sIdx];
                                        const settings = Array.isArray(section.setting) ? section.setting : [section.setting];
                                        settings.splice(setIdx, 1);
                                        section.setting = settings;
                                      });
                                    }}
                                    className="p-1 text-gray-300 hover:text-exact-red opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Standaard:</span>
                                <input 
                                  type="text"
                                  value={setting["@_defaultvalue"]}
                                  onChange={(e) => handleUpdateSetting(tIdx, sIdx, setIdx, "@_defaultvalue", e.target.value)}
                                  className="text-[10px] bg-white border border-gray-200 rounded px-2 py-0.5 flex-1"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                <Database className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-sans mb-6">Nog geen division settings gedefinieerd voor deze extensie.</p>
                <button 
                  onClick={handleAddDivisionTab}
                  className="inline-flex items-center px-6 py-3 bg-exact-blue text-white rounded-xl hover:bg-blue-800 transition-all shadow-md font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Eerste Tab Toevoegen
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Translations Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Languages className="w-5 h-5 text-exact-purple" />
              <h2 className="text-lg font-heading font-bold text-exact-dark">Meertalige Vertalingen (Translation Extensions)</h2>
            </div>
            <button 
              onClick={handleAddTranslation}
              className="inline-flex items-center px-4 py-2 border-2 border-exact-purple text-exact-purple bg-white rounded-xl hover:bg-purple-50 transition-all shadow-md font-bold text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Vertaling Toevoegen
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {translationsArray.length > 0 ? (
              translationsArray.map((trans: any, i: number) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm group relative"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Languages className="w-4 h-4 text-exact-purple" />
                      </div>
                      <input 
                        type="text"
                        value={trans["@_id"]}
                        onChange={(e) => {
                          updateModel((draft) => {
                            const translations = draft.extension.translationextensions.translation;
                            (Array.isArray(translations) ? translations : [translations])[i]["@_id"] = e.target.value;
                          });
                        }}
                        className="font-mono text-sm font-bold text-blue-600 bg-transparent border-none focus:ring-0 p-0"
                      />
                    </div>
                    <button 
                      onClick={() => handleRemoveTranslation(trans["@_id"])}
                      className="p-2 text-gray-300 hover:text-exact-red hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(Array.isArray(trans.language) ? trans.language : [trans.language]).map((lang: any, j: number) => (
                      <div key={j} className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest px-1">
                          <Globe className="w-2.5 h-2.5" />
                          <span>{lang["@_code"] === 'nl-NL' ? 'Nederlands' : lang["@_code"] === 'en-EN' ? 'Engels' : lang["@_code"]}</span>
                        </div>
                        <input 
                          type="text"
                          value={lang["#text"]}
                          onChange={(e) => handleUpdateTranslationText(trans["@_id"], lang["@_code"], e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:border-exact-purple focus:ring-0 transition-all text-sm"
                          placeholder="Tekst invoeren..."
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                <Globe className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-sans mb-6">Nog geen vertalingen toegevoegd voor deze extensie.</p>
                <button 
                  onClick={handleAddTranslation}
                  className="inline-flex items-center px-6 py-3 border-2 border-exact-purple text-exact-purple bg-white rounded-xl hover:bg-purple-50 transition-all shadow-md font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Eerste Vertaling Toevoegen
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg shrink-0">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-blue-900 text-sm tracking-tight">Instellingen & Meertaligheid</h4>
              <p className="text-blue-800 text-xs leading-relaxed font-sans opacity-90">
                Division Settings maken het mogelijk om configuratie-opties per administratie toe te voegen. Translation Extensions zorgen ervoor dat je extensie naadloos aansluit bij de taalinstelling van de gebruiker (bijv. nl-NL of en-EN). Gebruik <code className="bg-blue-200 px-1 rounded text-[10px]">translationid</code> bij je elementen om naar deze teksten te verwijzen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing icons from lucide
function LayoutGrid(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}
