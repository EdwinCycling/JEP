import React, { useState, useMemo } from 'react';
import { useJEPStore } from '../store';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Monitor, 
  Layout, 
  MousePointer2, 
  Layers, 
  Eye, 
  Settings2,
  ChevronRight,
  Info,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Search,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COMMON_PAGES = [
  "CRMAccounts.aspx",
  "CRMAccountCard.aspx",
  "CRMContactCard.aspx",
  "InvSerialBatchNumbers.aspx",
  "InvSerialBatchNumberCard.aspx",
  "SlsSalesOrderEntry.aspx",
  "SlsSalesOrders.aspx",
  "PrcPurchaseOrderEntry.aspx",
  "PrcPurchaseOrders.aspx",
  "InvItems.aspx",
  "InvItemCard.aspx"
];

export default function PageCanvas() {
  const { model, updateModel, addChangelog, showDialog } = useJEPStore();
  const [selectedPageIdx, setSelectedPageIdx] = useState<number | null>(null);
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [pageSearchTerm, setPageSearchTerm] = useState("");
  
  // Modals for editing components
  const [editButton, setEditButton] = useState<{ idx: number | null, data?: any } | null>(null);
  const [editField, setEditField] = useState<{ sectionIdx: number, fieldIdx: number | null, data?: any } | null>(null);
  const [editMonitor, setEditMonitor] = useState<{ idx: number | null, data?: any } | null>(null);

  if (!model) return null;

  const appExtensions = model.extension?.applicationextensions?.applicationextension || [];
  const appExtensionsArray = Array.isArray(appExtensions) ? appExtensions : [appExtensions].filter(Boolean);
  
  const entities = model.extension?.entities?.entity || [];
  const customEntities = model.extension?.customentities?.customentity || [];
  const allEntities = [
    ...(Array.isArray(entities) ? entities : [entities]), 
    ...(Array.isArray(customEntities) ? customEntities : [customEntities])
  ].filter(Boolean);

  const handleAddPage = () => {
    if (!newPageName) return;
    
    updateModel((draft) => {
      if (!draft.extension) {
        draft.extension = {
          "@_code": model.extension?.["@_code"] || "",
          "@_version": model.extension?.["@_version"] || "1.0.0"
        } as any;
      }
      if (!draft.extension.applicationextensions) {
        draft.extension.applicationextensions = { applicationextension: [] };
      }
      
      const newExt = {
        "@_application": newPageName,
        "@_existing": "true",
        cardsection: [],
        button: [],
        monitor: { "@_existing": "true", item: [] }
      };
      
      const current = draft.extension.applicationextensions.applicationextension;
      if (Array.isArray(current)) {
        draft.extension.applicationextensions.applicationextension = [...current, newExt];
      } else if (current) {
        draft.extension.applicationextensions.applicationextension = [current, newExt];
      } else {
        draft.extension.applicationextensions.applicationextension = [newExt];
      }
    });
    
    addChangelog(`Nieuwe pagina-aanpassing toegevoegd voor: ${newPageName}`);
    setIsAddingPage(false);
    setNewPageName("");
  };

  const saveButton = (data: any) => {
    if (selectedPageIdx === null) return;
    updateModel((draft) => {
      if (!draft.extension.applicationextensions) return;
      const extensions = draft.extension.applicationextensions.applicationextension;
      const page = Array.isArray(extensions) ? extensions[selectedPageIdx] : extensions;
      
      if (!page.button) page.button = [];
      const buttons = Array.isArray(page.button) ? [...page.button] : [page.button];
      
      if (editButton?.idx !== null && editButton?.idx !== undefined) {
        buttons[editButton.idx] = data;
      } else {
        buttons.push(data);
      }
      page.button = buttons;
    });
    setEditButton(null);
  };

  const saveField = (data: any) => {
    if (selectedPageIdx === null || editField === null) return;
    updateModel((draft) => {
      if (!draft.extension.applicationextensions) return;
      const extensions = draft.extension.applicationextensions.applicationextension;
      const page = Array.isArray(extensions) ? extensions[selectedPageIdx] : extensions;
      
      const sections = Array.isArray(page.cardsection) ? [...page.cardsection] : [page.cardsection];
      const section = sections[editField.sectionIdx];
      
      if (!section.field) section.field = [];
      const fields = Array.isArray(section.field) ? [...section.field] : [section.field];
      
      if (editField.fieldIdx !== null) {
        fields[editField.fieldIdx] = data;
      } else {
        fields.push(data);
      }
      section.field = fields;
      page.cardsection = sections;
    });
    setEditField(null);
  };

  const handleAddSection = () => {
    if (selectedPageIdx === null) return;
    
    showDialog({
      type: 'prompt',
      title: 'Nieuwe Sectie',
      message: 'Voer de Sectie ID in (bijv. General of Header):',
      defaultValue: 'General',
      onConfirm: (sectionId) => {
        if (!sectionId) return;
        updateModel((draft) => {
          if (!draft.extension.applicationextensions) return;
          const extensions = draft.extension.applicationextensions.applicationextension;
          const page = Array.isArray(extensions) ? extensions[selectedPageIdx] : extensions;
          
          if (!page.cardsection) page.cardsection = [];
          const sections = Array.isArray(page.cardsection) ? [...page.cardsection] : [page.cardsection].filter(Boolean);
          sections.push({ "@_id": sectionId, field: [] });
          page.cardsection = sections;
        });
        addChangelog(`Sectie '${sectionId}' toegevoegd aan pagina.`);
      }
    });
  };

  const selectedPage = selectedPageIdx !== null ? appExtensionsArray[selectedPageIdx] : null;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-6 border-b border-gray-200 bg-white shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-heading font-semibold text-exact-dark">Page Canvas</h2>
            <p className="text-sm text-gray-500 font-sans">Visuele weergave en beheer van Exact Online pagina-aanpassingen.</p>
          </div>
          <button 
            onClick={() => setIsAddingPage(true)}
            className="inline-flex items-center px-4 py-2 bg-exact-blue text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Pagina Toevoegen
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Page List */}
        <div className="w-72 border-r border-gray-200 bg-white overflow-y-auto shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aangepaste Pagina's</h3>
          </div>
          <div className="p-2 space-y-1">
            {appExtensionsArray.map((ext: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedPageIdx(idx)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                  selectedPageIdx === idx 
                    ? "bg-blue-50 text-exact-blue ring-1 ring-blue-100 shadow-sm" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center min-w-0">
                  <Layout className={`w-4 h-4 mr-3 shrink-0 ${selectedPageIdx === idx ? "text-exact-blue" : "text-gray-400"}`} />
                  <span className="text-sm font-medium truncate">{ext["@_application"] || "Onbekende Pagina"}</span>
                </div>
                <ChevronRight className={`w-3 h-3 transition-transform ${selectedPageIdx === idx ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"}`} />
              </button>
            ))}
            {appExtensionsArray.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-xs text-gray-400 font-sans italic">Nog geen pagina's aangepast.</p>
              </div>
            )}
          </div>

          <div className="p-4 mt-auto">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <div className="p-1.5 bg-blue-100 rounded-lg shrink-0">
                  <Info className="w-4 h-4 text-blue-600" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-blue-900 text-xs tracking-tight">Pagina Aanpassingen</h4>
                  <p className="text-blue-800 text-[10px] leading-relaxed font-sans opacity-90">
                    Application Extensions maken het mogelijk om standaard Aurora pagina's (.aspx) aan te passen. Je kunt knoppen toevoegen aan de actiebalk, nieuwe secties toevoegen aan kaarten of extra kolommen toevoegen aan overzichten (grids). Gebruik <code className="bg-blue-200 px-1 rounded text-[10px]">existing="true"</code> om naar bestaande elementen te verwijzen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Visual Canvas */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100/50 relative">
          {selectedPage ? (
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Page Header Mockup */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Monitor className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-bold text-exact-dark">
                        Pagina: {selectedPage["@_application"]}
                      </h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">Bestaand</span>
                        <span className="text-[10px] text-gray-400 font-mono">ID: {selectedPage["@_application"]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-exact-blue hover:bg-blue-50 rounded-lg transition-all" title="Pagina Instellingen">
                      <Settings2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Visual Zones */}
                <div className="p-8 space-y-8">
                  {/* Action Bar Zone */}
                  <div className="relative group">
                    <div className="absolute -top-3 left-4 px-2 bg-white text-[10px] font-bold text-exact-blue uppercase tracking-widest z-10 border border-blue-100 rounded">Actie-balk</div>
                    <div className="border-2 border-dashed border-blue-200 rounded-xl p-6 bg-blue-50/30 flex items-center space-x-3">
                      {/* Existing Buttons Placeholder */}
                      <div className="flex space-x-2 opacity-30 grayscale pointer-events-none">
                        <div className="px-4 py-1.5 bg-gray-200 rounded text-xs font-medium">Bewaren</div>
                        <div className="px-4 py-1.5 bg-gray-200 rounded text-xs font-medium">Verwijderen</div>
                      </div>
                      
                      {/* Custom Buttons */}
                      {selectedPage.button && (Array.isArray(selectedPage.button) ? selectedPage.button : [selectedPage.button]).map((btn: any, i: number) => (
                        <div 
                          key={i} 
                          onClick={() => setEditButton({ idx: i, data: btn })}
                          className="px-4 py-1.5 bg-emerald-500 text-white rounded text-xs font-bold shadow-sm flex items-center group/btn relative cursor-pointer hover:bg-emerald-600 transition-colors"
                        >
                          {btn["@_caption"]}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap z-20">
                            ID: {btn["@_id"]}
                          </div>
                        </div>
                      ))}

                      <button 
                        onClick={() => setEditButton({ idx: null })}
                        className="w-8 h-8 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Monitor Zone */}
                  <div className="relative group">
                    <div className="absolute -top-3 left-4 px-2 bg-white text-[10px] font-bold text-exact-gold uppercase tracking-widest z-10 border border-gold-100 rounded">Monitor Paneel</div>
                    <div className="border-2 border-dashed border-exact-gold/30 rounded-xl p-6 bg-exact-gold/5 flex items-center space-x-4">
                      {/* Existing Monitor Items Placeholder */}
                      <div className="w-24 h-24 bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center opacity-30 grayscale">
                        <div className="w-8 h-8 bg-gray-300 rounded-full mb-2" />
                        <div className="w-12 h-2 bg-gray-300 rounded" />
                      </div>

                      {/* Custom Monitor Items */}
                      {selectedPage.monitor?.item && (Array.isArray(selectedPage.monitor.item) ? selectedPage.monitor.item : [selectedPage.monitor.item]).map((item: any, i: number) => (
                        <div 
                          key={i} 
                          onClick={() => setEditMonitor({ idx: i, data: item })}
                          className="w-24 h-24 bg-white rounded-xl border-2 border-exact-gold shadow-sm flex flex-col items-center justify-center p-2 text-center group/item relative cursor-pointer hover:bg-exact-gold/5 transition-colors"
                        >
                          <div className="w-10 h-10 bg-exact-gold/10 rounded-full flex items-center justify-center mb-2">
                            <Monitor className="w-5 h-5 text-exact-gold" />
                          </div>
                          <span className="text-[10px] font-bold text-exact-dark line-clamp-2">{item["@_caption"]}</span>
                        </div>
                      ))}

                      <button 
                        onClick={() => setEditMonitor({ idx: null })}
                        className="w-10 h-10 rounded-full border-2 border-dashed border-exact-gold/50 flex items-center justify-center text-exact-gold hover:bg-exact-gold/10 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Information Sections Zone */}
                  <div className="relative group">
                    <div className="absolute -top-3 left-4 px-2 bg-white text-[10px] font-bold text-exact-purple uppercase tracking-widest z-10 border border-purple-100 rounded">Informatie Secties</div>
                    <div className="border-2 border-dashed border-exact-purple/30 rounded-xl p-6 bg-exact-purple/5 space-y-6">
                      
                      {/* Card Sections */}
                      {selectedPage.cardsection && (Array.isArray(selectedPage.cardsection) ? selectedPage.cardsection : [selectedPage.cardsection]).map((section: any, i: number) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h4 className="text-xs font-bold text-exact-dark flex items-center">
                              <Layers className="w-3 h-3 mr-2 text-exact-purple" />
                              Sectie: {section["@_id"]}
                            </h4>
                            <div className="flex space-x-1">
                              <button className="p-1 text-gray-400 hover:text-exact-blue"><Edit2 className="w-3 h-3" /></button>
                              <button className="p-1 text-gray-400 hover:text-exact-red"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                          <div className="p-4 grid grid-cols-2 gap-4">
                            {section.field && (Array.isArray(section.field) ? section.field : [section.field]).map((field: any, j: number) => (
                              <div 
                                key={j} 
                                onClick={() => setEditField({ sectionIdx: i, fieldIdx: j, data: field })}
                                className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 group/field cursor-pointer hover:border-exact-purple transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-2 h-2 rounded-full bg-exact-purple" />
                                  <div>
                                    <p className="text-[11px] font-bold text-exact-dark">{field["@_caption"]}</p>
                                    <p className="text-[9px] text-gray-400 font-mono">{field["@_datafield"]}</p>
                                  </div>
                                </div>
                                <div className="opacity-0 group-hover/field:opacity-100 transition-opacity flex space-x-1">
                                  <Edit2 className="w-3 h-3 text-gray-400" />
                                </div>
                              </div>
                            ))}
                            <button 
                              onClick={() => setEditField({ sectionIdx: i, fieldIdx: null })}
                              className="col-span-full py-2 border border-dashed border-gray-300 rounded-lg text-[10px] font-bold text-gray-400 hover:bg-gray-50 hover:text-exact-purple hover:border-exact-purple transition-all flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3 mr-1" /> Veld Toevoegen
                            </button>
                          </div>
                        </div>
                      ))}

                      <button 
                        onClick={handleAddSection}
                        className="w-full py-4 border-2 border-dashed border-exact-purple/50 rounded-xl text-sm font-bold text-exact-purple hover:bg-exact-purple/10 transition-all flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Nieuwe Sectie Toevoegen
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend/Info */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center space-x-6 text-xs font-sans text-gray-500">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded mr-2" />
                  Bestaand Exact Online element
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded mr-2" />
                  Nieuw toegevoegd element
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 border-2 border-dashed border-blue-400 rounded mr-2" />
                  Zone voor nieuwe aanpassingen
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-200 flex items-center justify-center mb-6">
                <MousePointer2 className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-exact-dark mb-2">Selecteer een pagina</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Kies een pagina uit de lijst aan de linkerkant om de visuele weergave te bekijken en aanpassingen te maken.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Page Modal */}
      <AnimatePresence>
        {isAddingPage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5 text-exact-blue" />
                  <h3 className="text-lg font-heading font-bold text-exact-dark">Pagina Aanpassing Toevoegen</h3>
                </div>
                <button onClick={() => setIsAddingPage(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4 flex flex-col overflow-hidden">
                <div className="shrink-0">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pagina Naam (.aspx)</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={newPageName}
                      onChange={(e) => setNewPageName(e.target.value)}
                      placeholder="bijv. CRMAccount.aspx"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-blue focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50/30">
                  <div className="p-2 space-y-1">
                    <h4 className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Suggesties</h4>
                    {COMMON_PAGES.filter(p => p.toLowerCase().includes(newPageName.toLowerCase())).map((page) => (
                      <button
                        key={page}
                        onClick={() => setNewPageName(page)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                          newPageName === page ? "bg-blue-100 text-exact-blue font-bold" : "hover:bg-white text-gray-600"
                        }`}
                      >
                        {page}
                        {newPageName === page && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shrink-0">
                  <div className="flex items-start space-x-3">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-blue-800 leading-relaxed font-sans opacity-90">
                      Met <code>&lt;applicationextension&gt;</code> kun je ELKE standaard Exact .aspx pagina selecteren. 
                      Als je bijvoorbeeld velden wilt toevoegen aan <strong>InvSerialBatchNumbers.aspx</strong>, voer dan die naam hierboven in.
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3 shrink-0">
                <button 
                  onClick={() => setIsAddingPage(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Annuleren
                </button>
                <button 
                  onClick={handleAddPage}
                  disabled={!newPageName}
                  className="px-6 py-2 bg-exact-blue text-white text-sm font-bold rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-all shadow-md"
                >
                  Toevoegen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Button Editor Modal */}
      <AnimatePresence>
        {editButton && (
          <ButtonEditorModal 
            initialData={editButton.data}
            onSave={saveButton}
            onClose={() => setEditButton(null)}
          />
        )}
      </AnimatePresence>

      {/* Field Editor Modal */}
      <AnimatePresence>
        {editField && (
          <FieldEditorModal 
            initialData={editField.data}
            allEntities={allEntities}
            onSave={saveField}
            onDelete={() => {
              updateModel((draft) => {
                const page = (Array.isArray(draft.extension.applicationextensions.applicationextension) 
                  ? draft.extension.applicationextensions.applicationextension 
                  : [draft.extension.applicationextensions.applicationextension])[selectedPageIdx!];
                const sections = Array.isArray(page.cardsection) ? page.cardsection : [page.cardsection];
                const section = sections[editField.sectionIdx];
                const fields = Array.isArray(section.field) ? section.field : [section.field];
                section.field = fields.filter((_, i) => i !== editField.fieldIdx);
              });
              setEditField(null);
            }}
            onClose={() => setEditField(null)}
          />
        )}
      </AnimatePresence>

      {/* Monitor Editor Modal */}
      <AnimatePresence>
        {editMonitor && (
          <MonitorEditorModal 
            initialData={editMonitor.data}
            onSave={(data: any) => {
              updateModel((draft) => {
                const page = (Array.isArray(draft.extension.applicationextensions.applicationextension) 
                  ? draft.extension.applicationextensions.applicationextension 
                  : [draft.extension.applicationextensions.applicationextension])[selectedPageIdx!];
                if (!page.monitor) page.monitor = { "@_existing": "true", item: [] };
                if (!page.monitor.item) page.monitor.item = [];
                const items = Array.isArray(page.monitor.item) ? page.monitor.item : [page.monitor.item];
                if (editMonitor.idx !== null) items[editMonitor.idx] = data;
                else items.push(data);
                page.monitor.item = items;
              });
              setEditMonitor(null);
            }}
            onDelete={() => {
              updateModel((draft) => {
                const page = (Array.isArray(draft.extension.applicationextensions.applicationextension) 
                  ? draft.extension.applicationextensions.applicationextension 
                  : [draft.extension.applicationextensions.applicationextension])[selectedPageIdx!];
                if (page.monitor && page.monitor.item) {
                  const items = Array.isArray(page.monitor.item) ? page.monitor.item : [page.monitor.item];
                  page.monitor.item = items.filter((_, i) => i !== editMonitor.idx);
                }
              });
              setEditMonitor(null);
            }}
            onClose={() => setEditMonitor(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ButtonEditorModal({ initialData, onSave, onDelete, onClose }: any) {
  const [id, setId] = useState(initialData?.["@_id"] || "");
  const [caption, setCaption] = useState(initialData?.["@_caption"] || "");
  const [href, setHref] = useState(initialData?.["@_href"] || "");
  const [positionBefore, setPositionBefore] = useState(initialData?.["@_positionbefore"] || "");
  
  // Advanced
  const [mandatoryLegislation, setMandatoryLegislation] = useState(initialData?.mandatorylegislation || "");
  const [mandatoryFeaturesets, setMandatoryFeaturesets] = useState(() => {
    const mfs = initialData?.mandatoryfeaturesets?.featureset;
    return Array.isArray(mfs) ? mfs.join(', ') : (mfs || '');
  });
  const [forbiddenFeaturesets, setForbiddenFeaturesets] = useState(() => {
    const ffs = initialData?.forbiddenfeaturesets?.featureset;
    return Array.isArray(ffs) ? ffs.join(', ') : (ffs || '');
  });
  const [featureCheck, setFeatureCheck] = useState(initialData?.["@_featurecheck"] || "None");

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-heading font-bold text-exact-dark">Knop Aanpassen</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">ID</label>
              <input type="text" value={id} onChange={(e) => setId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="btn_custom" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Positie (voor ID)</label>
              <input type="text" value={positionBefore} onChange={(e) => setPositionBefore(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="btnSave" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Caption (Tekst)</label>
            <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Mijn Knop" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Target URL (href)</label>
            <input type="text" value={href} onChange={(e) => setHref(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="https://..." />
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-4">
            <h4 className="text-[10px] font-bold text-exact-purple uppercase tracking-widest">Beperkingen</h4>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Wetgeving</label>
              <input type="text" value={mandatoryLegislation} onChange={(e) => setMandatoryLegislation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Belgium, Netherlands" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mandatory Features</label>
                <input type="text" value={mandatoryFeaturesets} onChange={(e) => setMandatoryFeaturesets(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Account" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Forbidden Features</label>
                <input type="text" value={forbiddenFeaturesets} onChange={(e) => setForbiddenFeaturesets(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="GeneralPro" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Feature Check Mode</label>
              <select value={featureCheck} onChange={(e) => setFeatureCheck(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="None">None</option>
                <option value="All">All</option>
                <option value="Any">Any</option>
              </select>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-between space-x-3">
          {initialData && (
            <button onClick={onDelete} className="px-4 py-2 text-sm font-medium text-exact-red hover:bg-red-50 rounded-lg transition-colors">
              Verwijderen
            </button>
          )}
          <div className="flex space-x-3 ml-auto">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600">Annuleren</button>
            <button 
              onClick={() => {
                const data: any = { "@_id": id, "@_caption": caption, "@_href": href, "@_positionbefore": positionBefore, "@_existing": "false" };
                if (mandatoryLegislation) data.mandatorylegislation = mandatoryLegislation;
                if (mandatoryFeaturesets) data.mandatoryfeaturesets = { featureset: mandatoryFeaturesets.split(',').map(s => s.trim()).filter(Boolean) };
                if (forbiddenFeaturesets) data.forbiddenfeaturesets = { featureset: forbiddenFeaturesets.split(',').map(s => s.trim()).filter(Boolean) };
                if (featureCheck !== "None") data["@_featurecheck"] = featureCheck;
                onSave(data);
              }}
              className="px-4 py-2 bg-exact-blue text-white text-sm font-medium rounded-lg"
            >
              Opslaan
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FieldEditorModal({ initialData, allEntities, onSave, onDelete, onClose }: any) {
  const [dataField, setDataField] = useState(initialData?.["@_datafield"] || "");
  const [caption, setCaption] = useState(initialData?.["@_caption"] || "");
  const [controlType, setControlType] = useState(initialData?.["@_controltype"] || "text");
  const [visibleExpression, setVisibleExpression] = useState(initialData?.visibleexpression || "");
  const [mandatoryLegislation, setMandatoryLegislation] = useState(initialData?.mandatorylegislation || "");
  
  // Featuresets
  const [mandatoryFeaturesets, setMandatoryFeaturesets] = useState(() => {
    const mfs = initialData?.mandatoryfeaturesets?.featureset;
    return Array.isArray(mfs) ? mfs.join(', ') : (mfs || '');
  });
  const [forbiddenFeaturesets, setForbiddenFeaturesets] = useState(() => {
    const ffs = initialData?.forbiddenfeaturesets?.featureset;
    return Array.isArray(ffs) ? ffs.join(', ') : (ffs || '');
  });
  const [featureCheck, setFeatureCheck] = useState(initialData?.["@_featurecheck"] || "None");

  const allProperties = allEntities.flatMap((e: any) => 
    (Array.isArray(e.property) ? e.property : [e.property]).filter(Boolean).map((p: any) => ({
      entity: e["@_name"],
      name: p["@_name"],
      caption: p["@_caption"] || p["@_name"]
    }))
  );

  const handlePropertyChange = (val: string) => {
    setDataField(val);
    const prop = allProperties.find(p => p.name === val);
    if (prop && !caption) {
      setCaption(prop.caption);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-heading font-bold text-exact-dark">Veld Aanpassen</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Koppel aan Property</label>
            <select value={dataField} onChange={(e) => handlePropertyChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Selecteer een property...</option>
              {allProperties.map((p: any) => (
                <option key={`${p.entity}_${p.name}`} value={p.name}>{p.entity} - {p.caption || p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Caption (Label)</label>
            <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Mijn Veld" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Type Weergave</label>
            <select value={controlType} onChange={(e) => setControlType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="text">Tekstveld</option>
              <option value="list">Keuzelijst</option>
              <option value="radiobuttonlist">Keuzerondjes</option>
              <option value="checkbox">Vinkje (Checkbox)</option>
            </select>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-exact-purple uppercase mb-3">Geavanceerde Condities</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Zichtbaarheid (VisibleExpression)</label>
                <input type="text" value={visibleExpression} onChange={(e) => setVisibleExpression(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" placeholder="Month(Today()) = 1" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Wetgeving (MandatoryLegislation)</label>
                <input type="text" value={mandatoryLegislation} onChange={(e) => setMandatoryLegislation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Netherlands, Belgium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mandatory Features</label>
                  <input type="text" value={mandatoryFeaturesets} onChange={(e) => setMandatoryFeaturesets(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Account" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Forbidden Features</label>
                  <input type="text" value={forbiddenFeaturesets} onChange={(e) => setForbiddenFeaturesets(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="GeneralPro" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Feature Check Mode</label>
                <select value={featureCheck} onChange={(e) => setFeatureCheck(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="None">None</option>
                  <option value="All">All</option>
                  <option value="Any">Any</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-between space-x-3">
          {initialData && (
            <button onClick={onDelete} className="px-4 py-2 text-sm font-medium text-exact-red hover:bg-red-50 rounded-lg transition-colors">
              Verwijderen
            </button>
          )}
          <div className="flex space-x-3 ml-auto">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600">Annuleren</button>
            <button 
              onClick={() => {
                const data: any = { "@_id": dataField.replace(/.*_/, ""), "@_datafield": dataField, "@_caption": caption, "@_controltype": controlType };
                if (visibleExpression) data.visibleexpression = visibleExpression;
                if (mandatoryLegislation) data.mandatorylegislation = mandatoryLegislation;
                if (mandatoryFeaturesets) data.mandatoryfeaturesets = { featureset: mandatoryFeaturesets.split(',').map(s => s.trim()).filter(Boolean) };
                if (forbiddenFeaturesets) data.forbiddenfeaturesets = { featureset: forbiddenFeaturesets.split(',').map(s => s.trim()).filter(Boolean) };
                if (featureCheck !== "None") data["@_featurecheck"] = featureCheck;
                onSave(data);
              }}
              className="px-4 py-2 bg-exact-blue text-white text-sm font-medium rounded-lg"
            >
              Opslaan
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MonitorEditorModal({ initialData, onSave, onDelete, onClose }: any) {
  const [caption, setCaption] = useState(initialData?.["@_caption"] || "");
  const [image, setImage] = useState(initialData?.["@_image"] || "icon-a-customer.gif");
  
  // Advanced
  const [mandatoryLegislation, setMandatoryLegislation] = useState(initialData?.mandatorylegislation || "");
  const [mandatoryFeaturesets, setMandatoryFeaturesets] = useState(() => {
    const mfs = initialData?.mandatoryfeaturesets?.featureset;
    return Array.isArray(mfs) ? mfs.join(', ') : (mfs || '');
  });
  const [forbiddenFeaturesets, setForbiddenFeaturesets] = useState(() => {
    const ffs = initialData?.forbiddenfeaturesets?.featureset;
    return Array.isArray(ffs) ? ffs.join(', ') : (ffs || '');
  });
  const [featureCheck, setFeatureCheck] = useState(initialData?.["@_featurecheck"] || "None");

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-heading font-bold text-exact-dark">Monitor Item Aanpassen</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Caption (Label)</label>
            <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Mijn KPI" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Icoon (image)</label>
            <select value={image} onChange={(e) => setImage(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="icon-a-customer.gif">Klant Icoon</option>
              <option value="icon-a-sales.gif">Verkoop Icoon</option>
              <option value="icon-a-project.gif">Project Icoon</option>
              <option value="icon-a-inventory.gif">Voorraad Icoon</option>
            </select>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-4">
            <h4 className="text-[10px] font-bold text-exact-purple uppercase tracking-widest">Beperkingen</h4>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Wetgeving</label>
              <input type="text" value={mandatoryLegislation} onChange={(e) => setMandatoryLegislation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Belgium, Netherlands" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mandatory Features</label>
                <input type="text" value={mandatoryFeaturesets} onChange={(e) => setMandatoryFeaturesets(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Account" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Forbidden Features</label>
                <input type="text" value={forbiddenFeaturesets} onChange={(e) => setForbiddenFeaturesets(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="GeneralPro" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Feature Check Mode</label>
              <select value={featureCheck} onChange={(e) => setFeatureCheck(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="None">None</option>
                <option value="All">All</option>
                <option value="Any">Any</option>
              </select>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-between space-x-3">
          {initialData && (
            <button onClick={onDelete} className="px-4 py-2 text-sm font-medium text-exact-red hover:bg-red-50 rounded-lg transition-colors">
              Verwijderen
            </button>
          )}
          <div className="flex space-x-3 ml-auto">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600">Annuleren</button>
            <button 
              onClick={() => {
                const data: any = { "@_caption": caption, "@_image": image, "@_existing": "false" };
                if (mandatoryLegislation) data.mandatorylegislation = mandatoryLegislation;
                if (mandatoryFeaturesets) data.mandatoryfeaturesets = { featureset: mandatoryFeaturesets.split(',').map(s => s.trim()).filter(Boolean) };
                if (forbiddenFeaturesets) data.forbiddenfeaturesets = { featureset: forbiddenFeaturesets.split(',').map(s => s.trim()).filter(Boolean) };
                if (featureCheck !== "None") data["@_featurecheck"] = featureCheck;
                onSave(data);
              }}
              className="px-4 py-2 bg-exact-blue text-white text-sm font-medium rounded-lg"
            >
              Opslaan
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
