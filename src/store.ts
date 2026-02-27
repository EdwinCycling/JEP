import { create } from "zustand";
import { JEPModel } from "./types";

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface JEPState {
  model: JEPModel | null;
  explanation: string | null;
  changelog: string[];
  addedFieldIds: string[];
  notifications: Notification[];
  setModel: (model: JEPModel) => void;
  setExplanation: (explanation: string) => void;
  addChangelog: (change: string) => void;
  addAddedFieldId: (id: string) => void;
  removeAddedFieldId: (id: string) => void;
  clearChangelog: () => void;
  updateModel: (updater: (model: JEPModel) => void) => void;
  addNotification: (message: string, type?: Notification['type']) => void;
  removeNotification: (id: string) => void;
}

export const useJEPStore = create<JEPState>((set) => ({
  model: null,
  explanation: null,
  changelog: [],
  addedFieldIds: [],
  notifications: [],
  setModel: (model) => {
    if (model && model.extension) {
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
    set({ model, changelog: [], addedFieldIds: [] });
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
      // We create a deep copy to ensure reactivity
      const newModel = JSON.parse(JSON.stringify(state.model));
      updater(newModel);

      // Normalize order of keys in extension
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

      return { model: newModel };
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
}));
