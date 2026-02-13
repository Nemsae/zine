import { SessionState, Viewport, SelectionBox, ToolType, createDefaultSessionState, MIN_SCALE, MAX_SCALE, SCALE_FACTOR } from '../types';

export class SessionStore {
  private state: SessionState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = createDefaultSessionState();
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): SessionState {
    return this.state;
  }

  getViewport(): Viewport {
    return this.state.viewport;
  }

  setViewport(viewport: Partial<Viewport>) {
    this.state.viewport = { ...this.state.viewport, ...viewport };
    this.notify();
  }

  panViewport(deltaX: number, deltaY: number) {
    this.state.viewport.x += deltaX;
    this.state.viewport.y += deltaY;
    this.notify();
  }

  zoomViewport(delta: number, centerX?: number, centerY?: number) {
    const oldScale = this.state.viewport.scale;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, oldScale * (delta > 0 ? 1 / SCALE_FACTOR : SCALE_FACTOR)));
    
    if (newScale !== oldScale) {
      if (centerX !== undefined && centerY !== undefined) {
        const scaleRatio = newScale / oldScale;
        this.state.viewport.x = centerX - (centerX - this.state.viewport.x) * scaleRatio;
        this.state.viewport.y = centerY - (centerY - this.state.viewport.y) * scaleRatio;
      }
      this.state.viewport.scale = newScale;
      this.notify();
    }
  }

  setZoom(scale: number) {
    this.state.viewport.scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
    this.notify();
  }

  resetViewport() {
    this.state.viewport = { x: 0, y: 0, scale: 1 };
    this.notify();
  }

  getSelectedIds(): string[] {
    return this.state.selectedIds;
  }

  setSelection(ids: string[]) {
    this.state.selectedIds = ids;
    this.notify();
  }

  addToSelection(id: string) {
    if (!this.state.selectedIds.includes(id)) {
      this.state.selectedIds.push(id);
      this.notify();
    }
  }

  removeFromSelection(id: string) {
    this.state.selectedIds = this.state.selectedIds.filter(i => i !== id);
    this.notify();
  }

  toggleSelection(id: string) {
    if (this.state.selectedIds.includes(id)) {
      this.removeFromSelection(id);
    } else {
      this.addToSelection(id);
    }
  }

  clearSelection() {
    this.state.selectedIds = [];
    this.notify();
  }

  isSelected(id: string): boolean {
    return this.state.selectedIds.includes(id);
  }

  getCurrentTool(): ToolType {
    return this.state.currentTool;
  }

  setCurrentTool(tool: ToolType) {
    this.state.currentTool = tool;
    this.notify();
  }

  isDragging(): boolean {
    return this.state.isDragging;
  }

  setDragging(dragging: boolean) {
    this.state.isDragging = dragging;
    this.notify();
  }

  isDrawing(): boolean {
    return this.state.isDrawing;
  }

  setDrawing(drawing: boolean) {
    this.state.isDrawing = drawing;
    this.notify();
  }

  getDragStart(): { x: number; y: number } | null {
    return this.state.dragStart;
  }

  setDragStart(pos: { x: number; y: number } | null) {
    this.state.dragStart = pos;
  }

  getSnapToGrid(): boolean {
    return this.state.snapToGrid;
  }

  setSnapToGrid(snap: boolean) {
    this.state.snapToGrid = snap;
    this.notify();
  }

  getGridSize(): number {
    return this.state.gridSize;
  }

  setGridSize(size: number) {
    this.state.gridSize = size;
    this.notify();
  }

  getShowGrid(): boolean {
    return this.state.showGrid;
  }

  setShowGrid(show: boolean) {
    this.state.showGrid = show;
    this.notify();
  }

  getSelectionBox(): SelectionBox | null {
    return this.state.selectionBox;
  }

  setSelectionBox(box: SelectionBox | null) {
    this.state.selectionBox = box;
    this.notify();
  }

  snapToGridValue(value: number): number {
    if (!this.state.snapToGrid) return value;
    return Math.round(value / this.state.gridSize) * this.state.gridSize;
  }

  snapToGridPosition(x: number, y: number): { x: number; y: number } {
    return {
      x: this.snapToGridValue(x),
      y: this.snapToGridValue(y),
    };
  }

  getDefaultFill(): string {
    return this.state.defaultFill;
  }

  setDefaultFill(fill: string) {
    this.state.defaultFill = fill;
    this.notify();
  }

  getDefaultStroke(): string {
    return this.state.defaultStroke;
  }

  setDefaultStroke(stroke: string) {
    this.state.defaultStroke = stroke;
    this.notify();
  }

  getDefaultStrokeWidth(): number {
    return this.state.defaultStrokeWidth;
  }

  setDefaultStrokeWidth(width: number) {
    this.state.defaultStrokeWidth = width;
    this.notify();
  }
}
