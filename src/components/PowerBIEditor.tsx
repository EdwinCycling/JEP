import React from 'react';
import { useJEPStore } from '../store';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Plus, 
  Trash2, 
  ExternalLink,
  Info,
  Edit2,
  Layout,
  Type,
  FileText
} from 'lucide-react';
import { JEPPowerBILink, JEPMegaMenuExtension } from '../types';

export default function PowerBIEditor() {
  const { model, updateModel, addNotification, addChangelog, showDialog } = useJEPStore();
  
  const megamenuextensions = model?.extension?.megamenuextensions?.megamenuextension;
  const allMenuExts: JEPMegaMenuExtension[] = Array.isArray(megamenuextensions) 
    ? megamenuextensions 
    : [megamenuextensions].filter(Boolean) as JEPMegaMenuExtension[];

  const powerbiLinks: { menuIdx: number, tabIdx: number, sectionIdx: number, subsectionIdx: number, link: JEPPowerBILink, linkIdx: number }[] = [];

  allMenuExts.forEach((menu, mIdx) => {
    const tabs = Array.isArray(menu.tab) ? menu.tab : [menu.tab].filter(Boolean);
    tabs.forEach((tab: any, tIdx) => {
      const sections = Array.isArray(tab.section) ? tab.section : [tab.section].filter(Boolean);
      sections.forEach((sec: any, sIdx) => {
        const subsections = Array.isArray(sec.subsection) ? sec.subsection : [sec.subsection].filter(Boolean);
        subsections.forEach((sub: any, subIdx) => {
          if (sub.powerbilink) {
            const links = Array.isArray(sub.powerbilink) ? sub.powerbilink : [sub.powerbilink];
            links.forEach((link, lIdx) => {
              powerbiLinks.push({ menuIdx: mIdx, tabIdx: tIdx, sectionIdx: sIdx, subsectionIdx: subIdx, link, linkIdx: lIdx });
            });
          }
        });
      });
    });
  });

  const handleAddPbiLink = () => {
    updateModel((draft) => {
      if (!draft.extension) return;
      if (!draft.extension.megamenuextensions) {
        draft.extension.megamenuextensions = { megamenuextension: [] };
      }
      
      let menuExts = draft.extension.megamenuextensions.megamenuextension;
      if (!Array.isArray(menuExts)) {
        draft.extension.megamenuextensions.megamenuextension = [menuExts].filter(Boolean);
        menuExts = draft.extension.megamenuextensions.megamenuextension;
      }

      let megaMenu = (menuExts as any[]).find(m => m["@_menuid"] === "MegaMenu");
      if (!megaMenu) {
        megaMenu = { "@_menuid": "MegaMenu", tab: [] };
        (menuExts as any[]).push(megaMenu);
      }

      let tabs = megaMenu.tab;
      if (!Array.isArray(tabs)) {
        megaMenu.tab = [tabs].filter(Boolean);
        tabs = megaMenu.tab;
      }

      let reportTab = (tabs as any[]).find(t => t["@_id"] === "Reporting");
      if (!reportTab) {
        reportTab = { "@_id": "Reporting", "@_caption": "Rapportage", "@_existing": "true", section: [] };
        (tabs as any[]).push(reportTab);
      }

      let sections = reportTab.section;
      if (!Array.isArray(sections)) {
        reportTab.section = [sections].filter(Boolean);
        sections = reportTab.section;
      }

      let biSection = (sections as any[]).find(s => s["@_id"] === "BI");
      if (!biSection) {
        biSection = { "@_id": "BI", "@_caption": "Business Intelligence", subsection: [] };
        (sections as any[]).push(biSection);
      }

      let subsections = biSection.subsection;
      if (!Array.isArray(subsections)) {
        biSection.subsection = [subsections].filter(Boolean);
        subsections = biSection.subsection;
      }

      let reportsSub = (subsections as any[]).find(sub => sub["@_id"] === "Reports");
      if (!reportsSub) {
        reportsSub = { "@_id": "Reports", "@_caption": "Rapporten", powerbilink: [] };
        (subsections as any[]).push(reportsSub);
      }

      if (!reportsSub.powerbilink) reportsSub.powerbilink = [];
      if (!Array.isArray(reportsSub.powerbilink)) reportsSub.powerbilink = [reportsSub.powerbilink];

      const newId = `PBI_Report_${Date.now()}`;
      reportsSub.powerbilink.push({
        "@_id": newId,
        "@_caption": "Nieuw Power BI Rapport",
        powerbireportembedlink: "https://app.powerbi.com/reportEmbed?reportId=...",
        pagetitle: "Mijn Rapport"
      });
    });
    addChangelog("Nieuw Power BI rapport toegevoegd.");
    addNotification("Power BI rapport toegevoegd aan menu.", "success");
  };

  const handleRemovePbiLink = (info: typeof powerbiLinks[0]) => {
    showDialog({
      type: 'confirm',
      title: 'Rapport Verwijderen',
      message: `Weet je zeker dat je het rapport '${info.link["@_caption"]}' wilt verwijderen?`,
      onConfirm: () => {
        updateModel((draft) => {
          const menuExts = draft.extension.megamenuextensions.megamenuextension;
          const allMenus = Array.isArray(menuExts) ? menuExts : [menuExts];
          const menu = allMenus[info.menuIdx];
          
          const allTabs = Array.isArray(menu.tab) ? menu.tab : [menu.tab];
          const tab = allTabs[info.tabIdx];

          const allSections = Array.isArray(tab.section) ? tab.section : [tab.section];
          const section = allSections[info.sectionIdx];

          const allSubsections = Array.isArray(section.subsection) ? section.subsection : [section.subsection];
          const subsection = allSubsections[info.subsectionIdx];

          if (Array.isArray(subsection.powerbilink)) {
            subsection.powerbilink.splice(info.linkIdx, 1);
          } else {
            delete subsection.powerbilink;
          }
        });
        addChangelog(`Power BI rapport '${info.link["@_caption"]}' verwijderd.`);
      }
    });
  };

  const handleUpdateLink = (info: typeof powerbiLinks[0], key: keyof JEPPowerBILink, value: string) => {
    updateModel((draft) => {
      const menuExts = draft.extension.megamenuextensions.megamenuextension;
      const allMenus = Array.isArray(menuExts) ? menuExts : [menuExts];
      const menu = allMenus[info.menuIdx];
      
      const allTabs = Array.isArray(menu.tab) ? menu.tab : [menu.tab];
      const tab = allTabs[info.tabIdx];

      const allSections = Array.isArray(tab.section) ? tab.section : [tab.section];
      const section = allSections[info.sectionIdx];

      const allSubsections = Array.isArray(section.subsection) ? section.subsection : [section.subsection];
      const subsection = allSubsections[info.subsectionIdx];

      const links = Array.isArray(subsection.powerbilink) ? subsection.powerbilink : [subsection.powerbilink];
      (links[info.linkIdx] as any)[key] = value;
      
      if (!Array.isArray(subsection.powerbilink)) {
        subsection.powerbilink = links[0];
      }
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-exact-beige/30">
      <div className="max-w-4xl mx-auto space-y-8">
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
          <button
            onClick={handleAddPbiLink}
            className="inline-flex items-center px-4 py-2 bg-exact-blue text-white rounded-xl hover:bg-blue-800 transition-all shadow-md font-bold text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Rapport Toevoegen
          </button>
        </div>

        {powerbiLinks.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {powerbiLinks.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-50 flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-50 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="font-heading font-bold text-exact-dark">{item.link["@_caption"]}</h3>
                  </div>
                  <button
                    onClick={() => handleRemovePbiLink(item)}
                    className="p-2 text-gray-400 hover:text-exact-red hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                        <Type className="w-3 h-3 mr-2" /> Menunaam (Caption)
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
                    <div className="relative">
                      <input
                        type="text"
                        value={item.link.powerbireportembedlink || ""}
                        onChange={(e) => handleUpdateLink(item, "powerbireportembedlink", e.target.value)}
                        className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:border-exact-blue focus:ring-0 transition-all font-sans text-sm bg-gray-50/50"
                        placeholder="https://app.powerbi.com/reportEmbed?..."
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <BarChart3 className="w-5 h-5 text-gray-300" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-400 italic">
                    <Info className="w-3 h-3 mr-1.5" />
                    ID: {item.link["@_id"]}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase bg-white px-2 py-1 rounded-md border border-gray-200">
                      ID: {allMenuExts[item.menuIdx].tab[item.tabIdx]["@_id"]}
                    </span>
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
            <button
              onClick={handleAddPbiLink}
              className="inline-flex items-center px-6 py-3 bg-exact-blue text-white rounded-xl hover:bg-blue-800 transition-all shadow-md font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Eerste Rapport Toevoegen
            </button>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg shrink-0">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-blue-900 text-sm">Hoe werkt Power BI integratie?</h4>
              <p className="text-blue-800 text-xs leading-relaxed font-sans">
                Door een <code className="bg-blue-200 px-1 rounded">powerbilink</code> toe te voegen aan een menu-sectie, maakt Exact Online automatisch een speciale pagina aan die het rapport veilig binnen de Aurora-interface rendert. Let erop dat de URL de juiste embed-parameters bevat voor een optimale weergave.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
