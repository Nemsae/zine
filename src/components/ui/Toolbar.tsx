import React from 'react';
import { ToolType } from '../../core/types';
import { SessionStore } from '../../core/store';

interface ToolbarProps {
  sessionStore: SessionStore;
  currentTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const tools: { type: ToolType; icon: string; label: string }[] = [
  { type: 'select', icon: '↖', label: 'Select' },
  { type: 'pan', icon: '✋', label: 'Pan' },
  { type: 'rectangle', icon: '▢', label: 'Rectangle' },
  { type: 'circle', icon: '○', label: 'Circle' },
  { type: 'text', icon: 'T', label: 'Text' },
  { type: 'line', icon: '/', label: 'Line' },
  { type: 'arrow', icon: '→', label: 'Arrow' },
  { type: 'freehand', icon: '✎', label: 'Freehand' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  sessionStore,
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: '#fff',
      borderBottom: '1px solid #e0e0e0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', gap: '4px', marginRight: '16px' }}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            padding: '6px 12px',
            background: canUndo ? '#f5f5f5' : '#eee',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: canUndo ? 'pointer' : 'not-allowed',
            opacity: canUndo ? 1 : 0.5,
          }}
          title="Undo (Ctrl+Z)"
        >
          ↩
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{
            padding: '6px 12px',
            background: canRedo ? '#f5f5f5' : '#eee',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: canRedo ? 'pointer' : 'not-allowed',
            opacity: canRedo ? 1 : 0.5,
          }}
          title="Redo (Ctrl+Y)"
        >
          ↪
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '4px',
        background: '#f5f5f5',
        borderRadius: '6px',
      }}>
        {tools.map((tool) => (
          <button
            key={tool.type}
            onClick={() => onToolChange(tool.type)}
            style={{
              padding: '8px 12px',
              background: currentTool === tool.type ? '#4285f4' : 'transparent',
              color: currentTool === tool.type ? '#fff' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.15s ease',
            }}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666' }}>
          <input
            type="checkbox"
            checked={sessionStore.getSnapToGrid()}
            onChange={(e) => sessionStore.setSnapToGrid(e.target.checked)}
          />
          Snap to Grid
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666' }}>
          <input
            type="checkbox"
            checked={sessionStore.getShowGrid()}
            onChange={(e) => sessionStore.setShowGrid(e.target.checked)}
          />
          Show Grid
        </label>

        <select
          value={sessionStore.getGridSize()}
          onChange={(e) => sessionStore.setGridSize(Number(e.target.value))}
          style={{
            padding: '4px 8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          <option value={5}>5px</option>
          <option value={10}>10px</option>
          <option value={20}>20px</option>
          <option value={50}>50px</option>
        </select>
      </div>
    </div>
  );
};

export default Toolbar;
