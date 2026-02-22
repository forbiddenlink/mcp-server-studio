import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Node, Edge } from '@xyflow/react';
import { MCPTool, MCPResource, MCPPrompt, MCPServerConfig, ChatMessage } from '../types';

const MAX_HISTORY_SIZE = 50;

interface HistoryEntry {
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
  nodes: Node[];
  edges: Edge[];
}

/**
 * Helper to create a history entry from current state
 */
function createHistoryEntry(
  tools: MCPTool[],
  resources: MCPResource[],
  prompts: MCPPrompt[],
  nodes: Node[],
  edges: Edge[]
): HistoryEntry {
  return {
    tools: tools.map(t => ({ ...t, parameters: [...t.parameters] })),
    resources: resources.map(r => ({ ...r })),
    prompts: prompts.map(p => ({ ...p, arguments: [...p.arguments] })),
    nodes: nodes.map(n => ({ ...n })),
    edges: edges.map(e => ({ ...e })),
  };
}

interface StoreState {
  // React Flow state
  nodes: Node[];
  edges: Edge[];

  // Tools, resources, prompts, and config
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
  serverConfig: MCPServerConfig;
  selectedNodeId: string | null;

  // Chat state
  messages: ChatMessage[];

  // Clipboard
  clipboard: MCPTool | null;

  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;

  // Tool actions
  addTool: (tool: MCPTool) => void;
  updateTool: (id: string, tool: Partial<MCPTool>) => void;
  deleteTool: (id: string) => void;
  selectNode: (id: string | null) => void;
  duplicateTool: (id: string) => void;

  // Resource actions
  addResource: (resource: MCPResource) => void;
  updateResource: (id: string, resource: Partial<MCPResource>) => void;
  deleteResource: (id: string) => void;

  // Prompt actions
  addPrompt: (prompt: MCPPrompt) => void;
  updatePrompt: (id: string, prompt: Partial<MCPPrompt>) => void;
  deletePrompt: (id: string) => void;

  // Clipboard actions
  copyTool: (id: string) => void;
  pasteTool: () => void;

  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // React Flow actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;

  // Chat actions
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  tools: [],
  resources: [],
  prompts: [],
  serverConfig: {
    name: 'my-mcp-server',
    version: '1.0.0',
    tools: [],
    resources: [],
    prompts: [],
  },
  selectedNodeId: null,
  messages: [],
  clipboard: null,
  history: [],
  historyIndex: -1,

  // Tool actions
  addTool: (tool) => {
    const { tools, resources, prompts, nodes, edges, history, historyIndex } = get();

    // Initialize history with current state if empty
    let newHistory = history.length === 0
      ? [createHistoryEntry([], [], [], [], [])]
      : history.slice(0, historyIndex + 1);

    // Calculate new state
    const newTools = [...tools, tool];
    const newNode: Node = {
      id: tool.id,
      type: 'toolNode',
      position: { x: 100 + tools.length * 50, y: 100 + tools.length * 50 },
      data: { tool },
    };
    const newNodes = [...nodes, newNode];

    // Push NEW state to history
    newHistory.push(createHistoryEntry(newTools, resources, prompts, newNodes, edges));

    // Trim old history if exceeds max size
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
    }

