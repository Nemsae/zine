import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { HeadingWidget, TextWidget, ContentWidget } from '../widgets';
import { DraggableWidgetProps } from '../../types';
import './DraggableWidget.css';

const DraggableWidget: React.FC<DraggableWidgetProps> = ({ 
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

    switch (type) {
      case 'heading':
        return <HeadingWidget {...commonProps} />;
      case 'text':
        return <TextWidget {...commonProps} />;
      case 'content':
        return <ContentWidget {...commonProps} />;
      default:
        return <div className="content-widget" onClick={() => onEdit(widget.id)}>
          <div className="content-text">{widget.content}</div>
        </div>;
    }
  };

  if (isFromPalette) {
    return (
      <Draggable 
        draggableId={widget.id} 
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`draggable-widget palette-widget ${snapshot.isDragging ? 'dragging' : ''}`}
            style={{
              ...provided.draggableProps.style,
            }}
          >
            {renderWidget()}
          </div>
        )}
      </Draggable>
    );
  }

  return (
    <Draggable 
      draggableId={widget.id} 
      index={index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`draggable-widget ${snapshot.isDragging ? 'dragging' : ''}`}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          {renderWidget()}
        </div>
      )}
    </Draggable>
  );
};

export default DraggableWidget;