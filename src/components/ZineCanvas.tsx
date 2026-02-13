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
  const [footerVisible, setFooterVisible] = React.useState(() => {
    const stored = localStorage.getItem('footerVisible');
    return stored !== 'false'; // Default to true unless explicitly hidden
  });

  const handleFooterClose = () => {
    setFooterVisible(false);
    localStorage.setItem('footerVisible', 'false');
  };

  return (
    <div className="zine-canvas" style={{ fontFamily: currentTheme.fontFamily }}>
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
            onDrop={() => {}}
          />
        </section>
      </main>
      
      {footerVisible && (
        <footer className="zine-footer">
          <p>💡 Tip: Your work is automatically saved locally!</p>
          <button className="footer-close" onClick={handleFooterClose}>×</button>
        </footer>
      )}
    </div>
  );
};

export default ZineCanvas;