import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type OnNodesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { GithubWorkflow } from "./App";
import { useCallback, useEffect, useMemo } from "react";
import Dagre from "@dagrejs/dagre";
import { JobNode } from "./JobNode";

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } {
  const g = new Dagre.graphlib.Graph();

  g.setGraph({ rankdir: "LR" });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, {
      ...node,
      width: node?.measured?.width ?? 0,
      height: node?.measured?.height ?? 0,
    });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const nodeWithPosition = g.node(node.id);

      node.position = {
        x: nodeWithPosition.x - (node.measured?.width ?? 0) / 2,
        y: nodeWithPosition.y - (node.measured?.width ?? 0) / 2,
      };

      return node;
    }),
    edges,
  };
}

const nodeTypes = {
  job: JobNode,
};

export default function Graph({ workflow }: { workflow: GithubWorkflow }) {
  const initialNodes = useMemo<Node[]>(
    () =>
      Object.entries(workflow.jobs).map(([jobName, job]) => ({
        id: jobName,
        data: { name: jobName, job },
        position: { x: 0, y: 0 },
        measured: { width: 300, height: 200 * (job.steps.length || 1) },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        type: "job",
      })),
    [workflow]
  );
  const initialEdges = useMemo<Edge[]>(
    () =>
      Object.entries(workflow.jobs)
        .map(([jobName, job]) => {
          if (!job.needs) return [];

          const needs = Array.isArray(job.needs) ? job.needs : [job.needs];

          return needs.map((need) => ({
            id: `${need}-${jobName}`,
            source: need,
            target: jobName,
            animated: true,
            style: { stroke: "#000" },
          }));
        })
        .flat(),
    [workflow]
  );

  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  const handleNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const { fitView } = useReactFlow();

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    fitView();
  }, [workflow, fitView, initialNodes, initialEdges, setEdges, setNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      fitView
    >
      <Controls />
    </ReactFlow>
  );
}
