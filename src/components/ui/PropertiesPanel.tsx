import React from 'react';
import { Shape, RectangleShape, CircleShape, TextShape, LineShape, ArrowShape } from '../../core/types';
import { DocumentStore } from '../../core/store/DocumentStore';

interface PropertiesPanelProps {
  documentStore: DocumentStore;
  selectedIds: string[];
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  documentStore,
  selectedIds,
}) => {
  const selectedShape = selectedIds.length === 1
    ? documentStore.getShape(documentStore.getActivePageId(), selectedIds[0])
    : null;

  if (selectedIds.length === 0) {
    return (
      <div style={{
        width: '260px',
        padding: '16px',
        background: '#fff',
        borderLeft: '1px solid #e0e0e0',
        height: '100%',
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#333' }}>Properties</h3>
        <p style={{ color: '#666', fontSize: '12px' }}>Select a shape to edit its properties</p>
      </div>
    );
  }

  if (selectedIds.length > 1) {
    return (
      <div style={{
        width: '260px',
        padding: '16px',
        background: '#fff',
        borderLeft: '1px solid #e0e0e0',
        height: '100%',
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#333' }}>Properties</h3>
        <p style={{ color: '#666', fontSize: '12px' }}>{selectedIds.length} shapes selected</p>
      </div>
    );
  }

  if (!selectedShape) {
    return null;
  }

  const handleChange = (property: string, value: any) => {
    documentStore.updateShape(documentStore.getActivePageId(), selectedShape.id, { [property]: value });
  };

  return (
    <div style={{
      width: '260px',
      padding: '16px',
      background: '#fff',
      borderLeft: '1px solid #e0e0e0',
      height: '100%',
      overflowY: 'auto',
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#333' }}>
        {selectedShape.type.charAt(0).toUpperCase() + selectedShape.type.slice(1)} Properties
      </h3>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
          Position
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '10px', color: '#999' }}>X</span>
            <input
              type="number"
              value={Math.round(selectedShape.x)}
              onChange={(e) => handleChange('x', Number(e.target.value))}
              style={{
                width: '60px',
                padding: '4px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            />
          </div>
          <div>
            <span style={{ fontSize: '10px', color: '#999' }}>Y</span>
            <input
              type="number"
              value={Math.round(selectedShape.y)}
              onChange={(e) => handleChange('y', Number(e.target.value))}
              style={{
                width: '60px',
                padding: '4px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            />
          </div>
        </div>
      </div>

      {selectedShape.type !== 'text' && selectedShape.type !== 'line' && selectedShape.type !== 'arrow' && selectedShape.type !== 'freehand' && 'width' in selectedShape && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
            Size
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '10px', color: '#999' }}>W</span>
              <input
                type="number"
                value={Math.round(selectedShape.width || 0)}
                onChange={(e) => handleChange('width', Number(e.target.value))}
                style={{
                  width: '60px',
                  padding: '4px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#999' }}>H</span>
              <input
                type="number"
                value={Math.round(selectedShape.height || 0)}
                onChange={(e) => handleChange('height', Number(e.target.value))}
                style={{
                  width: '60px',
                  padding: '4px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {selectedShape.type === 'circle' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
            Radius
          </label>
          <input
            type="number"
            value={Math.round((selectedShape as CircleShape).radius)}
            onChange={(e) => handleChange('radius', Number(e.target.value))}
            style={{
              width: '100px',
              padding: '4px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          />
        </div>
      )}

      {selectedShape.type !== 'text' && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
              Fill Color
            </label>
            <input
              type="color"
              value={(selectedShape as any).fill || '#ffffff'}
              onChange={(e) => handleChange('fill', e.target.value)}
              style={{
                width: '40px',
                height: '30px',
                padding: '0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
              Stroke Color
            </label>
            <input
              type="color"
              value={(selectedShape as any).stroke || '#000000'}
              onChange={(e) => handleChange('stroke', e.target.value)}
              style={{
                width: '40px',
                height: '30px',
                padding: '0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
              Stroke Width
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={(selectedShape as any).strokeWidth || 1}
              onChange={(e) => handleChange('strokeWidth', Number(e.target.value))}
              style={{
                width: '60px',
                padding: '4px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            />
          </div>
        </>
      )}

      {selectedShape.type === 'text' && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
              Text Content
            </label>
            <textarea
              value={(selectedShape as TextShape).text}
              onChange={(e) => handleChange('text', e.target.value)}
              style={{
                width: '100%',
                height: '80px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
              Font Size
            </label>
            <input
              type="number"
              min="8"
              max="200"
              value={(selectedShape as TextShape).fontSize}
              onChange={(e) => handleChange('fontSize', Number(e.target.value))}
              style={{
                width: '60px',
                padding: '4px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
              Text Color
            </label>
            <input
              type="color"
              value={(selectedShape as TextShape).fill}
              onChange={(e) => handleChange('fill', e.target.value)}
              style={{
                width: '40px',
                height: '30px',
                padding: '0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
          </div>
        </>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
          Rotation
        </label>
        <input
          type="number"
          min="0"
          max="360"
          value={selectedShape.rotation}
          onChange={(e) => handleChange('rotation', Number(e.target.value))}
          style={{
            width: '60px',
            padding: '4px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
          Opacity
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={selectedShape.opacity}
          onChange={(e) => handleChange('opacity', Number(e.target.value))}
          style={{
            width: '100%',
          }}
        />
      </div>
    </div>
  );
};

export default PropertiesPanel;
