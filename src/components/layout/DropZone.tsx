import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import DraggableWidget from './DraggableWidget';
import { DropZoneProps } from '../../types';
import './DropZone.css';

const DropZone: React.FC<DropZoneProps> = ({ 
  widgets, 
  editingWidget, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete,
  onDrop 
}) => {

  return (
    <Droppable 
      droppableId="canvas"
      isDropDisabled={false}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`drop-zone ${snapshot.isDraggingOver ? 'drop-over' : ''} ${snapshot.isUsingPlaceholder ? 'can-drop' : ''}`}
        >
          {widgets.length === 0 && (
            <div className="empty-state">
              <h3>Welcome to Your Zine Canvas!</h3>
              <p>Start dragging widgets from the palette to build your page</p>
              <div className="empty-state-icon">🎨</div>
            </div>
          )}
          
          {widgets.map((widget, index) => (
            <div
              key={widget.id}
              className="widget-container"
              style={{
                position: 'absolute',
                left: widget.position?.x || 0,
                top: widget.position?.y || 0,
              }}
            >
              <DraggableWidget
                widget={widget}
                type={widget.type}
                isEditing={editingWidget === widget.id}
                onEdit={onEdit}
                onSave={onSave}
                onCancel={onCancel}
                onDelete={onDelete}
                index={index}
              />
            </div>
          ))}
          
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default DropZone;