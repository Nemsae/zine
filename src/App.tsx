import React, { useState, useMemo, useCallback } from 'react';
import { DocumentStore } from './core/store/DocumentStore';
import { SessionStore } from './core/store/SessionStore';
import { CommandManager } from './core/commands/CommandManager';
import { ZineCanvas } from './components/canvas';
import { Toolbar, PropertiesPanel } from './components/ui';
import { ToolType } from './core/types';

const documentStore = new DocumentStore();
const sessionStore = new SessionStore();

function App(): React.JSX.Element {
  const [currentTool, setCurrentTool] = useState<ToolType>('select');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const commandManager = useMemo(() => {
    return new CommandManager(() => {
      setCanUndo(commandManager.canUndo());
      setCanRedo(commandManager.canRedo());
    });
  }, []);

  const handleToolChange = useCallback((tool: ToolType) => {
    sessionStore.setCurrentTool(tool);
    setCurrentTool(tool);
  }, []);

  const handleUndo = useCallback(() => {
    commandManager.undo();
    setCanUndo(commandManager.canUndo());
    setCanRedo(commandManager.canRedo());
  }, [commandManager]);

  const handleRedo = useCallback(() => {
    commandManager.redo();
    setCanUndo(commandManager.canUndo());
    setCanRedo(commandManager.canRedo());
  }, [commandManager]);

  React.useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      setSelectedIds(sessionStore.getSelectedIds());
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif',
    }}>
      <Toolbar
        sessionStore={sessionStore}
        currentTool={currentTool}
        onToolChange={handleToolChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        <ZineCanvas
          documentStore={documentStore}
          sessionStore={sessionStore}
          commandManager={commandManager}
        />
        
        <PropertiesPanel
          documentStore={documentStore}
          selectedIds={selectedIds}
        />
      </div>
    </div>
  );
}

export default App;
