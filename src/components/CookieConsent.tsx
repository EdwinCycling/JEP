import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white w-full h-[50vh] rounded-t-[2rem] shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="p-8 md:p-12 flex-1 overflow-y-auto max-w-5xl mx-auto w-full">
            <h2 className="text-3xl font-heading font-bold text-exact-dark mb-6">
              Wij gebruiken cookies
            </h2>
            <p className="text-lg text-gray-600 font-sans leading-relaxed mb-6">
              Deze applicatie maakt gebruik van functionele cookies om de gebruikerservaring te verbeteren en uw voorkeuren te onthouden. 
              We gebruiken <strong>geen</strong> tracking cookies of cookies van derden voor advertentiedoeleinden.
            </p>
            <p className="text-lg text-gray-600 font-sans leading-relaxed mb-6">
              Door deze applicatie te gebruiken, gaat u akkoord met ons gebruik van deze noodzakelijke cookies.
            </p>
          </div>
          <div className="p-8 border-t border-gray-100 bg-gray-50 flex justify-center shrink-0">
            <button
              onClick={handleAccept}
              className="px-10 py-4 text-lg font-medium text-white bg-exact-red rounded-xl hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/30 transition-all shadow-lg hover:shadow-xl w-full max-w-md"
            >
              Accepteren en doorgaan
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
