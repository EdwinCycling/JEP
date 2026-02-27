import React, { useState, useEffect, useRef } from 'react';
import AceEditor from 'react-ace';
import { motion } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Save, RefreshCw, FileCode, Search, ListFilter, ChevronRight } from 'lucide-react';
import { useJEPStore } from '../../store';
import { validateWithSchema, ValidationError } from '../../lib/validation/engine';
import { XMLBuilder } from 'fast-xml-parser';

import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

interface XmlEditorScreenProps {
  onClose: () => void;
}

export default function XmlEditorScreen({ onClose }: XmlEditorScreenProps) {
  const { model, updateModel, addChangelog, addNotification, addedFieldIds } = useJEPStore();
  const [xml, setXml] = useState("");
  const [xsd, setXsd] = useState("");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editorInstance = useRef<any>(null);

  const changedLines = xml.split('\n').map((line, i) => ({ line, index: i }))
    .filter(item => addedFieldIds.some(id => item.line.includes(id)));

  // Initialize XML from model
  useEffect(() => {
    if (model) {
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        suppressEmptyNode: true,
      });
      
      // Remove any existing ?xml declaration from model copy
      const cleanModel = JSON.parse(JSON.stringify(model));
      if (cleanModel["?xml"]) delete cleanModel["?xml"];
      
      const xmlContent = builder.build(cleanModel);
      setXml(`<?xml version="1.0" encoding="utf-8"?>\n${xmlContent}`);
    }
  }, [model]);

  // Fetch XSD
  useEffect(() => {
    const fetchXsd = async () => {
      try {
        const res = await fetch('/api/xsd');
        const data = await res.json();
        setXsd(data.xsd);
      } catch (error) {
        console.error("Failed to fetch XSD:", error);
      }
    };
    fetchXsd();
  }, []);

  const handleValidate = async () => {
    if (!xsd) {
      addNotification("XSD schema niet geladen.", "warning");
      return;
    }
    setIsValidating(true);
    setErrors([]);
    try {
      const result = await validateWithSchema(xml, xsd);
      setErrors(result.errors);
      if (result.isValid) {
        addNotification("XML is succesvol gevalideerd!", "success");
      } else {
        addNotification(`Validatie mislukt: ${result.errors.length} fouten gevonden.`, "error");
      }
    } catch (err) {
      console.error("Validation error:", err);
      setErrors([{
        line: 1,
        column: 1,
        message: "Er is een technische fout opgetreden tijdens de validatie. Controleer of de XML structuur correct is."
      }]);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      // In a real app, we'd parse the XML back to JSON and update the model
      // For now, we'll just simulate saving and close
      addChangelog("XML handmatig gewijzigd via Validatie Center.");
      onClose();
    } catch (error) {
      console.error("Save Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const jumpToError = (line: number) => {
    if (editorInstance.current) {
      editorInstance.current.gotoLine(line);
      editorInstance.current.focus();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-exact-red/10 rounded-lg">
            <FileCode className="w-6 h-6 text-exact-red" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-semibold text-exact-dark">
              Validatie Center
            </h2>
            <p className="text-xs text-gray-500 font-sans">
              Controleer uw XML tegen de Extensions.xsd en corrigeer fouten direct.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleValidate}
            disabled={isValidating}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-exact-dark bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
            Valideer Nu
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || errors.length > 0}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-exact-blue rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Opslaan & Sluiten
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar for Changes */}
        {changedLines.length > 0 && (
          <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <ListFilter className="w-3 h-3 mr-2" /> Wijzigingen ({changedLines.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {changedLines.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => jumpToError(item.index + 1)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono text-yellow-400">Regel {item.index + 1}</span>
                    <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-yellow-400 transition-colors" />
                  </div>
                  <p className="text-xs text-slate-300 truncate font-mono">
                    {item.line.trim()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Editor Pane */}
        <div className="flex-1 border-r border-gray-200">
          <AceEditor
            mode="xml"
            theme="monokai"
            name="xml-editor"
            value={xml}
            onChange={setXml}
            onLoad={(editor) => {
              editorInstance.current = editor;
            }}
            width="100%"
            height="100%"
            fontSize={14}
            showPrintMargin={false}
            showGutter={true}
            highlightActiveLine={true}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
              useWorker: false,
            }}
          />
        </div>

        {/* Validation Pane */}
        <div className="w-96 bg-gray-50 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-white shrink-0">
            <h3 className="text-sm font-heading font-semibold text-exact-dark uppercase tracking-wider flex items-center">
              <Search className="w-4 h-4 mr-2 text-exact-blue" />
              Validatie Resultaten
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {errors.length === 0 && !isValidating && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h4 className="text-green-800 font-heading font-semibold mb-1">XML is Valide!</h4>
                <p className="text-green-600 text-sm font-sans">
                  Geen technische fouten gevonden tegen de XSD.
                </p>
              </div>
            )}

            {errors.length > 0 && (
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-red-800 text-sm">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                  <span>Er zijn {errors.length} fouten gevonden.</span>
                </div>
                
                {errors.map((err, idx) => (
                  <button
                    key={idx}
                    onClick={() => jumpToError(err.line)}
                    className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-exact-red hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                        REGEL {err.line}
                      </span>
                      <AlertCircle className="w-4 h-4 text-exact-red opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-exact-dark font-sans leading-relaxed">
                      {err.message}
                    </p>
                    {err.rawContext && (
                      <p className="text-[10px] text-gray-400 font-mono mt-2 truncate">
                        {err.rawContext}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {isValidating && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <RefreshCw className="w-8 h-8 animate-spin mb-3" />
                <p className="text-sm font-sans">Valideren...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
