import {
  Background,
  Controls,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { GithubWorkflow } from "./App";
import { useEffect, useMemo } from "react";
import Dagre from "@dagrejs/dagre";

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

export default function Graph({ workflow }: { workflow: GithubWorkflow }) {
  const initialNodes = useMemo<Node[]>(
    () =>
      Object.entries(workflow.jobs).map(([jobName]) => ({
        id: jobName,
        data: { label: jobName },
        position: { x: 0, y: 0 },
        measured: { width: 200, height: 50 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
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
    <ReactFlow nodes={nodes} edges={edges} fitView>
      <Controls />
      <Background />
    </ReactFlow>
  );
}
