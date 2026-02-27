import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, AlertCircle, ShieldCheck, Loader2, AlertTriangle, ChevronRight, Edit3, Eye, ChevronDown, ChevronUp, ListFilter } from 'lucide-react';
import AceEditor from 'react-ace';

import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

interface ValidationError {
  message: string;
  line: string;
  suggestion: string;
}

interface XmlViewerModalProps {
  xml: string;
  addedFieldIds?: string[];
  onClose: () => void;
}

export default function XmlViewerModal({ xml: initialXml, addedFieldIds = [], onClose }: XmlViewerModalProps) {
  const [xml, setXml] = useState(initialXml);
  const [copied, setCopied] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; message?: string; errors?: ValidationError[] } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const editorInstance = useRef<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const changedLines = xml.split('\n').map((line, i) => ({ line, index: i }))
    .filter(item => addedFieldIds.some(id => item.line.includes(id)));

  const jumpToLine = (index: number) => {
    if (isEditMode && editorInstance.current) {
      editorInstance.current.gotoLine(index + 1);
      editorInstance.current.focus();
    } else if (scrollContainerRef.current) {
      const lineElement = scrollContainerRef.current.querySelector(`[data-line="${index}"]`);
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(xml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      const res = await fetch('/api/validate-xml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xml }),
      });
      const data = await res.json();
      setValidationResult(data);
    } catch (error) {
      console.error(error);
      setValidationResult({
        isValid: false,
        message: 'Er is een fout opgetreden bij het valideren. Controleer of er een XSD is geüpload.'
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Simple validation check (just checking if it starts with <?)
  const isBasicValid = xml.trim().startsWith("<?xml");

  const renderHighlightedXml = () => {
    if (!addedFieldIds || addedFieldIds.length === 0) {
      return <code>{xml}</code>;
    }

    const lines = xml.split('\n');
    return (
      <code>
        {lines.map((line, i) => {
          const isHighlighted = addedFieldIds.some(id => line.includes(id));
          return (
            <div
              key={i}
              data-line={i}
              className={`${isHighlighted ? 'bg-yellow-400/20 text-yellow-100 -mx-6 px-6 py-0.5 border-l-2 border-yellow-400' : ''}`}
            >
              {line}
            </div>
          );
        })}
      </code>
    );
  };

  const hasErrors = validationResult && !validationResult.isValid && validationResult.errors && validationResult.errors.length > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`bg-white rounded-2xl shadow-2xl w-full h-[90vh] flex flex-col overflow-hidden transition-all duration-300 ${hasErrors || changedLines.length > 0 ? 'max-w-7xl' : 'max-w-5xl'}`}
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-heading font-semibold text-exact-dark">
                Gegenereerde XML
              </h2>
              {isBasicValid && !validationResult && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 font-sans">
                  <Check className="w-3 h-3 mr-1" />
                  Basis Structuur OK
                </span>
              )}
              {validationResult && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans ${validationResult.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {validationResult.isValid ? <Check className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                  {validationResult.isValid ? 'XSD Validatie Geslaagd' : 'XSD Validatie Gefaald'}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-sm font-medium rounded-md transition-colors ${
                  isEditMode 
                    ? 'border-exact-red text-exact-red bg-red-50 hover:bg-red-100' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                {isEditMode ? (
                  <>
                    <Eye className="w-4 h-4 mr-1.5" />
                    Bekijk Modus
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-1.5" />
                    Handmatig Wijzigen
                  </>
                )}
              </button>
              <button
                onClick={handleValidate}
                disabled={isValidating}
                className="inline-flex items-center px-3 py-1.5 border border-exact-blue shadow-sm text-sm font-medium rounded-md text-exact-blue bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-blue transition-colors disabled:opacity-50"
              >
                {isValidating ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                )}
                Valideer met XSD
              </button>
              <button
                onClick={handleCopy}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-exact-dark bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-blue transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5 text-green-500" />
                    Gekopieerd!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1.5 text-gray-400" />
                    Kopieer XML
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {validationResult && !validationResult.isValid && validationResult.message && !validationResult.errors && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-100 shrink-0">
              <p className="text-sm text-red-800 font-sans flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="whitespace-pre-wrap">{validationResult.message}</span>
              </p>
            </div>
          )}

          <div className="flex-1 flex overflow-hidden bg-slate-900">
            {/* Sidebar for Navigation */}
            {changedLines.length > 0 && (
              <div className="w-64 shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <ListFilter className="w-3 h-3 mr-2" /> Wijzigingen ({changedLines.length})
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {changedLines.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => jumpToLine(item.index)}
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

            <div 
              ref={scrollContainerRef}
              className={`flex-1 overflow-auto p-0 ${hasErrors ? 'border-r border-slate-700' : ''}`}
            >
              {isEditMode ? (
                <AceEditor
                  mode="xml"
                  theme="monokai"
                  name="xml-viewer-editor"
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
              ) : (
                <pre className="p-6 text-sm font-mono text-slate-300 whitespace-pre-wrap break-all">
                  {renderHighlightedXml()}
                </pre>
              )}
            </div>

            {hasErrors && (
              <div className="w-96 shrink-0 bg-white overflow-y-auto flex flex-col">
                <div className="p-4 bg-red-50 border-b border-red-100 sticky top-0">
                  <h3 className="text-sm font-heading font-semibold text-red-800 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Validatie Fouten
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {validationResult.errors?.map((err, idx) => (
                    <div key={idx} className="bg-white border border-red-200 rounded-lg p-3 shadow-sm">
                      <p className="text-sm font-medium text-gray-900 mb-1">{err.message}</p>
                      <div className="flex items-start mt-2 text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                        <ChevronRight className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span>{err.line}</span>
                      </div>
                      <div className="mt-3 text-sm text-gray-700 bg-blue-50 p-2 rounded border border-blue-100">
                        <span className="font-semibold text-exact-blue block mb-1">Suggestie:</span>
                        {err.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-exact-beige/30 flex justify-between items-center shrink-0">
            <div className="flex items-center text-sm text-gray-500 font-sans">
              <AlertCircle className="w-4 h-4 mr-1.5 text-exact-blue" />
              Deze XML is klaar om in Exact Online Premium te worden geïmporteerd. Gewijzigde regels zijn gemarkeerd.
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-exact-blue border border-transparent rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-blue transition-colors"
            >
              Sluiten
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
