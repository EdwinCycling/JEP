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
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useJEPStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flag, 
  RotateCcw, 
  CircleStop, 
  CheckCircle2, 
  Plus, 
  Settings2,
  Trash2,
  Activity,
  Play,
  X,
  Eye,
  Lock,
  Asterisk,
  ChevronRight,
  EyeOff,
  Unlock,
  Info,
  Layout,
  Columns,
  Rows
} from 'lucide-react';
import { JEPWorkflowDefinition, JEPWorkflowStage, JEPWorkflowAction, JEPProperty, JEPWorkflowPropertySetting } from '../types';
import WorkflowSettingsModal from './WorkflowSettingsModal';
import SimulationInfoModal from './SimulationInfoModal';

// Custom Node for Workflow Stages
const StageNode = ({ data, selected }: { data: { stage: JEPWorkflowStage, isSimulating?: boolean, isCurrent?: boolean }; selected: boolean }) => {
  const stage = data.stage;
  const isSimulating = data.isSimulating;
  const isCurrent = data.isCurrent;
  
  const getIcon = () => {
    switch (stage["@_stagetype"]) {
      case 'New':
        return <Flag className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-emerald-600'}`} />;
      case 'Restarted':
        return <RotateCcw className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-blue-600'}`} />;
      case 'Canceled':
        return <CircleStop className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-red-600'}`} />;
      case 'Final':
        return <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-purple-600'}`} />;
      default:
        return <Activity className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-gray-600'}`} />;
    }
  };

  let borderClass = 'border-gray-200 hover:border-gray-300';
  let bgClass = 'bg-white';
  let textClass = 'text-exact-dark';

  if (selected) {
    borderClass = 'border-exact-red ring-2 ring-red-100';
  }

  if (isSimulating && isCurrent) {
    borderClass = 'border-blue-600 ring-4 ring-blue-100 scale-110 z-50';
    bgClass = 'bg-blue-600';
    textClass = 'text-white';
  }

  return (
    <div className={`px-4 py-3 rounded-xl border-2 shadow-sm min-w-[180px] transition-all duration-300 ${borderClass} ${bgClass}`}>
      {/* Smart Handles on all sides */}
      <Handle type="target" position={Position.Top} id="top-t" className="w-2 h-2 bg-gray-300 opacity-0 group-hover:opacity-100" />
      <Handle type="source" position={Position.Top} id="top-s" className="w-2 h-2 bg-gray-300 opacity-0 group-hover:opacity-100" />
      
      <Handle type="target" position={Position.Bottom} id="bottom-t" className="w-2 h-2 bg-gray-300 opacity-0 group-hover:opacity-100" />
      <Handle type="source" position={Position.Bottom} id="bottom-s" className="w-2 h-2 bg-gray-300 opacity-0 group-hover:opacity-100" />
      
      <Handle type="target" position={Position.Left} id="left-t" className="w-2 h-2 bg-gray-300 opacity-0 group-hover:opacity-100" />
      <Handle type="source" position={Position.Left} id="left-s" className="w-2 h-2 bg-gray-300 opacity-0 group-hover:opacity-100" />
      
      <Handle type="target" position={Position.Right} id="right-t" className="w-2 h-2 bg-gray-300 opacity-0 group-hover:opacity-100" />
      <Handle type="source" position={Position.Right} id="right-s" className="w-2 h-2 bg-gray-300 opacity-0 group-hover:opacity-100" />

      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${isCurrent && isSimulating ? 'bg-blue-500' : 'bg-gray-50'}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-[9px] font-bold uppercase tracking-wider leading-none mb-1 ${isCurrent && isSimulating ? 'text-blue-100' : 'text-gray-400'}`}>
            {stage["@_stagetype"] || 'Standaard'}
          </div>
          <div className={`text-sm font-semibold truncate ${textClass}`}>
            {stage["@_caption"]}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowDesigner() {
  return (
    <ReactFlowProvider>
      <WorkflowDesignerInternal />
    </ReactFlowProvider>
  );
};

const nodeTypes = {
  stage: StageNode,
};

function WorkflowDesignerInternal() {
  const { model, updateModel, addNotification, addChangelog } = useJEPStore();
  const { fitView } = useReactFlow();
  const workflows = model?.extension?.workflowdefinitions?.workflowdefinition || [];
  const allWorkflows = useMemo(() => Array.isArray(workflows) ? workflows : [workflows], [workflows]);
  
  const [activeWorkflowIndex, setActiveWorkflowIndex] = useState(0);
  const activeWorkflow = useMemo(() => allWorkflows[activeWorkflowIndex], [allWorkflows, activeWorkflowIndex]);
  const [selectedStageName, setSelectedStageName] = useState<string | null>(null);
  const [editingAction, setEditingAction] = useState<{ stageName: string, actionName: string } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationCurrentStage, setSimulationCurrentStage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSimulationInfo, setShowSimulationInfo] = useState(false);
  const [viewMode, setViewMode] = useState<'flow' | 'swimlane'>('flow');

  // Auto-layout logic
  const getLayoutedElements = (stages: JEPWorkflowStage[]) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Build adjacency list
    const adj: Record<string, string[]> = {};
    stages.forEach(s => {
      adj[s["@_name"]] = [];
      const actions = Array.isArray(s.actions?.action) ? s.actions.action : [s.actions?.action].filter(Boolean);
      actions.forEach((a: any) => {
        adj[s["@_name"]].push(a["@_tostage"]);
      });
    });

    if (viewMode === 'swimlane') {
      // Swimlane layout: Categories based on StageType
      const categories = ['New', 'Standard', 'Restarted', 'Canceled', 'Final'];
      const getCategory = (s: JEPWorkflowStage) => {
        const type = s["@_stagetype"];
        if (!type) return 'Standard';
        return type as string;
      };

      const groupedStages: Record<string, JEPWorkflowStage[]> = {};
      categories.forEach(cat => groupedStages[cat] = []);
      
      stages.forEach(s => {
        const cat = getCategory(s);
        if (groupedStages[cat]) {
          groupedStages[cat].push(s);
        } else {
          if (!groupedStages['Standard']) groupedStages['Standard'] = [];
          groupedStages['Standard'].push(s);
        }
      });

      // Create Lane background nodes
       categories.forEach((cat, laneIdx) => {
         nodes.push({
           id: `lane-${cat}`,
           data: { label: cat === 'Standard' ? 'Standaard' : cat },
           position: { x: laneIdx * 300, y: 0 },
           style: { 
              width: 300, 
              height: 1200, 
              backgroundColor: laneIdx % 2 === 0 ? 'rgba(249, 250, 251, 0.4)' : 'transparent',
              borderRight: '1px solid #e5e7eb',
              borderBottom: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              zIndex: -1,
              pointerEvents: 'none',
              borderRadius: 0,
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '20px'
            },
           type: 'default', // Using a default node for the lane header
           selectable: false,
           draggable: false,
         });

        // Add nodes in this lane
        groupedStages[cat].forEach((stage, idx) => {
          nodes.push({
            id: stage["@_name"],
            type: 'stage',
            position: { x: laneIdx * 300 + 50, y: idx * 120 + 80 },
            data: { 
              stage,
              isSimulating,
              isCurrent: simulationCurrentStage === stage["@_name"]
            },
          });
        });
      });
    } else {
      // Flow layout (Original logic improved)
      const levels: Record<string, number> = {};
      const startStage = stages.find(s => s["@_stagetype"] === 'New') || stages[0];
      const queue = [{ id: startStage["@_name"], level: 0 }];
      const visited = new Set([startStage["@_name"]]);

      while (queue.length > 0) {
        const { id, level } = queue.shift()!;
        levels[id] = level;

        (adj[id] || []).forEach(nextId => {
          if (!visited.has(nextId)) {
            visited.add(nextId);
            queue.push({ id: nextId, level: level + 1 });
          }
        });
      }

      stages.forEach(s => {
        if (!(s["@_name"] in levels)) levels[s["@_name"]] = 0;
      });

      const levelGroups: Record<number, string[]> = {};
      Object.entries(levels).forEach(([id, level]) => {
        if (!levelGroups[level]) levelGroups[level] = [];
        levelGroups[level].push(id);
      });

      stages.forEach(stage => {
        const level = levels[stage["@_name"]];
        const indexInLevel = levelGroups[level].indexOf(stage["@_name"]);
        const totalInLevel = levelGroups[level].length;
        const xOffset = (indexInLevel - (totalInLevel - 1) / 2) * 250;

        nodes.push({
          id: stage["@_name"],
          type: 'stage',
          position: { x: 400 + xOffset, y: level * 180 + 50 },
          data: { 
            stage,
            isSimulating,
            isCurrent: simulationCurrentStage === stage["@_name"]
          },
        });
      });
    }

    // Create smart edges
    stages.forEach(stage => {
      const actions = Array.isArray(stage.actions?.action) ? stage.actions.action : [stage.actions?.action].filter(Boolean);
      
      actions.forEach((action: any) => {
        const targetStage = stages.find(s => s["@_name"] === action["@_tostage"]);
        if (!targetStage) return;

        // Smart Handle selection
        let sourceHandle = 'bottom-s';
        let targetHandle = 'top-t';

        if (viewMode === 'swimlane') {
          // In swimlane, nodes usually go right-to-left or top-to-bottom
          // For now let's use right/left if they are in different lanes
          const categories = ['New', 'Standard', 'Restarted', 'Canceled', 'Final'];
          const sourceCat = stage["@_stagetype"] || 'Standard';
          const targetCat = targetStage["@_stagetype"] || 'Standard';
          
          const sourceIdx = categories.indexOf(sourceCat === 'New' ? 'New' : sourceCat === 'Final' ? 'Final' : sourceCat === 'Restarted' ? 'Restarted' : sourceCat === 'Canceled' ? 'Canceled' : 'Standard');
          const targetIdx = categories.indexOf(targetCat === 'New' ? 'New' : targetCat === 'Final' ? 'Final' : targetCat === 'Restarted' ? 'Restarted' : targetCat === 'Canceled' ? 'Canceled' : 'Standard');

          if (sourceIdx < targetIdx) {
            sourceHandle = 'right-s';
            targetHandle = 'left-t';
          } else if (sourceIdx > targetIdx) {
            sourceHandle = 'left-s';
            targetHandle = 'right-t';
          } else {
            sourceHandle = 'bottom-s';
            targetHandle = 'top-t';
          }
        } else {
          // In Flow mode, use vertical layout mostly
          sourceHandle = 'bottom-s';
          targetHandle = 'top-t';
        }

        edges.push({
          id: `${stage["@_name"]}-${action["@_name"]}-${action["@_tostage"]}`,
          source: stage["@_name"],
          target: action["@_tostage"],
          sourceHandle: sourceHandle,
          targetHandle: targetHandle,
          label: action["@_caption"],
          type: 'smoothstep', // Smoother lines
          animated: isSimulating && simulationCurrentStage === stage["@_name"],
          style: { 
            stroke: isSimulating && simulationCurrentStage === stage["@_name"] ? '#3b82f6' : '#003399', 
            strokeWidth: isSimulating && simulationCurrentStage === stage["@_name"] ? 3 : 2,
          },
          labelStyle: { fill: '#003399', fontWeight: 700, fontSize: 10 },
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: '#fff', fillOpacity: 0.8 },
        });
      });
    });

    return { nodes, edges };
  };

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (!activeWorkflow?.stages?.stage) return { nodes: [], edges: [] };
    const stages = Array.isArray(activeWorkflow.stages.stage) ? activeWorkflow.stages.stage : [activeWorkflow.stages.stage];
    return getLayoutedElements(stages);
  }, [activeWorkflow, isSimulating, simulationCurrentStage, viewMode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    // Trigger fitView when layout changes
    setTimeout(() => {
      fitView({ duration: 800 });
    }, 50);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges, fitView]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (_: any, node: Node) => {
    setSelectedStageName(node.id);
  };

  const selectedStage = useMemo(() => {
    if (!selectedStageName || !activeWorkflow?.stages?.stage) return null;
    const stages = Array.isArray(activeWorkflow.stages.stage) ? activeWorkflow.stages.stage : [activeWorkflow.stages.stage];
    return stages.find(s => s["@_name"] === selectedStageName);
  }, [selectedStageName, activeWorkflow]);

  const workflowProperties = useMemo(() => {
    return activeWorkflow?.customentity?.property || [];
  }, [activeWorkflow]);

  const handleAddWorkflow = () => {
    const prefix = model?.extension?.["@_code"] || "CUSTOM";
    const newWorkflow: JEPWorkflowDefinition = {
      "@_name": `${prefix}_Wfl_NewProcess`,
      "@_description": "Nieuw Bedrijfsproces",
      customentity: {
        "@_name": `${prefix}_Ent_NewProcess`,
        property: [
          {
            "@_name": "Description",
            "@_type": "string",
            "@_length": "60",
            "@_caption": "Omschrijving",
            "@_allowempty": "false",
            "@_isdescription": "true"
          }
        ]
      },
      stages: {
        stage: [
          {
            "@_name": "New",
            "@_caption": "Nieuw",
            "@_stagetype": "New",
            actions: {
              action: []
            },
            propertysettings: {
              propertysetting: []
            }
          }
        ]
      }
    };

    updateModel((m) => {
      if (!m.extension) return;
      if (!m.extension.workflowdefinitions) {
        m.extension.workflowdefinitions = { workflowdefinition: [] };
      }
      const wfs = m.extension.workflowdefinitions.workflowdefinition;
      const allWfs = Array.isArray(wfs) ? [...wfs] : [wfs].filter(Boolean);
      allWfs.push(newWorkflow);
      m.extension.workflowdefinitions.workflowdefinition = allWfs;
    });
    
    addChangelog(`Nieuwe workflow aangemaakt: ${newWorkflow["@_description"]} (${newWorkflow["@_name"]})`);
    setActiveWorkflowIndex(allWorkflows.length);
    addNotification("Nieuwe workflow aangemaakt.", "success");
  };

  const handleUpdateWorkflow = (updatedWorkflow: JEPWorkflowDefinition) => {
    updateModel((m) => {
      if (!m.extension?.workflowdefinitions) return;
      const wfs = m.extension.workflowdefinitions.workflowdefinition;
      const allWfs = Array.isArray(wfs) ? [...wfs] : [wfs];
      allWfs[activeWorkflowIndex] = updatedWorkflow;
      m.extension.workflowdefinitions.workflowdefinition = allWfs;
    });
    addChangelog(`Workflow instellingen bijgewerkt voor: ${updatedWorkflow["@_name"]}`);
    addNotification("Workflow instellingen bijgewerkt.", "success");
  };

  const selectedAction = useMemo(() => {
    if (!editingAction || !activeWorkflow?.stages?.stage) return null;
    const stages = Array.isArray(activeWorkflow.stages.stage) ? activeWorkflow.stages.stage : [activeWorkflow.stages.stage];
    const stage = stages.find(s => s["@_name"] === editingAction.stageName);
    if (!stage || !stage.actions?.action) return null;
    const actions = Array.isArray(stage.actions.action) ? stage.actions.action : [stage.actions.action];
    return actions.find(a => a["@_name"] === editingAction.actionName);
  }, [editingAction, activeWorkflow]);

  const handleUpdateActionSkipCondition = (condition: string) => {
    if (!editingAction) return;

    updateModel((m) => {
      if (!m.extension?.workflowdefinitions) return;
      const wfs = m.extension.workflowdefinitions.workflowdefinition;
      const allWfs = Array.isArray(wfs) ? [...wfs] : [wfs];
      const wf = allWfs[activeWorkflowIndex];
      const stages = Array.isArray(wf.stages.stage) ? [...wf.stages.stage] : [wf.stages.stage];
      const stageIndex = stages.findIndex(s => s["@_name"] === editingAction.stageName);
      if (stageIndex === -1) return;
      
      const stage = { ...stages[stageIndex] };
      if (!stage.actions?.action) return;
      
      const actions = Array.isArray(stage.actions.action) ? [...stage.actions.action] : [stage.actions.action];
      const actionIndex = actions.findIndex(a => a["@_name"] === editingAction.actionName);
      if (actionIndex === -1) return;

      const action = { ...actions[actionIndex] };
      if (condition.trim() === "") {
        delete action["@_skipcondition"];
      } else {
        action["@_skipcondition"] = condition;
      }
      
      actions[actionIndex] = action;
      stage.actions.action = actions;
      stages[stageIndex] = stage;
      wf.stages.stage = stages;
      m.extension.workflowdefinitions.workflowdefinition = allWfs;
    });
    addChangelog(`Skip conditie bijgewerkt voor actie '${editingAction.actionName}' in stage '${editingAction.stageName}'.`);
  };

  const startSimulation = () => {
    if (!activeWorkflow?.stages?.stage) return;
    const stages = Array.isArray(activeWorkflow.stages.stage) ? activeWorkflow.stages.stage : [activeWorkflow.stages.stage];
    if (stages.length === 0) {
      addNotification("Deze workflow heeft nog geen stages om te simuleren.", "warning");
      return;
    }
    const startStage = stages.find(s => s["@_stagetype"] === 'New') || stages[0];
    
    if (startStage) {
      setIsSimulating(true);
      setSimulationCurrentStage(startStage["@_name"]);
      setSelectedStageName(startStage["@_name"]);
      addNotification(`Simulatie gestart vanaf '${startStage["@_caption"]}' stage.`, "info");
    }
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setSimulationCurrentStage(null);
    addNotification("Simulatie gestopt.", "info");
  };

  const handleSimulationAction = (toStage: string) => {
    setSimulationCurrentStage(toStage);
    setSelectedStageName(toStage);
    
    const stages = Array.isArray(activeWorkflow.stages.stage) ? activeWorkflow.stages.stage : [activeWorkflow.stages.stage];
    const targetStage = stages.find(s => s["@_name"] === toStage);
    
    if (targetStage?.["@_stagetype"] === 'Final' || targetStage?.["@_stagetype"] === 'Canceled') {
      addNotification(`Proces voltooid met status: ${targetStage["@_caption"]}`, "success");
    }
  };

  const handleTogglePropertySetting = (propName: string, type: 'visible' | 'enabled' | 'mandatory') => {
    if (!selectedStageName) return;

    updateModel((m) => {
      if (!m.extension?.workflowdefinitions) return;
      const wfs = m.extension.workflowdefinitions.workflowdefinition;
      const allWfs = Array.isArray(wfs) ? [...wfs] : [wfs];
      const wf = allWfs[activeWorkflowIndex];
      if (!wf) return;

      const stages = Array.isArray(wf.stages.stage) ? [...wf.stages.stage] : [wf.stages.stage];
      const stageIndex = stages.findIndex(s => s["@_name"] === selectedStageName);
      if (stageIndex === -1) return;
      
      const stage = { ...stages[stageIndex] };

      if (!stage.propertysettings) stage.propertysettings = { propertysetting: [] };
      const settings = Array.isArray(stage.propertysettings.propertysetting) 
        ? [...stage.propertysettings.propertysetting] 
        : [stage.propertysettings.propertysetting].filter(Boolean);

      let settingIndex = settings.findIndex(s => s["@_property"] === propName);
      let setting = settingIndex !== -1 ? { ...settings[settingIndex] } : null;

      if (!setting) {
        // Create new setting with defaults
        setting = {
          "@_property": propName,
          "@_visible": "true",
          "@_enabled": "true",
          "@_mandatory": "false"
        };
        settings.push(setting);
        settingIndex = settings.length - 1;
      }

      // Toggle the value
      const attr = `@_${type}` as keyof JEPWorkflowPropertySetting;
      const currentValue = setting[attr];
      
      if (type === 'mandatory') {
        setting[attr] = currentValue === 'true' ? 'false' : 'true';
      } else {
        setting[attr] = currentValue === 'false' ? 'true' : 'false';
      }

      // Update in settings array
      settings[settingIndex] = setting;

      // If setting is now at defaults (true, true, false), we can remove it to keep XML clean
      if (setting["@_visible"] === 'true' && setting["@_enabled"] === 'true' && setting["@_mandatory"] === 'false') {
        settings.splice(settingIndex, 1);
      }

      stage.propertysettings.propertysetting = settings;
      stages[stageIndex] = stage;
      wf.stages.stage = stages;
      m.extension.workflowdefinitions.workflowdefinition = allWfs;
    });
    addChangelog(`Veldinstelling '${propName}' (${type}) gewijzigd in stage '${selectedStageName}'.`);
  };

  if (!activeWorkflow) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-gray-50">
        <Activity className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-heading font-semibold text-exact-dark">Geen workflows gevonden</h2>
        <p className="text-gray-500 mt-2 mb-8 max-w-md">
          Start met het digitaliseren van je bedrijfsprocessen door een nieuwe workflow aan te maken.
        </p>
        <button
          onClick={handleAddWorkflow}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-exact-blue hover:bg-blue-800 transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nieuwe Workflow Starten
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
        <div className="flex items-center space-x-4">
          <select 
            value={activeWorkflowIndex}
            onChange={(e) => {
              setActiveWorkflowIndex(parseInt(e.target.value));
              setSelectedStageName(null);
            }}
            className="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-exact-red focus:border-exact-red sm:text-sm rounded-lg font-sans"
          >
            {allWorkflows.map((wf, idx) => (
              <option key={idx} value={idx}>{wf["@_description"] || wf["@_name"]}</option>
            ))}
          </select>
          <button 
            onClick={handleAddWorkflow}
            className="p-2 text-gray-400 hover:text-exact-blue hover:bg-blue-50 rounded-lg transition-all"
            title="Workflow toevoegen"
          >
            <Plus className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-gray-200 mx-2" />
          
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('flow')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'flow' ? 'bg-white text-exact-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Rows className="w-3.5 h-3.5" />
              <span>Flow</span>
            </button>
            <button 
              onClick={() => setViewMode('swimlane')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'swimlane' ? 'bg-white text-exact-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Swimlane</span>
            </button>
          </div>
        </div>
        <div className="flex space-x-3">
          {isSimulating ? (
            <button 
              onClick={stopSimulation}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors font-sans"
            >
              <CircleStop className="w-4 h-4 mr-2" />
              Stop Simulatie
            </button>
          ) : (
            <button 
              onClick={() => setShowSimulationInfo(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-sans"
            >
              <Play className="w-4 h-4 mr-2 text-emerald-600" />
              Simulatie
            </button>
          )}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-exact-red hover:bg-red-800 transition-colors font-sans"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Workflow Instellingen
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Simulation Banner */}
        <AnimatePresence>
          {isSimulating && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg flex items-center space-x-3"
            >
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-bold">Simulatie Modus Actief</span>
              <div className="h-4 w-px bg-blue-400" />
              <span className="text-xs opacity-90">Huidige stage: {(Array.isArray(activeWorkflow.stages.stage) ? activeWorkflow.stages.stage : [activeWorkflow.stages.stage]).find((s: any) => s["@_name"] === simulationCurrentStage)?.["@_caption"]}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* React Flow Canvas */}
        <div className="flex-1 relative overflow-hidden workflow-designer-canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
          >
            <Background color="#f1f1f1" gap={20} />
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                switch (node.data?.stage?.["@_stagetype"]) {
                  case 'New': return '#10b981';
                  case 'Canceled': return '#ef4444';
                  case 'Restarted': return '#3b82f6';
                  default: return '#e2e8f0';
                }
              }}
            />
            <Panel position="top-right" className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 m-4 max-w-xs">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 font-sans">Legenda</h3>
              <div className="space-y-2">
                <div className="flex items-center text-xs text-gray-600 font-sans">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div> Start (New)
                </div>
                <div className="flex items-center text-xs text-gray-600 font-sans">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div> Herstart (Restarted)
                </div>
                <div className="flex items-center text-xs text-gray-600 font-sans">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div> Stop (Canceled)
                </div>
                <div className="flex items-center text-xs text-gray-600 font-sans">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div> Einde (Final)
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Sidebar for Stage Details */}
        {selectedStage && (
          <motion.div 
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            className="w-96 border-l border-gray-200 bg-gray-50 flex flex-col shadow-2xl"
          >
            <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-heading font-semibold text-exact-dark">
                  Stage: {selectedStage["@_caption"]}
                </h3>
                <p className="text-xs text-gray-500 font-sans">ID: {selectedStage["@_name"]}</p>
              </div>
              <button 
                onClick={() => setSelectedStageName(null)}
                className="p-2 text-gray-400 hover:text-exact-red hover:bg-red-50 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Property Settings */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Veld Instellingen (PropertySettings)
                </h4>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100 shadow-sm">
                  {workflowProperties.map((prop: JEPProperty, i: number) => {
                    const settings = Array.isArray(selectedStage.propertysettings?.propertysetting) 
                      ? selectedStage.propertysettings?.propertysetting 
                      : [selectedStage.propertysettings?.propertysetting].filter(Boolean);
                    
                    const setting = settings.find(s => s?.["@_property"] === prop["@_name"]);

                    return (
                      <div key={i} className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-exact-dark truncate">{prop["@_caption"]}</div>
                          <div className="text-[10px] text-gray-400 font-sans">ID: {prop["@_name"]}</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => handleTogglePropertySetting(prop["@_name"], 'visible')}
                            className={`p-1.5 rounded-lg transition-all ${setting?.["@_visible"] === 'false' ? 'text-gray-400 bg-gray-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                            title={setting?.["@_visible"] === 'false' ? 'Onzichtbaar (klik om te tonen)' : 'Zichtbaar (klik om te verbergen)'}
                          >
                            {setting?.["@_visible"] === 'false' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleTogglePropertySetting(prop["@_name"], 'enabled')}
                            className={`p-1.5 rounded-lg transition-all ${setting?.["@_enabled"] === 'false' ? 'text-gray-400 bg-gray-100' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`}
                            title={setting?.["@_enabled"] === 'false' ? 'Alleen-lezen (klik om aanpasbaar te maken)' : 'Aanpasbaar (klik om alleen-lezen te maken)'}
                          >
                            {setting?.["@_enabled"] === 'false' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleTogglePropertySetting(prop["@_name"], 'mandatory')}
                            className={`p-1.5 rounded-lg transition-all ${setting?.["@_mandatory"] === 'true' ? 'text-exact-red bg-red-50 hover:bg-red-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}`}
                            title={setting?.["@_mandatory"] === 'true' ? 'Verplicht (klik om optioneel te maken)' : 'Optioneel (klik om verplicht te maken)'}
                          >
                            <Asterisk className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions from this stage */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Acties (Actions)
                </h4>
                <div className="space-y-3">
                  {isSimulating && (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                      <p className="text-[10px] font-bold text-blue-800 uppercase mb-2">Simulatie Acties</p>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(selectedStage.actions?.action) ? selectedStage.actions?.action : [selectedStage.actions?.action].filter(Boolean))
                          .map((action: any, i: number) => (
                            <button
                              key={i}
                              onClick={() => handleSimulationAction(action["@_tostage"])}
                              className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            >
                              {action["@_caption"]}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                  {(Array.isArray(selectedStage.actions?.action) ? selectedStage.actions?.action : [selectedStage.actions?.action].filter(Boolean))
                    .map((action: any, i: number) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-exact-dark">{action["@_caption"]}</div>
                            <div className="text-[10px] text-exact-blue font-bold">Naar: {action["@_tostage"]}</div>
                          </div>
                          <button 
                            onClick={() => setEditingAction({ stageName: selectedStage["@_name"], actionName: action["@_name"] })}
                            className={`p-2 rounded-lg transition-all ${editingAction?.actionName === action["@_name"] ? 'text-exact-blue bg-blue-50' : 'text-gray-400 hover:text-exact-blue hover:bg-blue-50'}`}
                          >
                            <Settings2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {editingAction?.actionName === action["@_name"] && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pt-3 border-t border-gray-100 space-y-3"
                          >
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Skip Conditie (Expression)</label>
                              <div className="relative">
                                <textarea
                                  value={action["@_skipcondition"] || ""}
                                  onChange={(e) => handleUpdateActionSkipCondition(e.target.value)}
                                  placeholder="Bijv: {Status} == 20"
                                  className="w-full p-2 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-exact-blue focus:border-exact-blue outline-none min-h-[60px]"
                                />
                                <div className="absolute right-2 bottom-2 text-[9px] text-gray-400 italic">Expression Engine</div>
                              </div>
                            </div>
                            <button 
                              onClick={() => setEditingAction(null)}
                              className="w-full py-1.5 text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                            >
                              Sluiten
                            </button>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-exact-blue hover:text-exact-blue transition-all flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Nieuwe Actie Toevoegen
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      {/* Modals */}
      {isSettingsOpen && (
        <WorkflowSettingsModal 
          workflow={activeWorkflow}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleUpdateWorkflow}
        />
      )}

      {showSimulationInfo && (
        <SimulationInfoModal 
          onClose={() => setShowSimulationInfo(false)}
          onStart={startSimulation}
        />
      )}
    </div>
  );
}
