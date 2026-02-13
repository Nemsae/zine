import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import { Shape, ToolType, RectangleShape, CircleShape, TextShape, LineShape, ArrowShape, FreehandShape, DEFAULT_SHAPE_STYLES } from '../types';
import { DocumentStore } from '../store/DocumentStore';
import { SessionStore } from '../store/SessionStore';
import { CommandManager } from '../commands/CommandManager';
import { CreateShapeCommand, DeleteShapesCommand, MoveShapesCommand } from '../commands';

export interface ToolContext {
  documentStore: DocumentStore;
  sessionStore: SessionStore;
  commandManager: CommandManager;
}

export interface Tool {
  type: ToolType;
  cursor: string;
  activate(): void;
  deactivate(): void;
  onPointerDown(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean;
  onPointerMove(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean;
  onPointerUp(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean;
  onWheel(e: Konva.KonvaEventObject<WheelEvent>, stage: Konva.Stage): boolean;
}

const getWorldPosition = (stage: Konva.Stage, clientX: number, clientY: number) => {
  const transform = stage.getAbsoluteTransform().copy();
  transform.invert();
  const pos = transform.point({ x: clientX, y: clientY });
  return { x: pos.x, y: pos.y };
};

export class SelectTool implements Tool {
  type: ToolType = 'select';
  cursor = 'default';

  private context!: ToolContext;
  private dragStartPos: { x: number; y: number } | null = null;
  private initialPositions: Map<string, { x: number; y: number }> = new Map();

  constructor(context: ToolContext) {
    this.context = context;
  }

  activate() {}
  deactivate() {}

  onPointerDown(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    const target = e.target;
    const pageId = this.context.documentStore.getActivePageId();

    if (target === stage) {
      if (!e.evt.shiftKey) {
        this.context.sessionStore.clearSelection();
      }
      this.context.sessionStore.setDragStart(worldPos);
      return true;
    }

    const shapeId = target.id();
    if (shapeId) {
      if (e.evt.shiftKey) {
        this.context.sessionStore.toggleSelection(shapeId);
      } else if (!this.context.sessionStore.isSelected(shapeId)) {
        this.context.sessionStore.setSelection([shapeId]);
      }

      this.context.sessionStore.setDragging(true);
      this.context.sessionStore.setDragStart(worldPos);

      const shapes = this.context.documentStore.getShapes(pageId);
      const selectedIds = this.context.sessionStore.getSelectedIds();
      this.initialPositions.clear();
      for (const id of selectedIds) {
        const shape = shapes.find(s => s.id === id);
        if (shape) {
          this.initialPositions.set(id, { x: shape.x, y: shape.y });
        }
      }

      return true;
    }

    return false;
  }

  onPointerMove(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    if (!this.context.sessionStore.isDragging()) return false;
    if (!this.dragStartPos) {
      this.dragStartPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    }

    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    const dragStart = this.context.sessionStore.getDragStart();
    if (!dragStart) return false;

    const deltaX = worldPos.x - dragStart.x;
    const deltaY = worldPos.y - dragStart.y;

    const snappedDeltaX = this.context.sessionStore.snapToGridValue(deltaX);
    const snappedDeltaY = this.context.sessionStore.snapToGridValue(deltaY);

    const selectedIds = this.context.sessionStore.getSelectedIds();
    const pageId = this.context.documentStore.getActivePageId();
    const shapes = this.context.documentStore.getShapes(pageId);

    for (const id of selectedIds) {
      const initial = this.initialPositions.get(id);
      if (initial) {
        const node = stage.findOne(`#${id}`);
        if (node) {
          node.x(initial.x + snappedDeltaX);
          node.y(initial.y + snappedDeltaY);
        }
      }
    }

    stage.batchDraw();
    return true;
  }

  onPointerUp(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    if (!this.context.sessionStore.isDragging()) {
      this.context.sessionStore.setDragStart(null);
      this.dragStartPos = null;
      return false;
    }

    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    const dragStart = this.context.sessionStore.getDragStart();
    
    if (dragStart) {
      const deltaX = worldPos.x - dragStart.x;
      const deltaY = worldPos.y - dragStart.y;

      const snappedDeltaX = this.context.sessionStore.snapToGridValue(deltaX);
      const snappedDeltaY = this.context.sessionStore.snapToGridValue(deltaY);

      if (Math.abs(snappedDeltaX) > 0 || Math.abs(snappedDeltaY) > 0) {
        const selectedIds = this.context.sessionStore.getSelectedIds();
        const pageId = this.context.documentStore.getActivePageId();

        const command = new MoveShapesCommand(
          uuidv4(),
          pageId,
          selectedIds,
          snappedDeltaX,
          snappedDeltaY,
          (pid, ids, dx, dy) => this.context.documentStore.moveShapes(pid, ids, dx, dy)
        );
        this.context.commandManager.execute(command);
      }
    }

    this.context.sessionStore.setDragging(false);
    this.context.sessionStore.setDragStart(null);
    this.dragStartPos = null;
    this.initialPositions.clear();

    return true;
  }

  onWheel(e: Konva.KonvaEventObject<WheelEvent>, stage: Konva.Stage): boolean {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (!pointer) return false;

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

    this.context.sessionStore.setViewport({
      x: stage.x(),
      y: stage.y(),
      scale: newScale,
    });

    stage.batchDraw();
    return true;
  }
}

export class PanTool implements Tool {
  type: ToolType = 'pan';
  cursor = 'grab';

  private context: ToolContext;
  private isPanning = false;
  private lastPos: { x: number; y: number } | null = null;

  constructor(context: ToolContext) {
    this.context = context;
  }

  activate() {}
  deactivate() {
    this.isPanning = false;
    this.lastPos = null;
  }

  onPointerDown(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    this.isPanning = true;
    this.lastPos = { x: e.evt.clientX, y: e.evt.clientY };
    stage.container().style.cursor = 'grabbing';
    return true;
  }

  onPointerMove(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    if (!this.isPanning || !this.lastPos) return false;

    const dx = e.evt.clientX - this.lastPos.x;
    const dy = e.evt.clientY - this.lastPos.y;

    stage.x(stage.x() + dx);
    stage.y(stage.y() + dy);

    this.context.sessionStore.setViewport({
      x: stage.x(),
      y: stage.y(),
      scale: stage.scaleX(),
    });

    this.lastPos = { x: e.evt.clientX, y: e.evt.clientY };
    stage.batchDraw();
    return true;
  }

  onPointerUp(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    if (this.isPanning) {
      this.isPanning = false;
      this.lastPos = null;
      stage.container().style.cursor = this.cursor;
    }
    return false;
  }

  onWheel(e: Konva.KonvaEventObject<WheelEvent>, stage: Konva.Stage): boolean {
    return new SelectTool(this.context).onWheel(e, stage);
  }
}

export class RectangleTool implements Tool {
  type: ToolType = 'rectangle';
  cursor = 'crosshair';

  private context: ToolContext;
  private isDrawing = false;
  private startPos: { x: number; y: number } | null = null;
  private previewRect: Konva.Rect | null = null;
  private layer: Konva.Layer | null = null;

  constructor(context: ToolContext) {
    this.context = context;
  }

  activate() {}
  deactivate() {
    this.cancelDrawing();
  }

  setLayer(layer: Konva.Layer) {
    this.layer = layer;
  }

  onPointerDown(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    this.isDrawing = true;
    this.startPos = worldPos;

    this.previewRect = new Konva.Rect({
      x: worldPos.x,
      y: worldPos.y,
      width: 0,
      height: 0,
      fill: this.context.sessionStore.getDefaultFill(),
      stroke: this.context.sessionStore.getDefaultStroke(),
      strokeWidth: this.context.sessionStore.getDefaultStrokeWidth(),
      dash: [5, 5],
      listening: false,
    });

    const layer = stage.findOne('.preview-layer') as Konva.Layer || stage.getLayers()[0];
    layer.add(this.previewRect);
    layer.batchDraw();

    return true;
  }

  onPointerMove(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    if (!this.isDrawing || !this.startPos || !this.previewRect) return false;

    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    const width = worldPos.x - this.startPos.x;
    const height = worldPos.y - this.startPos.y;

    this.previewRect.width(Math.abs(width));
    this.previewRect.height(Math.abs(height));
    this.previewRect.x(width < 0 ? worldPos.x : this.startPos.x);
    this.previewRect.y(height < 0 ? worldPos.y : this.startPos.y);

    const layer = this.previewRect.getLayer();
    layer?.batchDraw();

    return true;
  }

  onPointerUp(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    if (!this.isDrawing || !this.startPos) return false;

    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    const width = Math.abs(worldPos.x - this.startPos.x);
    const height = Math.abs(worldPos.y - this.startPos.y);

    if (width > 5 && height > 5) {
      const shape: RectangleShape = {
        id: uuidv4(),
        type: 'rectangle',
        x: Math.min(this.startPos.x, worldPos.x),
        y: Math.min(this.startPos.y, worldPos.y),
        width,
        height,
        fill: this.context.sessionStore.getDefaultFill(),
        stroke: this.context.sessionStore.getDefaultStroke(),
        strokeWidth: this.context.sessionStore.getDefaultStrokeWidth(),
        cornerRadius: 0,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
      };

      const command = new CreateShapeCommand(
        uuidv4(),
        this.context.documentStore.getActivePageId(),
        shape,
        (pid, s) => this.context.documentStore.addShape(pid, s),
        (pid, id) => this.context.documentStore.removeShape(pid, id)
      );
      this.context.commandManager.execute(command);
    }

    this.cancelDrawing();
    return true;
  }

  onWheel(e: Konva.KonvaEventObject<WheelEvent>, stage: Konva.Stage): boolean {
    return false;
  }

  private cancelDrawing() {
    if (this.previewRect) {
      this.previewRect.destroy();
      this.previewRect = null;
    }
    this.isDrawing = false;
    this.startPos = null;
  }
}

export class CircleTool implements Tool {
  type: ToolType = 'circle';
  cursor = 'crosshair';

  private context!: ToolContext;
  
  constructor(context: ToolContext) {
    this.context = context;
  }
  private isDrawing = false;
  private startPos: { x: number; y: number } | null = null;
  private previewCircle: Konva.Circle | null = null;

  activate() {}
  deactivate() {
    this.cancelDrawing();
  }

  onPointerDown(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    this.isDrawing = true;
    this.startPos = worldPos;

    this.previewCircle = new Konva.Circle({
      x: worldPos.x,
      y: worldPos.y,
      radius: 0,
      fill: this.context.sessionStore.getDefaultFill(),
      stroke: this.context.sessionStore.getDefaultStroke(),
      strokeWidth: this.context.sessionStore.getDefaultStrokeWidth(),
      dash: [5, 5],
      listening: false,
    });

    const layer = stage.getLayers()[0];
    layer.add(this.previewCircle);
    layer.batchDraw();
    return true;
  }

  onPointerMove(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    if (!this.isDrawing || !this.startPos || !this.previewCircle) return false;

    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    const radius = Math.sqrt(
      Math.pow(worldPos.x - this.startPos.x, 2) + Math.pow(worldPos.y - this.startPos.y, 2)
    );

    this.previewCircle.radius(radius);
    this.previewCircle.getLayer()?.batchDraw();
    return true;
  }

  onPointerUp(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    if (!this.isDrawing || !this.startPos) return false;

    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    const radius = Math.sqrt(
      Math.pow(worldPos.x - this.startPos.x, 2) + Math.pow(worldPos.y - this.startPos.y, 2)
    );

    if (radius > 5) {
      const shape: CircleShape = {
        id: uuidv4(),
        type: 'circle',
        x: this.startPos.x,
        y: this.startPos.y,
        radius,
        fill: this.context.sessionStore.getDefaultFill(),
        stroke: this.context.sessionStore.getDefaultStroke(),
        strokeWidth: this.context.sessionStore.getDefaultStrokeWidth(),
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
      };

      const command = new CreateShapeCommand(
        uuidv4(),
        this.context.documentStore.getActivePageId(),
        shape,
        (pid, s) => this.context.documentStore.addShape(pid, s),
        (pid, id) => this.context.documentStore.removeShape(pid, id)
      );
      this.context.commandManager.execute(command);
    }

    this.cancelDrawing();
    return true;
  }

  onWheel(e: Konva.KonvaEventObject<WheelEvent>, stage: Konva.Stage): boolean {
    return false;
  }

  private cancelDrawing() {
    if (this.previewCircle) {
      this.previewCircle.destroy();
      this.previewCircle = null;
    }
    this.isDrawing = false;
    this.startPos = null;
  }
}

export class TextTool implements Tool {
  type: ToolType = 'text';
  cursor = 'text';

  private context: ToolContext;

  constructor(context: ToolContext) {
    this.context = context;
  }

  activate() {}
  deactivate() {}

  onPointerDown(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);

    const shape: TextShape = {
      id: uuidv4(),
      type: 'text',
      x: worldPos.x,
      y: worldPos.y,
      text: 'Double-click to edit',
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      fill: '#1a202c',
      width: 200,
      align: 'left',
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
    };

    const command = new CreateShapeCommand(
      uuidv4(),
      this.context.documentStore.getActivePageId(),
      shape,
      (pid, s) => this.context.documentStore.addShape(pid, s),
      (pid, id) => this.context.documentStore.removeShape(pid, id)
    );
    this.context.commandManager.execute(command);

    this.context.sessionStore.setSelection([shape.id]);

    return true;
  }

  onPointerMove(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    return false;
  }

  onPointerUp(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    return false;
  }

  onWheel(e: Konva.KonvaEventObject<WheelEvent>, stage: Konva.Stage): boolean {
    return false;
  }
}

export class LineTool implements Tool {
  type: ToolType = 'line';
  cursor = 'crosshair';

  private context!: ToolContext;
  
  constructor(context: ToolContext) {
    this.context = context;
  }
  private isDrawing = false;
  private startPos: { x: number; y: number } | null = null;
  private previewLine: Konva.Line | null = null;

  activate() {}
  deactivate() {
    this.cancelDrawing();
  }

  onPointerDown(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    this.isDrawing = true;
    this.startPos = worldPos;

    this.previewLine = new Konva.Line({
      points: [worldPos.x, worldPos.y, worldPos.x, worldPos.y],
      stroke: this.context.sessionStore.getDefaultStroke(),
      strokeWidth: this.context.sessionStore.getDefaultStrokeWidth(),
      lineCap: 'round',
      lineJoin: 'round',
      dash: [5, 5],
      listening: false,
    });

    const layer = stage.getLayers()[0];
    layer.add(this.previewLine);
    layer.batchDraw();
    return true;
  }

  onPointerMove(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    if (!this.isDrawing || !this.startPos || !this.previewLine) return false;

    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    this.previewLine.points([this.startPos.x, this.startPos.y, worldPos.x, worldPos.y]);
    this.previewLine.getLayer()?.batchDraw();
    return true;
  }

  onPointerUp(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    if (!this.isDrawing || !this.startPos) return false;

    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    const dist = Math.sqrt(
      Math.pow(worldPos.x - this.startPos.x, 2) + Math.pow(worldPos.y - this.startPos.y, 2)
    );

    if (dist > 5) {
      const shape: LineShape = {
        id: uuidv4(),
        type: 'line',
        x: 0,
        y: 0,
        points: [this.startPos.x, this.startPos.y, worldPos.x, worldPos.y],
        stroke: this.context.sessionStore.getDefaultStroke(),
        strokeWidth: this.context.sessionStore.getDefaultStrokeWidth(),
        lineCap: 'round',
        lineJoin: 'round',
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
      };

      const command = new CreateShapeCommand(
        uuidv4(),
        this.context.documentStore.getActivePageId(),
        shape,
        (pid, s) => this.context.documentStore.addShape(pid, s),
        (pid, id) => this.context.documentStore.removeShape(pid, id)
      );
      this.context.commandManager.execute(command);
    }

    this.cancelDrawing();
    return true;
  }

  onWheel(e: Konva.KonvaEventObject<WheelEvent>, stage: Konva.Stage): boolean {
    return false;
  }

  private cancelDrawing() {
    if (this.previewLine) {
      this.previewLine.destroy();
      this.previewLine = null;
    }
    this.isDrawing = false;
    this.startPos = null;
  }
}

export class ArrowTool implements Tool {
  type: ToolType = 'arrow';
  cursor = 'crosshair';

  private context!: ToolContext;
  
  constructor(context: ToolContext) {
    this.context = context;
  }
  private isDrawing = false;
  private startPos: { x: number; y: number } | null = null;
  private previewArrow: Konva.Arrow | null = null;

  activate() {}
  deactivate() {
    this.cancelDrawing();
  }

  onPointerDown(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    this.isDrawing = true;
    this.startPos = worldPos;

    this.previewArrow = new Konva.Arrow({
      points: [worldPos.x, worldPos.y, worldPos.x, worldPos.y],
      stroke: this.context.sessionStore.getDefaultStroke(),
      strokeWidth: this.context.sessionStore.getDefaultStrokeWidth(),
      pointerLength: 10,
      pointerWidth: 10,
      lineCap: 'round',
      lineJoin: 'round',
      dash: [5, 5],
      listening: false,
    });

    const layer = stage.getLayers()[0];
    layer.add(this.previewArrow);
    layer.batchDraw();
    return true;
  }

  onPointerMove(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    if (!this.isDrawing || !this.startPos || !this.previewArrow) return false;

    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    this.previewArrow.points([this.startPos.x, this.startPos.y, worldPos.x, worldPos.y]);
    this.previewArrow.getLayer()?.batchDraw();
    return true;
  }

  onPointerUp(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    if (!this.isDrawing || !this.startPos) return false;

    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    const dist = Math.sqrt(
      Math.pow(worldPos.x - this.startPos.x, 2) + Math.pow(worldPos.y - this.startPos.y, 2)
    );

    if (dist > 5) {
      const shape: ArrowShape = {
        id: uuidv4(),
        type: 'arrow',
        x: 0,
        y: 0,
        points: [this.startPos.x, this.startPos.y, worldPos.x, worldPos.y],
        stroke: this.context.sessionStore.getDefaultStroke(),
        strokeWidth: this.context.sessionStore.getDefaultStrokeWidth(),
        lineCap: 'round',
        lineJoin: 'round',
        pointerLength: 10,
        pointerWidth: 10,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
      };

      const command = new CreateShapeCommand(
        uuidv4(),
        this.context.documentStore.getActivePageId(),
        shape,
        (pid, s) => this.context.documentStore.addShape(pid, s),
        (pid, id) => this.context.documentStore.removeShape(pid, id)
      );
      this.context.commandManager.execute(command);
    }

    this.cancelDrawing();
    return true;
  }

  onWheel(e: Konva.KonvaEventObject<WheelEvent>, stage: Konva.Stage): boolean {
    return false;
  }

  private cancelDrawing() {
    if (this.previewArrow) {
      this.previewArrow.destroy();
      this.previewArrow = null;
    }
    this.isDrawing = false;
    this.startPos = null;
  }
}

export class FreehandTool implements Tool {
  type: ToolType = 'freehand';
  cursor = 'crosshair';

  private context!: ToolContext;
  
  constructor(context: ToolContext) {
    this.context = context;
  }
  private isDrawing = false;
  private points: number[] = [];
  private previewLine: Konva.Line | null = null;

  activate() {}
  deactivate() {
    this.cancelDrawing();
  }

  onPointerDown(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    this.isDrawing = true;
    this.points = [worldPos.x, worldPos.y];

    this.previewLine = new Konva.Line({
      points: this.points,
      stroke: '#e53e3e',
      strokeWidth: 3,
      lineCap: 'round',
      lineJoin: 'round',
      tension: 0.5,
      listening: false,
    });

    const layer = stage.getLayers()[0];
    layer.add(this.previewLine);
    layer.batchDraw();
    return true;
  }

  onPointerMove(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    if (!this.isDrawing || !this.previewLine) return false;

    const worldPos = getWorldPosition(stage, e.evt.clientX, e.evt.clientY);
    this.points.push(worldPos.x, worldPos.y);
    this.previewLine.points(this.points);
    this.previewLine.getLayer()?.batchDraw();
    return true;
  }

  onPointerUp(e: Konva.KonvaEventObject<PointerEvent>, stage: Konva.Stage): boolean {
    if (!this.isDrawing || this.points.length < 4) {
      this.cancelDrawing();
      return false;
    }

    const xs = this.points.filter((_, i) => i % 2 === 0);
    const ys = this.points.filter((_, i) => i % 2 === 1);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);

    const shape: FreehandShape = {
      id: uuidv4(),
      type: 'freehand',
      x: 0,
      y: 0,
      points: this.points.map((p, i) => (i % 2 === 0 ? p - minX : p - minY)),
      stroke: '#e53e3e',
      strokeWidth: 3,
      tension: 0.5,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
    };

    const command = new CreateShapeCommand(
      uuidv4(),
      this.context.documentStore.getActivePageId(),
      shape,
      (pid, s) => this.context.documentStore.addShape(pid, s),
      (pid, id) => this.context.documentStore.removeShape(pid, id)
    );
    this.context.commandManager.execute(command);

    this.cancelDrawing();
    return true;
  }

  onWheel(e: Konva.KonvaEventObject<WheelEvent>, stage: Konva.Stage): boolean {
    return false;
  }

  private cancelDrawing() {
    if (this.previewLine) {
      this.previewLine.destroy();
      this.previewLine = null;
    }
    this.isDrawing = false;
    this.points = [];
  }
}

export const createTool = (type: ToolType, context: ToolContext): Tool => {
  switch (type) {
    case 'select':
      return new SelectTool(context);
    case 'pan':
      return new PanTool(context);
    case 'rectangle':
      return new RectangleTool(context);
    case 'circle':
      return new CircleTool(context);
    case 'text':
      return new TextTool(context);
    case 'line':
      return new LineTool(context);
    case 'arrow':
      return new ArrowTool(context);
    case 'freehand':
      return new FreehandTool(context);
    default:
      return new SelectTool(context);
  }
};
