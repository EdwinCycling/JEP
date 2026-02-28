import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface InfoModalProps {
  type: 'disclaimer' | 'cookies' | 'team';
  onClose: () => void;
}

export default function InfoModal({ type, onClose }: InfoModalProps) {
  const content = {
    disclaimer: {
      title: 'Disclaimer',
      text: 'De informatie in deze applicatie is uitsluitend bedoeld voor algemene informatiedoeleinden. Hoewel we ernaar streven de informatie actueel en correct te houden, geven we geen verklaringen of garanties van welke aard dan ook, expliciet of impliciet, over de volledigheid, nauwkeurigheid, betrouwbaarheid, geschiktheid of beschikbaarheid met betrekking tot de applicatie of de informatie, producten, diensten of gerelateerde afbeeldingen in de applicatie voor welk doel dan ook. Elk vertrouwen dat u in dergelijke informatie stelt, is daarom strikt op eigen risico.'
    },
    cookies: {
      title: 'Cookies',
      text: 'Deze applicatie maakt gebruik van functionele cookies om de gebruikerservaring te verbeteren. We gebruiken geen tracking cookies of cookies van derden voor advertentiedoeleinden. Door deze applicatie te gebruiken, gaat u akkoord met ons gebruik van deze noodzakelijke cookies.'
    },
    team: {
      title: 'Het Team',
      text: 'Deze applicatie is ontwikkeld door een gepassioneerd team van experts op het gebied van Exact Online onder leiding van Edwin. Ons doel is om partners te helpen efficiënter en effectiever te werken met Exact Online Premium extensies.'
    }
  };

  const { title, text } = content[type];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
            <h2 className="text-xl font-heading font-semibold text-exact-dark">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-auto">
            <p className="text-gray-600 font-sans leading-relaxed">
              {text}
            </p>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-exact-beige/30 flex justify-end">
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
