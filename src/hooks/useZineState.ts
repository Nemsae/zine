import { useReducer, useEffect } from 'react';
import { ZineState, ZineAction, UseZineStateReturn } from '../types';

const initialState: ZineState = {
  widgets: [],
  editingWidget: null,
  isLoading: false,
  error: null
};

const zineReducer = (state: ZineState, action: ZineAction): ZineState => {
  switch (action.type) {
    case 'ADD_WIDGET': {
      const newWidget = {
        id: action.payload.id,
        type: action.payload.type,
        content: action.payload.content,
        position: action.payload.position || { x: 50, y: 50 },
        createdAt: new Date().toISOString()
      };
      
      return {
        ...state,
        widgets: [...state.widgets, newWidget]
      };
    }
    
    case 'UPDATE_WIDGET': {
      return {
        ...state,
        widgets: state.widgets.map(widget =>
          widget.id === action.payload.id
            ? { ...widget, ...action.payload.updates }
            : widget
        )
      };
    }
    
    case 'DELETE_WIDGET': {
      return {
        ...state,
        widgets: state.widgets.filter(widget => widget.id !== action.payload.id)
      };
    }
    
    case 'START_EDITING': {
      return {
        ...state,
        editingWidget: action.payload.id
      };
    }
    
    case 'STOP_EDITING': {
      return {
        ...state,
        editingWidget: null
      };
    }
    
    case 'MOVE_WIDGET': {
      return {
        ...state,
        widgets: state.widgets.map(widget =>
          widget.id === action.payload.id
            ? { ...widget, position: action.payload.position }
            : widget
        )
      };
    }
    
    case 'REORDER_WIDGETS': {
      const { sourceIndex, destinationIndex } = action.payload;
      const newWidgets = Array.from(state.widgets);
      const [reorderedItem] = newWidgets.splice(sourceIndex, 1);
      newWidgets.splice(destinationIndex, 0, reorderedItem);
      
      // Update positions based on new order
      const reorderedWithPositions = newWidgets.map((widget, index) => ({
        ...widget,
        position: { x: index * 50, y: index * 30 }
      }));
      
      return {
        ...state,
        widgets: reorderedWithPositions
      };
    }
    
    case 'LOAD_DRAFT': {
      return {
        ...state,
        widgets: action.payload.widgets || [],
        isLoading: false
      };
    }
    
    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload.isLoading
      };
    }
    
    case 'SET_ERROR': {
      return {
        ...state,
        error: action.payload.error,
        isLoading: false
      };
    }
    
    case 'CLEAR_ALL': {
      return {
        ...state,
        widgets: [],
        editingWidget: null
      };
    }
    
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

export const useZineState = (): UseZineStateReturn => {
  const [state, dispatch] = useReducer(zineReducer, initialState);

  // Load draft from localStorage on mount
  useEffect(() => {
    const loadDraft = () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
        
        const savedDraft = localStorage.getItem('zine-draft');
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          dispatch({ type: 'LOAD_DRAFT', payload: { widgets: draft.widgets } });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: { error: 'Failed to load draft' } });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
      }
    };

    loadDraft();
  }, []);

  // Auto-save to localStorage when widgets change
  useEffect(() => {
    const saveDraft = () => {
      try {
        const draft = {
          widgets: state.widgets,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem('zine-draft', JSON.stringify(draft));
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    };

    if (state.widgets.length > 0) {
      const timeoutId = setTimeout(saveDraft, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [state.widgets]);

  const addWidget = (widget: Omit<import('../types').Widget, 'createdAt'>): void => {
    dispatch({ type: 'ADD_WIDGET', payload: widget });
  };

  const updateWidget = (id: string, updates: Partial<import('../types').Widget>): void => {
    dispatch({ type: 'UPDATE_WIDGET', payload: { id, updates } });
  };

  const deleteWidget = (id: string): void => {
    dispatch({ type: 'DELETE_WIDGET', payload: { id } });
  };

  const startEditing = (id: string): void => {
    dispatch({ type: 'START_EDITING', payload: { id } });
  };

  const stopEditing = (): void => {
    dispatch({ type: 'STOP_EDITING' });
  };

  const moveWidget = (id: string, position: { x: number; y: number }): void => {
    dispatch({ type: 'MOVE_WIDGET', payload: { id, position } });
  };

  const reorderWidgets = (sourceIndex: number, destinationIndex: number): void => {
    dispatch({ type: 'REORDER_WIDGETS', payload: { sourceIndex, destinationIndex } });
  };

  const clearAll = (): void => {
    dispatch({ type: 'CLEAR_ALL' });
    localStorage.removeItem('zine-draft');
  };

  const saveWidgetContent = (id: string, content: string): void => {
    updateWidget(id, { content });
    stopEditing();
  };

  return {
    // State
    widgets: state.widgets,
    editingWidget: state.editingWidget,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    addWidget,
    updateWidget,
    deleteWidget,
    startEditing,
    stopEditing,
    moveWidget,
    reorderWidgets,
    clearAll,
    saveWidgetContent
  };
};