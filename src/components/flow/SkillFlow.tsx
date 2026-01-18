import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionMode,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useGraphStore } from '@/store/graphStore';
import { useUserStore } from '@/store/userStore';
import { SkillNodeComponent_Memoized } from './SkillNode';
import { NodePopup } from './NodePopup';

const nodeTypes = {
  skillNode: SkillNodeComponent_Memoized,
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: { stroke: '#475569', strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 15,
    height: 15,
    color: '#475569',
  },
};

export function SkillFlow() {
  const { currentGraph, isNodePopupOpen, openNodePopup, closeNodePopup, getSelectedNode } = useGraphStore();
  const { careerGoals } = useUserStore();
  const { generateGraph } = useGraphStore();

  // Convert our graph format to React Flow format
  const initialNodes: Node[] = useMemo(() => {
    if (!currentGraph) return [];

    return currentGraph.nodes.map(node => ({
      id: node.id,
      type: 'skillNode',
      position: node.position,
      data: {
        skillId: node.skillId,
        state: node.state,
        completionPercent: node.completionPercent,
        tier: node.tier,
      },
    }));
  }, [currentGraph]);

  const initialEdges: Edge[] = useMemo(() => {
    if (!currentGraph) return [];

    return currentGraph.edges.map(edge => ({
      id: edge.id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      type: 'smoothstep',
      animated: edge.type === 'prerequisite',
      style: {
        stroke: edge.type === 'prerequisite' ? '#475569' : '#334155',
        strokeWidth: 2,
        strokeDasharray: edge.type === 'recommended' ? '5,5' : undefined,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 12,
        height: 12,
        color: '#475569',
      },
    }));
  }, [currentGraph]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when graph changes
  useEffect(() => {
    if (currentGraph) {
      const newNodes = currentGraph.nodes.map(node => ({
        id: node.id,
        type: 'skillNode',
        position: node.position,
        data: {
          skillId: node.skillId,
          state: node.state,
          completionPercent: node.completionPercent,
          tier: node.tier,
        },
      }));
      setNodes(newNodes);

      const newEdges = currentGraph.edges.map(edge => ({
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        type: 'smoothstep',
        animated: edge.type === 'prerequisite',
        style: {
          stroke: '#475569',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 12,
          height: 12,
          color: '#475569',
        },
      }));
      setEdges(newEdges);
    }
  }, [currentGraph, setNodes, setEdges]);

  // Generate initial graph based on career goal
  useEffect(() => {
    if (careerGoals.length > 0 && !currentGraph) {
      const primaryGoal = careerGoals.find(g => g.timeframe === 'long') || careerGoals[0];
      generateGraph(primaryGoal.targetRoleId);
    }
  }, [careerGoals, currentGraph, generateGraph]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      openNodePopup(node.id);
    },
    [openNodePopup]
  );

  const selectedNode = getSelectedNode();

  if (!currentGraph) {
    return (
      <div className="w-full h-[600px] bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 mb-2">No career goal set</div>
          <p className="text-sm text-slate-500">
            Set a career goal to see your skill progression path
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls
          className="bg-slate-800 border-slate-700 rounded-lg overflow-hidden"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={(node) => {
            const state = (node.data as { state: string }).state;
            switch (state) {
              case 'completed':
                return '#14b8a6';
              case 'in_progress':
                return '#eab308';
              case 'unlocked':
                return '#64748b';
              default:
                return '#334155';
            }
          }}
          maskColor="rgba(15, 23, 42, 0.8)"
          className="bg-slate-900 border border-slate-700 rounded-lg"
        />
      </ReactFlow>

      <NodePopup
        node={selectedNode}
        isOpen={isNodePopupOpen}
        onClose={closeNodePopup}
      />
    </div>
  );
}
