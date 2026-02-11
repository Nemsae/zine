import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { HeadingWidget, TextWidget, ContentWidget } from '../widgets';
import './DraggableWidget.css';

const DraggableWidget = ({ 
  widget, 
  type, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete,
  isFromPalette = false,
  index
}) => {

  const renderWidget = () => {
    const commonProps = {
      id: widget.id,
      content: widget.content,
      isEditing,
      onEdit,
      onSave,
      onCancel
    };

    switch (widget.type) {
      case 'heading':
        return <HeadingWidget {...commonProps} />;
      case 'text':
        return <TextWidget {...commonProps} />;
      case 'content':
        return <ContentWidget {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Draggable 
      draggableId={widget.id} 
      index={index}
      isDragDisabled={isEditing}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`draggable-widget ${isFromPalette ? 'palette-widget' : 'canvas-widget'} ${snapshot.isDragging ? 'dragging' : ''}`}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.4 : 1
          }}
        >
          {renderWidget()}
          {!isFromPalette && !isEditing && (
            <button 
              className="delete-btn" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(widget.id);
              }}
            >
              ×
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default DraggableWidget;