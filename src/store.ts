import { create } from "zustand";
import { JEPModel } from "./types";

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface JEPState {
  model: JEPModel | null;
  history: JEPModel[]; // History for undo
  explanation: string | null;
  changelog: string[];
  addedFieldIds: string[];
  notifications: Notification[];
  dialog: {
    isOpen: boolean;
    type: 'alert' | 'confirm' | 'prompt';
    title: string;
    message: string;
    defaultValue?: string;
    onConfirm?: (value?: string) => void;
    onCancel?: () => void;
  } | null;
  setModel: (model: JEPModel) => void;
  setExplanation: (explanation: string) => void;
  addChangelog: (change: string) => void;
  addAddedFieldId: (id: string) => void;
  removeAddedFieldId: (id: string) => void;
  clearChangelog: () => void;
  updateModel: (updater: (model: JEPModel) => void) => void;
  undo: () => void;
  addNotification: (message: string, type?: Notification['type']) => void;
  removeNotification: (id: string) => void;
  showDialog: (options: Omit<NonNullable<JEPState['dialog']>, 'isOpen'>) => void;
  closeDialog: () => void;
}

export const useJEPStore = create<JEPState>((set) => ({
  model: null,
  history: [],
  explanation: null,
  changelog: [],
  addedFieldIds: [],
  notifications: [],
  dialog: null,
  setModel: (model) => {
    if (model && model.extension) {
      normalizeModel(model);
      const { "@_code": code, "@_version": version, ...rest } = model.extension;
      const orderedKeys = [
        "customentities",
        "entities",
        "workflowdefinitions",
        "megamenuextensions",
        "quickmenuextensions",
        "roles",
        "applicationextensions",
        "translationextensions"
      ];
      const newExtension: any = { "@_code": code, "@_version": version };
      orderedKeys.forEach(key => { if (rest[key]) newExtension[key] = rest[key]; });
      Object.keys(rest).forEach(key => { if (!orderedKeys.includes(key)) newExtension[key] = rest[key]; });
      model.extension = newExtension;
    }
    set({ model, changelog: [], addedFieldIds: [], history: [] });
  },
  setExplanation: (explanation) => set({ explanation }),
  addChangelog: (change) =>
    set((state) => ({ changelog: [...state.changelog, change] })),
  addAddedFieldId: (id) =>
    set((state) => ({ addedFieldIds: [...state.addedFieldIds, id] })),
  removeAddedFieldId: (id) =>
    set((state) => ({
      addedFieldIds: state.addedFieldIds.filter((fieldId) => fieldId !== id),
    })),
  clearChangelog: () => set({ changelog: [] }),
  updateModel: (updater) =>
    set((state) => {
      if (!state.model) return state;
      
      // Save current state to history before update
      const history = [...state.history, JSON.parse(JSON.stringify(state.model))];
      
      // Keep history limited to 50 steps
      if (history.length > 50) history.shift();

      const newModel = JSON.parse(JSON.stringify(state.model));
      normalizeModel(newModel);
      updater(newModel);
      normalizeModel(newModel);

      if (newModel && newModel.extension) {
        const { "@_code": code, "@_version": version, ...rest } = newModel.extension;
        const orderedKeys = [
          "customentities",
          "entities",
          "workflowdefinitions",
          "megamenuextensions",
          "quickmenuextensions",
          "roles",
          "applicationextensions",
          "translationextensions"
        ];
        const newExtension: any = { "@_code": code, "@_version": version };
        orderedKeys.forEach(key => { if (rest[key]) newExtension[key] = rest[key]; });
        Object.keys(rest).forEach(key => { if (!orderedKeys.includes(key)) newExtension[key] = rest[key]; });
        newModel.extension = newExtension;
      }

      return { model: newModel, history };
    }),
  undo: () =>
    set((state) => {
      if (state.history.length === 0) return state;
      
      const newHistory = [...state.history];
      const previousModel = newHistory.pop();
      const newChangelog = [...state.changelog];
      newChangelog.pop(); // Remove last entry from log

      return { 
        model: previousModel || state.model, 
        history: newHistory,
        changelog: newChangelog
      };
    }),
  addNotification: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 5000);
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  showDialog: (options) => set({ dialog: { ...options, isOpen: true } }),
  closeDialog: () => set({ dialog: null }),
}));

