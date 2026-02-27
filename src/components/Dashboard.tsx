import React, { useState, useEffect, useRef } from "react";
import { useJEPStore } from "../store";
import { motion } from "motion/react";
import {
  FileText,
  Type,
  Calendar,
  CheckSquare,
  List,
  Plus,
  Download,
  Code,
  Eye,
  Edit2,
  Monitor,
  LayoutTemplate,
  Menu,
  Settings,
  Info,
  X,
  ShieldCheck,
  FileCode,
  History,
  ChevronRight,
  ChevronLeft,
  Link,
  MonitorPlay
} from "lucide-react";
import EditorModal from "./EditorModal";
import XmlViewerModal from "./XmlViewerModal";
import DownloadModal from "./DownloadModal";
import MenuEditor from "./MenuEditor";
import XmlEditorScreen from "./editor/XmlEditorScreen";
import CustomEntityModal from "./CustomEntityModal";
import ConnectionsModal from "./ConnectionsModal";
import PageCanvas from "./PageCanvas";

type MainTab = 'tables' | 'menus' | 'pages' | 'features';

const getTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "string":
      return <Type className="w-5 h-5 text-exact-blue" />;
    case "date":
      return <Calendar className="w-5 h-5 text-exact-gold" />;
    case "boolean":
      return <CheckSquare className="w-5 h-5 text-exact-purple" />;
    case "integer":
    case "double":
      return <List className="w-5 h-5 text-exact-red" />;
    default:
      return <FileText className="w-5 h-5 text-gray-500" />;
  }
};

const getFriendlyType = (type: string) => {
  switch (type?.toLowerCase()) {
    case "string":
      return "Tekstregel";
    case "date":
      return "Datum";
    case "boolean":
      return "Ja/Nee vinkje";
    case "integer":
    case "double":
      return "Getal/Keuzelijst";
    default:
      return type || "Onbekend";
  }
};

