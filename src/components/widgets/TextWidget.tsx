import React from 'react';
import { WidgetProps } from '../../types';
import './widgets.css';

const TextWidget: React.FC<WidgetProps> = ({ 
  id, 
  content, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel 
}) => {
  if (isEditing) {
    return (
      <div className="widget-text editing">
        <textarea
          defaultValue={content}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onCancel();
            }
          }}
          onBlur={(e) => onSave(id, e.currentTarget.value)}
          className="widget-textarea"
          rows={3}
        />
      </div>
    );
  }

  return (
    <div className="widget-text">
      <p>{content}</p>
    </div>
  );
};

export default TextWidget;