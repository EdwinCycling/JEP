import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Star, Zap, Shield, Globe, Users, MessageSquare, Heart } from 'lucide-react';

interface PricingModalProps {
  onClose: () => void;
}

export default function PricingModal({ onClose }: PricingModalProps) {
  const features = [
    { icon: <Zap className="w-5 h-5 text-yellow-500" />, title: "Real-time XML Generatie", desc: "Direct resultaat bij elke wijziging in uw model." },
    { icon: <Shield className="w-5 h-5 text-blue-500" />, title: "XSD Validatie", desc: "Altijd foutloze bestanden die voldoen aan de Exact standaarden." },
    { icon: <Globe className="w-5 h-5 text-green-500" />, title: "Custom Entities", desc: "Maak moeiteloos nieuwe tabellen en menu's aan." },
    { icon: <Users className="w-5 h-5 text-purple-500" />, title: "Multi-user Support", desc: "Werk samen met uw team aan complexe extensies." },
    { icon: <MessageSquare className="w-5 h-5 text-pink-500" />, title: "AI Assistentie", desc: "Krijg uitleg en suggesties bij uw XML configuratie." },
    { icon: <Star className="w-5 h-5 text-orange-500" />, title: "Premium UI/UX", desc: "Een intuïtieve interface ontworpen voor productiviteit." },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row"
        >
          {/* Left Side: Showcase */}
          <div className="md:w-1/2 bg-exact-blue p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-3xl"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-exact-purple blur-3xl"></div>
            </div>
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="mb-8">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-widest mb-4">
                  Showcase
                </div>
                <h2 className="text-4xl font-heading font-bold mb-4 leading-tight">
                  De Ultieme Tool voor Exact Online Premium
                </h2>
                <p className="text-blue-100 text-lg">
                  Alles wat u nodig heeft om uw Exact Online omgeving naar een hoger niveau te tillen.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 mt-auto">
                {features.slice(0, 3).map((f, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="p-2 bg-white/10 rounded-lg shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{f.title}</h4>
                      <p className="text-sm text-blue-100/80">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Pricing */}
          <div className="md:w-1/2 p-8 flex flex-col bg-gray-50">
            <div className="flex justify-end mb-4">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-heading font-bold text-exact-dark mb-2">Eenvoudige Prijsstelling</h3>
              <p className="text-gray-500">Geen verborgen kosten, geen abonnementen.</p>
            </div>

            <div className="bg-white rounded-2xl border-2 border-exact-blue p-8 shadow-lg relative mb-8">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-exact-blue text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Meest Gekozen
              </div>
              
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-exact-dark">€0</span>
                <span className="text-gray-400 ml-2">/ altijd</span>
              </div>

              <div className="space-y-4 mb-8">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mr-3 shrink-0" />
                    {f.title}
                  </div>
                ))}
                <div className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-3 shrink-0" />
                  Onbeperkt aantal projecten
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 bg-exact-blue text-white rounded-xl font-bold text-lg hover:bg-blue-800 transition-all shadow-lg shadow-blue-200"
              >
                Gratis beschikbaar!
              </button>
            </div>

            <div className="mt-auto text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
                <Heart className="w-4 h-4 text-exact-red fill-exact-red" />
                <span>Gemaakt voor de Exact Community</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