// Helper function to ensure collections are always arrays
function normalizeModel(model: JEPModel) {
  if (!model.extension) return;

  const ext = model.extension as any;

  // Level 1: Main collections in extension
  const collections = [
    { parent: ext, key: 'entities', childKey: 'entity' },
    { parent: ext, key: 'customentities', childKey: 'customentity' },
    { parent: ext, key: 'workflowdefinitions', childKey: 'workflowdefinition' },
    { parent: ext, key: 'megamenuextensions', childKey: 'megamenuextension' },
    { parent: ext, key: 'quickmenuextensions', childKey: 'quickmenuextension' },
    { parent: ext, key: 'roles', childKey: 'role' },
    { parent: ext, key: 'roles', childKey: 'extensionrole' },
    { parent: ext, key: 'roles', childKey: 'existingrole' },
    { parent: ext, key: 'applicationextensions', childKey: 'applicationextension' },
    { parent: ext, key: 'translationextensions', childKey: 'translation' },
    { parent: ext, key: 'businesscomponentextensions', childKey: 'businesscomponent' }
  ];

  collections.forEach(({ parent, key, childKey }) => {
    if (parent[key] && parent[key][childKey]) {
      if (!Array.isArray(parent[key][childKey])) {
        parent[key][childKey] = [parent[key][childKey]];
      }
    } else if (parent[key]) {
      // If the parent key exists but childKey doesn't, initialize it as empty array
      // This helps with .find() calls later
      parent[key][childKey] = [];
    }
  });

  // Level 1.5: Validation function rules in business components
  if (ext.businesscomponentextensions?.businesscomponent) {
    ext.businesscomponentextensions.businesscomponent.forEach((bc: any) => {
      if (bc.validationfunctionrule && !Array.isArray(bc.validationfunctionrule)) {
        bc.validationfunctionrule = [bc.validationfunctionrule];
      } else if (!bc.validationfunctionrule) {
        bc.validationfunctionrule = [];
      }
    });
  }

  // Level 1.6: Role custom entities
  if (ext.roles) {
    ['role', 'extensionrole', 'existingrole'].forEach(roleKey => {
      if (ext.roles[roleKey]) {
        const roles = Array.isArray(ext.roles[roleKey]) ? ext.roles[roleKey] : [ext.roles[roleKey]];
        roles.forEach((role: any) => {
          if (role.customentity && !Array.isArray(role.customentity)) {
            role.customentity = [role.customentity];
          } else if (!role.customentity) {
            role.customentity = [];
          }
        });
      }
    });
  }

  // Level 2: Properties in entities
  const allEntities = [
    ...(ext.entities?.entity || []),
    ...(ext.customentities?.customentity || [])
  ];

  allEntities.forEach((entity: any) => {
    if (entity.property && !Array.isArray(entity.property)) {
      entity.property = [entity.property];
    } else if (!entity.property) {
      entity.property = [];
    }
  });

  // Level 3: Workflow stages and transitions
  const workflows = ext.workflowdefinitions?.workflowdefinition || [];
  workflows.forEach((wf: any) => {
    if (wf.stages && wf.stages.stage) {
      if (!Array.isArray(wf.stages.stage)) {
        wf.stages.stage = [wf.stages.stage];
      }
      wf.stages.stage.forEach((stage: any) => {
        if (stage.transitions && stage.transitions.transition) {
          if (!Array.isArray(stage.transitions.transition)) {
            stage.transitions.transition = [stage.transitions.transition];
          }
        } else if (stage.transitions) {
          stage.transitions.transition = [];
        }
      });
    }
  });

  // Level 4: Application extensions sections and fields
  const appExts = ext.applicationextensions?.applicationextension || [];
  appExts.forEach((appExt: any) => {
    if (appExt.cardsection) {
      if (!Array.isArray(appExt.cardsection)) {
        appExt.cardsection = [appExt.cardsection];
      }
      appExt.cardsection.forEach((section: any) => {
        if (section.field && !Array.isArray(section.field)) {
          section.field = [section.field];
        } else if (!section.field) {
          section.field = [];
        }
      });
    }
    if (appExt.contentsectionrow) {
      if (!Array.isArray(appExt.contentsectionrow)) {
        appExt.contentsectionrow = [appExt.contentsectionrow];
      }
      appExt.contentsectionrow.forEach((row: any) => {
        if (row.field && !Array.isArray(row.field)) {
          row.field = [row.field];
        } else if (!row.field) {
          row.field = [];
        }
      });
    }
  });
}
