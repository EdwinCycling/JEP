import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  Panel,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useJEPStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Plus, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  Layout,
  Table as TableIcon,
  Search,
  X,
  PlusCircle,
  Link as LinkIcon,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import CustomEntityModal from './CustomEntityModal';
import EditorModal from './EditorModal';

// Custom Node for Database Tables
const TableNode = ({ data, selected }: { data: { entity: any, isCustom: boolean, onAddField: (e: string) => void, onEditField: (e: string, p: any) => void, onDeleteEntity: (e: string) => void, onEditEntity: (e: string) => void }, selected: boolean }) => {
  const entity = data.entity;
  const isCustom = data.isCustom;
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`bg-white rounded-xl shadow-xl border-2 transition-all min-w-[240px] overflow-hidden ${selected ? 'border-exact-red ring-4 ring-red-100 scale-105 z-50' : 'border-gray-200'}`}>
      <div className={`px-4 py-3 flex items-center justify-between ${isCustom ? 'bg-blue-600' : 'bg-gray-800'} text-white`}>
        <div className="flex items-center space-x-2 overflow-hidden">
          <Database className="w-4 h-4 shrink-0" />
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-xs truncate">{entity["@_description"] || entity["@_name"]}</span>
            <span className="text-[9px] opacity-70 truncate uppercase tracking-tighter">{entity["@_table"] || entity["@_name"]}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          {isCustom && (
            <button 
              onClick={(e) => { e.stopPropagation(); data.onAddField(entity["@_name"]); }}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Veld toevoegen"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-white/20 rounded transition-colors">
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {isCustom && (
            <button 
              onClick={(e) => { e.stopPropagation(); data.onDeleteEntity(entity["@_name"]); }}
              className="p-1 hover:bg-red-500 rounded transition-colors"
              title="Verwijder entiteit"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="py-2 divide-y divide-gray-50 max-h-[300px] overflow-y-auto custom-scrollbar">
          {entity.property?.map((prop: any, i: number) => {
            const isRef = prop["@_refersto"] || prop["@_referstocustomentity"];
            const isPK = prop["@_unique"] === 'true' || prop["@_name"].toLowerCase().endsWith('_id');
            const isDesc = prop["@_isdescription"] === 'true';

            return (
              <div 
                key={i} 
                className="px-4 py-2 flex items-center justify-between text-xs hover:bg-gray-50 relative group cursor-pointer"
                onClick={() => isCustom && data.onEditField(entity["@_name"], prop)}
              >
                <div className="flex items-center space-x-2 overflow-hidden">
                  {isPK ? (
                    <span className="text-[10px] font-bold text-exact-gold">PK</span>
                  ) : (
                    <span className={`w-2 h-2 rounded-full shrink-0 ${prop["@_type"] === 'guid' ? 'bg-exact-gold' : 'bg-gray-300'}`} />
                  )}
                  <div className="flex flex-col overflow-hidden">
                    <span className={`text-gray-700 font-medium truncate ${isPK ? 'font-bold' : ''}`}>
                      {prop["@_caption"] || prop["@_name"]}
                      {isDesc && <span className="ml-1 text-[8px] text-emerald-500 font-bold uppercase">(Desc)</span>}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono truncate">{prop["@_name"]}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-gray-400 font-mono text-[9px] uppercase">{prop["@_type"]}</span>
                  {isRef && <LinkIcon className="w-3 h-3 text-exact-gold" />}
                </div>
                
                {/* Handles for connections - specific to each field */}
                <Handle 
                  type="source" 
                  position={Position.Right} 
                  id={`field-s-${prop["@_name"]}`}
                  className="!opacity-0 !w-0 !h-0"
                  style={{ top: '50%' }}
                />
                <Handle 
                  type="target" 
                  position={Position.Left} 
                  id={`field-t-${prop["@_name"]}`}
                  className="!opacity-0 !w-0 !h-0"
                  style={{ top: '50%' }}
                />
              </div>
            );
          })}
          {!entity.property?.length && (
            <div className="px-4 py-6 text-center text-gray-400 italic text-[10px] flex flex-col items-center">
              <TableIcon className="w-8 h-8 opacity-10 mb-2" />
              Nog geen velden
            </div>
          )}
        </div>
      )}
      
      {/* Entity-level handles for general connections */}
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-gray-400 !border-white" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-gray-400 !border-white" />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gray-400 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-gray-400 !border-white" />
    </div>
  );
}

