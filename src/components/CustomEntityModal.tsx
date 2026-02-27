import React, { useState } from "react";
import { useJEPStore } from "../store";
import { motion, AnimatePresence } from "motion/react";
import { X, Database, Plus, CheckCircle } from "lucide-react";

interface CustomEntityModalProps {
  onClose: () => void;
}

export default function CustomEntityModal({ onClose }: CustomEntityModalProps) {
  const { model, updateModel, addChangelog, addNotification } = useJEPStore();
  const [name, setName] = useState("");
  const [plural, setPlural] = useState("");
  const [menuParent, setMenuParent] = useState("CRM");
  const [isSaving, setIsSaving] = useState(false);

  const extCode = model?.extension?.["@_code"] || "EXT";

  const handleSave = async () => {
    if (!name || !plural) {
      addNotification("Vul a.u.b. alle velden in.", "warning");
      return;
    }

    setIsSaving(true);
    try {
      const technicalName = `${extCode}_${name.replace(/\s+/g, "")}`;
      const tableName = `${technicalName}_Plural`;
      
      updateModel((draft) => {
        if (!draft.extension) return;

        // 1. Add Custom Entity
        if (!draft.extension.customentities) {
          draft.extension.customentities = { customentity: [] };
        }
        if (!Array.isArray(draft.extension.customentities.customentity)) {
          draft.extension.customentities.customentity = draft.extension.customentities.customentity ? [draft.extension.customentities.customentity] : [];
        }

        const newEntity = {
          "@_name": technicalName,
          "@_table": tableName,
          "@_description": name,
          "@_descriptionplural": plural,
          property: [
            {
              "@_name": `${technicalName}_ID`,
              "@_type": "guid",
              "@_caption": "ID",
              "@_unique": "true"
            },
            {
              "@_name": `${technicalName}_Code`,
              "@_type": "string",
              "@_length": "30",
              "@_caption": "Code",
              "@_iscode": "true"
            },
            {
              "@_name": `${technicalName}_Description`,
              "@_type": "string",
              "@_length": "60",
              "@_caption": "Omschrijving",
              "@_isdescription": "true"
            }
          ]
        };

        draft.extension.customentities.customentity.push(newEntity as any);

        // 2. Add Mega Menu Extension
        if (!draft.extension.megamenuextensions) {
          draft.extension.megamenuextensions = { megamenuextension: [] };
        }
        if (!Array.isArray(draft.extension.megamenuextensions.megamenuextension)) {
          draft.extension.megamenuextensions.megamenuextension = draft.extension.megamenuextensions.megamenuextension ? [draft.extension.megamenuextensions.megamenuextension] : [];
        }

        const menuExt = {
          "@_id": `${technicalName}_Menu`,
          "@_parentid": menuParent,
          "@_caption": plural,
          item: [
            {
              "@_id": `${technicalName}_Overview`,
              "@_caption": `Overzicht ${plural}`,
              "@_url": `ExtCustomEntities.aspx?Entity=${technicalName}`
            },
            {
              "@_id": `${technicalName}_New`,
              "@_caption": `Nieuwe ${name}`,
              "@_url": `ExtCustomEntity.aspx?Entity=${technicalName}&BCAction=0`
            }
          ]
        };

        draft.extension.megamenuextensions.megamenuextension.push(menuExt as any);

        // 3. Add Roles
        if (!draft.extension.roles) {
          draft.extension.roles = { existingrole: [] };
        }
        if (!Array.isArray(draft.extension.roles.existingrole)) {
          draft.extension.roles.existingrole = draft.extension.roles.existingrole ? [draft.extension.roles.existingrole] : [];
        }

        let defaultRole = draft.extension.roles.existingrole.find((r: any) => r["@_id"] === "100");
        if (!defaultRole) {
          defaultRole = { "@_id": "100", customentity: [] };
          draft.extension.roles.existingrole.push(defaultRole as any);
        }

        if (!Array.isArray(defaultRole.customentity)) {
          defaultRole.customentity = defaultRole.customentity ? [defaultRole.customentity] : [];
        }

        defaultRole.customentity.push({
          "@_name": technicalName,
          "@_permission": "Full"
        } as any);
      });

      addChangelog(`Nieuwe entiteit toegevoegd: ${name} (${technicalName})`);
      addNotification(`Entiteit '${name}' succesvol aangemaakt!`, "success");
      onClose();
    } catch (error) {
      console.error(error);
      addNotification("Fout bij het aanmaken van de entiteit.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-exact-red" />
            <h3 className="text-lg font-heading font-semibold text-exact-dark">Nieuwe Entiteit</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naam van het object (Enkelvoud)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="bijv. Auto"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-red focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meervoudsvorm</label>
              <input
                type="text"
                value={plural}
                onChange={(e) => setPlural(e.target.value)}
                placeholder="bijv. Auto's"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-red focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waar in het menu plaatsen?</label>
              <select
                value={menuParent}
                onChange={(e) => setMenuParent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-red focus:border-transparent outline-none transition-all"
              >
                <option value="CRM">Relatiebeheer (CRM)</option>
                <option value="Logistics">Logistiek</option>
                <option value="Project">Projecten</option>
                <option value="Financial">Financieel</option>
                <option value="Manufacturing">Productie</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="text-sm font-bold text-exact-blue mb-2 flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Wat we automatisch voor je doen:
            </h4>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Technische code genereren: <strong>{extCode}_{name || "..."}</strong></li>
              <li>Tabel aanmaken in de database</li>
              <li>Standaard velden (ID, Code, Omschrijving) toevoegen</li>
              <li>Menu-links aanmaken voor Overzicht en Nieuw</li>
              <li>Rechten toekennen aan de beheerder (Rol 100)</li>
            </ul>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-exact-red text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-md disabled:opacity-50 flex items-center"
          >
            {isSaving ? "Bezig..." : "Entiteit Aanmaken"}
            {!isSaving && <CheckCircle className="w-4 h-4 ml-2" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
