import React from 'react';
import { WidgetPalette, DropZone } from './layout';
import { ZineCanvasProps } from '../types';
import './ZineCanvas.css';

const ZineCanvas: React.FC<ZineCanvasProps> = ({
  widgets,
  editingWidget,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onThemeChange,
  currentTheme
}) => {
  return (
    <div className="zine-canvas">
      <header className="zine-header">
        <h1>🎨 Zine Builder</h1>
        <div className="header-controls">
          <button className="preview-btn">Preview</button>
          <button className="publish-btn">Publish</button>
        </div>
      </header>
      
      <main className="zine-main">
        <aside className="sidebar">
          <WidgetPalette 
          onThemeChange={onThemeChange}
          currentTheme={currentTheme}
        />
        </aside>
        
        <section className="canvas-area">
          <DropZone
            widgets={widgets}
            editingWidget={editingWidget}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
            onDelete={onDelete}
          />
        </section>
      </main>
      
      <footer className="zine-footer">
        <p>💡 Tip: Your work is automatically saved locally!</p>
      </footer>
    </div>
  );
};

export default ZineCanvas;