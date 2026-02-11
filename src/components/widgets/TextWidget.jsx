import React, { useState } from 'react';
import './TextWidget.css';

const TextWidget = ({ id, content, isEditing, onEdit, onSave, onCancel }) => {
  const [tempContent, setTempContent] = useState(content || 'Your text content goes here. Click to edit this blurb.');

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
      <div className="text-widget editing">
        <textarea
          value={tempContent}
          onChange={(e) => setTempContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-input"
          autoFocus
          rows={4}
        />
        <div className="edit-controls">
          <button onClick={handleSave} className="save-btn">Save</button>
          <button onClick={onCancel} className="cancel-btn">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-widget" onClick={() => onEdit(id)}>
      <p>{content || 'Your text content goes here. Click to edit this blurb.'}</p>
    </div>
  );
};

export default TextWidget;