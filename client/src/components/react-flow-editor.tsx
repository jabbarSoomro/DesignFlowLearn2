import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Server,
  Database,
  Zap,
  Cloud,
  Layers,
  Package,
  Share2,
  Box,
  Undo2,
  Redo2,
  Save,
  Upload,
} from 'lucide-react';

const componentTypes = [
  { type: 'loadbalancer', label: 'Load Balancer', icon: Share2, color: 'bg-blue-500' },
  { type: 'cache', label: 'Cache', icon: Zap, color: 'bg-yellow-500' },
  { type: 'database', label: 'Database', icon: Database, color: 'bg-green-500' },
  { type: 'cdn', label: 'CDN', icon: Cloud, color: 'bg-purple-500' },
  { type: 'queue', label: 'Message Queue', icon: Layers, color: 'bg-orange-500' },
  { type: 'storage', label: 'Blob Storage', icon: Package, color: 'bg-pink-500' },
  { type: 'gateway', label: 'API Gateway', icon: Server, color: 'bg-indigo-500' },
  { type: 'microservice', label: 'Microservice', icon: Box, color: 'bg-teal-500' },
];

interface ReactFlowEditorProps {
  onSave?: (diagram: any) => void;
  initialDiagram?: any;
}

export function ReactFlowEditor({ onSave, initialDiagram }: ReactFlowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialDiagram?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialDiagram?.edges || []);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const component = componentTypes.find((c) => c.type === type);

      if (!component) return;

      const position = {
        x: event.clientX - 250,
        y: event.clientY - 100,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'default',
        position,
        data: { 
          label: (
            <div className="flex items-center gap-2">
              <component.icon className="h-4 w-4" />
              <span>{component.label}</span>
            </div>
          ) 
        },
        style: {
          background: 'hsl(var(--card))',
          border: '2px solid hsl(var(--border))',
          borderRadius: '6px',
          padding: '10px',
          fontSize: '14px',
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSave = () => {
    const diagram = { nodes, edges };
    onSave?.(diagram);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
    }
  };

  return (
    <div className="flex h-full gap-4">
      <Card className="w-64 shrink-0 overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-lg">Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {componentTypes.map((component) => (
            <div
              key={component.type}
              draggable
              onDragStart={(e) => onDragStart(e, component.type)}
              className="flex items-center gap-3 p-3 rounded-md border bg-card hover-elevate active-elevate-2 cursor-move"
              data-testid={`component-${component.type}`}
            >
              <div className={`${component.color} p-2 rounded-md`}>
                <component.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium">{component.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            data-testid="button-undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            data-testid="button-redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            data-testid="button-save-diagram"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            data-testid="button-submit-design"
          >
            <Upload className="h-4 w-4 mr-2" />
            Submit Design
          </Button>
        </div>

        <div className="flex-1 border rounded-lg overflow-hidden bg-card">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap className="bg-background border border-border" />
            <Panel position="top-left">
              <Badge variant="secondary">
                {nodes.length} component{nodes.length !== 1 ? 's' : ''}
              </Badge>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
