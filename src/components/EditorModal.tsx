import React, { useState, useEffect } from "react";
import { useJEPStore } from "../store";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, Plus, Minus, ChevronDown, ChevronUp, Settings2, Database, AlertTriangle } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

interface EditorModalProps {
  entityName: string;
  isCustomEntity?: boolean;
  existingField?: any;
  onClose: () => void;
}

export default function EditorModal({ entityName, isCustomEntity, existingField, onClose }: EditorModalProps) {
  const { model, updateModel, addChangelog, addAddedFieldId, removeAddedFieldId, addNotification } = useJEPStore();
  
  // Basic Info
  const [name, setName] = useState("");
  const [caption, setCaption] = useState("");
  const [translationId, setTranslationId] = useState("");
  const [type, setType] = useState("string");

  const translationsList = model?.extension?.translationextensions?.translation || [];
  const translationIds = (Array.isArray(translationsList) ? translationsList : [translationsList]).map((t: any) => t["@_id"]).filter(Boolean);
  
  // Advanced Settings
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [allowEmpty, setAllowEmpty] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [visibleExpression, setVisibleExpression] = useState("");
  const [mandatoryLegislation, setMandatoryLegislation] = useState("");
  
  // Type Specific
  const [length, setLength] = useState(100);
  const [scale, setScale] = useState(2);
  const [isCode, setIsCode] = useState(false);
  const [isDescription, setIsDescription] = useState(false);
  const [autoIncrement, setAutoIncrement] = useState(false);
  const [refersTo, setRefersTo] = useState("");
  const [refersToCustomEntity, setRefersToCustomEntity] = useState("");
  const [defaultValue, setDefaultValue] = useState("");
  
  // Keuzelijst (Enum)
  const [isKeuzelijst, setIsKeuzelijst] = useState(false);
  const [listDefinitionId, setListDefinitionId] = useState("");
  const [controlType, setControlType] = useState("list");
  const [listItems, setListItems] = useState<{ value: string; caption: string }[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const extCode = model?.extension?.["@_code"] || "EXT";
  const isAdded = existingField ? useJEPStore.getState().addedFieldIds.includes(existingField["@_name"]) : true;

  useEffect(() => {
    if (existingField) {
      setName(existingField["@_columnname"] || existingField["@_name"].replace(`${extCode}_`, "") || "");
      setCaption(existingField["@_caption"] || "");
      setTranslationId(existingField["@_translationid"] || "");
      setType(existingField["@_type"] || "string");
      
      setAllowEmpty(existingField["@_allowempty"] !== "false");
      setReadOnly(existingField["@_readonly"] === "true");
      setVisibleExpression(existingField.visibleexpression || "");
      setMandatoryLegislation(existingField.mandatorylegislation || "");
      
      setLength(parseInt(existingField["@_length"]) || 100);
      setScale(parseInt(existingField["@_scale"]) || 2);
      setIsCode(existingField["@_iscode"] === "true");
      setIsDescription(existingField["@_isdescription"] === "true");
      setAutoIncrement(existingField["@_autoincrement"] === "true");
      setRefersTo(existingField["@_refersto"] || "");
      setRefersToCustomEntity(existingField["@_referstocustomentity"] || "");
      
      if (existingField.listitems) {
        setIsKeuzelijst(true);
        setListDefinitionId(existingField.listitems["@_listdefinitionid"] || "");
        setControlType(existingField["@_controltype"] || "list");
        const items = existingField.listitems.listitem;
        setListItems(Array.isArray(items) ? items.map((i: any) => ({ value: i["@_value"], caption: i["@_caption"] })) : items ? [{ value: items["@_value"], caption: items["@_caption"] }] : []);
      }
    }
  }, [existingField, extCode]);

  const addListItem = () => {
    setListItems([...listItems, { value: (listItems.length + 1).toString(), caption: "" }]);
  };

  const removeListItem = (index: number) => {
    setListItems(listItems.filter((_, i) => i !== index));
  };

  const updateListItem = (index: number, field: "value" | "caption", val: string) => {
    const newItems = [...listItems];
    newItems[index][field] = val;
    setListItems(newItems);
  };

  const confirmDelete = () => {
    setIsSaving(true);
    try {
      const prefixedName = existingField["@_name"];
      const translationId = existingField["@_translationid"] || `${extCode}_${name}_Translation`;

      updateModel((draft) => {
        let entity = draft.extension?.entities?.entity?.find((e) => e["@_name"] === entityName);
        if (!entity) {
          entity = draft.extension?.customentities?.customentity?.find((e) => e["@_name"] === entityName);
        }

        if (entity && entity.property) {
          entity.property = entity.property.filter((p) => p["@_name"] !== prefixedName);
        }

        // Remove from applicationextension
        const appExts = draft.extension?.applicationextensions?.applicationextension || [];
        const appExtList = Array.isArray(appExts) ? appExts : [appExts];
        
        appExtList.forEach((appExt: any) => {
          if (appExt.cardsection) {
            const sections = Array.isArray(appExt.cardsection) ? appExt.cardsection : [appExt.cardsection];
            sections.forEach((section: any) => {
              if (section.field) {
                const fields = Array.isArray(section.field) ? section.field : [section.field];
                section.field = fields.filter((f: any) => f["@_datafield"] !== prefixedName);
              }
            });
          }
          if (appExt.contentsectionrow) {
            const rows = Array.isArray(appExt.contentsectionrow) ? appExt.contentsectionrow : [appExt.contentsectionrow];
            rows.forEach((row: any) => {
              if (row.field) {
                const fields = Array.isArray(row.field) ? row.field : [row.field];
                row.field = fields.filter((f: any) => f["@_datafield"] !== prefixedName);
              }
            });
          }
        });

        // Remove translation
        if (draft.extension?.translationextensions?.translation) {
          const translations = Array.isArray(draft.extension.translationextensions.translation) 
            ? draft.extension.translationextensions.translation 
            : [draft.extension.translationextensions.translation];
          draft.extension.translationextensions.translation = translations.filter(
            (t: any) => t["@_id"] !== translationId
          );
        }
      });

      removeAddedFieldId(prefixedName);
      addChangelog(`Veld '${caption}' is verwijderd uit '${entityName}'.`);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
      setShowConfirmDelete(false);
    }
  };

  const handleSave = async () => {
    if (!name || !caption) {
      addNotification("Vul a.u.b. alle verplichte velden in.", "warning");
      return;
    }

    if (isKeuzelijst && (!listDefinitionId || listItems.length === 0)) {
      addNotification("Vul a.u.b. de keuzelijst details in.", "warning");
      return;
    }

    setIsSaving(true);
    try {
      const prefixedName = name.startsWith(extCode + "_") ? name : `${extCode}_${name}`;
      const finalTranslationId = translationId || `${extCode}_${name}_Translation`;

      updateModel((draft) => {
        let entity = draft.extension?.entities?.entity?.find((e) => e["@_name"] === entityName);
        if (!entity) {
          entity = draft.extension?.customentities?.customentity?.find((e) => e["@_name"] === entityName);
        }

        if (entity) {
          if (!entity.property) entity.property = [];

          const propertyData: any = {
            "@_name": prefixedName,
            "@_caption": caption,
            "@_type": type,
            "@_columnname": name.replace(`${extCode}_`, ""),
            "@_translationid": finalTranslationId,
            "@_allowempty": allowEmpty ? "true" : "false",
            "@_readonly": readOnly ? "true" : "false",
          };

          if (visibleExpression) propertyData.visibleexpression = visibleExpression;
          if (mandatoryLegislation) propertyData.mandatorylegislation = mandatoryLegislation;

          if (isCode) propertyData["@_iscode"] = "true";
          if (isDescription) propertyData["@_isdescription"] = "true";
          if (autoIncrement) propertyData["@_autoincrement"] = "true";
          if (refersTo) propertyData["@_refersto"] = refersTo;
          if (refersToCustomEntity) propertyData["@_referstocustomentity"] = refersToCustomEntity;

          if (type === "string") {
            propertyData["@_length"] = length.toString();
          } else if (type === "string_long") {
            propertyData["@_type"] = "string";
            propertyData["@_length"] = "4000";
          } else if (type === "double") {
            propertyData["@_scale"] = scale.toString();
          }

          if (isKeuzelijst) {
            propertyData["@_controltype"] = controlType;
            propertyData.listitems = {
              "@_allowempty": "true",
              "@_listdefinitionid": listDefinitionId,
              listitem: listItems.map(item => ({
                "@_value": item.value,
                "@_caption": item.caption
              }))
            };
          }

          if (existingField) {
            const index = entity.property.findIndex((p) => p["@_name"] === existingField["@_name"]);
            if (index !== -1) {
              entity.property[index] = propertyData;
            }
          } else {
            if (entity.property.some((p) => p["@_name"] === prefixedName)) {
              addNotification("Deze naam wordt al gebruikt. Kies een andere naam.", "error");
              throw new Error("Duplicate name");
            }
            entity.property.push(propertyData);
          }

          // Sync with applicationextensions
          if (!draft.extension.applicationextensions) {
            draft.extension.applicationextensions = { applicationextension: [] };
          }
          const appExts = Array.isArray(draft.extension.applicationextensions.applicationextension) 
            ? draft.extension.applicationextensions.applicationextension 
            : [draft.extension.applicationextensions.applicationextension].filter(Boolean);
          
          let appExt = appExts.find(
            (ext: any) => ext["@_entity"] === entityName || (ext["@_application"] && ext["@_application"].includes(entityName.replace(extCode + "_", "")))
          );

          if (!appExt && appExts.length > 0) {
            appExt = appExts[0];
          }

          if (appExt) {
            const fieldData = {
              "@_id": name.replace(`${extCode}_`, ""),
              "@_datafield": prefixedName,
              "@_type": type,
              "@_caption": caption,
              "@_translationid": finalTranslationId,
            };

            if (appExt.cardsection) {
              const sections = Array.isArray(appExt.cardsection) ? appExt.cardsection : [appExt.cardsection];
              const section = sections[0];
              if (!section.field) section.field = [];
              const fields = Array.isArray(section.field) ? section.field : [section.field];
              const fieldIdx = fields.findIndex((f: any) => f["@_datafield"] === (existingField?.["@_name"] || prefixedName));
              if (fieldIdx !== -1) {
                fields[fieldIdx] = fieldData;
                section.field = fields;
              } else {
                section.field = [...fields, fieldData];
              }
            } else if (appExt.contentsectionrow) {
              const rows = Array.isArray(appExt.contentsectionrow) ? appExt.contentsectionrow : [appExt.contentsectionrow];
              const row = rows[0];
              if (!row.field) row.field = [];
              const fields = Array.isArray(row.field) ? row.field : [row.field];
              const fieldIdx = fields.findIndex((f: any) => f["@_datafield"] === (existingField?.["@_name"] || prefixedName));
              if (fieldIdx !== -1) {
                fields[fieldIdx] = fieldData;
                row.field = fields;
              } else {
                row.field = [...fields, fieldData];
              }
            }
          }

          // Sync Translations
          if (!draft.extension.translationextensions) {
            draft.extension.translationextensions = { translation: [] };
          }
          const translations = Array.isArray(draft.extension.translationextensions.translation) 
            ? draft.extension.translationextensions.translation 
            : [draft.extension.translationextensions.translation].filter(Boolean);
          
          const transIdx = translations.findIndex((t: any) => t["@_id"] === (existingField?.["@_translationid"] || finalTranslationId));
          const transData = {
            "@_id": finalTranslationId,
            language: [
              { "@_code": "nl", "#text": caption },
              { "@_code": "en", "#text": caption },
            ],
          };

          if (transIdx !== -1) {
            translations[transIdx] = transData;
          } else {
            translations.push(transData);
          }
          draft.extension.translationextensions.translation = translations;
        }
      });

      if (!existingField) {
        addAddedFieldId(prefixedName);
        addChangelog(`Je hebt een extra veld '${caption}' toegevoegd aan de ${entityName}-pagina.`);
      } else {
        if (existingField["@_name"] !== prefixedName) {
          removeAddedFieldId(existingField["@_name"]);
          addAddedFieldId(prefixedName);
        }
        addChangelog(`Je hebt het veld '${caption}' gewijzigd op de ${entityName}-pagina.`);
      }

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
            <h2 className="text-xl font-heading font-semibold text-exact-dark">
              {existingField ? "Veld bewerken" : `Veld toevoegen aan ${entityName}`}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {!isAdded && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-800">Let op: Bestaand Veld</h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    U bewerkt een veld dat al standaard in Exact Online aanwezig is. 
                    Wijzigingen in het type of de lengte kunnen leiden tot conflicten met bestaande data. 
                    Wees voorzichtig met het aanpassen van technische eigenschappen.
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-exact-dark mb-1.5 font-sans">
                    Vriendelijke Naam (Caption)
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="bijv. Kleur of Klantnummer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-blue focus:border-exact-blue outline-none transition-shadow font-sans"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-exact-dark mb-1.5 font-sans">
                    Vertaling (Translation ID)
                  </label>
                  <div className="space-y-2">
                    <select
                      value={translationId}
                      onChange={(e) => setTranslationId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-blue focus:border-exact-blue outline-none transition-shadow font-sans bg-white text-sm"
                    >
                      <option value="">-- Kies een bestaande vertaling --</option>
                      {translationIds.map((tid: string) => (
                        <option key={tid} value={tid}>{tid}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={translationId}
                      onChange={(e) => setTranslationId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg italic text-gray-500 outline-none"
                      placeholder="Of voer een nieuw Translation ID in..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-exact-dark mb-1.5 font-sans">
                    Systeem Naam (ID)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                    placeholder="bijv. Kleur"
                    disabled={!!existingField}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-blue focus:border-exact-blue outline-none transition-shadow font-sans ${existingField ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                  />
                  {!existingField && (
                    <p className="text-xs text-gray-500 mt-1.5 font-sans">
                      Wordt opgeslagen als: <span className="font-mono font-bold text-exact-red">{extCode}_{name || "..."}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-exact-dark mb-1.5 font-sans">
                    Type Veld
                  </label>
                  <select
                    value={type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setType(newType);
                      if (newType === "integer") setIsKeuzelijst(false);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-blue focus:border-exact-blue outline-none transition-shadow font-sans bg-white"
                  >
                    <option value="string">Tekstregel</option>
                    <option value="string_long">Lange tekst (4000)</option>
                    <option value="integer">Getal</option>
                    <option value="double">Kommagetal (Double)</option>
                    <option value="boolean">Ja/Nee vinkje</option>
                    <option value="date">Datum</option>
                    <option value="guid">Referentie (GUID)</option>
                    <option value="picture">Foto/Afbeelding</option>
                  </select>
                </div>
              </div>

              {/* Type Specific Settings */}
              <div className="space-y-4 bg-exact-beige/20 p-4 rounded-xl border border-exact-beige/50">
                <h3 className="text-sm font-heading font-semibold text-exact-dark uppercase tracking-wider flex items-center">
                  <Settings2 className="w-4 h-4 mr-2 text-exact-red" />
                  Type Details
                </h3>
                
                {type === "string" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1 font-sans">Maximale lengte</label>
                      <input 
                        type="number" 
                        value={length} 
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center text-xs font-sans cursor-pointer">
                        <input type="checkbox" checked={isCode} onChange={(e) => setIsCode(e.target.checked)} className="mr-2" />
                        Unieke Code
                      </label>
                      <label className="flex items-center text-xs font-sans cursor-pointer">
                        <input type="checkbox" checked={isDescription} onChange={(e) => setIsDescription(e.target.checked)} className="mr-2" />
                        Hoofdomschrijving
                      </label>
                    </div>
                  </div>
                )}

                {type === "double" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 font-sans">Aantal decimalen (Scale)</label>
                    <input 
                      type="number" 
                      value={scale} 
                      onChange={(e) => setScale(parseInt(e.target.value))}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                )}

                {type === "integer" && (
                  <div className="pt-2">
                    <label className="flex items-center text-sm font-medium text-exact-dark cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={isKeuzelijst} 
                        onChange={(e) => setIsKeuzelijst(e.target.checked)}
                        className="w-4 h-4 text-exact-red border-gray-300 rounded focus:ring-exact-red mr-3"
                      />
                      Gebruik als Keuzelijst (Enum)
                    </label>
                  </div>
                )}

                {type === "boolean" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 font-sans">Standaard waarde</label>
                    <select 
                      value={defaultValue} 
                      onChange={(e) => setDefaultValue(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
                    >
                      <option value="">Geen standaard</option>
                      <option value="true">Aan (True)</option>
                      <option value="false">Uit (False)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Entity Options */}
            {isCustomEntity && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-exact-blue flex items-center">
                  <Database className="w-4 h-4 mr-2" /> Custom Entity Opties
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center text-xs font-medium text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isCode} 
                      onChange={(e) => setIsCode(e.target.checked)}
                      className="w-3.5 h-3.5 text-exact-blue border-gray-300 rounded mr-2"
                    />
                    Dit veld is de unieke code (iscode)
                  </label>
                  <label className="flex items-center text-xs font-medium text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={autoIncrement} 
                      onChange={(e) => setAutoIncrement(e.target.checked)}
                      className="w-3.5 h-3.5 text-exact-blue border-gray-300 rounded mr-2"
                    />
                    Nummer automatisch ophogen
                  </label>
                  <label className="flex items-center text-xs font-medium text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isDescription} 
                      onChange={(e) => setIsDescription(e.target.checked)}
                      className="w-3.5 h-3.5 text-exact-blue border-gray-300 rounded mr-2"
                    />
                    Dit veld is de hoofdomschrijving
                  </label>
                </div>

                <div className="pt-2 space-y-3 border-t border-blue-200">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-blue-600 mb-1">Koppel aan Exact onderdeel (Reference)</label>
                    <select 
                      value={refersTo} 
                      onChange={(e) => setRefersTo(e.target.value)}
                      className="w-full px-3 py-1.5 border border-blue-200 rounded-lg text-sm bg-white"
                    >
                      <option value="">Geen koppeling</option>
                      <option value="Account">Relatie (Account)</option>
                      <option value="Contact">Contactpersoon</option>
                      <option value="Item">Artikel (Item)</option>
                      <option value="Project">Project</option>
                      <option value="Opportunity">Opportunity</option>
                      <option value="SalesOrder">Verkooporder</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-blue-600 mb-1">Koppel aan eigen entiteit</label>
                    <select 
                      value={refersToCustomEntity} 
                      onChange={(e) => setRefersToCustomEntity(e.target.value)}
                      className="w-full px-3 py-1.5 border border-blue-200 rounded-lg text-sm bg-white"
                    >
                      <option value="">Geen koppeling</option>
                      {model?.extension?.customentities?.customentity && (Array.isArray(model.extension.customentities.customentity) ? model.extension.customentities.customentity : [model.extension.customentities.customentity]).map((ce: any) => (
                        <option key={ce["@_name"]} value={ce["@_name"]}>{ce["@_description"] || ce["@_name"]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Keuzelijst Editor */}
            {isKeuzelijst && type === "integer" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-exact-red/20 rounded-xl p-5 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-heading font-semibold text-exact-red">Keuzelijst Configuratie</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-xs font-sans text-gray-500">Weergave:</label>
                      <select 
                        value={controlType} 
                        onChange={(e) => setControlType(e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                      >
                        <option value="list">Dropdown (List)</option>
                        <option value="radiobuttonlist">Keuzerondjes (Radio)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 font-sans">Lijst Definitie ID (Uniek)</label>
                  <input 
                    type="text" 
                    value={listDefinitionId} 
                    onChange={(e) => setListDefinitionId(e.target.value)}
                    placeholder="bijv. KleurenLijst"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-gray-600 font-sans">Lijst Items</label>
                    <button 
                      onClick={addListItem}
                      className="text-xs flex items-center text-exact-blue hover:underline"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Item toevoegen
                    </button>
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {listItems.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input 
                          type="text" 
                          value={item.value} 
                          onChange={(e) => updateListItem(idx, "value", e.target.value)}
                          placeholder="Waarde"
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <input 
                          type="text" 
                          value={item.caption} 
                          onChange={(e) => updateListItem(idx, "caption", e.target.value)}
                          placeholder="Label"
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <button 
                          onClick={() => removeListItem(idx)}
                          className="p-1 text-gray-400 hover:text-exact-red"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {listItems.length === 0 && (
                      <p className="text-center py-4 text-xs text-gray-400 italic">Geen items toegevoegd.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Advanced Settings Toggle */}
            <div className="border-t border-gray-100 pt-4">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-exact-dark transition-colors"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                Geavanceerde Instellingen
              </button>
              
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-3">
                        <label className="flex items-center text-sm font-sans cursor-pointer">
                          <input type="checkbox" checked={!allowEmpty} onChange={(e) => setAllowEmpty(!e.target.checked)} className="mr-2" />
                          Verplicht veld (Niet leeg)
                        </label>
                        <label className="flex items-center text-sm font-sans cursor-pointer">
                          <input type="checkbox" checked={readOnly} onChange={(e) => setReadOnly(e.target.checked)} className="mr-2" />
                          Alleen-lezen (Read Only)
                        </label>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1 font-sans">Zichtbaarheid Formule</label>
                          <input 
                            type="text" 
                            value={visibleExpression} 
                            onChange={(e) => setVisibleExpression(e.target.value)}
                            placeholder="bijv. DivisionSetting('MySetting', true)"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1 font-sans">Wetgeving (Land)</label>
                          <select 
                            value={mandatoryLegislation} 
                            onChange={(e) => setMandatoryLegislation(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
                          >
                            <option value="">Alle landen</option>
                            <option value="Netherlands">Nederland</option>
                            <option value="Belgium">België</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-exact-beige/30 flex justify-between items-center shrink-0">
            <div>
              {existingField && (
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-exact-red bg-white border border-red-200 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-red transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Verwijderen
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-exact-dark bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-blue transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-exact-blue border border-transparent rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-exact-blue disabled:opacity-50 transition-colors"
              >
                {isSaving ? "Opslaan..." : "Opslaan"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
    {showConfirmDelete && (
      <ConfirmModal
        title="Veld verwijderen"
        message={`Weet je zeker dat je het veld '${caption}' wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />
    )}
    </>
  );
}

