import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { HeadingWidget, TextWidget, ContentWidget } from '../widgets';
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
  return (
    <div className="draggable-widget">
      <div className="content-widget" onClick={() => onEdit(widget.id)}>
        <div className="content-text">{widget.content}</div>
      </div>
    </div>
  );
};

export default DraggableWidget;