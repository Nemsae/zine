import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { HeadingWidget, TextWidget, ContentWidget } from '../widgets';
import DraggableWidget from './DraggableWidget';
import CustomizationPanel from './CustomizationPanel';
import { WidgetPaletteProps } from '../../types';
import './WidgetPalette.css';

const WidgetPalette: React.FC<WidgetPaletteProps> = ({ onThemeChange, currentTheme }) => {
  const paletteWidgets = [
    {
      id: 'palette-heading',
      type: 'heading',
      content: 'Sample Heading'
    },
    {
      id: 'palette-text',
      type: 'text',
      content: 'Sample text blurb for your zine page.'
    },
    {
      id: 'palette-content',
      type: 'content',
      content: 'Sample longer content for your article or blog post. This can include multiple paragraphs and detailed information.'
    }
  ];

  return (
    <div className="widget-palette">
      <h3>Widget Palette</h3>
      <p className="palette-description">
        Drag these widgets onto your canvas to build your zine page
      </p>
      
      <Droppable droppableId="palette" isDropDisabled={true}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="palette-widgets"
          >
            {paletteWidgets.map((widget, index) => (
              <DraggableWidget
                key={widget.id}
                widget={widget}
                type={widget.type}
                isFromPalette={true}
                isEditing={false}
                onEdit={() => {}}
                onSave={() => {}}
                onCancel={() => {}}
                onDelete={() => {}}
                index={index}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      
      <div className="palette-tips">
        <h4>Tips:</h4>
        <ul>
          <li>Click on any widget to edit its content</li>
          <li>Drag widgets to rearrange them</li>
          <li>Click the × button to delete widgets</li>
          <li>Your work is automatically saved</li>
        </ul>
      </div>
      
      <CustomizationPanel 
        onThemeChange={onThemeChange}
        currentTheme={currentTheme}
      />
    </div>
  );
};

export default WidgetPalette;