    set({
      tools: newTools,
      nodes: newNodes,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      serverConfig: {
        ...get().serverConfig,
        tools: newTools,
      },
    });
  },

  updateTool: (id, updates) => {
    const { tools, resources, prompts, nodes, edges, history, historyIndex } = get();

    // Initialize history with current state if empty
    let newHistory = history.length === 0
      ? [createHistoryEntry(tools, resources, prompts, nodes, edges)]
      : history.slice(0, historyIndex + 1);

    // Calculate new state
    const updatedTools = tools.map((tool) =>
      tool.id === id ? { ...tool, ...updates } : tool
    );
    const updatedNodes = nodes.map((node) =>
      node.id === id
        ? { ...node, data: { ...node.data, tool: updatedTools.find((t) => t.id === id) } }
        : node
    );

    // Push NEW state to history
    newHistory.push(createHistoryEntry(updatedTools, resources, prompts, updatedNodes, edges));

    // Trim old history if exceeds max size
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
    }

    set({
      tools: updatedTools,
      nodes: updatedNodes,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      serverConfig: {
        ...get().serverConfig,
        tools: updatedTools,
      },
    });
  },

  deleteTool: (id) => {
    const { tools, resources, prompts, nodes, edges, history, historyIndex } = get();

    // Initialize history with current state if empty
    let newHistory = history.length === 0
      ? [createHistoryEntry(tools, resources, prompts, nodes, edges)]
      : history.slice(0, historyIndex + 1);

    // Calculate new state
    const newTools = tools.filter((tool) => tool.id !== id);
    const newNodes = nodes.filter((node) => node.id !== id);

    // Push NEW state to history
    newHistory.push(createHistoryEntry(newTools, resources, prompts, newNodes, edges));

    // Trim old history if exceeds max size
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
    }

    set({
      tools: newTools,
      nodes: newNodes,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      serverConfig: {
        ...get().serverConfig,
        tools: newTools,
      },
    });
  },

  selectNode: (id) => {
    set({ selectedNodeId: id });
  },

  duplicateTool: (id) => {
    const { tools, addTool } = get();
    const tool = tools.find((t) => t.id === id);
    if (!tool) return;

    const newTool: MCPTool = {
      ...tool,
      id: `tool-${Date.now()}`,
      name: `${tool.name} (copy)`,
      parameters: [...tool.parameters],
    };
    addTool(newTool);
  },

  // Resource actions
  addResource: (resource) => {
    const { tools, resources, prompts, nodes, edges, history, historyIndex } = get();

    let newHistory = history.length === 0
      ? [createHistoryEntry(tools, [], prompts, nodes, edges)]
      : history.slice(0, historyIndex + 1);

    const newResources = [...resources, resource];
    const newNode: Node = {
      id: resource.id,
      type: 'resourceNode',
      position: { x: 300 + nodes.length * 50, y: 100 + nodes.length * 50 },
      data: { resource },
    };
    const newNodes = [...nodes, newNode];

    newHistory.push(createHistoryEntry(tools, newResources, prompts, newNodes, edges));

    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
    }

    set({
      resources: newResources,
      nodes: newNodes,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      serverConfig: {
        ...get().serverConfig,
        resources: newResources,
      },
    });
  },

  updateResource: (id, updates) => {
    const { tools, resources, prompts, nodes, edges, history, historyIndex } = get();

    let newHistory = history.length === 0
      ? [createHistoryEntry(tools, resources, prompts, nodes, edges)]
      : history.slice(0, historyIndex + 1);

    const updatedResources = resources.map((resource) =>
      resource.id === id ? { ...resource, ...updates } : resource
    );
    const updatedNodes = nodes.map((node) =>
      node.id === id
        ? { ...node, data: { ...node.data, resource: updatedResources.find((r) => r.id === id) } }
        : node
    );

    newHistory.push(createHistoryEntry(tools, updatedResources, prompts, updatedNodes, edges));

    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
    }

    set({
      resources: updatedResources,
      nodes: updatedNodes,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      serverConfig: {
        ...get().serverConfig,
        resources: updatedResources,
      },
    });
  },

  deleteResource: (id) => {
    const { tools, resources, prompts, nodes, edges, history, historyIndex } = get();

    let newHistory = history.length === 0
      ? [createHistoryEntry(tools, resources, prompts, nodes, edges)]
      : history.slice(0, historyIndex + 1);

    const newResources = resources.filter((resource) => resource.id !== id);
    const newNodes = nodes.filter((node) => node.id !== id);

    newHistory.push(createHistoryEntry(tools, newResources, prompts, newNodes, edges));

    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
    }

    set({
      resources: newResources,
      nodes: newNodes,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      serverConfig: {
        ...get().serverConfig,
        resources: newResources,
      },
    });
  },

  // Prompt actions
  addPrompt: (prompt) => {
    const { tools, resources, prompts, nodes, edges, history, historyIndex } = get();

    let newHistory = history.length === 0
      ? [createHistoryEntry(tools, resources, [], nodes, edges)]
      : history.slice(0, historyIndex + 1);

    const newPrompts = [...prompts, prompt];
    const newNode: Node = {
      id: prompt.id,
      type: 'promptNode',
      position: { x: 500 + nodes.length * 50, y: 100 + nodes.length * 50 },
      data: { prompt },
    };
    const newNodes = [...nodes, newNode];

    newHistory.push(createHistoryEntry(tools, resources, newPrompts, newNodes, edges));

    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
    }

    set({
      prompts: newPrompts,
      nodes: newNodes,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      serverConfig: {
        ...get().serverConfig,
        prompts: newPrompts,
      },
    });
  },

  updatePrompt: (id, updates) => {
    const { tools, resources, prompts, nodes, edges, history, historyIndex } = get();

    let newHistory = history.length === 0
      ? [createHistoryEntry(tools, resources, prompts, nodes, edges)]
      : history.slice(0, historyIndex + 1);

    const updatedPrompts = prompts.map((prompt) =>
      prompt.id === id ? { ...prompt, ...updates } : prompt
    );
    const updatedNodes = nodes.map((node) =>
      node.id === id
        ? { ...node, data: { ...node.data, prompt: updatedPrompts.find((p) => p.id === id) } }
        : node
    );

    newHistory.push(createHistoryEntry(tools, resources, updatedPrompts, updatedNodes, edges));

    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
    }

    set({
      prompts: updatedPrompts,
      nodes: updatedNodes,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      serverConfig: {
        ...get().serverConfig,
        prompts: updatedPrompts,
      },
    });
  },

  deletePrompt: (id) => {
    const { tools, resources, prompts, nodes, edges, history, historyIndex } = get();

    let newHistory = history.length === 0
      ? [createHistoryEntry(tools, resources, prompts, nodes, edges)]
      : history.slice(0, historyIndex + 1);

    const newPrompts = prompts.filter((prompt) => prompt.id !== id);
    const newNodes = nodes.filter((node) => node.id !== id);

    newHistory.push(createHistoryEntry(tools, resources, newPrompts, newNodes, edges));

    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
    }

    set({
      prompts: newPrompts,
      nodes: newNodes,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      serverConfig: {
        ...get().serverConfig,
        prompts: newPrompts,
      },
    });
  },

  copyTool: (id) => {
    const { tools } = get();
    const tool = tools.find((t) => t.id === id);
    if (tool) {
      set({ clipboard: { ...tool, parameters: [...tool.parameters] } });
    }
  },

  pasteTool: () => {
    const { clipboard, addTool } = get();
    if (!clipboard) return;

    const newTool: MCPTool = {
      ...clipboard,
      id: `tool-${Date.now()}`,
      name: `${clipboard.name} (copy)`,
      parameters: [...clipboard.parameters],
    };
    addTool(newTool);
  },

  undo: () => {
    const { history, historyIndex } = get();
    // Can undo if we have history entries before current position
    if (historyIndex <= 0 || history.length === 0) return;

    const prevIndex = historyIndex - 1;
    const entry = history[prevIndex];
    set({
      tools: entry.tools,
      resources: entry.resources,
      prompts: entry.prompts,
      nodes: entry.nodes,
      edges: entry.edges,
      historyIndex: prevIndex,
      serverConfig: {
        ...get().serverConfig,
        tools: entry.tools,
        resources: entry.resources,
        prompts: entry.prompts,
      },
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    // Can redo if there are entries after current position
    if (historyIndex >= history.length - 1) return;

    const nextIndex = historyIndex + 1;
    const entry = history[nextIndex];
    set({
      tools: entry.tools,
      resources: entry.resources,
      prompts: entry.prompts,
      nodes: entry.nodes,
      edges: entry.edges,
      historyIndex: nextIndex,
      serverConfig: {
        ...get().serverConfig,
        tools: entry.tools,
        resources: entry.resources,
        prompts: entry.prompts,
      },
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // React Flow actions
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    // Handle node changes from React Flow
    set((state) => {
      const updatedNodes = changes.reduce((acc: Node[], change: any) => {
        if (change.type === 'position' && change.dragging) {
          return acc.map((node) =>
            node.id === change.id
              ? { ...node, position: change.position }
              : node
          );
        }
        return acc;
      }, state.nodes);

      return { nodes: updatedNodes };
    });
  },

  onEdgesChange: () => {
    // Handle edge changes (for future workflow features)
    set((state) => ({ edges: state.edges }));
  },

  // Chat actions
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },
    }),
    {
      name: 'mcp-server-studio',
      partialize: (state) => ({
        tools: state.tools,
        resources: state.resources,
        prompts: state.prompts,
        nodes: state.nodes,
        edges: state.edges,
        serverConfig: state.serverConfig,
      }),
    }
  )
);
