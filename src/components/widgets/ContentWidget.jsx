import React, { useState } from 'react';
import './ContentWidget.css';

const ContentWidget = ({ id, content, isEditing, onEdit, onSave, onCancel }) => {
  const [tempContent, setTempContent] = useState(content || 'This is a content area for longer articles, blog posts, or detailed information. Click to edit this content and add your own text here.');

  const handleSave = () => {
    onSave(id, tempContent);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="content-widget editing">
        <textarea
          value={tempContent}
          onChange={(e) => setTempContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="content-input"
          autoFocus
          rows={10}
        />
        <div className="edit-controls">
          <button onClick={handleSave} className="save-btn">Save</button>
          <button onClick={onCancel} className="cancel-btn">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-widget" onClick={() => onEdit(id)}>
      <div className="content-text">
        {content || 'This is a content area for longer articles, blog posts, or detailed information. Click to edit this content and add your own text here.'}
      </div>
    </div>
  );
};

export default ContentWidget;