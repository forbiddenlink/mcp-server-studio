'use client'

import {
  addEdge,
  Background,
  type Connection,
  ConnectionLineType,
  Controls,
  type Edge,
  type EdgeTypes,
  MarkerType,
  MiniMap,
  type NodeTypes,
  ReactFlow,
} from '@xyflow/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import '@xyflow/react/dist/style.css'
import {
  Calculator,
  Calendar,
  Camera,
  Cloud,
  Code,
  Database,
  FilePlus,
  FileText,
  FileUp,
  GitBranch,
  Globe,
  Image,
  Languages,
  LayoutGrid,
  type LucideIcon,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { AIGenerator } from '@/components/ui/ai-generator'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ImportDialog } from '@/components/ui/import-dialog'
import { TemplateGallery } from '@/components/ui/template-gallery'
import { useStore } from '@/lib/store/useStore'
import { toolTemplates } from '@/lib/templates/toolTemplates'
import type { MCPPrompt, MCPResource, MCPTool, ToolTemplate } from '@/lib/types'
import { DataFlowEdge } from './DataFlowEdge'
import { createSampleTool, ManifestSheet } from './ManifestSheet'
import { PromptNode } from './PromptNode'
import { QuickAddMenu } from './QuickAddMenu'
import { ResourceNode } from './ResourceNode'
import { ToolNode } from './ToolNode'

// Icon mapping for dropdown menu
const iconMap: Record<string, LucideIcon> = {
  Search,
  FileText,
  Globe,
  Database,
  Mail,
  FilePlus,
  Terminal,
  Cloud,
  GitBranch,
  Image,
  Calculator,
  Calendar,
  MessageSquare,
  Code,
  Languages,
  Camera,
}

