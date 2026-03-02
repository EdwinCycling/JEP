import React, { useState, useEffect, useRef, useMemo } from "react";
import { useJEPStore } from "../store";
import { motion, AnimatePresence } from "motion/react";
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
  MonitorPlay,
  Database,
  Search,
  Cloud,
  Zap,
  Copy,
  Check
} from "lucide-react";
import EditorModal from "./EditorModal";
import XmlViewerModal from "./XmlViewerModal";
import DownloadModal from "./DownloadModal";
import MenuEditor from "./MenuEditor";
import XmlEditorScreen from "./editor/XmlEditorScreen";
import CustomEntityModal from "./CustomEntityModal";
import ConnectionsModal from "./ConnectionsModal";
import PageCanvas from "./PageCanvas";
import WorkflowDesigner from "./WorkflowDesigner";
import SchemaDesigner from "./SchemaDesigner";
import FeatureSetsEditor from './FeatureSetsEditor';
import PowerBIEditor from './PowerBIEditor';
import SettingsEditor from './SettingsEditor';
import StandardTableModal from "./StandardTableModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toPng } from 'html-to-image';
import AzureFunctionsWizard from './AzureFunctionsWizard';
import GlobalDialog from "./GlobalDialog";
import { RotateCcw, BarChart3, Settings as SettingsIcon } from "lucide-react";

