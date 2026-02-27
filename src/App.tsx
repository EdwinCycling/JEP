import React, { useState } from "react";
import { useJEPStore } from "./store";
import UploadArea from "./components/UploadArea";
import Dashboard from "./components/Dashboard";
import XsdManagerModal from "./components/XsdManagerModal";
import InfoModal from "./components/InfoModal";
import CookieConsent from "./components/CookieConsent";
import { FileCode, Menu, X, Info, FilePlus, LogOut, CreditCard, Download, Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import LandingPage from "./components/LandingPage";
import ToastContainer from "./components/ToastContainer";
import PricingModal from "./components/PricingModal";

export default function App() {
  const model = useJEPStore((state) => state.model);
  const [isManagingXsd, setIsManagingXsd] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState<'disclaimer' | 'cookies' | 'team' | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [confirmAction, setConfirmAction] = useState<'new' | 'exit' | null>(null);

  const handleNewFile = () => {
    useJEPStore.getState().setModel(null as any);
    setIsMenuOpen(false);
    setShowLanding(false);
    setConfirmAction(null);
  };

  const handleExit = () => {
    useJEPStore.getState().setModel(null as any);
    setIsMenuOpen(false);
    setShowLanding(true);
    setConfirmAction(null);
  };

  const handleDownloadAndAction = async (action: 'new' | 'exit') => {
    // Trigger download
    const fetchXml = async () => {
      const res = await fetch("/api/build-xml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonObj: model }),
      });
      const { xml } = await res.json();
      return xml;
    };

    try {
      const xml = await fetchXml();
      const blob = new Blob([xml], { type: "text/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ExactExtension_Backup.xml";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (action === 'new') handleNewFile();
      else handleExit();
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const handleStartDesigning = () => {
    setShowLanding(false);
  };

  if (showLanding && !model) {
    return <LandingPage onStart={handleStartDesigning} />;
  }

  return (
    <div className="h-screen flex flex-col bg-exact-beige font-sans text-exact-dark overflow-hidden">
      <header className="bg-white shrink-0 z-20 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative">
          <div 
            className="flex items-center space-x-4 z-10 cursor-pointer group"
            onClick={() => setShowLanding(true)}
          >
            {/* New Exact Logo Motif (Pluses) */}
            <div className="w-10 h-10 bg-exact-red rounded-xl flex items-center justify-center shadow-md relative overflow-hidden group-hover:scale-110 transition-transform">
              <div className="absolute top-2 left-2 w-1 h-3 bg-white rounded-sm opacity-90"></div>
              <div className="absolute top-3 left-1 w-3 h-1 bg-white rounded-sm opacity-90"></div>
              
              <div className="absolute top-2 right-2 w-0.5 h-2 bg-white rounded-sm opacity-80"></div>
              <div className="absolute top-2.5 right-1.5 w-2 h-0.5 bg-white rounded-sm opacity-80"></div>
              
              <div className="absolute bottom-2 left-2 w-0.5 h-2 bg-white rounded-sm opacity-80"></div>
              <div className="absolute bottom-2.5 left-1.5 w-2 h-0.5 bg-white rounded-sm opacity-80"></div>
              
              <div className="absolute bottom-2 right-2 w-1 h-3 bg-white rounded-sm opacity-70"></div>
              <div className="absolute bottom-3 right-1 w-3 h-1 bg-white rounded-sm opacity-70"></div>
            </div>
            <span className="text-xl font-heading font-semibold text-exact-dark tracking-tight">
              Precies <span className="font-normal text-gray-500">Premium Extension</span>
            </span>
          </div>

          {/* Center - Dutch Street Sign */}
          <div className="absolute left-1/2 -translate-x-1/2 z-0 hidden md:block">
            <a 
              href="https://www.exact.com/nl/software/exact-online/premium"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-[#0a2342] text-white px-6 py-1.5 rounded-md hover:scale-105 transition-transform cursor-pointer relative group"
              style={{ 
                boxShadow: 'inset 0 0 0 2px white',
                border: '3px solid #0a2342'
              }}
              title="Naar Exact Online Premium"
            >
              <span className="font-sans font-bold tracking-wider text-sm">Exact Online Premium</span>
            </a>
          </div>

          <div className="flex items-center z-10">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500 hover:text-exact-dark hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-20 right-4 sm:right-6 lg:right-8 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
            >
              <button
                onClick={() => {
                  if (model) {
                    setConfirmAction('exit');
                  } else {
                    setShowLanding(true);
                  }
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-exact-dark hover:bg-gray-50 flex items-center transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3 text-exact-red" />
                Afsluiten
              </button>
              {model && (
                <button
                  onClick={() => {
                    setConfirmAction('new');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-exact-dark hover:bg-gray-50 flex items-center transition-colors"
                >
                  <FilePlus className="w-4 h-4 mr-3 text-exact-blue" />
                  Nieuw Bestand
                </button>
              )}
              <button
                onClick={() => {
                  setIsManagingXsd(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-exact-dark hover:bg-gray-50 flex items-center transition-colors"
              >
                <FileCode className="w-4 h-4 mr-3 text-exact-blue" />
                Update XSD
              </button>
              <button
                onClick={() => {
                  setIsPricingOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-exact-dark hover:bg-gray-50 flex items-center transition-colors"
              >
                <CreditCard className="w-4 h-4 mr-3 text-exact-gold" />
                Pricing
              </button>
              <div className="h-px bg-gray-100 my-1"></div>
              <button
                onClick={() => {
                  setInfoModalType('team');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-exact-dark hover:bg-gray-50 flex items-center transition-colors"
              >
                <Info className="w-4 h-4 mr-3 text-exact-purple" />
                About
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative Bar */}
        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-exact-purple"></div>
          <div className="h-full w-1/3 bg-exact-red"></div>
          <div className="h-full w-1/3 bg-exact-gold"></div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {!model ? <UploadArea /> : <Dashboard />}
      </main>

      <footer className="bg-white shrink-0 border-t border-gray-200 py-4 z-10">
        <div className="max-w-7xl mx-auto px-4 flex justify-center space-x-8 text-sm font-medium text-gray-500">
          <button onClick={() => setInfoModalType('disclaimer')} className="hover:text-exact-dark transition-colors">Disclaimer</button>
          <button onClick={() => setInfoModalType('cookies')} className="hover:text-exact-dark transition-colors">Cookies</button>
          <button onClick={() => setInfoModalType('team')} className="hover:text-exact-dark transition-colors">Het team</button>
        </div>
      </footer>

      {isManagingXsd && (
        <XsdManagerModal onClose={() => setIsManagingXsd(false)} />
      )}

      {isPricingOpen && (
        <PricingModal onClose={() => setIsPricingOpen(false)} />
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-exact-red/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-exact-red" />
              </div>
              <h3 className="text-lg font-heading font-bold text-exact-dark mb-2">
                {confirmAction === 'new' ? 'Nieuw bestand aanmaken?' : 'Afsluiten?'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Alle niet-opgeslagen wijzigingen gaan verloren. Wilt u de huidige XML eerst bewaren?
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleDownloadAndAction(confirmAction)}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-exact-blue rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Bewaar XML & {confirmAction === 'new' ? 'Nieuw' : 'Sluit'}
                </button>
                <button
                  onClick={() => confirmAction === 'new' ? handleNewFile() : handleExit()}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-exact-red bg-exact-red/5 rounded-lg hover:bg-exact-red/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Niet bewaren, alles verwijderen
                </button>
                <button
                  onClick={() => setConfirmAction(null)}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {infoModalType && (
        <InfoModal type={infoModalType} onClose={() => setInfoModalType(null)} />
      )}

      <ToastContainer />
      <CookieConsent />
    </div>
  );
}
