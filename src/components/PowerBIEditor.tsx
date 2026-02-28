import React, { useState } from 'react';
import { useJEPStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Plus, 
  Trash2, 
  ExternalLink,
  Info,
  Layout,
  Type,
  Eye,
  EyeOff,
  AlertTriangle,
  MousePointer2
} from 'lucide-react';
import { JEPPowerBILink, JEPMegaMenuExtension, JEPQuickMenuExtension } from '../types';

export default function PowerBIEditor() {
  const { model, updateModel, addNotification, addChangelog, showDialog } = useJEPStore();
  const [previewId, setPreviewId] = useState<string | null>(null);
  
  const megamenuextensions = model?.extension?.megamenuextensions?.megamenuextension;
  const allMegaMenuExts: JEPMegaMenuExtension[] = Array.isArray(megamenuextensions) 
    ? megamenuextensions 
    : [megamenuextensions].filter(Boolean) as JEPMegaMenuExtension[];

  const quickmenuextensions = model?.extension?.quickmenuextensions?.quickmenuextension;
  const allQuickMenuExts: JEPQuickMenuExtension[] = Array.isArray(quickmenuextensions) 
    ? quickmenuextensions 
    : [quickmenuextensions].filter(Boolean) as JEPQuickMenuExtension[];

  const powerbiLinks: { 
    type: 'MegaMenu' | 'QuickMenu',
    menuIdx: number, 
    tabIdx?: number, 
    sectionIdx?: number, 
    subsectionIdx: number, 
    link: JEPPowerBILink, 
    linkIdx: number,
    containerId: string 
  }[] = [];

  // Parse Mega Menu links
  allMegaMenuExts.forEach((menu, mIdx) => {
    const tabs = Array.isArray(menu.tab) ? menu.tab : [menu.tab].filter(Boolean);
    tabs.forEach((tab: any, tIdx) => {
      const sections = Array.isArray(tab.section) ? tab.section : [tab.section].filter(Boolean);
      sections.forEach((sec: any, sIdx) => {
        const subsections = Array.isArray(sec.subsection) ? sec.subsection : [sec.subsection].filter(Boolean);
        subsections.forEach((sub: any, subIdx) => {
          if (sub.powerbilink) {
            const links = Array.isArray(sub.powerbilink) ? sub.powerbilink : [sub.powerbilink].filter(Boolean);
            links.forEach((link, lIdx) => {
              powerbiLinks.push({ 
                type: 'MegaMenu',
                menuIdx: mIdx, 
                tabIdx: tIdx, 
                sectionIdx: sIdx, 
                subsectionIdx: subIdx, 
                link, 
                linkIdx: lIdx,
                containerId: tab["@_id"] || "MegaMenu"
              });
            });
          }
        });
      });
    });
  });

  // Parse Quick Menu links
  allQuickMenuExts.forEach((menu, mIdx) => {
    const subsections = Array.isArray(menu.subsection) ? menu.subsection : [menu.subsection].filter(Boolean);
    subsections.forEach((sub: any, subIdx) => {
      if (sub.powerbilink) {
        const links = Array.isArray(sub.powerbilink) ? sub.powerbilink : [sub.powerbilink].filter(Boolean);
        links.forEach((link, lIdx) => {
          powerbiLinks.push({ 
            type: 'QuickMenu',
            menuIdx: mIdx, 
            subsectionIdx: subIdx, 
            link, 
            linkIdx: lIdx,
            containerId: menu["@_menuid"] || "QuickMenu"
          });
        });
      }
    });
  });

  const handleAddPbiLink = (menuType: 'MegaMenu' | 'QuickMenu') => {
    updateModel((draft) => {
      if (!draft.extension) return;
      const newId = `PBI_Report_${Date.now()}`;
      const newLink: JEPPowerBILink = {
        "@_id": newId,
        "@_caption": "Nieuw Power BI Rapport",
        powerbireportembedlink: "https://app.powerbi.com/reportEmbed?reportId=...",
        pagetitle: "Mijn Rapport"
      };

      if (menuType === 'MegaMenu') {
        if (!draft.extension.megamenuextensions) draft.extension.megamenuextensions = { megamenuextension: [] };
        let menuExts = draft.extension.megamenuextensions.megamenuextension;
        if (!Array.isArray(menuExts)) {
          draft.extension.megamenuextensions.megamenuextension = [menuExts].filter(Boolean);
          menuExts = draft.extension.megamenuextensions.megamenuextension;
        }
        let megaMenu = (menuExts as any[]).find(m => m["@_menuid"] === "MegaMenu");
        if (!megaMenu) { megaMenu = { "@_menuid": "MegaMenu", tab: [] }; (menuExts as any[]).push(megaMenu); }
        let tabs = megaMenu.tab;
        if (!Array.isArray(tabs)) { megaMenu.tab = [tabs].filter(Boolean); tabs = megaMenu.tab; }
        let reportTab = (tabs as any[]).find(t => t["@_id"] === "Reporting");
        if (!reportTab) { reportTab = { "@_id": "Reporting", "@_caption": "Rapportage", "@_existing": "true", section: [] }; (tabs as any[]).push(reportTab); }
        let sections = reportTab.section;
        if (!Array.isArray(sections)) { reportTab.section = [sections].filter(Boolean); sections = reportTab.section; }
        let biSection = (sections as any[]).find(s => s["@_id"] === "BI");
        if (!biSection) { biSection = { "@_id": "BI", "@_caption": "Business Intelligence", subsection: [] }; (sections as any[]).push(biSection); }
        let subsections = biSection.subsection;
        if (!Array.isArray(subsections)) { biSection.subsection = [subsections].filter(Boolean); subsections = biSection.subsection; }
        let reportsSub = (subsections as any[]).find(sub => sub["@_id"] === "Reports");
        if (!reportsSub) { reportsSub = { "@_id": "Reports", "@_caption": "Rapporten", powerbilink: [] }; (subsections as any[]).push(reportsSub); }
        if (!reportsSub.powerbilink) reportsSub.powerbilink = [];
        if (!Array.isArray(reportsSub.powerbilink)) reportsSub.powerbilink = [reportsSub.powerbilink];
        reportsSub.powerbilink.push(newLink);
      } else {
        if (!draft.extension.quickmenuextensions) draft.extension.quickmenuextensions = { quickmenuextension: [] };
        let menuExts = draft.extension.quickmenuextensions.quickmenuextension;
        if (!Array.isArray(menuExts)) {
          draft.extension.quickmenuextensions.quickmenuextension = [menuExts].filter(Boolean);
          menuExts = draft.extension.quickmenuextensions.quickmenuextension;
        }
        let quickMenu = (menuExts as any[]).find(m => m["@_menuid"] === "Wholesale" || m["@_menuid"] === "QuickMenu");
        if (!quickMenu) { quickMenu = { "@_menuid": "Wholesale", subsection: [] }; (menuExts as any[]).push(quickMenu); }
        let subsections = quickMenu.subsection;
        if (!Array.isArray(subsections)) { quickMenu.subsection = [subsections].filter(Boolean); subsections = quickMenu.subsection; }
        let biSub = (subsections as any[]).find(sub => sub["@_id"] === "BI_Reports");
        if (!biSub) { biSub = { "@_id": "BI_Reports", "@_caption": "BI Rapporten", powerbilink: [] }; (subsections as any[]).push(biSub); }
        if (!biSub.powerbilink) biSub.powerbilink = [];
        if (!Array.isArray(biSub.powerbilink)) biSub.powerbilink = [biSub.powerbilink];
        biSub.powerbilink.push(newLink);
      }
    });
    addChangelog(`Nieuw Power BI rapport toegevoegd aan ${menuType}.`);
    addNotification(`Power BI rapport toegevoegd aan ${menuType}.`, "success");
  };

  const handleRemovePbiLink = (info: typeof powerbiLinks[0]) => {
    showDialog({
      type: 'confirm',
      title: 'Rapport Verwijderen',
      message: `Weet je zeker dat je het rapport '${info.link["@_caption"]}' wilt verwijderen?`,
      onConfirm: () => {
        updateModel((draft) => {
          if (info.type === 'MegaMenu') {
            const menuExts = draft.extension.megamenuextensions.megamenuextension;
            const allMenus = Array.isArray(menuExts) ? menuExts : [menuExts];
            const menu = allMenus[info.menuIdx];
            const allTabs = Array.isArray(menu.tab) ? menu.tab : [menu.tab];
            const tab = allTabs[info.tabIdx!];
            const allSections = Array.isArray(tab.section) ? tab.section : [tab.section];
            const section = allSections[info.sectionIdx!];
            const allSubsections = Array.isArray(section.subsection) ? section.subsection : [section.subsection];
            const subsection = allSubsections[info.subsectionIdx];
            if (Array.isArray(subsection.powerbilink)) subsection.powerbilink.splice(info.linkIdx, 1);
            else delete subsection.powerbilink;
          } else {
            const menuExts = draft.extension.quickmenuextensions.quickmenuextension;
            const allMenus = Array.isArray(menuExts) ? menuExts : [menuExts];
            const menu = allMenus[info.menuIdx];
            const allSubsections = Array.isArray(menu.subsection) ? menu.subsection : [menu.subsection];
            const subsection = allSubsections[info.subsectionIdx];
            if (Array.isArray(subsection.powerbilink)) subsection.powerbilink.splice(info.linkIdx, 1);
            else delete subsection.powerbilink;
          }
        });
        addChangelog(`Power BI rapport '${info.link["@_caption"]}' verwijderd.`);
      }
    });
  };

  const handleUpdateLink = (info: typeof powerbiLinks[0], key: keyof JEPPowerBILink, value: string) => {
    updateModel((draft) => {
      let subsection: any;
      if (info.type === 'MegaMenu') {
        const menuExts = draft.extension.megamenuextensions.megamenuextension;
        const allMenus = Array.isArray(menuExts) ? menuExts : [menuExts];
        const tab = (Array.isArray(allMenus[info.menuIdx].tab) ? allMenus[info.menuIdx].tab : [allMenus[info.menuIdx].tab])[info.tabIdx!];
        const section = (Array.isArray(tab.section) ? tab.section : [tab.section])[info.sectionIdx!];
        subsection = (Array.isArray(section.subsection) ? section.subsection : [section.subsection])[info.subsectionIdx];
      } else {
        const menuExts = draft.extension.quickmenuextensions.quickmenuextension;
        const allMenus = Array.isArray(menuExts) ? menuExts : [menuExts];
        subsection = (Array.isArray(allMenus[info.menuIdx].subsection) ? allMenus[info.menuIdx].subsection : [allMenus[info.menuIdx].subsection])[info.subsectionIdx];
      }

      if (!Array.isArray(subsection.powerbilink)) subsection.powerbilink = [subsection.powerbilink];
      (subsection.powerbilink[info.linkIdx] as any)[key] = value;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-exact-beige/30">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-2xl">
              <BarChart3 className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-exact-dark">Power BI Rapporten</h1>
              <p className="text-sm text-gray-500 font-sans">Beheer geïntegreerde rapportages binnen Exact Online Premium.</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleAddPbiLink('MegaMenu')}
              className="inline-flex items-center px-4 py-2 bg-exact-blue text-white rounded-xl hover:bg-blue-800 transition-all shadow-md font-bold text-sm"
            >
              <Layout className="w-4 h-4 mr-2" />
              In Mega Menu
            </button>
            <button
              onClick={() => handleAddPbiLink('QuickMenu')}
              className="inline-flex items-center px-4 py-2 border-2 border-exact-blue text-exact-blue bg-white rounded-xl hover:bg-blue-50 transition-all shadow-md font-bold text-sm"
            >
              <MousePointer2 className="w-4 h-4 mr-2" />
              In Quick Menu
            </button>
          </div>
        </div>

        {powerbiLinks.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {powerbiLinks.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row h-full">
                  {/* Edit Side */}
                  <div className="p-8 lg:w-1/2 border-b lg:border-b-0 lg:border-r border-gray-100 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${item.type === 'MegaMenu' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          {item.type === 'MegaMenu' ? <Layout className="w-5 h-5" /> : <MousePointer2 className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-exact-dark">{item.link["@_caption"]}</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.type} Integratie</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePbiLink(item)}
                        className="p-2 text-gray-400 hover:text-exact-red hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                          <Type className="w-3 h-3 mr-2" /> Menunaam
                        </label>
                        <input
                          type="text"
                          value={item.link["@_caption"] || ""}
                          onChange={(e) => handleUpdateLink(item, "@_caption", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-exact-blue focus:ring-0 transition-all font-sans text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                          <Layout className="w-3 h-3 mr-2" /> Pagina Titel
                        </label>
                        <input
                          type="text"
                          value={item.link.pagetitle || ""}
                          onChange={(e) => handleUpdateLink(item, "pagetitle", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-exact-blue focus:ring-0 transition-all font-sans text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                        <ExternalLink className="w-3 h-3 mr-2" /> Embed URL
                      </label>
                      <input
                        type="text"
                        value={item.link.powerbireportembedlink || ""}
                        onChange={(e) => handleUpdateLink(item, "powerbireportembedlink", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-exact-blue focus:ring-0 transition-all font-sans text-sm bg-gray-50/50"
                        placeholder="https://app.powerbi.com/reportEmbed?..."
                      />
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <button
                        onClick={() => setPreviewId(previewId === item.link["@_id"] ? null : item.link["@_id"])}
                        className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          previewId === item.link["@_id"] 
                            ? "bg-exact-red text-white" 
                            : "bg-exact-beige text-exact-dark hover:bg-gray-200"
                        }`}
                      >
                        {previewId === item.link["@_id"] ? <><EyeOff className="w-4 h-4 mr-2" /> Sluit Preview</> : <><Eye className="w-4 h-4 mr-2" /> Toon Preview</>}
                      </button>
                      <div className="flex items-center text-[10px] text-gray-400 font-mono">
                        ID: {item.link["@_id"]}
                      </div>
                    </div>
                  </div>

                  {/* Preview Side */}
                  <div className="lg:w-1/2 bg-slate-50 min-h-[300px] flex flex-col items-center justify-center relative group">
                    <AnimatePresence mode="wait">
                      {previewId === item.link["@_id"] ? (
                        <motion.div 
                          key="preview"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full h-full"
                        >
                          <iframe
                            src={item.link.powerbireportembedlink}
                            className="w-full h-full border-0"
                            title="Power BI Preview"
                            sandbox="allow-scripts allow-same-origin allow-forms"
                          />
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center p-8 space-y-4"
                        >
                          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-gray-300">
                            <BarChart3 className="w-8 h-8" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Preview Modus</p>
                            <p className="text-xs text-gray-400 font-sans max-w-[200px]">Klik op de knop links om een live preview van het rapport te laden.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 text-[10px] font-bold text-gray-500 shadow-sm">
                        Container: {item.containerId}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-heading font-bold text-exact-dark mb-2">Geen rapporten gevonden</h3>
            <p className="text-gray-500 font-sans mb-8 max-w-sm mx-auto">
              Voeg je eerste Power BI rapport toe om deze direct binnen de Exact Online interface te kunnen tonen.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleAddPbiLink('MegaMenu')}
                className="inline-flex items-center px-6 py-3 bg-exact-blue text-white rounded-xl hover:bg-blue-800 transition-all shadow-md font-bold"
              >
                <Layout className="w-4 h-4 mr-2" />
                In Mega Menu
              </button>
              <button
                onClick={() => handleAddPbiLink('QuickMenu')}
                className="inline-flex items-center px-6 py-3 border-2 border-exact-blue text-exact-blue bg-white rounded-xl hover:bg-blue-50 transition-all shadow-md font-bold"
              >
                <MousePointer2 className="w-4 h-4 mr-2" />
                In Quick Menu
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-blue-900 text-sm">Mega vs Quick Menu</h4>
                <p className="text-blue-800 text-xs leading-relaxed font-sans">
                  Volgens de officiële documentatie is <code className="bg-blue-200 px-1 rounded">powerbilink</code> expliciet gedocumenteerd voor het Mega Menu. De Quick Menu optie is een experimentele toevoeging in deze app die mogelijk extra configuratie vereist in Exact Online.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-amber-900 text-sm">Beveiliging & Preview</h4>
                <p className="text-amber-800 text-xs leading-relaxed font-sans">
                  Als de preview niet laadt, controleer dan of de URL begint met <code className="bg-amber-200 px-1 rounded">https://</code> en of de Power BI instellingen "embed in apps" toestaan voor jouw domein.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