type MainTab = 'tables' | 'menus' | 'pages' | 'workflows' | 'powerbi' | 'features' | 'settings';

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
  const { 
    model, 
    explanation, 
    changelog, 
    addedFieldIds, 
    addNotification, 
    addChangelog,
    undo,
    history,
    showDialog
  } = useJEPStore();
  const [editingEntity, setEditingEntity] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<any | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isViewingXml, setIsViewingXml] = useState(false);
  const [xmlContent, setXmlContent] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>('tables');
  const [isXmlEditorOpen, setIsXmlEditorOpen] = useState(false);
  const [isAddingCustomEntity, setIsAddingCustomEntity] = useState(false);
  const [isAddingStandardTable, setIsAddingStandardTable] = useState(false);
  const [isAzureWizardOpen, setIsAzureWizardOpen] = useState(false);
  const [viewingConnections, setViewingConnections] = useState<any | null>(null);
  const [tableMode, setTableMode] = useState<'list' | 'schema'>('list');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const entities = useMemo(() => {
    const e = model?.extension?.entities?.entity || [];
    return Array.isArray(e) ? e : [e];
  }, [model?.extension?.entities?.entity]);

  const customEntities = useMemo(() => {
    const ce = model?.extension?.customentities?.customentity || [];
    return Array.isArray(ce) ? ce : [ce];
  }, [model?.extension?.customentities?.customentity]);

  const allEntities = useMemo(() => {
    return [...entities, ...customEntities].filter(Boolean);
  }, [entities, customEntities]);

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
    const prefix = isCustomEntity(entity) ? 'ce' : 'e';
    return `${prefix}-${entity["@_name"]}-${index}`;
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

  const handleExportPdf = async (shouldDownload = false) => {
    setIsExportingPdf(true);
    addNotification("PDF overzicht wordt voorbereid...", "info");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const doc = new jsPDF();
      const extCode = model.extension?.["@_code"] || "UNKNOWN";
      const extVersion = model.extension?.["@_version"] || "1.0.0";

      // --- PAGE 1: Header & Summary ---
      doc.setFontSize(22);
      doc.setTextColor(0, 51, 153);
      doc.text("Exact Online Premium Extension Overzicht", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Oplossing: ${extCode}`, 14, 28);
      doc.text(`Versie: ${extVersion}`, 80, 28);
      doc.text(`Datum: ${new Date().toLocaleString('nl-NL')}`, 140, 28);
      
      doc.setDrawColor(0, 51, 153);
      doc.setLineWidth(0.5);
      doc.line(14, 32, 196, 32);

      let yPos = 45;

      // 1. Algemene Informatie
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text("1. Overzicht Entiteiten", 14, yPos);
      yPos += 10;

      const summaryData = [
        ["Totaal aantal entiteiten", allEntities.length.toString()],
        ["Custom entiteiten", customEntities.length.toString()],
        ["Standaard entiteiten uitgebreid", entities.length.toString()],
        ["Bedrijfsprocessen (Workflows)", (Array.isArray(model.extension?.workflowdefinitions?.workflowdefinition) ? model.extension.workflowdefinitions.workflowdefinition.length : (model.extension?.workflowdefinitions?.workflowdefinition ? 1 : 0)).toString()]
      ];

      autoTable(doc, {
        startY: yPos,
        body: summaryData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
      });
      yPos = (doc as any).lastAutoTable.finalY + 15;

      // 2. Custom Entities Tabel
      if (customEntities.length > 0) {
        doc.setFontSize(14);
        doc.text("2. Nieuwe Entiteiten (Custom)", 14, yPos);
        yPos += 8;

        const ceData = customEntities.map((ce: any) => [
          ce["@_name"],
          ce["@_description"] || "-",
          ce["@_table"] || "-",
          Array.isArray(ce.property) ? ce.property.length : (ce.property ? 1 : 0)
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Naam', 'Omschrijving', 'Database Tabel', 'Velden']],
          body: ceData,
          theme: 'striped',
          headStyles: { fillColor: [0, 51, 153] },
          styles: { fontSize: 9 }
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // 3. Alle Velden Overzicht
      if (yPos > 240) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.text("3. Velden per Entiteit", 14, yPos);
      yPos += 8;

      const allFieldsData: any[] = [];
      allEntities.forEach(e => {
        const props = Array.isArray(e.property) ? e.property : [e.property].filter(Boolean);
        props.forEach((p: any) => {
          allFieldsData.push([
            e["@_name"],
            p["@_name"],
            p["@_caption"] || p["@_name"],
            p["@_type"],
            p["@_allowempty"] === "false" ? "Ja" : "Nee",
            addedFieldIds.includes(p["@_name"]) ? "Nieuw" : "Bestaand"
          ]);
        });
      });

      if (allFieldsData.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Entiteit', 'Veld ID', 'Label', 'Type', 'Verplicht', 'Status']],
          body: allFieldsData,
          theme: 'grid',
          headStyles: { fillColor: [213, 27, 33] },
          styles: { fontSize: 8 },
          didParseCell: function(data) {
            if (data.row.section === 'body' && data.cell.raw === 'Nieuw') {
              data.cell.styles.textColor = [0, 100, 0];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // 4. Workflows
      const workflows = model.extension?.workflowdefinitions?.workflowdefinition || [];
      const workflowArray = Array.isArray(workflows) ? workflows : [workflows].filter(Boolean);
      
      if (workflowArray.length > 0) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.text("4. Bedrijfsprocessen (Workflows)", 14, yPos);
        yPos += 8;

        const wfData = workflowArray.map((wf: any) => [
          wf["@_name"],
          wf["@_description"],
          Array.isArray(wf.stages?.stage) ? wf.stages.stage.length : (wf.stages?.stage ? 1 : 0)
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Naam', 'Omschrijving', 'Aantal Stages']],
          body: wfData,
          theme: 'striped',
          headStyles: { fillColor: [102, 51, 153] },
          styles: { fontSize: 9 }
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // 5. Feature Sets Section
      const featuresets = model.extension?.mandatoryfeaturesets?.featureset || [];
      const featureList = Array.isArray(featuresets) ? featuresets : [featuresets].filter(Boolean);
      
      if (featureList.length > 0) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.text("5. Vereiste Feature Sets", 14, yPos);
        yPos += 8;
        doc.setFontSize(9);
        featureList.forEach(fs => {
          doc.text(`- ${fs}`, 18, yPos);
          yPos += 6;
        });
        yPos += 10;
      }

      // 6. Power BI Reports Section
      const powerbiLinks: any[] = [];
      
      // Check Mega Menu
      const megaMenuExts = model.extension?.megamenuextensions?.megamenuextension;
      const allMega = Array.isArray(megaMenuExts) ? megaMenuExts : [megaMenuExts].filter(Boolean);
      allMega.forEach(menu => {
        const tabs = Array.isArray(menu.tab) ? menu.tab : [menu.tab].filter(Boolean);
        tabs.forEach(tab => {
          const sections = Array.isArray(tab.section) ? tab.section : [tab.section].filter(Boolean);
          sections.forEach(sec => {
            const subsections = Array.isArray(sec.subsection) ? sec.subsection : [sec.subsection].filter(Boolean);
            subsections.forEach(sub => {
              if (sub.powerbilink) {
                const links = Array.isArray(sub.powerbilink) ? sub.powerbilink : [sub.powerbilink];
                links.forEach(l => powerbiLinks.push({ ...l, type: 'Mega Menu' }));
              }
            });
          });
        });
      });

      // Check Quick Menu
      const quickMenuExts = model.extension?.quickmenuextensions?.quickmenuextension;
      const allQuick = Array.isArray(quickMenuExts) ? quickMenuExts : [quickMenuExts].filter(Boolean);
      allQuick.forEach(menu => {
        const subsections = Array.isArray(menu.subsection) ? menu.subsection : [menu.subsection].filter(Boolean);
        subsections.forEach(sub => {
          if (sub.powerbilink) {
            const links = Array.isArray(sub.powerbilink) ? sub.powerbilink : [sub.powerbilink];
            links.forEach(l => powerbiLinks.push({ ...l, type: 'Quick Menu' }));
          }
        });
      });

      if (powerbiLinks.length > 0) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.text("6. Power BI Rapporten", 14, yPos);
        yPos += 8;
        
        const pbiData = powerbiLinks.map(l => [
          l["@_caption"] || "Naamloos",
          l.type,
          l.pagetitle || "-",
          l.powerbireportembedlink || "-"
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Naam', 'Type', 'Pagina Titel', 'Embed URL']],
          body: pbiData,
          theme: 'striped',
          headStyles: { fillColor: [241, 196, 15] },
          styles: { fontSize: 8, cellPadding: 3 },
          columnStyles: { 3: { cellWidth: 60 } }
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // 7. Division Settings Section
      const divSettingsTabs = model.extension?.divisionsettingsextensions?.tab || [];
      const divSettingsTabsArray = Array.isArray(divSettingsTabs) ? divSettingsTabs : [divSettingsTabs].filter(Boolean);
      
      if (divSettingsTabsArray.length > 0) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.text("7. Division Settings", 14, yPos);
        yPos += 8;
        
        const divData: any[] = [];
        divSettingsTabsArray.forEach(tab => {
          const sections = Array.isArray(tab.section) ? tab.section : [tab.section].filter(Boolean);
          sections.forEach(sec => {
            const settings = Array.isArray(sec.setting) ? sec.setting : [sec.setting].filter(Boolean);
            settings.forEach(set => {
              divData.push([
                tab["@_caption"],
                sec["@_caption"],
                set["@_caption"],
                set["@_type"],
                set["@_defaultvalue"] || "-"
              ]);
            });
          });
        });

        autoTable(doc, {
          startY: yPos,
          head: [['Tab', 'Sectie', 'Instelling', 'Type', 'Standaard']],
          body: divData,
          theme: 'striped',
          headStyles: { fillColor: [241, 196, 15] },
          styles: { fontSize: 8, cellPadding: 3 }
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // 8. Vertalingen Section
      const transExts = model.extension?.translationextensions?.translation || [];
      const transArray = Array.isArray(transExts) ? transExts : [transExts].filter(Boolean);
      
      if (transArray.length > 0) {
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.text("8. Vertalingen", 14, yPos);
        yPos += 8;
        
        const transData: any[] = [];
        transArray.forEach(trans => {
          const languages = Array.isArray(trans.language) ? trans.language : [trans.language].filter(Boolean);
          const nl = languages.find(l => l["@_code"] === 'nl-NL' || l["@_code"] === 'nl')?.[ "#text"] || "-";
          const en = languages.find(l => l["@_code"] === 'en-EN' || l["@_code"] === 'en')?.[ "#text"] || "-";
          transData.push([trans["@_id"], nl, en]);
        });

        autoTable(doc, {
          startY: yPos,
          head: [['Translation ID', 'Nederlands', 'Engels']],
          body: transData,
          theme: 'striped',
          headStyles: { fillColor: [155, 89, 182] },
          styles: { fontSize: 8, cellPadding: 3 }
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // --- PAGE 2: Graphical Views ---
      doc.addPage();
      doc.setFontSize(18);
      doc.setTextColor(0, 51, 153);
      doc.text("Grafische Weergaven", 14, 20);
      
      let captureY = 30;

      // Capture Database Schema
      const schemaCanvas = document.querySelector('.schema-designer-canvas');
      if (schemaCanvas) {
        try {
          const dataUrl = await toPng(schemaCanvas as HTMLElement, { 
            backgroundColor: '#ffffff',
            style: { transform: 'scale(1)' }
          });
          doc.setFontSize(14);
          doc.setTextColor(0);
          doc.text("Database Schema", 14, captureY);
          doc.addImage(dataUrl, 'PNG', 14, captureY + 5, 180, 100);
          captureY += 115;
        } catch (e) {
          doc.setFontSize(10);
          doc.setTextColor(200, 0, 0);
          doc.text("Schema capture mislukt (open de Schema tab eerst)", 14, captureY + 5);
          captureY += 20;
        }
      }

      // Capture Workflow Designer
      const workflowCanvas = document.querySelector('.workflow-designer-canvas');
      if (workflowCanvas) {
        if (captureY > 150) { doc.addPage(); captureY = 20; }
        try {
          const dataUrl = await toPng(workflowCanvas as HTMLElement, { 
            backgroundColor: '#ffffff',
            style: { transform: 'scale(1)' }
          });
          doc.setFontSize(14);
          doc.setTextColor(0);
          doc.text("Workflow Designer", 14, captureY);
          doc.addImage(dataUrl, 'PNG', 14, captureY + 5, 180, 100);
          captureY += 115;
        } catch (e) {
          doc.setFontSize(10);
          doc.setTextColor(200, 0, 0);
          doc.text("Workflow capture mislukt (open de Bedrijfsprocessen tab eerst)", 14, captureY + 5);
          captureY += 20;
        }
      }

      // --- FINAL PAGE: Changelog ---
      if (changelog.length > 0) {
        doc.addPage();
        doc.setFontSize(18);
        doc.setTextColor(0, 51, 153);
        doc.text("Wijzigingenlogboek", 14, 20);
        
        let logY = 35;
        doc.setFontSize(9);
        doc.setTextColor(50);
        
        changelog.forEach((log, i) => {
          if (logY > 280) { doc.addPage(); logY = 20; }
          const splitText = doc.splitTextToSize(`${i + 1}. ${log}`, 180);
          doc.text(splitText, 14, logY);
          logY += (splitText.length * 5) + 2;
        });
      }

      // --- FINAL PAGE: XML Export ---
      const xml = await fetchXml();
      doc.addPage();
      doc.setFontSize(18);
      doc.setTextColor(0, 51, 153);
      doc.text("Configuratie XML", 14, 20);
      
      doc.setFontSize(7);
      doc.setTextColor(80);
      const splitXml = doc.splitTextToSize(xml, 180);
      let xmlY = 30;
      splitXml.forEach((line: string) => {
        if (xmlY > 280) { doc.addPage(); xmlY = 20; }
        doc.text(line, 14, xmlY);
        xmlY += 3.5;
      });

      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfPreviewUrl(pdfUrl);
      
      if (shouldDownload) {
        doc.save(`${extCode}_Configuratie_Overzicht.pdf`);
        addNotification("PDF Overzicht succesvol gedownload!", "success");
      } else {
        addNotification("PDF Voorbeeld gereed.", "success");
      }
    } catch (error) {
      console.error("PDF Export Error:", error);
      addNotification("Fout bij het genereren van de PDF: " + (error as Error).message, "error");
    } finally {
      setIsExportingPdf(false);
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

  const activeEntity = useMemo(() => 
    allEntities.find((e, i) => getTabId(e, i) === activeTab),
  [allEntities, activeTab]);

  const copyXmlSummary = async () => {
    try {
      const xml = await fetchXml();
      await navigator.clipboard.writeText(xml);
      setCopied(true);
      addNotification("XML gekopieerd naar klembord!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      addNotification("Kopiëren mislukt.", "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col max-w-[1580px] mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      <GlobalDialog />
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <h1 className="text-3xl font-heading font-semibold text-exact-dark tracking-tight">
              Extensie Overzicht: <span className="text-exact-red">{model?.extension?.["@_code"]}</span>
            </h1>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsAzureWizardOpen(true)}
            className="inline-flex items-center px-4 py-2 border-2 border-blue-600 text-sm font-medium rounded-lg shadow-sm text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors"
          >
            <Cloud className="w-4 h-4 mr-2" />
            Azure Wizard
          </button>
          <button
            onClick={() => setIsXmlEditorOpen(true)}
            className="inline-flex items-center px-4 py-2 border-2 border-exact-red text-sm font-medium rounded-lg shadow-sm text-exact-red bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-red transition-colors"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Validatie Center
          </button>
          <button
            onClick={() => handleExportPdf(false)}
            disabled={isExportingPdf}
            className="inline-flex items-center px-4 py-2 border-2 border-emerald-600 text-sm font-medium rounded-lg shadow-sm text-emerald-600 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition-colors"
          >
            <FileCode className="w-4 h-4 mr-2" />
            {isExportingPdf ? "Bezig..." : "PDF Overzicht"}
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
                onClick={() => setMainTab('workflows')}
                className={`pb-4 text-sm font-medium font-sans border-b-2 transition-colors ${mainTab === 'workflows' ? 'border-exact-red text-exact-red' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <div className="flex items-center">
                  <History className="w-4 h-4 mr-2" />
                  Bedrijfsprocessen
                </div>
              </button>
              <button 
                onClick={() => setMainTab('powerbi')}
                className={`pb-4 text-sm font-medium font-sans border-b-2 transition-colors ${mainTab === 'powerbi' ? 'border-exact-red text-exact-red' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Power BI
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
              <button 
                onClick={() => setMainTab('settings')}
                className={`pb-4 text-sm font-medium font-sans border-b-2 transition-colors ${mainTab === 'settings' ? 'border-exact-red text-exact-red' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <div className="flex items-center">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Instellingen
                </div>
              </button>
            </div>
          </div>

          {mainTab === 'tables' && (
            <>
              {/* Entity Tabs & Mode Switcher */}
              <div className="relative border-b border-gray-200 bg-gray-50/50 group flex items-center pr-6">
                <button 
                  onClick={() => scrollTabs('left')}
                  className="absolute left-0 top-0 bottom-0 z-10 px-1 bg-gradient-to-r from-gray-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                <div 
                  ref={tabsRef}
                  className="flex overflow-x-auto shrink-0 hide-scrollbar scroll-smooth flex-1"
                >
                  {allEntities.map((entity, i) => {
                    const tabId = getTabId(entity, i);
                    return (
                      <button
                        key={tabId}
                        className={`px-6 py-4 text-sm font-heading font-semibold whitespace-nowrap border-b-2 transition-colors ${
                          activeTab === tabId && tableMode === 'list'
                            ? "border-exact-red text-exact-red bg-white"
                            : "border-transparent text-gray-500 hover:text-exact-dark hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          setActiveTab(tabId);
                          setTableMode('list');
                        }}
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
                  <button
                    onClick={() => setIsAddingStandardTable(true)}
                    className="px-6 py-4 text-sm font-heading font-bold text-emerald-600 hover:bg-emerald-50 flex items-center whitespace-nowrap border-b-2 border-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Bestaande Tabel Uitbreiden
                  </button>
                </div>

                <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl ml-4">
                  <button 
                    onClick={() => setTableMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${tableMode === 'list' ? 'bg-white text-exact-red shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Lijstweergave"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setTableMode('schema')}
                    className={`p-1.5 rounded-lg transition-all ${tableMode === 'schema' ? 'bg-white text-exact-red shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Schemaweergave"
                  >
                    <Database className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto bg-exact-beige/30 min-h-0">
                {tableMode === 'schema' ? (
                  <SchemaDesigner />
                ) : activeEntity ? (
                  <div className="p-6">
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
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 font-sans">
                    <Database className="w-12 h-12 mb-4 opacity-20" />
                    <p>Selecteer een entiteit of schakel over naar schemaweergave.</p>
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

          {mainTab === 'workflows' && (
            <div className="flex-1 overflow-y-auto bg-white">
              <WorkflowDesigner />
            </div>
          )}

          {mainTab === 'powerbi' && (
            <PowerBIEditor />
          )}

          {mainTab === 'features' && (
            <FeatureSetsEditor />
          )}

          {mainTab === 'settings' && (
            <SettingsEditor />
          )}
        </div>

        {/* Right side: Changelog */}
        <div className="w-80 shrink-0 flex flex-col bg-white shadow-sm border-l-4 border-exact-purple rounded-r-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-white shrink-0 flex justify-between items-center">
            <h2 className="text-lg font-heading font-semibold text-exact-dark flex items-center">
              <FileText className="w-5 h-5 mr-2 text-exact-purple" />
              Logboek
            </h2>
            {changelog.length > 0 && (
              <button
                onClick={() => {
                  showDialog({
                    type: 'confirm',
                    title: 'Wijziging ongedaan maken?',
                    message: `Weet je zeker dat je de laatste wijziging ('${changelog[changelog.length - 1]}') ongedaan wilt maken?`,
                    onConfirm: () => {
                      undo();
                      addNotification("Laatste wijziging ongedaan gemaakt.", "info");
                    }
                  });
                }}
                className="p-1.5 text-gray-400 hover:text-exact-red hover:bg-red-50 rounded-lg transition-all"
                title="Laatste wijziging ongedaan maken"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {changelog.length > 0 ? (
              <ul className="space-y-4">
                {[...changelog].reverse().map((change, i) => (
                  <li key={i} className={`flex items-start ${i === 0 ? 'bg-purple-50/50 -mx-2 p-2 rounded-lg border border-purple-100' : ''}`}>
                    <span className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${i === 0 ? 'bg-exact-purple animate-pulse' : 'bg-gray-300'} mr-3`}></span>
                    <span className={`text-sm font-sans leading-relaxed ${i === 0 ? 'text-exact-purple font-medium' : 'text-gray-600'}`}>
                      {change}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4 font-sans">
                Nog geen wijzigingen.
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

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {pdfPreviewUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <FileCode className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-heading font-semibold text-exact-dark">
                      PDF Voorbeeld
                    </h2>
                    <p className="text-xs text-gray-500 font-sans italic">Let op: Grafische weergaves worden pas meegenomen nadat je de betreffende pagina eerst hebt geopend.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={copyXmlSummary}
                    className="inline-flex items-center px-4 py-2 text-sm font-bold text-gray-600 hover:text-exact-blue hover:bg-blue-50 rounded-xl transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Gekopieerd!' : 'Kopieer XML'}
                  </button>
                  <button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = pdfPreviewUrl;
                      a.download = `${model.extension?.["@_code"]}_Overzicht.pdf`;
                      a.click();
                    }}
                    className="inline-flex items-center px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(pdfPreviewUrl);
                      setPdfPreviewUrl(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-gray-100 p-4">
                <iframe 
                  src={`${pdfPreviewUrl}#toolbar=0`} 
                  className="w-full h-full rounded-lg border border-gray-300 shadow-inner bg-white"
                  title="PDF Preview"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

      {isAddingStandardTable && (
        <StandardTableModal onClose={() => setIsAddingStandardTable(false)} />
      )}

      {isAzureWizardOpen && (
        <AzureFunctionsWizard onClose={() => setIsAzureWizardOpen(false)} />
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
