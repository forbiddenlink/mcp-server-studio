import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Node, Edge } from '@xyflow/react';
import { MCPTool, MCPServerConfig, ChatMessage } from '../types';

const MAX_HISTORY_SIZE = 50;

interface HistoryEntry {
  tools: MCPTool[];
  nodes: Node[];
  edges: Edge[];
}

interface StoreState {
  // React Flow state
  nodes: Node[];
  edges: Edge[];

  // Tools and config
  tools: MCPTool[];
  serverConfig: MCPServerConfig;
  selectedNodeId: string | null;

  // Chat state
  messages: ChatMessage[];

  // Clipboard
  clipboard: MCPTool | null;

  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;

  // Actions
  addTool: (tool: MCPTool) => void;
  updateTool: (id: string, tool: Partial<MCPTool>) => void;
  deleteTool: (id: string) => void;
  selectNode: (id: string | null) => void;
  duplicateTool: (id: string) => void;

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
  serverConfig: {
    name: 'my-mcp-server',
    version: '1.0.0',
    tools: [],
  },
  selectedNodeId: null,
  messages: [],
  clipboard: null,
  history: [],
  historyIndex: -1,

  // Tool actions
  addTool: (tool) => {
    const { tools, nodes, edges, history, historyIndex } = get();

    // Initialize history with current state if empty
    let newHistory = history.length === 0
      ? [{ tools: [], nodes: [], edges: [] }]
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
    newHistory.push({
      tools: newTools.map(t => ({ ...t, parameters: [...t.parameters] })),
      nodes: newNodes.map(n => ({ ...n })),
      edges: edges.map(e => ({ ...e })),
    });

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
    const { tools, nodes, edges, history, historyIndex } = get();

    // Initialize history with current state if empty
    let newHistory = history.length === 0
      ? [{
          tools: tools.map(t => ({ ...t, parameters: [...t.parameters] })),
          nodes: nodes.map(n => ({ ...n })),
          edges: edges.map(e => ({ ...e })),
        }]
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
    newHistory.push({
      tools: updatedTools.map(t => ({ ...t, parameters: [...t.parameters] })),
      nodes: updatedNodes.map(n => ({ ...n })),
      edges: edges.map(e => ({ ...e })),
    });

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
    const { tools, nodes, edges, history, historyIndex } = get();

    // Initialize history with current state if empty
    let newHistory = history.length === 0
      ? [{
          tools: tools.map(t => ({ ...t, parameters: [...t.parameters] })),
          nodes: nodes.map(n => ({ ...n })),
          edges: edges.map(e => ({ ...e })),
        }]
      : history.slice(0, historyIndex + 1);

    // Calculate new state
    const newTools = tools.filter((tool) => tool.id !== id);
    const newNodes = nodes.filter((node) => node.id !== id);

    // Push NEW state to history
    newHistory.push({
      tools: newTools.map(t => ({ ...t, parameters: [...t.parameters] })),
      nodes: newNodes.map(n => ({ ...n })),
      edges: edges.map(e => ({ ...e })),
    });

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
    const { tools, nodes, addTool } = get();
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
      nodes: entry.nodes,
      edges: entry.edges,
      historyIndex: prevIndex,
      serverConfig: {
        ...get().serverConfig,
        tools: entry.tools,
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
      nodes: entry.nodes,
      edges: entry.edges,
      historyIndex: nextIndex,
      serverConfig: {
        ...get().serverConfig,
        tools: entry.tools,
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
  
  onEdgesChange: (changes) => {
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
        nodes: state.nodes,
        edges: state.edges,
        serverConfig: state.serverConfig,
      }),
    }
  )
);
