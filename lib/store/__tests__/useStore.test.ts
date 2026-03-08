import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../useStore';
import { MCPTool, MCPResource, MCPPrompt } from '../../types';

describe('useStore', () => {
  // Reset store state before each test
  beforeEach(() => {
    useStore.setState({
      nodes: [],
      edges: [],
      tools: [],
      resources: [],
      prompts: [],
      serverConfig: {
        name: 'my-mcp-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [],
        resources: [],
        prompts: [],
      },
      selectedNodeId: null,
      messages: [],
      clipboard: null,
      history: [],
      historyIndex: -1,
    });
  });

  describe('Tool actions', () => {
    const mockTool: MCPTool = {
      id: 'tool-123',
      name: 'Test Tool',
      description: 'A test tool',
      icon: 'Wrench',
      parameters: [
        {
          name: 'query',
          type: 'string',
          description: 'Search query',
          required: true,
        },
      ],
    };

    describe('addTool', () => {
      it('adds a tool to the tools array', () => {
        useStore.getState().addTool(mockTool);

        const state = useStore.getState();
        expect(state.tools).toHaveLength(1);
        expect(state.tools[0].id).toBe('tool-123');
      });

      it('creates a corresponding node', () => {
        useStore.getState().addTool(mockTool);

        const state = useStore.getState();
        expect(state.nodes).toHaveLength(1);
        expect(state.nodes[0].id).toBe('tool-123');
        expect(state.nodes[0].type).toBe('toolNode');
      });

      it('updates serverConfig with new tool', () => {
        useStore.getState().addTool(mockTool);

        const state = useStore.getState();
        expect(state.serverConfig.tools).toHaveLength(1);
        expect(state.serverConfig.tools[0].id).toBe('tool-123');
      });

      it('pushes to history for undo', () => {
        useStore.getState().addTool(mockTool);

        const state = useStore.getState();
        expect(state.history.length).toBeGreaterThan(0);
        expect(state.historyIndex).toBeGreaterThanOrEqual(0);
      });
    });

    describe('updateTool', () => {
      beforeEach(() => {
        useStore.getState().addTool(mockTool);
      });

      it('updates tool properties', () => {
        useStore.getState().updateTool('tool-123', { name: 'Updated Tool' });

        const state = useStore.getState();
        expect(state.tools[0].name).toBe('Updated Tool');
      });

      it('preserves other tool properties', () => {
        useStore.getState().updateTool('tool-123', { name: 'Updated Tool' });

        const state = useStore.getState();
        expect(state.tools[0].description).toBe('A test tool');
        expect(state.tools[0].icon).toBe('Wrench');
      });

      it('updates node data', () => {
        useStore.getState().updateTool('tool-123', { name: 'Updated Tool' });

        const state = useStore.getState();
        const nodeData = state.nodes[0].data as { tool: MCPTool };
        expect(nodeData.tool.name).toBe('Updated Tool');
      });

      it('updates serverConfig', () => {
        useStore.getState().updateTool('tool-123', { description: 'New description' });

        const state = useStore.getState();
        expect(state.serverConfig.tools[0].description).toBe('New description');
      });
    });

    describe('deleteTool', () => {
      beforeEach(() => {
        useStore.getState().addTool(mockTool);
      });

      it('removes tool from tools array', () => {
        useStore.getState().deleteTool('tool-123');

        const state = useStore.getState();
        expect(state.tools).toHaveLength(0);
      });

      it('removes corresponding node', () => {
        useStore.getState().deleteTool('tool-123');

        const state = useStore.getState();
        expect(state.nodes).toHaveLength(0);
      });

      it('clears selectedNodeId if deleted tool was selected', () => {
        useStore.setState({ selectedNodeId: 'tool-123' });
        useStore.getState().deleteTool('tool-123');

        const state = useStore.getState();
        expect(state.selectedNodeId).toBeNull();
      });

      it('preserves selectedNodeId if different tool was deleted', () => {
        const anotherTool = { ...mockTool, id: 'tool-456', name: 'Another Tool' };
        useStore.getState().addTool(anotherTool);
        useStore.setState({ selectedNodeId: 'tool-456' });

        useStore.getState().deleteTool('tool-123');

        const state = useStore.getState();
        expect(state.selectedNodeId).toBe('tool-456');
      });
    });

    describe('duplicateTool', () => {
      beforeEach(() => {
        useStore.getState().addTool(mockTool);
      });

      it('creates a copy with new id', () => {
        useStore.getState().duplicateTool('tool-123');

        const state = useStore.getState();
        expect(state.tools).toHaveLength(2);
        expect(state.tools[1].id).not.toBe('tool-123');
      });

      it('appends (copy) to name', () => {
        useStore.getState().duplicateTool('tool-123');

        const state = useStore.getState();
        expect(state.tools[1].name).toBe('Test Tool (copy)');
      });

      it('copies parameters', () => {
        useStore.getState().duplicateTool('tool-123');

        const state = useStore.getState();
        expect(state.tools[1].parameters).toHaveLength(1);
        expect(state.tools[1].parameters[0].name).toBe('query');
      });

      it('does nothing for non-existent tool', () => {
        useStore.getState().duplicateTool('non-existent');

        const state = useStore.getState();
        expect(state.tools).toHaveLength(1);
      });
    });
  });

  describe('Resource actions', () => {
    const mockResource: MCPResource = {
      id: 'resource-123',
      name: 'Test Resource',
      description: 'A test resource',
      uri: 'file://test.txt',
      mimeType: 'text/plain',
    };

    describe('addResource', () => {
      it('adds a resource to the resources array', () => {
        useStore.getState().addResource(mockResource);

        const state = useStore.getState();
        expect(state.resources).toHaveLength(1);
        expect(state.resources[0].id).toBe('resource-123');
      });

      it('creates a corresponding node', () => {
        useStore.getState().addResource(mockResource);

        const state = useStore.getState();
        expect(state.nodes).toHaveLength(1);
        expect(state.nodes[0].type).toBe('resourceNode');
      });

      it('updates serverConfig', () => {
        useStore.getState().addResource(mockResource);

        const state = useStore.getState();
        expect(state.serverConfig.resources).toHaveLength(1);
      });
    });

    describe('updateResource', () => {
      beforeEach(() => {
        useStore.getState().addResource(mockResource);
      });

      it('updates resource properties', () => {
        useStore.getState().updateResource('resource-123', { name: 'Updated Resource' });

        const state = useStore.getState();
        expect(state.resources[0].name).toBe('Updated Resource');
      });

      it('updates node data', () => {
        useStore.getState().updateResource('resource-123', { uri: 'file://new.txt' });

        const state = useStore.getState();
        const nodeData = state.nodes[0].data as { resource: MCPResource };
        expect(nodeData.resource.uri).toBe('file://new.txt');
      });
    });

    describe('deleteResource', () => {
      beforeEach(() => {
        useStore.getState().addResource(mockResource);
      });

      it('removes resource from resources array', () => {
        useStore.getState().deleteResource('resource-123');

        const state = useStore.getState();
        expect(state.resources).toHaveLength(0);
      });

      it('removes corresponding node', () => {
        useStore.getState().deleteResource('resource-123');

        const state = useStore.getState();
        expect(state.nodes).toHaveLength(0);
      });
    });
  });

  describe('Prompt actions', () => {
    const mockPrompt: MCPPrompt = {
      id: 'prompt-123',
      name: 'Test Prompt',
      description: 'A test prompt',
      arguments: [
        {
          name: 'topic',
          type: 'string',
          description: 'Topic to discuss',
          required: true,
        },
      ],
    };

    describe('addPrompt', () => {
      it('adds a prompt to the prompts array', () => {
        useStore.getState().addPrompt(mockPrompt);

        const state = useStore.getState();
        expect(state.prompts).toHaveLength(1);
        expect(state.prompts[0].id).toBe('prompt-123');
      });

      it('creates a corresponding node', () => {
        useStore.getState().addPrompt(mockPrompt);

        const state = useStore.getState();
        expect(state.nodes).toHaveLength(1);
        expect(state.nodes[0].type).toBe('promptNode');
      });
    });

    describe('updatePrompt', () => {
      beforeEach(() => {
        useStore.getState().addPrompt(mockPrompt);
      });

      it('updates prompt properties', () => {
        useStore.getState().updatePrompt('prompt-123', { name: 'Updated Prompt' });

        const state = useStore.getState();
        expect(state.prompts[0].name).toBe('Updated Prompt');
      });

      it('updates node data', () => {
        useStore.getState().updatePrompt('prompt-123', { description: 'New description' });

        const state = useStore.getState();
        const nodeData = state.nodes[0].data as { prompt: MCPPrompt };
        expect(nodeData.prompt.description).toBe('New description');
      });
    });

    describe('deletePrompt', () => {
      beforeEach(() => {
        useStore.getState().addPrompt(mockPrompt);
      });

      it('removes prompt from prompts array', () => {
        useStore.getState().deletePrompt('prompt-123');

        const state = useStore.getState();
        expect(state.prompts).toHaveLength(0);
      });

      it('removes corresponding node', () => {
        useStore.getState().deletePrompt('prompt-123');

        const state = useStore.getState();
        expect(state.nodes).toHaveLength(0);
      });
    });
  });

  describe('Clipboard actions', () => {
    const mockTool: MCPTool = {
      id: 'tool-123',
      name: 'Clipboard Tool',
      description: 'Tool for clipboard test',
      icon: 'Copy',
      parameters: [],
    };

    describe('copyTool', () => {
      beforeEach(() => {
        useStore.getState().addTool(mockTool);
      });

      it('copies tool to clipboard', () => {
        useStore.getState().copyTool('tool-123');

        const state = useStore.getState();
        expect(state.clipboard).not.toBeNull();
        expect(state.clipboard?.name).toBe('Clipboard Tool');
      });

      it('creates deep copy of parameters', () => {
        const toolWithParams: MCPTool = {
          ...mockTool,
          parameters: [{ name: 'test', type: 'string', description: 'Test', required: true }],
        };
        useStore.setState({ tools: [toolWithParams] });

        useStore.getState().copyTool('tool-123');

        const state = useStore.getState();
        expect(state.clipboard?.parameters).toHaveLength(1);
        // Verify it's a copy, not reference
        expect(state.clipboard?.parameters).not.toBe(toolWithParams.parameters);
      });

      it('does nothing for non-existent tool', () => {
        useStore.getState().copyTool('non-existent');

        const state = useStore.getState();
        expect(state.clipboard).toBeNull();
      });
    });

    describe('pasteTool', () => {
      beforeEach(() => {
        useStore.getState().addTool(mockTool);
        useStore.getState().copyTool('tool-123');
      });

      it('creates new tool from clipboard', () => {
        useStore.getState().pasteTool();

        const state = useStore.getState();
        expect(state.tools).toHaveLength(2);
      });

      it('assigns new id to pasted tool', () => {
        useStore.getState().pasteTool();

        const state = useStore.getState();
        expect(state.tools[1].id).not.toBe('tool-123');
      });

      it('appends (copy) to name', () => {
        useStore.getState().pasteTool();

        const state = useStore.getState();
        expect(state.tools[1].name).toBe('Clipboard Tool (copy)');
      });

      it('does nothing if clipboard is empty', () => {
        useStore.setState({ clipboard: null });
        useStore.getState().pasteTool();

        const state = useStore.getState();
        expect(state.tools).toHaveLength(1);
      });
    });
  });

  describe('History (undo/redo)', () => {
    const mockTool: MCPTool = {
      id: 'tool-123',
      name: 'History Tool',
      description: 'Tool for history test',
      icon: 'History',
      parameters: [],
    };

    describe('undo', () => {
      it('restores previous state', () => {
        useStore.getState().addTool(mockTool);
        expect(useStore.getState().tools).toHaveLength(1);

        useStore.getState().undo();

        expect(useStore.getState().tools).toHaveLength(0);
      });

      it('decrements history index', () => {
        useStore.getState().addTool(mockTool);
        const indexAfterAdd = useStore.getState().historyIndex;

        useStore.getState().undo();

        expect(useStore.getState().historyIndex).toBe(indexAfterAdd - 1);
      });

      it('does nothing when at beginning of history', () => {
        useStore.getState().addTool(mockTool);
        useStore.getState().undo();
        const indexAfterFirstUndo = useStore.getState().historyIndex;

        useStore.getState().undo();

        expect(useStore.getState().historyIndex).toBe(indexAfterFirstUndo);
      });
    });

    describe('redo', () => {
      beforeEach(() => {
        useStore.getState().addTool(mockTool);
        useStore.getState().undo();
      });

      it('restores next state', () => {
        expect(useStore.getState().tools).toHaveLength(0);

        useStore.getState().redo();

        expect(useStore.getState().tools).toHaveLength(1);
      });

      it('increments history index', () => {
        const indexAfterUndo = useStore.getState().historyIndex;

        useStore.getState().redo();

        expect(useStore.getState().historyIndex).toBe(indexAfterUndo + 1);
      });

      it('does nothing when at end of history', () => {
        useStore.getState().redo();
        const indexAfterRedo = useStore.getState().historyIndex;

        useStore.getState().redo();

        expect(useStore.getState().historyIndex).toBe(indexAfterRedo);
      });
    });

    describe('canUndo / canRedo', () => {
      it('canUndo returns false initially', () => {
        expect(useStore.getState().canUndo()).toBe(false);
      });

      it('canUndo returns true after action', () => {
        useStore.getState().addTool(mockTool);
        expect(useStore.getState().canUndo()).toBe(true);
      });

      it('canRedo returns false initially', () => {
        expect(useStore.getState().canRedo()).toBe(false);
      });

      it('canRedo returns true after undo', () => {
        useStore.getState().addTool(mockTool);
        useStore.getState().undo();
        expect(useStore.getState().canRedo()).toBe(true);
      });

      it('canRedo returns false after new action', () => {
        useStore.getState().addTool(mockTool);
        useStore.getState().undo();
        useStore.getState().addTool({ ...mockTool, id: 'tool-456' });
        expect(useStore.getState().canRedo()).toBe(false);
      });
    });
  });

  describe('Selection', () => {
    it('selectNode sets selectedNodeId', () => {
      useStore.getState().selectNode('tool-123');

      expect(useStore.getState().selectedNodeId).toBe('tool-123');
    });

    it('selectNode can clear selection with null', () => {
      useStore.setState({ selectedNodeId: 'tool-123' });
      useStore.getState().selectNode(null);

      expect(useStore.getState().selectedNodeId).toBeNull();
    });
  });

  describe('Chat messages', () => {
    it('addMessage adds message to array', () => {
      useStore.getState().addMessage({
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: Date.now(),
      });

      expect(useStore.getState().messages).toHaveLength(1);
    });

    it('clearMessages empties messages array', () => {
      useStore.getState().addMessage({
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: Date.now(),
      });
      useStore.getState().clearMessages();

      expect(useStore.getState().messages).toHaveLength(0);
    });
  });

  describe('Server config', () => {
    it('updateServerConfig updates config fields', () => {
      useStore.getState().updateServerConfig({ name: 'new-server-name' });

      expect(useStore.getState().serverConfig.name).toBe('new-server-name');
    });

    it('updateServerConfig preserves other fields', () => {
      useStore.getState().updateServerConfig({ name: 'new-server-name' });

      expect(useStore.getState().serverConfig.version).toBe('1.0.0');
      expect(useStore.getState().serverConfig.transport).toBe('stdio');
    });

    it('updateServerConfig can change transport', () => {
      useStore.getState().updateServerConfig({ transport: 'http', httpPort: 8080 });

      expect(useStore.getState().serverConfig.transport).toBe('http');
      expect(useStore.getState().serverConfig.httpPort).toBe(8080);
    });
  });

  describe('React Flow actions', () => {
    it('setNodes updates nodes array', () => {
      const nodes = [{ id: 'node-1', type: 'toolNode', position: { x: 0, y: 0 }, data: {} }];
      useStore.getState().setNodes(nodes);

      expect(useStore.getState().nodes).toEqual(nodes);
    });

    it('setEdges updates edges array', () => {
      const edges = [{ id: 'edge-1', source: 'a', target: 'b' }];
      useStore.getState().setEdges(edges);

      expect(useStore.getState().edges).toEqual(edges);
    });
  });

  describe('Tool with capabilities', () => {
    it('duplicates tool with sampling config', () => {
      const toolWithSampling: MCPTool = {
        id: 'tool-sampling',
        name: 'Sampling Tool',
        description: 'Tool with sampling',
        icon: 'Sparkles',
        parameters: [],
        sampling: {
          enabled: true,
          maxTokens: 1000,
          temperature: 0.7,
        },
      };

      useStore.getState().addTool(toolWithSampling);
      useStore.getState().duplicateTool('tool-sampling');

      const state = useStore.getState();
      expect(state.tools[1].sampling).toBeDefined();
      expect(state.tools[1].sampling?.enabled).toBe(true);
      expect(state.tools[1].sampling?.maxTokens).toBe(1000);
    });

    it('duplicates tool with elicitation config', () => {
      const toolWithElicitation: MCPTool = {
        id: 'tool-elicitation',
        name: 'Elicitation Tool',
        description: 'Tool with elicitation',
        icon: 'FormInput',
        parameters: [],
        elicitation: {
          enabled: true,
          mode: 'form',
          message: 'Please provide input',
          formFields: [
            { name: 'field1', type: 'string', description: 'Field 1', required: true },
          ],
        },
      };

      useStore.getState().addTool(toolWithElicitation);
      useStore.getState().duplicateTool('tool-elicitation');

      const state = useStore.getState();
      expect(state.tools[1].elicitation).toBeDefined();
      expect(state.tools[1].elicitation?.formFields).toHaveLength(1);
    });

    it('duplicates tool with tasks config', () => {
      const toolWithTasks: MCPTool = {
        id: 'tool-tasks',
        name: 'Tasks Tool',
        description: 'Tool with tasks',
        icon: 'Clock',
        parameters: [],
        tasks: {
          enabled: true,
          ttl: 60000,
        },
      };

      useStore.getState().addTool(toolWithTasks);
      useStore.getState().duplicateTool('tool-tasks');

      const state = useStore.getState();
      expect(state.tools[1].tasks).toBeDefined();
      expect(state.tools[1].tasks?.enabled).toBe(true);
      expect(state.tools[1].tasks?.ttl).toBe(60000);
    });
  });
});
