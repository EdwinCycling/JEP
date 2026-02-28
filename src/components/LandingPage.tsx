import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, 
  Eye, 
  CheckCircle, 
  Database, 
  ArrowRight, 
  ChevronRight, 
  Users, 
  Zap, 
  ShieldCheck,
  FileCode,
  X
} from 'lucide-react';

import { APP_VERSION } from '../config';

interface LandingPageProps {
  onStart: () => void;
}

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden"
        >
          <div className="p-8 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-2xl font-heading font-bold text-exact-dark">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
          <div className="p-8 max-h-[60vh] overflow-y-auto prose prose-slate">
            {children}
          </div>
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-exact-dark text-white rounded-xl font-bold hover:bg-black transition-colors"
            >
              Sluiten
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [modalType, setModalType] = useState<'privacy' | 'voorwaarden' | 'contact' | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F1ED] text-[#262626] font-sans selection:bg-exact-red selection:text-white overflow-x-hidden">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#E30613] rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">=</span>
            </div>
            <span className="text-xl font-heading font-bold tracking-tight">
              Jouw <span className="text-[#E30613]">Exact</span> Partner
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a href="#features" className="hover:text-[#E30613] transition-colors">Functies</a>
            <a href="#magic" className="hover:text-[#E30613] transition-colors">XML Magic</a>
            <a href="#quotes" className="hover:text-[#E30613] transition-colors">Ervaringen</a>
            <button 
              onClick={onStart}
              className="px-6 py-2.5 bg-[#0046AD] text-white rounded-lg font-semibold hover:bg-blue-800 transition-all shadow-md hover:shadow-lg"
            >
              Start Nu
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0046AD] blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8F13FE] blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center px-4 py-1.5 bg-[#E30613]/10 text-[#E30613] rounded-full text-xs font-bold uppercase tracking-widest border border-[#E30613]/20">
                Nieuw: Nu met volledige Custom Entity ondersteuning
              </motion.div>
              <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-heading font-bold leading-[1.1] tracking-tight">
                Beheers de Kracht van <span className="text-[#E30613]">Exact Online Premium.</span> Zonder de XML-hoofdpijn.
              </motion.h1>
              <motion.p variants={itemVariants} className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Visualiseer, bewerk en valideer je ERP-extensies in een handomdraai. Jouw Exact Partner maakt low-code écht toegankelijk.
              </motion.p>
              <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                <button 
                  onClick={onStart}
                  className="px-8 py-4 bg-[#E30613] text-white rounded-xl font-bold text-lg flex items-center hover:bg-red-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  Start met Ontwerpen
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </motion.div>
            </motion.div>

            {/* Hero Visual: XML to Card Transformation */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative z-10 bg-white/40 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl p-8 aspect-square flex items-center justify-center overflow-hidden group">
                {/* XML Side (Left) */}
                <div className="absolute inset-y-0 left-0 w-1/2 bg-[#262626] p-6 font-mono text-[10px] text-emerald-400 overflow-hidden opacity-40 group-hover:opacity-60 transition-opacity">
                  <div className="space-y-1">
                    <p>&lt;extension code="PREMIUM_EXT"&gt;</p>
                    <p className="ml-4">&lt;entities&gt;</p>
                    <p className="ml-8">&lt;entity name="Project"&gt;</p>
                    <p className="ml-12">&lt;property name="CustomField"&gt;</p>
                    <p className="ml-16">&lt;caption&gt;Klant Prioriteit&lt;/caption&gt;</p>
                    <p className="ml-16">&lt;type&gt;String&lt;/type&gt;</p>
                    <p className="ml-12">&lt;/property&gt;</p>
                    <p className="ml-8">&lt;/entity&gt;</p>
                    <p className="ml-4">&lt;/entities&gt;</p>
                    <p>&lt;/extension&gt;</p>
                  </div>
                  {/* Floating XML Tags */}
                  <motion.div 
                    animate={{ 
                      x: [0, 100, 200], 
                      y: [0, -50, 0],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.2, 0.8]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/4 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded text-emerald-300 text-xs"
                  >
                    &lt;property /&gt;
                  </motion.div>
                </div>

                {/* Visual Card Side (Right) */}
                <div className="absolute inset-y-0 right-0 w-1/2 bg-white p-6 flex flex-col justify-center">
                  <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-lg"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-[#E30613] rounded-lg flex items-center justify-center">
                        <Database className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-sm">Project Veld</span>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 w-2/3 bg-gray-200 rounded"></div>
                      <div className="h-8 w-full bg-white border border-gray-200 rounded-md flex items-center px-3 text-xs text-gray-400">
                        Klant Prioriteit
                      </div>
                      <div className="flex justify-between">
                        <div className="h-2 w-1/4 bg-gray-200 rounded"></div>
                        <div className="h-2 w-1/3 bg-[#0046AD]/20 rounded"></div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Center Divider Line */}
                <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent z-20"></div>
                
                {/* Flowing Particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        x: [-100, 400],
                        y: [Math.random() * 400, Math.random() * 400],
                        opacity: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        delay: i * 0.6,
                        ease: "easeInOut"
                      }}
                      className="absolute w-1 h-1 bg-[#E30613] rounded-full"
                    />
                  ))}
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#DFA800] rounded-full blur-3xl opacity-30"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#8F13FE] rounded-full blur-3xl opacity-20"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-heading font-bold mb-4 tracking-tight">De Drie Krachten</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Alles wat je nodig hebt om Exact Online Premium extensies te bouwen als een pro.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Visueel Inzicht",
                desc: "Bekijk je data-model zoals het bedoeld is. Geen droge XML-lijsten, maar een intuïtief dashboard van je entiteiten en velden.",
                icon: <Eye className="w-6 h-6" />,
                color: "bg-[#E30613]"
              },
              {
                title: "Foutloze Editor",
                desc: "Wijzig captions, voeg keuzelijsten toe of creëer nieuwe entiteiten. Onze editor bewaakt de XSD-regels, zodat jij nooit een fout maakt.",
                icon: <Code className="w-6 h-6" />,
                color: "bg-[#0046AD]"
              },
              {
                title: "Real-time Validatie",
                desc: "Directe feedback tegen de officiële Exact-standaarden. Groen licht betekent 100% succesvolle import.",
                icon: <CheckCircle className="w-6 h-6" />,
                color: "bg-[#DFA800]"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 bg-[#F3F1ED] rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all group"
              >
                <div className={`w-14 h-14 ${feature.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* XML Magic Section */}
      <section id="magic" className="py-32 bg-[#F3F1ED] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-12 md:p-20 space-y-8">
              <div className="inline-block px-4 py-1 bg-[#8F13FE]/10 text-[#8F13FE] rounded-full text-xs font-bold uppercase tracking-widest">
                XML Magic
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight">
                Handmatige controle, <span className="text-[#E30613]">visuele perfectie.</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Schakel moeiteloos tussen de visuele editor en de rauwe XML-code. Wijzigingen in de code worden direct vertaald naar je dashboard, en andersom.
              </p>
              <div className="space-y-4">
                {[
                  "Directe synchronisatie",
                  "Intelligente code-suggesties",
                  "XSD-schema handhaving"
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 bg-[#262626] p-8 relative min-h-[400px]">
              {/* Glassmorphism Editor Preview */}
              <div className="absolute inset-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="h-10 bg-white/10 border-b border-white/10 flex items-center px-4 space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                  <span className="ml-4 text-[10px] text-white/40 font-mono">Extensions.xml</span>
                </div>
                <div className="p-6 font-mono text-sm text-blue-300/80">
                  <p className="text-purple-400">&lt;extension&gt;</p>
                  <p className="ml-4 text-purple-400">&lt;entities&gt;</p>
                  <p className="ml-8 text-purple-400">&lt;entity <span className="text-orange-300">name</span>=<span className="text-emerald-400">"Project"</span>&gt;</p>
                  <p className="ml-12 text-gray-500">// Jouw wijzigingen hier...</p>
                  <motion.div 
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="ml-12 w-2 h-5 bg-[#E30613] inline-block align-middle"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quotes Section */}
      <section id="quotes" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-heading font-bold mb-4 tracking-tight">Geloofd door Experts</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                text: "Eindelijk een tool die begrijpt dat een consultant geen programmeur is. Jouw Exact Partner bespaart ons uren aan debug-werk.",
                author: "Marc D.",
                role: "Senior ERP Consultant"
              },
              {
                text: "De visualisatie van workflows gaf ons direct inzicht in de knelpunten van onze klantextensies. Onmisbaar voor Premium gebruikers.",
                author: "Sanne V.",
                role: "Exact Partner"
              }
            ].map((quote, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative p-12 bg-[#F3F1ED] rounded-[3rem] border border-gray-100"
              >
                <div className="absolute -top-6 left-12 text-8xl text-[#E30613] font-serif opacity-20">“</div>
                <p className="text-xl text-gray-700 italic leading-relaxed mb-8 relative z-10">
                  {quote.text}
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                    {quote.author[0]}
                  </div>
                  <div>
                    <div className="font-bold text-[#262626]">{quote.author}</div>
                    <div className="text-sm text-gray-500">{quote.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            whileInView={{ scale: [0.95, 1] }}
            className="bg-[#E30613] rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden"
          >
            {/* Decorative Motif */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 relative z-10">
              Klaar om je Exact Online Premium <br className="hidden md:block" /> ervaring te transformeren?
            </h2>
            <div className="flex flex-wrap justify-center gap-6 relative z-10">
              <button 
                onClick={onStart}
                className="px-10 py-5 bg-white text-[#E30613] rounded-2xl font-bold text-xl hover:bg-gray-100 transition-all shadow-xl hover:scale-105"
              >
                Start Gratis Ontwerp
              </button>
              <a 
                href="https://www.exact.com/nl/probeer"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-2xl font-bold text-xl hover:bg-white/10 transition-all inline-block"
              >
                Praat met een Expert
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#E30613] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">=</span>
              </div>
              <span className="text-lg font-heading font-bold tracking-tight">
                Jouw <span className="text-[#E30613]">Exact</span> Partner
              </span>
            </div>
            <div className="flex space-x-8 text-sm font-medium text-gray-500">
              <button onClick={() => setModalType('privacy')} className="hover:text-[#E30613] transition-colors">Privacy</button>
              <button onClick={() => setModalType('voorwaarden')} className="hover:text-[#E30613] transition-colors">Voorwaarden</button>
              <button onClick={() => setModalType('contact')} className="hover:text-[#E30613] transition-colors">Contact</button>
            </div>
            <div className="text-sm text-gray-400 font-medium">
              Gebouwd voor de consultants van de toekomst.
            </div>
          </div>
          
          {/* Decorative Bottom Bar */}
          <div className="mt-16 h-1.5 w-full flex rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-[#8F13FE]"></div>
            <div className="h-full w-1/3 bg-[#E30613]"></div>
            <div className="h-full w-1/3 bg-[#DFA800]"></div>
          </div>
          
          <div className="mt-8 flex justify-between items-center text-xs text-gray-400">
            <div>&copy; {new Date().getFullYear()} Jouw Exact Partner. Alle rechten voorbehouden.</div>
            <div className="font-mono">v{APP_VERSION}</div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Modal 
        isOpen={modalType === 'privacy'} 
        onClose={() => setModalType(null)} 
        title="Privacybeleid"
      >
        <p>Bij Jouw Exact Partner nemen we uw privacy serieus. Deze applicatie is ontworpen om lokaal in uw browser te werken voor maximale veiligheid.</p>
        <h4>Dataverwerking</h4>
        <p>Wij slaan geen XML-bestanden of bedrijfsgegevens op onze servers op. Alle verwerking vindt plaats in uw tijdelijke sessie.</p>
        <h4>Cookies</h4>
        <p>We gebruiken alleen functionele cookies om uw voorkeuren (zoals taal en sessie-instellingen) te onthouden.</p>
      </Modal>

      <Modal 
        isOpen={modalType === 'voorwaarden'} 
        onClose={() => setModalType(null)} 
        title="Algemene Voorwaarden"
      >
        <p>Door gebruik te maken van de Precies Premium Extension tool gaat u akkoord met de volgende voorwaarden:</p>
        <ul>
          <li>De tool wordt geleverd "zoals deze is" zonder expliciete garanties.</li>
          <li>U bent zelf verantwoordelijk voor de validatie van de gegenereerde XML voordat u deze importeert in een productie-omgeving.</li>
          <li>Het is niet toegestaan de tool te gebruiken voor illegale doeleinden of reverse engineering.</li>
        </ul>
      </Modal>

      <Modal 
        isOpen={modalType === 'contact'} 
        onClose={() => setModalType(null)} 
        title="Contact & Ondersteuning"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-blue-900 mb-1">Professionele Ondersteuning</h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                Klanten kunnen terecht bij <strong>Exact Partners</strong> voor volledige ondersteuning en begeleiding bij de implementatie van hun Exact Online Premium extensies.
              </p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100">
            <div className="font-bold">Over de applicatie</div>
            <div className="text-sm text-gray-500 leading-relaxed">
              Deze applicatie is ontwikkeld door een gepassioneerd team van experts op het gebied van Exact Online onder leiding van Edwin. Ons doel is om partners te helpen efficiënter en effectiever te werken met Exact Online Premium extensies.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LandingPage;
