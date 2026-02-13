export type ToolType = 'select' | 'pan' | 'rectangle' | 'circle' | 'text' | 'image' | 'line' | 'arrow' | 'freehand';

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SessionState {
  viewport: Viewport;
  selectedIds: string[];
  currentTool: ToolType;
  isDragging: boolean;
  isDrawing: boolean;
  dragStart: { x: number; y: number } | null;
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;
  selectionBox: SelectionBox | null;
  defaultFill: string;
  defaultStroke: string;
  defaultStrokeWidth: number;
}

export const createDefaultSessionState = (): SessionState => ({
  viewport: { x: 0, y: 0, scale: 1 },
  selectedIds: [],
  currentTool: 'select',
  isDragging: false,
  isDrawing: false,
  dragStart: null,
  snapToGrid: true,
  gridSize: 10,
  showGrid: true,
  selectionBox: null,
  defaultFill: '#4a90d9',
  defaultStroke: '#2c5282',
  defaultStrokeWidth: 2,
});

export const MIN_SCALE = 0.1;
export const MAX_SCALE = 5;
export const SCALE_FACTOR = 1.05;
