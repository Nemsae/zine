import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import ZineCanvas from './components/ZineCanvas';
import { useZineState } from './hooks/useZineState';
import './App.css';

function App() {
  const {
    widgets,
    editingWidget,
    isLoading,
    error,
    addWidget,
    updateWidget,
    deleteWidget,
    startEditing,
    stopEditing,
    saveWidgetContent,
    reorderWidgets
  } = useZineState();

  const [currentTheme, setCurrentTheme] = React.useState({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Arial, sans-serif',
    widgetShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  });

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    
    // If dropped outside a droppable area, do nothing
    if (!destination) {
      return;
    }
    
    // Handle drop from palette to canvas
    if (source.droppableId === 'palette' && destination.droppableId === 'canvas') {
      const paletteWidgets = [
        { id: 'palette-heading', type: 'heading', content: 'Sample Heading' },
        { id: 'palette-text', type: 'text', content: 'Sample text blurb for your zine page.' },
        { id: 'palette-content', type: 'content', content: 'Sample longer content for your article or blog post. This can include multiple paragraphs and detailed information.' }
      ];
      
      const paletteWidget = paletteWidgets.find(w => w.id === draggableId);
      if (paletteWidget) {
        addWidget({
          ...paletteWidget,
          id: `${paletteWidget.type}-${Date.now()}`,
          position: { x: destination.index * 50, y: destination.index * 30 }
        });
      }
      return;
    }
    
// Handle reordering within canvas
    if (source.droppableId === 'canvas' && destination.droppableId === 'canvas') {
      reorderWidgets(source.index, destination.index);
      return;
    }
  };

  const handleEdit = (id) => {
    startEditing(id);
  };

  const handleSave = (id, content) => {
    saveWidgetContent(id, content);
  };

  const handleCancel = () => {
    stopEditing();
  };

  const handleDelete = (id) => {
    deleteWidget(id);
  };

  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading your zine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: currentTheme.background, fontFamily: currentTheme.fontFamily, minHeight: '100vh', minWidth: '100vw' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <ZineCanvas
          widgets={widgets}
          editingWidget={editingWidget}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDelete}
          onThemeChange={handleThemeChange}
          currentTheme={currentTheme}
        />
      </DragDropContext>
    </div>
  );
}

export default App;
