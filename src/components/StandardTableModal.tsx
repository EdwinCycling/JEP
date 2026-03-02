import React, { useState } from "react";
import { useJEPStore } from "../store";
import { motion, AnimatePresence } from "motion/react";
import { X, Database, Plus, Search, CheckCircle, Info } from "lucide-react";

interface StandardTable {
  name: string;
  table: string;
  businesscomponent: string;
  caption: string;
}

const STANDARD_TABLES: StandardTable[] = [
  { name: "Account", table: "Accounts", businesscomponent: "Account", caption: "Relaties (Accounts)" },
  { name: "Item", table: "Items", businesscomponent: "Item", caption: "Artikelen (Items)" },
  { name: "SalesOrder", table: "SalesOrders", businesscomponent: "SalesOrder", caption: "Verkooporders" },
  { name: "InvSerialBatchNumber", table: "InvSerialBatchNumbers", businesscomponent: "InvSerialBatchNumber", caption: "Serienummers / Batchnummers" },
  { name: "GLTransaction", table: "GLTransactions", businesscomponent: "PurchaseEntryLine", caption: "Grootboekmutaties (Inkoop)" },
  { name: "GLTransaction", table: "GLTransactions", businesscomponent: "SalesEntryLine", caption: "Grootboekmutaties (Verkoop)" },
  { name: "Contact", table: "Contacts", businesscomponent: "Contact", caption: "Contactpersonen" },
  { name: "Project", table: "Projects", businesscomponent: "Project", caption: "Projecten" },
  { name: "Quotation", table: "Quotations", businesscomponent: "Quotation", caption: "Offertes" },
  { name: "PurchaseOrder", table: "PurchaseOrders", businesscomponent: "PurchaseOrder", caption: "Inkooporders" },
];

interface StandardTableModalProps {
  onClose: () => void;
}

export default function StandardTableModal({ onClose }: StandardTableModalProps) {
  const { model, updateModel, addChangelog, addNotification } = useJEPStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState<StandardTable | null>(null);

  const filteredTables = STANDARD_TABLES.filter(t => 
    t.caption.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.table.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!selectedTable) return;

    updateModel((draft) => {
      if (!draft.extension) return;

      if (!draft.extension.entities) {
        draft.extension.entities = { entity: [] };
      }

      const entities = Array.isArray(draft.extension.entities.entity) 
        ? draft.extension.entities.entity 
        : (draft.extension.entities.entity ? [draft.extension.entities.entity] : []);

      // Check if already exists
      const exists = entities.find((e: any) => 
        e["@_table"] === selectedTable.table && 
        e["@_businesscomponent"] === selectedTable.businesscomponent
      );

      if (exists) {
        addNotification(`Tabel '${selectedTable.caption}' is al toegevoegd aan de extensie.`, "info");
        onClose();
        return;
      }

      const newEntity = {
        "@_name": selectedTable.name,
        "@_table": selectedTable.table,
        "@_businesscomponent": selectedTable.businesscomponent,
        "@_description": selectedTable.caption,
        property: []
      };

      draft.extension.entities.entity = [...entities, newEntity as any];
    });

    addChangelog(`Standaard tabel uitgebreid: ${selectedTable.caption} (${selectedTable.table})`);
    addNotification(`Tabel '${selectedTable.caption}' toegevoegd aan de extensie.`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-exact-blue" />
            <h3 className="text-lg font-heading font-semibold text-exact-dark">Bestaande Exact Tabel Uitbreiden</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-hidden flex flex-col">
          <p className="text-sm text-gray-500 font-sans">
            Kies een standaard Exact Online tabel om vrije velden aan toe te voegen. 
            Wij genereren automatisch het juiste <code>&lt;entity&gt;</code> blok voor je.
          </p>

          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Zoek in Exact Online bibliotheek..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-exact-blue focus:border-transparent outline-none transition-all"
              autoFocus
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 border border-gray-100 rounded-xl">
            <div className="grid grid-cols-1 gap-1 p-1">
              {filteredTables.map((table, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTable(table)}
                  className={`flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                    selectedTable === table 
                      ? "bg-blue-50 border border-blue-200 ring-1 ring-blue-100 shadow-sm" 
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${selectedTable === table ? "bg-exact-blue text-white" : "bg-gray-100 text-gray-400"}`}>
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${selectedTable === table ? "text-exact-blue" : "text-gray-700"}`}>
                        {table.caption}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        Tabel: {table.table} | BC: {table.businesscomponent}
                      </div>
                    </div>
                  </div>
                  {selectedTable === table && <CheckCircle className="w-5 h-5 text-exact-blue" />}
                </button>
              ))}
              {filteredTables.length === 0 && (
                <div className="p-8 text-center text-gray-400 italic text-sm">
                  Geen tabellen gevonden voor "{searchTerm}".
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shrink-0">
            <div className="flex items-start space-x-3">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-blue-900 tracking-tight">Waarom dit nodig is:</h4>
                <p className="text-[10px] text-blue-800 leading-relaxed font-sans opacity-90">
                  Om velden toe te voegen aan een standaard tabel moet deze eerst gedefinieerd worden in de XML. 
                  Voor bijvoorbeeld <strong>Serienummers</strong> maken we een <code>&lt;entity name="InvSerialBatchNumber" table="InvSerialBatchNumbers" ...&gt;</code> blok aan.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedTable}
            className="px-6 py-2 bg-exact-blue text-white rounded-lg font-bold hover:bg-blue-800 transition-all shadow-md disabled:opacity-50 flex items-center"
          >
            Tabel Toevoegen
            <Plus className="w-4 h-4 ml-2" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