export default function Dashboard() {
  const { model, explanation, changelog, addedFieldIds, addNotification } = useJEPStore();
  const [editingEntity, setEditingEntity] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<any | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isViewingXml, setIsViewingXml] = useState(false);
  const [xmlContent, setXmlContent] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>('tables');
  const [isXmlEditorOpen, setIsXmlEditorOpen] = useState(false);
  const [isAddingCustomEntity, setIsAddingCustomEntity] = useState(false);
  const [viewingConnections, setViewingConnections] = useState<any | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const entities = model?.extension?.entities?.entity || [];
  const customEntities = model?.extension?.customentities?.customentity || [];
  const allEntities = [
    ...(Array.isArray(entities) ? entities : [entities]), 
    ...(Array.isArray(customEntities) ? customEntities : [customEntities])
  ].filter(Boolean);

  const isCustomEntity = (entity: any) => {
    return customEntities.some((ce: any) => ce["@_name"] === entity["@_name"]);
  };

  const hasMenuLink = (entity: any) => {
    const menuExts = model?.extension?.megamenuextensions?.megamenuextension || [];
    const allMenuExts = Array.isArray(menuExts) ? menuExts : [menuExts];
    return allMenuExts.some((me: any) => me["@_id"] === `${entity["@_name"]}_Menu`);
  };

  const isLinked = (entity: any) => {
    return entity.property?.some((p: any) => p["@_refersto"] || p["@_referstocustomentity"]);
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getTabId = (entity: any, index: number) => {
    return entity["@_extensiontable"] || `${entity["@_name"]}-${index}`;
  };

  const getTabLabel = (entity: any) => {
    const name = entity["@_description"] || entity["@_name"];
    const bc = entity["@_businesscomponent"];
    if (bc && bc !== name) {
      return `${name} (${bc})`;
    }
    return name;
  };

  useEffect(() => {
    if (allEntities.length > 0 && !activeTab) {
      setActiveTab(getTabId(allEntities[0], 0));
    }
  }, [allEntities, activeTab]);

  if (!model) return null;

  const fetchXml = async () => {
    const res = await fetch("/api/build-xml", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonObj: model }),
    });
    const { xml } = await res.json();
    return xml;
  };

  const handleExport = async (filename: string) => {
    setIsExporting(true);
    setDownloadModalOpen(false);
    try {
      const xml = await fetchXml();
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      addNotification("Fout bij het exporteren van de XML.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewXml = async () => {
    try {
      const xml = await fetchXml();
      setXmlContent(xml);
      setIsViewingXml(true);
    } catch (error) {
      console.error(error);
      addNotification("Fout bij het genereren van de XML.", "error");
    }
  };

  const activeEntity = allEntities.find((e, i) => getTabId(e, i) === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <h1 className="text-3xl font-heading font-semibold text-exact-dark tracking-tight">
              Extensie Overzicht: <span className="text-exact-red">{model?.extension?.["@_code"]}</span>
            </h1>
            {explanation && (
              <button 
                onClick={() => setShowExplanation(true)}
                className="p-1.5 text-gray-400 hover:text-exact-blue hover:bg-blue-50 rounded-full transition-all"
                title="Wat doet dit?"
              >
                <Info className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsXmlEditorOpen(true)}
            className="inline-flex items-center px-4 py-2 border-2 border-exact-red text-sm font-medium rounded-lg shadow-sm text-exact-red bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-red transition-colors"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Validatie Center
          </button>
          <button
            onClick={handleViewXml}
            className="inline-flex items-center px-4 py-2 border-2 border-exact-blue text-sm font-medium rounded-lg shadow-sm text-exact-blue bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-blue transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            Toon XML
          </button>
          <button
            onClick={() => setDownloadModalOpen(true)}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-exact-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-blue disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Bezig..." : "Download XML"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-8">
        {/* Left side: Tabs + Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white shadow-sm border border-gray-200 rounded-2xl">
          
          {/* Main Navigation Tabs */}
          <div className="px-6 pt-4 border-b border-gray-200 shrink-0 bg-white">
            <div className="flex space-x-8">
              <button 
                onClick={() => setMainTab('tables')}
                className={`pb-4 text-sm font-medium font-sans border-b-2 transition-colors ${mainTab === 'tables' ? 'border-exact-red text-exact-red' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <div className="flex items-center">
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  Tabel/Veld
                </div>
              </button>
              <button 
                onClick={() => setMainTab('menus')}
                className={`pb-4 text-sm font-medium font-sans border-b-2 transition-colors ${mainTab === 'menus' ? 'border-exact-red text-exact-red' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <div className="flex items-center">
                  <Menu className="w-4 h-4 mr-2" />
                  Menu uitbreiding
                </div>
              </button>
              <button 
                onClick={() => setMainTab('pages')}
                className={`pb-4 text-sm font-medium font-sans border-b-2 transition-colors ${mainTab === 'pages' ? 'border-exact-red text-exact-red' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <div className="flex items-center">
                  <MonitorPlay className="w-4 h-4 mr-2" />
                  Pagina's
                </div>
              </button>
              <button 
                onClick={() => setMainTab('features')}
                className={`pb-4 text-sm font-medium font-sans border-b-2 transition-colors ${mainTab === 'features' ? 'border-exact-red text-exact-red' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <div className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Feature set
                </div>
              </button>
            </div>
          </div>

          {mainTab === 'tables' && (
            <>
              {/* Entity Tabs */}
              <div className="relative border-b border-gray-200 bg-gray-50/50 group">
                <button 
                  onClick={() => scrollTabs('left')}
                  className="absolute left-0 top-0 bottom-0 z-10 px-1 bg-gradient-to-r from-gray-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                <div 
                  ref={tabsRef}
                  className="flex overflow-x-auto shrink-0 hide-scrollbar scroll-smooth"
                >
                  {allEntities.map((entity, i) => {
                    const tabId = getTabId(entity, i);
                    return (
                      <button
                        key={tabId}
                        className={`px-6 py-4 text-sm font-heading font-semibold whitespace-nowrap border-b-2 transition-colors ${
                          activeTab === tabId
                            ? "border-exact-red text-exact-red bg-white"
                            : "border-transparent text-gray-500 hover:text-exact-dark hover:bg-gray-100"
                        }`}
                        onClick={() => setActiveTab(tabId)}
                      >
                        {getTabLabel(entity)}
                        {isCustomEntity(entity) && (
                          <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded uppercase tracking-wider">Custom</span>
                        )}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setIsAddingCustomEntity(true)}
                    className="px-6 py-4 text-sm font-heading font-bold text-exact-blue hover:bg-blue-50 flex items-center whitespace-nowrap border-b-2 border-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nieuwe Entiteit
                  </button>
                </div>

                <button 
                  onClick={() => scrollTabs('right')}
                  className="absolute right-0 top-0 bottom-0 z-10 px-1 bg-gradient-to-l from-gray-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-exact-beige/30">
                {activeEntity && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h2 className="text-xl font-heading font-semibold text-exact-dark">
                            {activeEntity["@_description"] || activeEntity["@_name"]}
                          </h2>
                          <p className="text-sm text-gray-500 mt-1 font-sans">
                            Tabel: {activeEntity["@_table"] || activeEntity["@_name"]}
                          </p>
                        </div>
                        {isCustomEntity(activeEntity) && hasMenuLink(activeEntity) && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full flex items-center">
                            <CheckSquare className="w-3 h-3 mr-1" /> Menu-link actief
                          </span>
                        )}
                        {isLinked(activeEntity) && (
                          <button 
                            onClick={() => setViewingConnections(activeEntity)}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full flex items-center hover:bg-blue-200 transition-colors"
                          >
                            <Link className="w-3 h-3 mr-1" /> Gekoppeld
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setEditingEntity(activeEntity["@_name"]);
                          setEditingField(null);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-exact-dark bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-red transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-1.5 text-exact-red" />
                        Veld Toevoegen
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {activeEntity.property?.map((prop: any, j: number) => {
                        const isAdded = addedFieldIds.includes(prop["@_name"]);
                        return (
                          <div
                            key={j}
                            onClick={() => {
                              setEditingEntity(activeEntity["@_name"]);
                              setEditingField(prop);
                            }}
                            className={`border rounded-xl p-4 transition-all bg-white relative cursor-pointer hover:shadow-md ${
                              isAdded
                                ? "border-exact-blue shadow-sm ring-1 ring-exact-blue/20"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {isAdded && (
                              <div className="absolute top-3 right-3">
                                <Edit2 className="w-4 h-4 text-exact-blue opacity-50 hover:opacity-100" />
                              </div>
                            )}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-exact-beige rounded-xl">
                                  {getTypeIcon(prop["@_type"])}
                                </div>
                                <div>
                                  <h3 className="text-sm font-heading font-medium text-exact-dark pr-6">
                                    {prop["@_caption"] || prop["@_name"]}
                                  </h3>
                                  <p className="text-xs text-gray-500 font-sans mt-0.5">
                                    {getFriendlyType(prop["@_type"])}
                                  </p>
                                  {prop.listitems?.listitem && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {(Array.isArray(prop.listitems.listitem) ? prop.listitems.listitem : [prop.listitems.listitem])
                                        .slice(0, 3)
                                        .map((item: any, idx: number) => (
                                          <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                            {item["@_caption"]}
                                          </span>
                                        ))}
                                      {(Array.isArray(prop.listitems.listitem) ? prop.listitems.listitem : [prop.listitems.listitem]).length > 3 && (
                                        <span className="text-[10px] text-gray-400 self-center">...</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 text-xs text-gray-400 flex justify-between items-center font-sans">
                              <span
                                className="truncate max-w-[150px]"
                                title={prop["@_name"]}
                              >
                                ID: {prop["@_name"]}
                              </span>
                              {isAdded && (
                                <span className="text-exact-blue font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                                  Nieuw
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {(!activeEntity.property || activeEntity.property.length === 0) && (
                        <div className="col-span-full text-center py-8 text-gray-500 text-sm font-sans">
                          Nog geen velden in deze entiteit.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {mainTab === 'menus' && (
            <div className="flex-1 overflow-y-auto bg-white">
              <MenuEditor />
            </div>
          )}

          {mainTab === 'pages' && (
            <div className="flex-1 overflow-y-auto bg-white">
              <PageCanvas />
            </div>
          )}

          {mainTab === 'features' && (
            <div className="flex-1 overflow-y-auto p-6 bg-exact-beige/30 flex items-center justify-center">
              <div className="text-center">
                <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Feature set</h3>
                <p className="text-gray-500 mt-2">Deze functionaliteit is momenteel in ontwikkeling.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right side: Changelog */}
        <div className="w-80 shrink-0 flex flex-col bg-white shadow-sm border-l-4 border-exact-purple rounded-r-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-white shrink-0">
            <h2 className="text-lg font-heading font-semibold text-exact-dark flex items-center">
              <FileText className="w-5 h-5 mr-2 text-exact-purple" />
              Wijzigingenlogboek
            </h2>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {changelog.length > 0 ? (
              <ul className="space-y-4">
                {changelog.map((change, i) => (
                  <li key={i} className="flex items-start">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-exact-purple mr-3"></span>
                    <span className="text-sm text-gray-600 font-sans leading-relaxed">
                      {change}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4 font-sans">
                Nog geen wijzigingen aangebracht.
              </p>
            )}
          </div>
        </div>
      </div>

      {showExplanation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <h2 className="text-xl font-heading font-semibold text-exact-dark">
                Wat doet deze extensie?
              </h2>
              <button
                onClick={() => setShowExplanation(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 font-sans leading-relaxed">{explanation}</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-exact-beige/30 flex justify-end">
              <button
                onClick={() => setShowExplanation(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-exact-blue border border-transparent rounded-lg hover:bg-blue-800 transition-colors"
              >
                Begrepen
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {isXmlEditorOpen && (
        <XmlEditorScreen onClose={() => setIsXmlEditorOpen(false)} />
      )}

      {editingEntity && (
        <EditorModal
          entityName={editingEntity}
          isCustomEntity={isCustomEntity(activeEntity)}
          existingField={editingField}
          onClose={() => {
            setEditingEntity(null);
            setEditingField(null);
          }}
        />
      )}

      {isAddingCustomEntity && (
        <CustomEntityModal onClose={() => setIsAddingCustomEntity(false)} />
      )}

      {viewingConnections && (
        <ConnectionsModal 
          entity={viewingConnections} 
          allEntities={allEntities} 
          onClose={() => setViewingConnections(null)} 
        />
      )}

      {isViewingXml && (
        <XmlViewerModal
          xml={xmlContent}
          addedFieldIds={addedFieldIds}
          onClose={() => setIsViewingXml(false)}
        />
      )}

      {downloadModalOpen && (
        <DownloadModal
          defaultFilename={model?.extension?.["@_code"] || "extensie.xml"}
          onDownload={handleExport}
          onClose={() => setDownloadModalOpen(false)}
        />
      )}
    </motion.div>
  );
}
