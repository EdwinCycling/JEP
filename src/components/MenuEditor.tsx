import React, { useState } from 'react';
import { useJEPStore } from '../store';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, Link as LinkIcon, Folder, LayoutGrid, Menu as MenuIcon } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import MenuEditModal from './MenuEditModal';

export default function MenuEditor() {
  const { model, updateModel, addChangelog, addAddedFieldId } = useJEPStore();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string, path: any[], name: string } | null>(null);
  const [editModal, setEditModal] = useState<{ type: 'tab' | 'section' | 'subsection' | 'link' | 'quickmenuextension', path: any[], initialData?: any } | null>(null);

  if (!model) return null;

  const megaMenus = model?.extension?.megamenuextensions?.megamenuextension || [];
  const quickMenus = model?.extension?.quickmenuextensions?.quickmenuextension || [];

  const megaMenusArray = Array.isArray(megaMenus) ? megaMenus : [megaMenus].filter(Boolean);
  const quickMenusArray = Array.isArray(quickMenus) ? quickMenus : [quickMenus].filter(Boolean);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to get nested object by path
  const getNestedObject = (obj: any, path: any[]) => {
    let current = obj;
    for (const key of path) {
      if (current === undefined) return undefined;
      current = current[key];
    }
    return current;
  };

  // Helper to set nested object by path
  const setNestedObject = (obj: any, path: any[], value: any) => {
    if (path.length === 0) return value;
    const newObj = Array.isArray(obj) ? [...obj] : { ...obj };
    const key = path[0];
    if (path.length === 1) {
      if (value === undefined) {
        if (Array.isArray(newObj)) {
          newObj.splice(key as number, 1);
        } else {
          delete newObj[key];
        }
      } else {
        newObj[key] = value;
      }
    } else {
      newObj[key] = setNestedObject(newObj[key] || (typeof path[1] === 'number' ? [] : {}), path.slice(1), value);
    }
    return newObj;
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    const { path, name } = deleteConfirm;
    
    updateModel((draft) => {
      draft.extension = setNestedObject(draft.extension, path, undefined);
      
      // Clean up empty arrays if necessary
      const parentPath = path.slice(0, -1);
      const parent = getNestedObject(draft.extension, parentPath);
      if (Array.isArray(parent) && parent.length === 0) {
        draft.extension = setNestedObject(draft.extension, parentPath, undefined);
      }
    });
    
    addChangelog(`Menu item '${name}' verwijderd.`);
    setDeleteConfirm(null);
  };

  const handleSave = (data: any) => {
    if (!editModal) return;
    const { type, path, initialData } = editModal;
    
    updateModel((draft) => {
      if (!draft.extension) {
        draft.extension = {
          "@_code": "EXT",
          "@_version": "1.0",
        } as any;
      }
      
      if (path[0] === 'megamenuextensions') {
        if (!draft.extension.megamenuextensions) draft.extension.megamenuextensions = {};
        if (!draft.extension.megamenuextensions.megamenuextension) draft.extension.megamenuextensions.megamenuextension = [];
      } else if (path[0] === 'quickmenuextensions') {
        if (!draft.extension.quickmenuextensions) draft.extension.quickmenuextensions = {};
        if (!draft.extension.quickmenuextensions.quickmenuextension) draft.extension.quickmenuextensions.quickmenuextension = [];
      }

      if (initialData) {
        // Edit existing
        const current = getNestedObject(draft.extension, path);
        draft.extension = setNestedObject(draft.extension, path, { ...current, ...data });
        addChangelog(`Menu item '${data['@_caption'] || data['@_menuid']}' gewijzigd.`);
        const itemId = data['@_id'] || data['@_menuid'];
        if (itemId) addAddedFieldId(itemId);
      } else {
        // Add new
        const parentPath = path.slice(0, -1);
        const key = path[path.length - 1]; // e.g., 'tab', 'section', 'link'
        
        let parent = getNestedObject(draft.extension, parentPath);
        if (!parent) {
          // Create parent structure if missing
          draft.extension = setNestedObject(draft.extension, parentPath, {});
          parent = getNestedObject(draft.extension, parentPath);
        }

        if (!parent[key]) {
          parent[key] = data;
        } else if (Array.isArray(parent[key])) {
          parent[key].push(data);
        } else {
          parent[key] = [parent[key], data];
        }
        
        // Update the model with the modified parent
        draft.extension = setNestedObject(draft.extension, parentPath, parent);
        addChangelog(`Nieuw menu item '${data['@_caption'] || data['@_menuid']}' toegevoegd.`);
        const itemId = data['@_id'] || data['@_menuid'];
        if (itemId) addAddedFieldId(itemId);
      }
    });

    setEditModal(null);
  };

  const renderLink = (link: any, path: any[]) => {
    if (!link) return null;
    const isArray = Array.isArray(link);
    const links = isArray ? link : [link];

    return links.map((l: any, idx: number) => (
      <div key={idx} className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 border-l-2 border-transparent hover:border-exact-blue ml-8">
        <div className="flex items-center text-sm">
          <LinkIcon className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-medium text-gray-700">{l['@_caption']}</span>
          <span className="ml-2 text-xs text-gray-400 truncate max-w-[200px]">({l['@_href']})</span>
        </div>
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditModal({ type: 'link', path: [...path, idx], initialData: l })} className="p-1 text-gray-400 hover:text-exact-blue"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => setDeleteConfirm({ type: 'link', path: [...path, idx], name: l['@_caption'] })} className="p-1 text-gray-400 hover:text-exact-red"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    ));
  };

  const renderSubsection = (subsection: any, path: any[]) => {
    if (!subsection) return null;
    const isArray = Array.isArray(subsection);
    const subsections = isArray ? subsection : [subsection];

    return subsections.map((sub: any, idx: number) => {
      const id = path.join('-') + '-sub-' + idx;
      const isExpanded = expandedItems[id];
      
      return (
        <div key={idx} className="ml-6 border-l border-gray-200">
          <div className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 group cursor-pointer" onClick={() => toggleExpand(id)}>
            <div className="flex items-center text-sm">
              {sub.link ? (
                isExpanded ? <ChevronDown className="w-4 h-4 mr-1 text-gray-400" /> : <ChevronRight className="w-4 h-4 mr-1 text-gray-400" />
              ) : <span className="w-5" />}
              <LayoutGrid className="w-4 h-4 mr-2 text-exact-gold" />
              <span className="font-medium text-gray-800">{sub['@_caption']}</span>
            </div>
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              <button onClick={() => setEditModal({ type: 'link', path: [...path, idx, 'link'] })} className="p-1 text-gray-400 hover:text-exact-blue" title="Link toevoegen"><Plus className="w-4 h-4" /></button>
              <button onClick={() => setEditModal({ type: 'subsection', path: [...path, idx], initialData: sub })} className="p-1 text-gray-400 hover:text-exact-blue"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => setDeleteConfirm({ type: 'subsection', path: [...path, idx], name: sub['@_caption'] })} className="p-1 text-gray-400 hover:text-exact-red"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
          {isExpanded && sub.link && (
            <div className="mt-1">
              {renderLink(sub.link, [...path, idx, 'link'])}
            </div>
          )}
        </div>
      );
    });
  };

  const renderSection = (section: any, path: any[]) => {
    if (!section) return null;
    const isArray = Array.isArray(section);
    const sections = isArray ? section : [section];

    return sections.map((sec: any, idx: number) => {
      const id = path.join('-') + '-sec-' + idx;
      const isExpanded = expandedItems[id];

      return (
        <div key={idx} className="ml-4 border-l border-gray-200">
          <div className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 group cursor-pointer" onClick={() => toggleExpand(id)}>
            <div className="flex items-center text-sm">
              {sec.subsection ? (
                isExpanded ? <ChevronDown className="w-4 h-4 mr-1 text-gray-400" /> : <ChevronRight className="w-4 h-4 mr-1 text-gray-400" />
              ) : <span className="w-5" />}
              <Folder className="w-4 h-4 mr-2 text-exact-blue" />
              <span className="font-medium text-gray-800">{sec['@_caption']}</span>
            </div>
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              <button onClick={() => setEditModal({ type: 'subsection', path: [...path, idx, 'subsection'] })} className="p-1 text-gray-400 hover:text-exact-blue" title="Subsectie toevoegen"><Plus className="w-4 h-4" /></button>
              <button onClick={() => setEditModal({ type: 'section', path: [...path, idx], initialData: sec })} className="p-1 text-gray-400 hover:text-exact-blue"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => setDeleteConfirm({ type: 'section', path: [...path, idx], name: sec['@_caption'] })} className="p-1 text-gray-400 hover:text-exact-red"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
          {isExpanded && sec.subsection && (
            <div className="mt-1">
              {renderSubsection(sec.subsection, [...path, idx, 'subsection'])}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex gap-8">
      {/* Left Pane: Editor */}
      <div className="w-1/2 space-y-8">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-exact-dark flex items-center">
            <MenuIcon className="w-6 h-6 mr-2 text-exact-red" />
            Menu Uitbreidingen
          </h2>
          <p className="text-gray-500 mt-1 font-sans">Beheer Mega menu's en Quick menu's voor Exact Online.</p>
        </div>

        {/* Mega Menus */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-heading font-semibold text-exact-dark">Mega Menu's</h3>
            <button 
              onClick={() => {
                // Determine path to add a new tab
                const path: any[] = ['megamenuextensions', 'megamenuextension', 0, 'tab'];
                setEditModal({ type: 'tab', path });
              }}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-exact-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-blue transition-colors"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nieuwe Tab
            </button>
          </div>
          <div className="p-4">
            {megaMenusArray.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Geen Mega menu uitbreidingen gevonden.</p>
            ) : (
              megaMenusArray.map((megaMenu: any, i: number) => {
                const tabs = Array.isArray(megaMenu.tab) ? megaMenu.tab : (megaMenu.tab ? [megaMenu.tab] : []);
                return tabs.map((tab: any, j: number) => {
                  const id = `mega-${i}-tab-${j}`;
                  const isExpanded = expandedItems[id];
                  return (
                    <div key={`${i}-${j}`} className="mb-2 border border-gray-100 rounded-lg overflow-hidden">
                      <div 
                        className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer group"
                        onClick={() => toggleExpand(id)}
                      >
                        <div className="flex items-center">
                          {isExpanded ? <ChevronDown className="w-5 h-5 mr-2 text-gray-500" /> : <ChevronRight className="w-5 h-5 mr-2 text-gray-500" />}
                          <span className="font-semibold text-gray-900">{tab['@_caption']}</span>
                          <span className="ml-3 px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">Tab</span>
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setEditModal({ type: 'section', path: ['megamenuextensions', 'megamenuextension', i, 'tab', j, 'section'] })} className="p-1.5 text-gray-500 hover:text-exact-blue bg-white rounded shadow-sm" title="Sectie toevoegen"><Plus className="w-4 h-4" /></button>
                          <button onClick={() => setEditModal({ type: 'tab', path: ['megamenuextensions', 'megamenuextension', i, 'tab', j], initialData: tab })} className="p-1.5 text-gray-500 hover:text-exact-blue bg-white rounded shadow-sm"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteConfirm({ type: 'tab', path: ['megamenuextensions', 'megamenuextension', i, 'tab', j], name: tab['@_caption'] })} className="p-1.5 text-gray-500 hover:text-exact-red bg-white rounded shadow-sm"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      {isExpanded && tab.section && (
                        <div className="p-2 bg-white">
                          {renderSection(tab.section, ['megamenuextensions', 'megamenuextension', i, 'tab', j, 'section'])}
                        </div>
                      )}
                    </div>
                  );
                });
              })
            )}
          </div>
        </div>

        {/* Quick Menus */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-heading font-semibold text-exact-dark">Quick Menu's</h3>
            <button 
              onClick={() => setEditModal({ type: 'quickmenuextension', path: ['quickmenuextensions', 'quickmenuextension'] })}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-exact-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-blue transition-colors"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nieuw Quick Menu
            </button>
          </div>
          <div className="p-4">
            {quickMenusArray.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Geen Quick menu uitbreidingen gevonden.</p>
            ) : (
              quickMenusArray.map((quickMenu: any, i: number) => {
                const id = `quick-${i}`;
                const isExpanded = expandedItems[id];
                return (
                  <div key={i} className="mb-2 border border-gray-100 rounded-lg overflow-hidden">
                    <div 
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer group"
                      onClick={() => toggleExpand(id)}
                    >
                      <div className="flex items-center">
                        {isExpanded ? <ChevronDown className="w-5 h-5 mr-2 text-gray-500" /> : <ChevronRight className="w-5 h-5 mr-2 text-gray-500" />}
                        <span className="font-semibold text-gray-900">{quickMenu['@_menuid'] || 'Quick Menu'}</span>
                      </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setEditModal({ type: 'subsection', path: ['quickmenuextensions', 'quickmenuextension', i, 'subsection'] })} className="p-1.5 text-gray-500 hover:text-exact-blue bg-white rounded shadow-sm" title="Subsectie toevoegen"><Plus className="w-4 h-4" /></button>
                        <button onClick={() => setEditModal({ type: 'quickmenuextension', path: ['quickmenuextensions', 'quickmenuextension', i], initialData: quickMenu })} className="p-1.5 text-gray-500 hover:text-exact-blue bg-white rounded shadow-sm"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm({ type: 'quickmenuextension', path: ['quickmenuextensions', 'quickmenuextension', i], name: quickMenu['@_menuid'] || 'Quick Menu' })} className="p-1.5 text-gray-500 hover:text-exact-red bg-white rounded shadow-sm"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    {isExpanded && quickMenu.subsection && (
                      <div className="p-2 bg-white">
                        {renderSubsection(quickMenu.subsection, ['quickmenuextensions', 'quickmenuextension', i, 'subsection'])}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Pane: Live Preview */}
      <div className="w-1/2">
        <div className="sticky top-8 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Live Voorbeeld</h3>
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
          </div>
          
          {/* Fake Exact Online Header */}
          <div className="bg-exact-blue text-white h-14 flex items-center px-4 justify-between relative">
            <div className="flex items-center space-x-6">
              <div className="font-bold text-xl tracking-tight">Exact</div>
              {/* Mega Menu Tabs */}
              <div className="flex space-x-1">
                {megaMenusArray.map((mm: any, mmIdx: number) => {
                  const tabs = Array.isArray(mm.tab) ? mm.tab : (mm.tab ? [mm.tab] : []);
                  return tabs.map((tab: any, tIdx: number) => (
                    <div key={`${mmIdx}-${tIdx}`} className="px-3 py-2 hover:bg-blue-800 cursor-pointer rounded text-sm relative group font-medium">
                      {tab['@_caption']}
                      {/* Dropdown */}
                      <div className="absolute top-full left-0 mt-0 bg-white text-gray-800 shadow-2xl rounded-b-md w-max min-w-[200px] max-w-3xl hidden group-hover:block z-50 border border-gray-100">
                        <div className="p-6 flex gap-8">
                          {(() => {
                            const sections = Array.isArray(tab.section) ? tab.section : (tab.section ? [tab.section] : []);
                            if (sections.length === 0) return <div className="text-gray-400 text-sm italic">Geen secties</div>;
                            return sections.map((sec: any, sIdx: number) => (
                              <div key={sIdx} className="flex-1 min-w-[150px]">
                                <div className="font-bold text-exact-dark border-b border-gray-200 pb-2 mb-3">{sec['@_caption']}</div>
                                {(() => {
                                  const subs = Array.isArray(sec.subsection) ? sec.subsection : (sec.subsection ? [sec.subsection] : []);
                                  return subs.map((sub: any, subIdx: number) => (
                                    <div key={subIdx} className="mb-4">
                                      <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">{sub['@_caption']}</div>
                                      {(() => {
                                        const links = Array.isArray(sub.link) ? sub.link : (sub.link ? [sub.link] : []);
                                        return links.map((link: any, lIdx: number) => (
                                          <div key={lIdx} className="text-sm text-exact-blue hover:underline cursor-pointer py-1">
                                            {link['@_caption']}
                                          </div>
                                        ))
                                      })()}
                                    </div>
                                  ))
                                })()}
                              </div>
                            ))
                          })()}
                        </div>
                      </div>
                    </div>
                  ))
                })}
              </div>
            </div>
            
            {/* Quick Menu */}
            <div className="relative group">
              <button className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              <div className="absolute top-full right-0 mt-0 bg-white text-gray-800 shadow-2xl rounded-b-md w-64 hidden group-hover:block z-50 border border-gray-100">
                {quickMenusArray.length === 0 ? (
                  <div className="p-4 text-gray-400 text-sm italic text-center">Geen Quick Menu items</div>
                ) : (
                  quickMenusArray.map((qm: any, qmIdx: number) => {
                    const subs = Array.isArray(qm.subsection) ? qm.subsection : (qm.subsection ? [qm.subsection] : []);
                    return subs.map((sub: any, subIdx: number) => (
                      <div key={`${qmIdx}-${subIdx}`} className="p-4 border-b border-gray-50 last:border-0">
                        <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">{sub['@_caption']}</div>
                        {(() => {
                          const links = Array.isArray(sub.link) ? sub.link : (sub.link ? [sub.link] : []);
                          return links.map((link: any, lIdx: number) => (
                            <div key={lIdx} className="text-sm text-exact-dark hover:text-exact-blue hover:bg-gray-50 px-2 py-1.5 -mx-2 rounded cursor-pointer transition-colors">
                              {link['@_caption']}
                            </div>
                          ))
                        })()}
                      </div>
                    ))
                  })
                )}
              </div>
            </div>
          </div>
          
          <div className="h-96 bg-gray-50 p-8 flex flex-col items-center justify-center text-center border-t border-gray-200">
            <LayoutGrid className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">Beweeg over de menu-items hierboven</p>
            <p className="text-gray-400 text-sm mt-1">om een live voorbeeld te zien van je wijzigingen.</p>
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <ConfirmModal
          title="Verwijderen"
          message={`Weet je zeker dat je '${deleteConfirm.name}' wilt verwijderen?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {editModal && (
        <MenuEditModal
          type={editModal.type}
          initialData={editModal.initialData}
          onSave={handleSave}
          onClose={() => setEditModal(null)}
        />
      )}
    </div>
  );
}
