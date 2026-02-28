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
  Database
} from 'lucide-react';

export default function SettingsEditor() {
  const { model, updateModel, addChangelog } = useJEPStore();
  
  const translations = model?.extension?.translationextensions?.translation || [];
  const translationsArray = Array.isArray(translations) ? translations : [translations].filter(Boolean);

  const divisionSettings = model?.extension?.divisionsettingsextensions?.tab || [];
  const divisionSettingsArray = Array.isArray(divisionSettings) ? divisionSettings : [divisionSettings].filter(Boolean);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-exact-beige/30">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <Settings className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-exact-dark">Instellingen & Vertalingen</h1>
            <p className="text-sm text-gray-500 font-sans">Beheer division settings en meertalige teksten voor je extensie.</p>
          </div>
        </div>

        {/* Division Settings Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-5 h-5 text-exact-gold" />
              <h2 className="text-lg font-heading font-bold text-exact-dark">Division Settings</h2>
            </div>
            <button className="text-xs font-bold text-exact-blue hover:underline flex items-center">
              <Plus className="w-3 h-3 mr-1" /> Tab Toevoegen
            </button>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
            {divisionSettingsArray.length > 0 ? (
              <div className="text-left space-y-4">
                {divisionSettingsArray.map((tab: any, i: number) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-exact-dark">{tab["@_caption"]}</span>
                      <span className="ml-2 text-[10px] text-gray-400 font-mono">ID: {tab["@_id"]}</span>
                    </div>
                    <button className="text-gray-400 hover:text-exact-red"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8">
                <Database className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-sm text-gray-400 font-sans italic">Nog geen division settings gedefinieerd.</p>
              </div>
            )}
          </div>
        </section>

        {/* Translations Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Languages className="w-5 h-5 text-exact-purple" />
              <h2 className="text-lg font-heading font-bold text-exact-dark">Vertalingen</h2>
            </div>
            <button className="text-xs font-bold text-exact-blue hover:underline flex items-center">
              <Plus className="w-3 h-3 mr-1" /> Vertaling Toevoegen
            </button>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
            {translationsArray.length > 0 ? (
              <div className="text-left space-y-4">
                {translationsArray.map((trans: any, i: number) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-mono text-xs font-bold text-blue-600">{trans["@_id"]}</span>
                      <button className="text-gray-400 hover:text-exact-red"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {(Array.isArray(trans.language) ? trans.language : [trans.language]).map((lang: any, j: number) => (
                        <div key={j} className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase w-8">{lang["@_code"]}</span>
                          <span className="text-sm text-exact-dark">{lang["#text"]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8">
                <Globe className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-sm text-gray-400 font-sans italic">Nog geen vertalingen toegevoegd.</p>
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
