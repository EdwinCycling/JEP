import React, { useState } from 'react';
import { useJEPStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud, 
  Plus, 
  Trash2, 
  Code2, 
  Globe, 
  CheckCircle2, 
  X, 
  ChevronRight,
  Zap,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface AzureFunctionsWizardProps {
  onClose: () => void;
}

export default function AzureFunctionsWizard({ onClose }: AzureFunctionsWizardProps) {
  const { model, updateModel, addNotification, addChangelog } = useJEPStore();
  const [step, setStep] = useState(1);
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [selectedExample, setSelectedExample] = useState<string>('generic');
  const [functionName, setFunctionName] = useState('');
  const [functionUrl, setFunctionUrl] = useState('');
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);

  const examples = {
    generic: {
      name: "Generieke Validatie",
      description: "Een basis template voor elke validatie.",
      logic: `
    // De data bevat alle velden van de ${selectedEntity || 'Entiteit'}
    // Voorbeeld: string name = data?.Name;

    bool isValid = true; 
    string errorMessage = "";

    // VOEG HIER JE LOGICA TOE
    // if (string.IsNullOrEmpty(name)) { isValid = false; errorMessage = "Naam is verplicht!"; }
      `
    },
    vat: {
      name: "BTW-nummer Controle",
      description: "Valideert het BTW-nummer via de VIES API.",
      logic: `
    string vatNumber = data?.VATNumber;
    if (string.IsNullOrEmpty(vatNumber)) {
        return new OkObjectResult(new { isValid = true }); // Optioneel veld
    }

    // Voorbeeld VIES API aanroep logic
    log.LogInformation($"Validating VAT: {vatNumber}");
    
    // Simpele regex check als fallback
    bool isValid = System.Text.RegularExpressions.Regex.IsMatch(vatNumber, @"^[A-Z]{2}[0-9A-Z]{2,12}$");
    string errorMessage = isValid ? "" : "Ongeldig BTW-nummer formaat.";

    return new OkObjectResult(new {
        isValid = isValid,
        message = errorMessage
    });
      `
    },
    kvk: {
      name: "KVK-nummer Check",
      description: "Controleert of het KVK-nummer uit 8 cijfers bestaat.",
      logic: `
    string kvkNumber = data?.KVKNumber;
    if (string.IsNullOrEmpty(kvkNumber)) {
        return new OkObjectResult(new { isValid = true });
    }

    bool isValid = System.Text.RegularExpressions.Regex.IsMatch(kvkNumber, @"^[0-9]{8}$");
    string errorMessage = isValid ? "" : "KVK-nummer moet exact 8 cijfers bevatten.";

    return new OkObjectResult(new {
        isValid = isValid,
        message = errorMessage
    });
      `
    }
  };

  const entities = model?.extension?.entities?.entity || [];
  const customEntities = model?.extension?.customentities?.customentity || [];
  const allEntities = [
    ...(Array.isArray(entities) ? entities : [entities]), 
    ...(Array.isArray(customEntities) ? customEntities : [customEntities])
  ].filter(Boolean);

  const handleAddValidation = () => {
    if (!selectedEntity || !functionName || !functionUrl) return;

    updateModel((m) => {
      if (!m.extension) return;
      
      // Ensure businesscomponentextensions exists
      if (!m.extension.businesscomponentextensions) {
        m.extension.businesscomponentextensions = { businesscomponent: [] };
      }

      const bce = m.extension.businesscomponentextensions;
      const components = Array.isArray(bce.businesscomponent) 
        ? bce.businesscomponent 
        : [bce.businesscomponent].filter(Boolean);

      let component = components.find((c: any) => c["@_name"] === selectedEntity);
      
      if (!component) {
        component = { "@_name": selectedEntity, validationfunctionrule: [] };
        components.push(component);
      }

      const rules = Array.isArray(component.validationfunctionrule) 
        ? component.validationfunctionrule 
        : [component.validationfunctionrule].filter(Boolean);

      rules.push({
        "@_name": functionName,
        "@_functionurl": functionUrl,
        "@_description": description
      });

      component.validationfunctionrule = rules;
      bce.businesscomponent = components;
    });

    addChangelog(`Azure Function validatie '${functionName}' toegevoegd aan '${selectedEntity}'.`);
    addNotification("Validatie regel toegevoegd!", "success");
    setStep(3);
  };

  const generateBoilerplate = () => {
    const exampleLogic = examples[selectedExample as keyof typeof examples]?.logic || examples.generic.logic;
    
    return `
// Azure Function (C#) voor Exact Online Premium Validatie
// URL: ${functionUrl || 'https://jouw-app.azurewebsites.net/api/' + functionName}

[FunctionName("${functionName || 'MijnValidatie'}")]
public static async Task<IActionResult> Run(
    [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
    ILogger log)
{
    string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
    dynamic data = JsonConvert.DeserializeObject(requestBody);
    
    ${exampleLogic.trim()}

    return new OkObjectResult(new {
        isValid = isValid,
        message = errorMessage
    });
}
    `.trim();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateBoilerplate());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Cloud className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-exact-dark">
                Azure Functions Wizard
              </h2>
              <p className="text-xs text-gray-500 font-sans">
                Voeg geavanceerde validatie toe aan je extensie
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-10">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${step >= s ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400'}`}>
                  {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start space-x-3">
                <Zap className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-800 leading-relaxed">
                  Gebruik Azure Functions voor validaties die te complex zijn voor de standaard expressies. 
                  Exact Online roept jouw URL aan bij het opslaan van gegevens.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">Voor welke entiteit is dit?</label>
                <select 
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                >
                  <option value="">Selecteer een entiteit...</option>
                  {allEntities.map((e, i) => (
                    <option key={i} value={e["@_name"]}>{e["@_description"] || e["@_name"]}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  disabled={!selectedEntity}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Volgende stap
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Kies een voorbeeld (optioneel)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(examples).map(([key, ex]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedExample(key);
                          if (key === 'vat') {
                            setFunctionName('ValidateVAT');
                            setDescription('Valideert BTW-nummer formaat.');
                          } else if (key === 'kvk') {
                            setFunctionName('ValidateKVK');
                            setDescription('Controleert KVK-nummer (8 cijfers).');
                          }
                        }}
                        className={`p-3 text-left rounded-xl border-2 transition-all ${selectedExample === key ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                      >
                        <div className="text-xs font-bold text-gray-900">{ex.name}</div>
                        <div className="text-[10px] text-gray-500 mt-1 line-clamp-1">{ex.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Naam van de validatie</label>
                  <input 
                    type="text"
                    placeholder="bijv. CheckVatNumber"
                    value={functionName}
                    onChange={(e) => setFunctionName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Azure Function URL</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="url"
                      placeholder="https://jouw-app.azurewebsites.net/api/..."
                      value={functionUrl}
                      onChange={(e) => setFunctionUrl(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Omschrijving</label>
                  <textarea 
                    placeholder="Wat controleert deze functie?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
                >
                  Terug
                </button>
                <button
                  disabled={!functionName || !functionUrl}
                  onClick={handleAddValidation}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  Regel toevoegen aan XML
                  <ShieldCheck className="w-5 h-5 ml-2" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Klaar!</h3>
                <p className="text-gray-500 mt-2">De validatie-regel is toegevoegd aan je manifest XML.</p>
              </div>

              <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
                <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Code2 className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-mono text-slate-300">AzureFunction.cs</span>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Gekopieerd!' : 'Kopieer Code'}</span>
                  </button>
                </div>
                <div className="p-4 overflow-x-auto max-h-[300px]">
                  <pre className="text-sm font-mono text-slate-300 leading-relaxed">
                    {generateBoilerplate()}
                  </pre>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                  Wat nu?
                </h4>
                <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
                  <li>Maak een Azure Function project aan in Visual Studio of VS Code.</li>
                  <li>Plak de bovenstaande code in je nieuwe functie.</li>
                  <li>Publiceer de functie naar Azure en zorg dat de URL klopt.</li>
                  <li>In Exact Online Premium zal deze validatie nu automatisch worden aangeroepen.</li>
                </ul>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={onClose}
                  className="px-10 py-3 bg-exact-dark text-white font-bold rounded-xl hover:bg-black transition-all"
                >
                  Wizard Sluiten
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
