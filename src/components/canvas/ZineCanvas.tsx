import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Arrow, Transformer, Group } from 'react-konva';
import Konva from 'konva';
import { Shape, RectangleShape, CircleShape, TextShape, LineShape, ArrowShape, FreehandShape } from '../../core/types';
import { DocumentStore } from '../../core/store/DocumentStore';
import { SessionStore } from '../../core/store/SessionStore';
import { CommandManager } from '../../core/commands/CommandManager';
import { Tool, createTool, ToolContext } from '../../core/tools';
import { DeleteShapesCommand } from '../../core/commands';
import { v4 as uuidv4 } from 'uuid';

interface ZineCanvasProps {
  documentStore: DocumentStore;
  sessionStore: SessionStore;
  commandManager: CommandManager;
}

const ShapeRenderer: React.FC<{
  shape: Shape;
  isSelected: boolean;
  onSelect: () => void;
  onDblClick: () => void;
}> = ({ shape, isSelected, onSelect, onDblClick }) => {
  const shapeRef = useRef<Konva.Shape>(null);

  useEffect(() => {
    if (isSelected && shapeRef.current) {
      const layer = shapeRef.current.getLayer();
      const transformer = layer?.findOne('.shape-transformer') as Konva.Transformer;
      if (transformer) {
        transformer.nodes([shapeRef.current]);
        transformer.getLayer()?.batchDraw();
      }
    }
  }, [isSelected]);

  const commonProps = {
    id: shape.id,
    x: shape.x,
    y: shape.y,
    rotation: shape.rotation,
    opacity: shape.opacity,
    visible: shape.visible,
    onClick: onSelect,
    onTap: onSelect,
    onDblClick: onDblClick,
    draggable: !shape.locked,
  };

  switch (shape.type) {
    case 'rectangle':
      return (
        <Rect
          ref={shapeRef as any}
          {...commonProps}
          width={shape.width}
          height={shape.height}
          fill={shape.fill}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          cornerRadius={shape.cornerRadius}
        />
      );

    case 'circle':
      return (
        <Circle
          ref={shapeRef as any}
          {...commonProps}
          radius={shape.radius}
          fill={shape.fill}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
        />
      );

    case 'text':
      return (
        <Text
          ref={shapeRef as any}
          {...commonProps}
          text={shape.text}
          fontSize={shape.fontSize}
          fontFamily={shape.fontFamily}
          fill={shape.fill}
          width={shape.width}
          align={shape.align}
        />
      );

    case 'line':
      return (
        <Line
          ref={shapeRef as any}
          {...commonProps}
          points={shape.points}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          lineCap={shape.lineCap}
          lineJoin={shape.lineJoin}
        />
      );

    case 'arrow':
      return (
        <Arrow
          ref={shapeRef as any}
          {...commonProps}
          points={shape.points}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          lineCap={shape.lineCap}
          lineJoin={shape.lineJoin}
          pointerLength={shape.pointerLength}
          pointerWidth={shape.pointerWidth}
        />
      );

    case 'freehand':
      return (
        <Line
          ref={shapeRef as any}
          {...commonProps}
          points={shape.points}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          lineCap="round"
          lineJoin="round"
          tension={shape.tension}
        />
      );

    case 'image':
      return null;

    default:
      return null;
  }
};

const GridLayer: React.FC<{
  width: number;
  height: number;
  gridSize: number;
  viewport: { x: number; y: number; scale: number };
  showGrid: boolean;
}> = ({ width, height, gridSize, viewport, showGrid }) => {
  if (!showGrid) return null;

  const lines: React.ReactNode[] = [];
  const scaledGridSize = gridSize * viewport.scale;

  const offsetX = viewport.x % scaledGridSize;
  const offsetY = viewport.y % scaledGridSize;

  for (let x = offsetX; x < width; x += scaledGridSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke="#e0e0e0"
        strokeWidth={1}
        listening={false}
      />
    );
  }

  for (let y = offsetY; y < height; y += scaledGridSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke="#e0e0e0"
        strokeWidth={1}
        listening={false}
      />
    );
  }

  return <Layer listening={false}>{lines}</Layer>;
};

const SelectionBox: React.FC<{
  box: { x: number; y: number; width: number; height: number } | null;
}> = ({ box }) => {
  if (!box) return null;

  return (
    <Rect
      x={box.x}
      y={box.y}
      width={box.width}
      height={box.height}
      fill="rgba(66, 133, 244, 0.2)"
      stroke="#4285f4"
      strokeWidth={1}
      dash={[5, 5]}
      listening={false}
    />
  );
};

