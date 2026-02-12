import React from 'react';
import { WidgetProps } from '../../types';
import './widgets.css';

const ContentWidget: React.FC<WidgetProps> = ({ 
  id, 
  content, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel 
}) => {
  if (isEditing) {
    return (
      <div className="widget-content editing">
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
          rows={6}
        />
      </div>
    );
  }

  return (
    <div className="widget-content">
      <div className="content-text">{content}</div>
    </div>
  );
};

export default ContentWidget;