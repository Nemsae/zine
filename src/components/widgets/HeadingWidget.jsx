import React, { useState } from 'react';
import './HeadingWidget.css';

const HeadingWidget = ({ id, content, isEditing, onEdit, onSave, onCancel }) => {
  const [tempContent, setTempContent] = useState(content || 'Your Heading Here');

  const handleSave = () => {
    onSave(id, tempContent);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="heading-widget editing">
        <input
          type="text"
          value={tempContent}
          onChange={(e) => setTempContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="heading-input"
          autoFocus
        />
        <div className="edit-controls">
          <button onClick={handleSave} className="save-btn">Save</button>
          <button onClick={onCancel} className="cancel-btn">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="heading-widget" onClick={() => onEdit(id)}>
      <h2>{content || 'Your Heading Here'}</h2>
    </div>
  );
};

export default HeadingWidget;