export const ZineCanvas: React.FC<ZineCanvasProps> = ({
  documentStore,
  sessionStore,
  commandManager,
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [currentTool, setCurrentTool] = useState<string>('select');
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [textValue, setTextValue] = useState('');
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(10);

  const toolContext: ToolContext = {
    documentStore,
    sessionStore,
    commandManager,
  };

  const currentToolRef = useRef<Tool>(createTool('select', toolContext));

  useEffect(() => {
    const unsubDoc = documentStore.subscribe(() => {
      setShapes(documentStore.getActivePageShapes());
    });
    const unsubSession = sessionStore.subscribe(() => {
      setSelectedIds(sessionStore.getSelectedIds());
      setViewport(sessionStore.getViewport());
      setCurrentTool(sessionStore.getCurrentTool());
      setSelectionBox(sessionStore.getSelectionBox());
      setShowGrid(sessionStore.getShowGrid());
      setGridSize(sessionStore.getGridSize());
    });

    setShapes(documentStore.getActivePageShapes());
    setSelectedIds(sessionStore.getSelectedIds());
    setViewport(sessionStore.getViewport());
    setCurrentTool(sessionStore.getCurrentTool());

    return () => {
      unsubDoc();
      unsubSession();
    };
  }, [documentStore, sessionStore]);

  useEffect(() => {
    currentToolRef.current.deactivate();
    currentToolRef.current = createTool(currentTool as any, toolContext);
    currentToolRef.current.activate();
  }, [currentTool]);

  const handlePointerDown = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    if (currentToolRef.current.onPointerDown(e, stage)) {
      return;
    }
  }, []);

  const handlePointerMove = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    currentToolRef.current.onPointerMove(e, stage);
  }, []);

  const handlePointerUp = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    currentToolRef.current.onPointerUp(e, stage);
  }, []);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    e.evt.preventDefault();
    
    const scaleBy = 1.05;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const nextScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const newScale = Math.max(0.1, Math.min(5, nextScale));

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    stage.scale({ x: newScale, y: newScale });
    stage.position({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });

    sessionStore.setViewport({
      x: stage.x(),
      y: stage.y(),
      scale: newScale,
    });

    stage.batchDraw();
  }, [sessionStore]);

  const handleSelect = useCallback((id: string) => {
    sessionStore.setSelection([id]);
  }, [sessionStore]);

  const handleDblClick = useCallback((shape: Shape) => {
    if (shape.type === 'text') {
      setEditingTextId(shape.id);
      setTextValue(shape.text);
    }
  }, []);

  const handleTextBlur = useCallback(() => {
    if (editingTextId) {
      documentStore.updateShape(
        documentStore.getActivePageId(),
        editingTextId,
        { text: textValue }
      );
      setEditingTextId(null);
    }
  }, [editingTextId, textValue, documentStore]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedIds.length > 0 && !editingTextId) {
        const command = new DeleteShapesCommand(
          uuidv4(),
          documentStore.getActivePageId(),
          selectedIds,
          (pid, ids) => documentStore.getShapes(pid).filter(s => ids.includes(s.id)),
          (pid, s) => documentStore.addShape(pid, s),
          (pid, ids) => documentStore.removeShapes(pid, ids)
        );
        commandManager.execute(command);
      }
    }
  }, [selectedIds, editingTextId, documentStore, commandManager]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const page = documentStore.getActivePage();

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: '#f5f5f5' }}>
      <Stage
        ref={stageRef}
        width={window.innerWidth - 280}
        height={window.innerHeight - 60}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        style={{ cursor: currentToolRef.current.cursor }}
      >
        <GridLayer
          width={window.innerWidth}
          height={window.innerHeight}
          gridSize={gridSize}
          viewport={viewport}
          showGrid={showGrid}
        />
        
        <Layer>
          <Rect
            x={0}
            y={0}
            width={page.width}
            height={page.height}
            fill={page.backgroundColor}
            shadowColor="black"
            shadowBlur={10}
            shadowOpacity={0.3}
            shadowOffset={{ x: 5, y: 5 }}
          />
          
          {shapes.map((shape) => (
            <ShapeRenderer
              key={shape.id}
              shape={shape}
              isSelected={selectedIds.includes(shape.id)}
              onSelect={() => handleSelect(shape.id)}
              onDblClick={() => handleDblClick(shape)}
            />
          ))}

          <SelectionBox box={selectionBox} />

          {editingTextId && (
            <Text
              x={shapes.find(s => s.id === editingTextId)?.x || 0}
              y={shapes.find(s => s.id === editingTextId)?.y || 0}
              text={textValue}
              fontSize={16}
              fontFamily="Arial"
              fill="black"
              visible={false}
            />
          )}

          <Transformer
            ref={transformerRef}
            name="shape-transformer"
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default ZineCanvas;
