import { MCPTool, ChatMessage } from '../types';

interface SimulatedResponse {
  toolName: string;
  parameters: Record<string, unknown>;
  result: string;
}

function extractKeywords(prompt: string): string[] {
  return prompt.toLowerCase().split(/\s+/);
}

function matchTool(prompt: string, tools: MCPTool[]): MCPTool | null {
  const keywords = extractKeywords(prompt);
  
  for (const tool of tools) {
    const toolKeywords = tool.name.toLowerCase().split(/\s+/);
    const descKeywords = tool.description.toLowerCase().split(/\s+/);
    
    // Check if any prompt keywords match tool name or description
    for (const keyword of keywords) {
      if (toolKeywords.some(tk => tk.includes(keyword)) || 
          descKeywords.some(dk => dk.includes(keyword))) {
        return tool;
      }
    }
  }
  
  return null;
}

function extractParameters(prompt: string, tool: MCPTool): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  
  tool.parameters.forEach((param) => {
    if (param.type === 'string') {
      // Simple extraction: look for quoted strings or rest of prompt
      const match = prompt.match(/"([^"]+)"/);
      params[param.name] = match ? match[1] : prompt.split(' ').slice(1).join(' ');
    } else if (param.type === 'number') {
      const match = prompt.match(/\d+/);
      params[param.name] = match ? parseInt(match[0], 10) : 0;
    } else if (param.type === 'boolean') {
      params[param.name] = prompt.includes('true') || prompt.includes('yes');
    } else {
      params[param.name] = {};
    }
  });
  
  return params;
}

export function simulateToolCall(prompt: string, tools: MCPTool[]): SimulatedResponse | null {
  const matchedTool = matchTool(prompt, tools);
  
  if (!matchedTool) {
    return null;
  }
  
  const parameters = extractParameters(prompt, matchedTool);
  
  return {
    toolName: matchedTool.name,
    parameters,
    result: `Successfully executed ${matchedTool.icon} ${matchedTool.name} with parameters: ${JSON.stringify(parameters, null, 2)}`,
  };
}

export function generateChatResponse(prompt: string, tools: MCPTool[]): ChatMessage {
  const simulation = simulateToolCall(prompt, tools);
  
  if (!simulation) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: "I couldn't find a matching tool for that request. Try being more specific or add more tools to your server.",
      timestamp: Date.now(),
    };
  }
  
  return {
    id: Date.now().toString(),
    role: 'assistant',
    content: simulation.result,
    toolCall: {
      toolName: simulation.toolName,
      parameters: simulation.parameters,
    },
    timestamp: Date.now(),
  };
}