export default function SchemaDesigner() {
  return (
    <ReactFlowProvider>
      <SchemaDesignerInternal />
    </ReactFlowProvider>
  );
};

const nodeTypes = {
  table: TableNode,
};

function SchemaDesignerInternal() {
  const { model, updateModel, addNotification, addChangelog, showDialog } = useJEPStore();
  const { fitView } = useReactFlow();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingEntity, setIsAddingEntity] = useState(false);
  const [editingField, setEditingField] = useState<{ entityName: string, prop: any | null } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const entities = useMemo(() => {
    const e = model?.extension?.entities?.entity || [];
    return Array.isArray(e) ? e : [e];
  }, [model?.extension?.entities?.entity]);

  const customEntities = useMemo(() => {
    const ce = model?.extension?.customentities?.customentity || [];
    return Array.isArray(ce) ? ce : [ce];
  }, [model?.extension?.customentities?.customentity]);

  const allEntities = useMemo(() => {
    return [...entities, ...customEntities].filter(Boolean);
  }, [entities, customEntities]);

  const isCustom = useCallback((entity: any) => 
    customEntities.some((ce: any) => ce["@_name"] === entity["@_name"]),
  [customEntities]);

  const handleRemoveEntity = useCallback((name: string) => {
    showDialog({
      type: 'confirm',
      title: 'Entiteit Verwijderen',
      message: `Weet je zeker dat je de custom entiteit '${name}' en alle bijbehorende menu-items wilt verwijderen?`,
      onConfirm: () => {
        updateModel((m) => {
          if (!m.extension) return;
          if (m.extension.customentities?.customentity) {
            const ce = Array.isArray(m.extension.customentities.customentity) 
              ? m.extension.customentities.customentity 
              : [m.extension.customentities.customentity];
            m.extension.customentities.customentity = ce.filter((e: any) => e["@_name"] !== name);
          }

          // Also remove menu items
          if (m.extension.megamenuextensions?.megamenuextension) {
            const menus = m.extension.megamenuextensions.megamenuextension;
            const allMenus = Array.isArray(menus) ? menus : [menus];
            m.extension.megamenuextensions.megamenuextension = allMenus.filter(
              (menu: any) => !menu["@_id"].startsWith(name)
            );
          }
        });
        addChangelog(`Custom entiteit '${name}' verwijderd.`);
        addNotification(`Entiteit '${name}' verwijderd.`, "success");
      }
    });
  }, [updateModel, addNotification, addChangelog, showDialog]);

  const handleAddField = useCallback((entityName: string) => {
    setEditingField({ entityName, prop: null });
  }, []);

  const handleEditField = useCallback((entityName: string, prop: any) => {
    setEditingField({ entityName, prop });
  }, []);

  const handleEditEntity = useCallback((entityName: string) => {
    // We can expand this later to edit entity metadata
    addNotification(`Bewerken van ${entityName} nog niet volledig ondersteund in schema view.`, "info");
  }, [addNotification]);

  const getLayoutedElements = useCallback(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Filter based on search
    const filteredEntities = allEntities.filter(e => 
      (e["@_description"] || e["@_name"]).toLowerCase().includes(searchTerm.toLowerCase())
    );

    filteredEntities.forEach((entity, i) => {
      // Simple grid layout
      const x = (i % 3) * 350;
      const y = Math.floor(i / 3) * 450;

      nodes.push({
        id: entity["@_name"],
        type: 'table',
        position: { x, y },
        data: { 
          entity, 
          isCustom: isCustom(entity),
          onAddField: handleAddField,
          onEditField: handleEditField,
          onDeleteEntity: handleRemoveEntity,
          onEditEntity: handleEditEntity
        },
      });

      // Connections
      entity.property?.forEach((prop: any) => {
        const targetEntityName = prop["@_refersto"] || prop["@_referstocustomentity"];
        if (targetEntityName) {
          edges.push({
            id: `edge-${entity["@_name"]}-${prop["@_name"]}-${targetEntityName}`,
            source: entity["@_name"],
            sourceHandle: `field-s-${prop["@_name"]}`,
            target: targetEntityName,
            targetHandle: `target`, // Default entity target
            label: prop["@_caption"] || prop["@_name"],
            animated: true,
            style: { stroke: '#f59e0b', strokeWidth: 2 },
            labelStyle: { fill: '#b45309', fontWeight: 700, fontSize: 10 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#f59e0b',
            },
          });
        }
      });
    });

    return { nodes, edges };
  }, [allEntities, searchTerm, customEntities, handleAddField, handleEditField, handleRemoveEntity, handleEditEntity]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => getLayoutedElements(), [getLayoutedElements]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    // Use a small timeout to ensure React Flow has applied the nodes before fitting view
    setTimeout(() => {
      fitView({ duration: 800 });
    }, 50);
  }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`h-full flex flex-col bg-white relative ${isFullscreen ? 'fixed inset-0 z-[200]' : ''}`}>
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Zoek entiteit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-exact-red focus:border-transparent outline-none w-64"
            />
          </div>
          <button 
            onClick={() => setIsAddingEntity(true)}
            className="inline-flex items-center px-4 py-2 bg-exact-blue text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Entiteit
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleFullscreen}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title={isFullscreen ? "Venster verkleinen" : "Volledig scherm"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Entity List */}
        <div className="w-72 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Entiteiten ({allEntities.length})
            </h3>
          </div>
          <div className="p-2 space-y-1">
            {allEntities.map((entity, i) => {
              const custom = isCustom(entity);
              return (
                <div 
                  key={i} 
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${nodes.find(n => n.id === entity["@_name"])?.selected ? 'bg-red-50 text-exact-red' : 'hover:bg-white'}`}
                  onClick={() => {
                    setNodes(nodes.map(n => ({ ...n, selected: n.id === entity["@_name"] })));
                  }}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className={`w-2 h-2 rounded-full ${custom ? 'bg-blue-500' : 'bg-gray-400'}`} />
                    <span className="text-sm font-medium truncate">{entity["@_description"] || entity["@_name"]}</span>
                  </div>
                  {custom && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveEntity(entity["@_name"]);
                      }}
                      className="p-1 text-gray-400 hover:text-exact-red opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-gray-50 schema-designer-canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            nodeTypes={nodeTypes}
            fitView
            className="bg-exact-beige/10"
          >
            <Background color="#cbd5e1" gap={30} size={1} />
            <Controls />
            <MiniMap 
              nodeColor={(node) => node.data?.isCustom ? '#2563eb' : '#1f2937'}
              maskColor="rgba(0, 0, 0, 0.1)"
            />
            <Panel position="top-right" className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-lg border border-gray-200 m-4">
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase">Legenda</h4>
                <div className="flex items-center space-x-3 text-xs text-gray-600">
                  <div className="w-3 h-3 bg-gray-800 rounded shadow-sm" />
                  <span>Standaard Tabel</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-600">
                  <div className="w-3 h-3 bg-blue-600 rounded shadow-sm" />
                  <span>Vrije Entiteit</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-600">
                  <div className="w-3 h-3 bg-exact-gold rounded-full shadow-sm" />
                  <span>Referentie (GUID)</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Modals */}
      {isAddingEntity && (
        <CustomEntityModal onClose={() => setIsAddingEntity(false)} />
      )}

      {editingField && (
        <EditorModal 
          entityName={editingField.entityName}
          isCustomEntity={true}
          existingField={editingField.prop}
          onClose={() => setEditingField(null)}
        />
      )}
    </div>
  );
}
