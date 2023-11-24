/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType, memo, MouseEvent } from 'react';
import { shallow } from 'zustand/shallow';
import { NodeOrigin, getNodePositionWithOrigin } from '@xyflow/system';

import { useStore } from '../../hooks/useStore';
import type { ReactFlowState } from '../../types';
import MiniMapNode from './MiniMapNode';
import type { MiniMapNodes as MiniMapNodesProps, GetMiniMapNodeAttribute, MiniMapNodeProps } from './types';
import { createSelector } from 'reselect';

declare const window: any;

const selector = (s: ReactFlowState) => s.nodeOrigin;
const selectorNodeIds = createSelector(
  [(s: ReactFlowState) => s.nodes],
  (nodes) =>
    nodes
      .filter((node) => !node.hidden && (node.computed?.width || node.width) && (node.computed?.height || node.height))
      .map((node) => node.id),
  {
    memoizeOptions: {
      resultEqualityCheck: shallow,
    },
  }
);
const getAttrFunction = (func: any): GetMiniMapNodeAttribute => (func instanceof Function ? func : () => func);

function MiniMapNodes({
  nodeStrokeColor,
  nodeColor,
  nodeClassName = '',
  nodeBorderRadius = 5,
  nodeStrokeWidth,
  // We need to rename the prop to be `CapitalCase` so that JSX will render it as
  // a component properly.
  nodeComponent: NodeComponent = MiniMapNode,
  onClick,
}: MiniMapNodesProps) {
  const nodes = useStore(selectorNodeIds);
  const nodeOrigin = useStore(selector);
  const nodeColorFunc = getAttrFunction(nodeColor);
  const nodeStrokeColorFunc = getAttrFunction(nodeStrokeColor);
  const nodeClassNameFunc = getAttrFunction(nodeClassName);

  const shapeRendering = typeof window === 'undefined' || !!window.chrome ? 'crispEdges' : 'geometricPrecision';

  return (
    <>
      {nodes.map((nodeId) => (
        <NodeComponentWrapper
          key={nodeId}
          id={nodeId}
          nodeOrigin={nodeOrigin}
          nodeColorFunc={nodeColorFunc}
          nodeStrokeColorFunc={nodeStrokeColorFunc}
          nodeClassNameFunc={nodeClassNameFunc}
          nodeBorderRadius={nodeBorderRadius}
          nodeStrokeWidth={nodeStrokeWidth}
          NodeComponent={NodeComponent}
          onClick={onClick}
          shapeRendering={shapeRendering}
        />
      ))}
    </>
  );
}

const NodeComponentWrapper = memo(function NodeComponentWrapper({
  id,
  nodeOrigin,
  nodeColorFunc,
  nodeStrokeColorFunc,
  nodeClassNameFunc,
  nodeBorderRadius,
  nodeStrokeWidth,
  shapeRendering,
  NodeComponent,
  onClick,
}: {
  id: string;
  nodeOrigin: NodeOrigin;
  nodeColorFunc: GetMiniMapNodeAttribute;
  nodeStrokeColorFunc: GetMiniMapNodeAttribute;
  nodeClassNameFunc: GetMiniMapNodeAttribute;
  nodeBorderRadius: number;
  nodeStrokeWidth?: number;
  NodeComponent: ComponentType<MiniMapNodeProps>;
  onClick: MiniMapNodesProps['onClick'];
  shapeRendering: string;
}) {
  const node = useStore((s) => s.nodeLookup.get(id));
  if (!node) {
    return null;
  }

  const { x, y } = getNodePositionWithOrigin(node, node.origin || nodeOrigin).positionAbsolute;

  return (
    <NodeComponent
      x={x}
      y={y}
      width={node.computed?.width ?? node.width ?? 0}
      height={node.computed?.height ?? node.height ?? 0}
      style={node.style}
      selected={!!node.selected}
      className={nodeClassNameFunc(node)}
      color={nodeColorFunc(node)}
      borderRadius={nodeBorderRadius}
      strokeColor={nodeStrokeColorFunc(node)}
      strokeWidth={nodeStrokeWidth}
      shapeRendering={shapeRendering}
      onClick={onClick}
      id={node.id}
    />
  );
});

export default memo(MiniMapNodes);
