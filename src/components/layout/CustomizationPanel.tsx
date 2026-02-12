import React, { useState } from 'react';
import { WidgetPaletteProps } from '../../types';
import './CustomizationPanel.css';

const CustomizationPanel: React.FC<WidgetPaletteProps> = ({ onThemeChange, currentTheme }) => {
  const [activeTab, setActiveTab] = useState('background');

  const predefinedThemes = [
    {
      name: 'Indie Magazine',
      background: '#f8f8f8',
      fontFamily: 'Georgia, serif',
      widgetShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      description: 'Clean editorial aesthetic'
    },
    {
      name: 'Hyperpop',
      background: 'linear-gradient(45deg, #ff006e, #8338ec, #3a86ff)',
      fontFamily: 'Arial Black, sans-serif',
      widgetShadow: '0 8px 32px rgba(255, 0, 110, 0.4)',
      description: 'Vibrant digital chaos'
    },
    {
      name: 'Grunge Metal',
      background: 'radial-gradient(circle at center, #2a2a2a 0%, #000000 100%)',
      fontFamily: 'Courier New, monospace',
      widgetShadow: '0 0 20px rgba(255, 0, 0, 0.3)',
      description: 'Dark and distorted'
    },
    {
      name: 'Coding Aesthetic',
      background: '#0d1117',
      fontFamily: 'Fira Code, Monaco, monospace',
      widgetShadow: '0 0 10px rgba(56, 178, 172, 0.3)',
      description: 'Terminal-inspired dark mode'
    },
    {
      name: 'Ocean Blue',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      fontFamily: 'Arial, sans-serif',
      widgetShadow: '0 4px 12px rgba(0, 50, 100, 0.2)',
      description: 'Cool and refreshing'
    },
    {
      name: 'Sunset Orange',
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      fontFamily: 'Verdana, sans-serif',
      widgetShadow: '0 4px 12px rgba(255, 100, 0, 0.2)',
      description: 'Warm and energetic'
    }
  ];

  const fonts = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Courier New', value: 'Courier New, monospace' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' }
  ];

  const handleThemeSelect = (theme: any) => {
    onThemeChange({ ...currentTheme, ...theme });
  };

  const handleFontChange = (fontFamily: string) => {
    onThemeChange({ ...currentTheme, fontFamily });
  };

  const handleCustomBackground = (color: string) => {
    onThemeChange({ 
      ...currentTheme, 
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` 
    });
  };

  return (
    <div className="customization-panel">
      <h3>Customize Your Zine</h3>
      
      <div className="panel-tabs">
        <button
          className={`tab ${activeTab === 'background' ? 'active' : ''}`}
          onClick={() => setActiveTab('background')}
        >
          Background
        </button>
        <button
          className={`tab ${activeTab === 'fonts' ? 'active' : ''}`}
          onClick={() => setActiveTab('fonts')}
        >
          Fonts
        </button>
        <button
          className={`tab ${activeTab === 'widgets' ? 'active' : ''}`}
          onClick={() => setActiveTab('widgets')}
        >
          Widgets
        </button>
      </div>

      <div className="panel-content">
        {activeTab === 'background' && (
          <div className="background-section">
            <h4>Predefined Themes</h4>
            <div className="theme-grid">
              {predefinedThemes.map((theme, index) => (
                <button
                  key={index}
                  className="theme-option"
                  style={{ 
                    background: theme.background,
                    fontFamily: theme.fontFamily || currentTheme.fontFamily
                  }}
                  onClick={() => handleThemeSelect(theme)}
                >
                  <span className="theme-name">{theme.name}</span>
                  {theme.description && (
                    <span className="theme-description">{theme.description}</span>
                  )}
                </button>
              ))}
            </div>
            
            <h4>Custom Color</h4>
            <div className="custom-color-section">
              <input
                type="color"
                onChange={(e) => handleCustomBackground(e.target.value)}
                className="color-picker"
              />
              <button 
                onClick={() => handleCustomBackground('#ff0000')}
                className="color-preset red"
              />
              <button 
                onClick={() => handleCustomBackground('#00ff00')}
                className="color-preset green"
              />
              <button 
                onClick={() => handleCustomBackground('#0000ff')}
                className="color-preset blue"
              />
              <button 
                onClick={() => handleCustomBackground('#000000')}
                className="color-preset black"
              />
            </div>
          </div>
        )}

        {activeTab === 'fonts' && (
          <div className="fonts-section">
            <h4>Font Family</h4>
            <div className="font-options">
              {fonts.map((font) => (
                <button
                  key={font.value}
                  className="font-option"
                  style={{ fontFamily: font.value }}
                  onClick={() => handleFontChange(font.value)}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'widgets' && (
          <div className="widgets-section">
            <h4>Widget Styles</h4>
            <div className="widget-options">
              <label className="widget-option">
                <input type="checkbox" defaultChecked />
                <span>Show shadows</span>
              </label>
              <label className="widget-option">
                <input type="checkbox" defaultChecked />
                <span>Rounded corners</span>
              </label>
              <label className="widget-option">
                <input type="checkbox" defaultChecked />
                <span>Animated hover effects</span>
              </label>
            </div>
            
            <h4>Widget Border Style</h4>
            <select className="border-style-select">
              <option value="none">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizationPanel;