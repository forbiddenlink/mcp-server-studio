import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Node, Edge } from '@xyflow/react';
import { MCPTool, MCPServerConfig, ChatMessage } from '../types';

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
  
  // Actions
  addTool: (tool: MCPTool) => void;
  updateTool: (id: string, tool: Partial<MCPTool>) => void;
  deleteTool: (id: string) => void;
  selectNode: (id: string | null) => void;
  
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

  // Tool actions
  addTool: (tool) => {
    const { tools, nodes } = get();
    
    // Add tool to store
    const newTools = [...tools, tool];
    
    // Create a new node for React Flow
    const newNode: Node = {
      id: tool.id,
      type: 'toolNode',
      position: { x: 100 + tools.length * 50, y: 100 + tools.length * 50 },
      data: {
        tool,
      },
    };
    
    set({
      tools: newTools,
      nodes: [...nodes, newNode],
      serverConfig: {
        ...get().serverConfig,
        tools: newTools,
      },
    });
  },

  updateTool: (id, updates) => {
    const { tools, nodes } = get();
    
    const updatedTools = tools.map((tool) =>
      tool.id === id ? { ...tool, ...updates } : tool
    );
    
    const updatedNodes = nodes.map((node) =>
      node.id === id
        ? { ...node, data: { ...node.data, tool: updatedTools.find((t) => t.id === id) } }
        : node
    );
    
    set({
      tools: updatedTools,
      nodes: updatedNodes,
      serverConfig: {
        ...get().serverConfig,
        tools: updatedTools,
      },
    });
  },

  deleteTool: (id) => {
    const { tools, nodes } = get();
    
    const newTools = tools.filter((tool) => tool.id !== id);
    const newNodes = nodes.filter((node) => node.id !== id);
    
    set({
      tools: newTools,
      nodes: newNodes,
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
