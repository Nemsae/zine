import React from 'react';
import { WidgetProps } from '../../types';
import './widgets.css';

const HeadingWidget: React.FC<WidgetProps> = ({ 
  id, 
  content, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel 
}) => {
  if (isEditing) {
    return (
      <div className="widget-heading editing">
        <input
          type="text"
          defaultValue={content}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSave(id, e.currentTarget.value);
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
          onBlur={(e) => onSave(id, e.currentTarget.value)}
          className="widget-input"
        />
      </div>
    );
  }

  return (
    <div className="widget-heading">
      <h2>{content}</h2>
    </div>
  );
};

export default HeadingWidget;