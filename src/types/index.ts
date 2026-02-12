// Type definitions for Zine Builder application
export interface Widget {
  id: string;
  type: 'heading' | 'text' | 'content';
  content: string;
  position: {
    x: number;
    y: number;
  };
}

export interface Theme {
  background: string;
  fontFamily: string;
  widgetShadow: string;
}

export interface DragEndResult {
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
  draggableId: string;
}

// Component Props Types
export interface WidgetProps {
  id: string;
  content: string;
  isEditing: boolean;
  onEdit: (id: string) => void;
  onSave: (id: string, content: string) => void;
  onCancel: () => void;
}

export interface DraggableWidgetProps extends WidgetProps {
  widget: Widget;
  type: string;
  isFromPalette?: boolean;
  index: number;
  onDelete?: (id: string) => void;
}

export interface DropZoneProps {
  widgets: Widget[];
  editingWidget: string | null;
  onEdit: (id: string) => void;
  onSave: (id: string, content: string) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onDrop: (result: DragEndResult) => void;
}

export interface WidgetPaletteProps {
  onThemeChange: (theme: Partial<Theme>) => void;
  currentTheme: Theme;
}

export interface ZineCanvasProps {
  widgets: Widget[];
  editingWidget: string | null;
  onEdit: (id: string) => void;
  onSave: (id: string, content: string) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onThemeChange: (theme: Partial<Theme>) => void;
  currentTheme: Theme;
}

// Action Types for useReducer
export type ZineAction =
  | { type: 'ADD_WIDGET'; payload: Omit<Widget, 'createdAt'> }
  | { type: 'UPDATE_WIDGET'; payload: { id: string; updates: Partial<Widget> } }
  | { type: 'DELETE_WIDGET'; payload: { id: string } }
  | { type: 'START_EDITING'; payload: { id: string } }
  | { type: 'STOP_EDITING' }
  | { type: 'MOVE_WIDGET'; payload: { id: string; position: { x: number; y: number } } }
  | { type: 'REORDER_WIDGETS'; payload: { sourceIndex: number; destinationIndex: number } }
  | { type: 'LOAD_DRAFT'; payload: { widgets: Widget[] } }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean } }
  | { type: 'SET_ERROR'; payload: { error: string | null } }
  | { type: 'CLEAR_ALL' };

// Custom Hook Return Types
export interface UseZineStateReturn {
  widgets: Widget[];
  editingWidget: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addWidget: (widget: Omit<Widget, 'createdAt'>) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  deleteWidget: (id: string) => void;
  startEditing: (id: string) => void;
  stopEditing: () => void;
  moveWidget: (id: string, position: { x: number; y: number }) => void;
  reorderWidgets: (sourceIndex: number, destinationIndex: number) => void;
  clearAll: () => void;
  saveWidgetContent: (id: string, content: string) => void;
}