export function CanvasPanel() {
  const {
    nodes,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    addTool,
    addResource,
    addPrompt,
    selectNode,
  } = useStore()
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [quickAddPosition, setQuickAddPosition] = useState({ x: 0, y: 0 })

  const handleAIGenerate = (tool: MCPTool) => {
    addTool(tool)
    selectNode(tool.id)
  }

  const handleImport = (tools: MCPTool[]) => {
    tools.forEach((tool) => {
      addTool(tool)
    })
    // Select the first imported tool
    if (tools.length > 0) {
      selectNode(tools[0].id)
    }
  }

  const handleSelectTemplate = (template: ToolTemplate) => {
    const newTool: MCPTool = {
      id: `tool-${Date.now()}`,
      name: template.name,
      description: template.description,
      icon: template.icon,
      parameters: [...template.defaultParameters],
    }
    addTool(newTool)
    selectNode(newTool.id)
  }

  // Quick Add Menu handlers
  const handleQuickAddTool = useCallback(
    (tool: MCPTool) => {
      addTool(tool)
      selectNode(tool.id)
    },
    [addTool, selectNode]
  )

  const handleCanvasContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    setQuickAddPosition({ x: event.clientX, y: event.clientY })
    setIsQuickAddOpen(true)
  }, [])

  // Space key to open Quick Add Menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === ' ' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault()
        // Open in center of viewport
        setQuickAddPosition({
          x: window.innerWidth / 2 - 260, // Half of menu width (520px)
          y: window.innerHeight / 2 - 300, // Half of menu height (600px)
        })
        setIsQuickAddOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const nodeTypes: NodeTypes = useMemo(
    () =>
      ({
        toolNode: ToolNode,
        resourceNode: ResourceNode,
        promptNode: PromptNode,
      }) as NodeTypes,
    []
  )

  const edgeTypes: EdgeTypes = useMemo(
    () =>
      ({
        dataFlow: DataFlowEdge,
      }) as EdgeTypes,
    []
  )

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'dataFlow',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: 'var(--border-strong)',
      },
    }),
    []
  )

  const handleAddTool = (templateIndex: number) => {
    const template = toolTemplates[templateIndex]
    const newTool: MCPTool = {
      id: `tool-${crypto.randomUUID()}`,
      name: template.name,
      description: template.description,
      icon: template.icon,
      parameters: [...template.defaultParameters],
    }
    addTool(newTool)
  }

  const handleAddCustomTool = () => {
    const newTool: MCPTool = {
      id: `tool-${crypto.randomUUID()}`,
      name: 'custom_tool',
      description: 'A custom tool',
      icon: 'Terminal',
      parameters: [],
    }
    addTool(newTool)
    selectNode(newTool.id)
  }

  const handleAddResource = () => {
    const newResource: MCPResource = {
      id: `resource-${crypto.randomUUID()}`,
      name: 'new_resource',
      uri: 'file:///path/to/resource',
      mimeType: 'text/plain',
      description: 'A new resource',
    }
    addResource(newResource)
    selectNode(newResource.id)
  }

  const handleAddPrompt = () => {
    const newPrompt: MCPPrompt = {
      id: `prompt-${crypto.randomUUID()}`,
      name: 'new_prompt',
      description: 'A new prompt template',
      arguments: [],
    }
    addPrompt(newPrompt)
    selectNode(newPrompt.id)
  }

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      // Prevent self-connections
      if (connection.source === connection.target) return false

      // Prevent duplicate connections
      const isDuplicate = edges.some(
        (edge) => edge.source === connection.source && edge.target === connection.target
      )
      if (isDuplicate) return false

      return true
    },
    [edges]
  )

  const onConnect = useCallback(
    (params: Connection) => {
      if (!isValidConnection(params)) return
      setEdges(addEdge(params, edges))
    },
    [edges, setEdges, isValidConnection]
  )

  return (
    <div className="w-full h-full relative grid-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.Bezier}
        connectionLineStyle={{
          stroke: 'var(--accent)',
          strokeWidth: 2,
          strokeDasharray: '5,5',
        }}
        onContextMenu={handleCanvasContextMenu}
        fitView
        className="bg-transparent"
      >
        <Background color="rgba(26, 43, 168, 0.10)" gap={24} />
        {nodes.length > 0 && <Controls className="glass-panel" />}
        {nodes.length > 0 && (
          <MiniMap
            className="glass-panel"
            maskColor="rgba(10, 20, 80, 0.12)"
            nodeColor={(node) => {
              if (node.type === 'resourceNode') return '#0b6b43'
              if (node.type === 'promptNode') return '#475569'
              return '#1a2ba8'
            }}
            nodeStrokeWidth={0}
            nodeBorderRadius={4}
          />
        )}
      </ReactFlow>

      {/* Add Tool Button */}
      <div className="absolute top-6 left-6 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="hover:shadow-[var(--shadow-glow)] transition-shadow">
              <Plus className="w-4 h-4 mr-2" />
              Add Tool
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-64 surface-overlay p-1 max-h-[70vh] overflow-y-auto"
          >
            {/* Browse Templates - Opens Gallery */}
            <DropdownMenuItem
              onClick={() => setIsTemplateGalleryOpen(true)}
              className="cursor-pointer p-3 rounded-lg hover:bg-[var(--accent)] hover:text-white focus:bg-[var(--accent)] focus:text-white group"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--accent-muted)] group-hover:bg-white/20 flex items-center justify-center mr-3 transition-colors">
                <LayoutGrid
                  className="w-4 h-4 text-[var(--accent)] group-hover:text-white"
                  strokeWidth={1.5}
                />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm">Browse Templates</div>
                <div className="text-xs opacity-70">29 templates in 7 categories</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--border-default)]" />
            {/* Quick Add - Show first 5 common templates */}
            <div className="px-2 py-1.5 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
              Quick Add
            </div>
            {toolTemplates.slice(0, 5).map((template, index) => {
              const IconComponent = iconMap[template.icon] || Terminal
              return (
                <DropdownMenuItem
                  key={index}
                  onClick={() => handleAddTool(index)}
                  className="cursor-pointer p-3 rounded-lg hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)]"
                >
                  <div className="icon-container-sm icon-container mr-3 flex-shrink-0">
                    <IconComponent className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-[var(--text-primary)]">
                      {template.name}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] truncate">
                      {template.description}
                    </div>
                  </div>
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator className="bg-[var(--border-default)]" />
            <DropdownMenuItem
              onClick={() => setIsAIGeneratorOpen(true)}
              className="cursor-pointer p-3 rounded-lg hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)]"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center mr-3">
                <Sparkles className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm text-[var(--text-primary)]">
                  Generate with AI
                </div>
                <div className="text-xs text-[var(--text-tertiary)] truncate">
                  Describe in natural language
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleAddCustomTool}
              className="cursor-pointer p-3 rounded-lg hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)]"
            >
              <div className="icon-container-sm icon-container mr-3 flex-shrink-0">
                <Plus className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm text-[var(--text-primary)]">Custom Tool</div>
                <div className="text-xs text-[var(--text-tertiary)] truncate">
                  Create from scratch
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--border-default)]" />
            <DropdownMenuItem
              onClick={handleAddResource}
              className="cursor-pointer p-3 rounded-lg hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)]"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-3">
                <Database className="w-4 h-4 text-emerald-700" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm text-[var(--text-primary)]">Add Resource</div>
                <div className="text-xs text-[var(--text-tertiary)] truncate">
                  Expose data to clients
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleAddPrompt}
              className="cursor-pointer p-3 rounded-lg hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)]"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center mr-3">
                <MessageSquare className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm text-[var(--text-primary)]">Add Prompt</div>
                <div className="text-xs text-[var(--text-tertiary)] truncate">
                  Reusable prompt template
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--border-default)]" />
            <DropdownMenuItem
              onClick={() => setIsImportDialogOpen(true)}
              className="cursor-pointer p-3 rounded-lg hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)]"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center mr-3">
                <FileUp className="w-4 h-4 text-sky-700" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm text-[var(--text-primary)]">
                  Import from OpenAPI
                </div>
                <div className="text-xs text-[var(--text-tertiary)] truncate">
                  Import tools from API spec
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Import Dialog */}
      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImport}
      />

      {/* AI Generator Dialog */}
      <AIGenerator
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onGenerate={handleAIGenerate}
      />

      {/* Template Gallery Modal */}
      <TemplateGallery
        isOpen={isTemplateGalleryOpen}
        onClose={() => setIsTemplateGalleryOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Empty State - the product's own output: a real generated manifest */}
      {nodes.length === 0 && (
        <div className="absolute inset-x-0 bottom-0 top-20 flex items-start sm:items-center justify-center pointer-events-none overflow-hidden">
          <div className="relative text-center w-full max-w-[31rem] px-5">
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-2">
              Start Wiring
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              Drop your first node, then drag from a port to wire it up
              <br />
              <span className="text-xs mt-1 text-[var(--text-tertiary)]">
                Right-click or press Space to add tools
              </span>
            </p>
            <div className="pointer-events-auto">
              <ManifestSheet />
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => addTool(createSampleTool())}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add this sample tool
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Menu */}
      <QuickAddMenu
        isOpen={isQuickAddOpen}
        position={quickAddPosition}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTool={handleQuickAddTool}
      />
    </div>
  )
}
