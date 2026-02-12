import React, { useState } from 'react';
import { WidgetPaletteProps } from '../../types';
import './CustomizationPanel.css';

const CustomizationPanel: React.FC<WidgetPaletteProps> = ({ onThemeChange, currentTheme }) => {
  const [activeTab, setActiveTab] = useState('background');

  const predefinedThemes = [
    {
      name: 'Default Purple',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      widgetShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    },
    {
      name: 'Ocean Blue',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      widgetShadow: '0 4px 12px rgba(0, 50, 100, 0.2)'
    },
    {
      name: 'Sunset Orange',
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      widgetShadow: '0 4px 12px rgba(255, 100, 0, 0.2)'
    },
    {
      name: 'Forest Green',
      background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      widgetShadow: '0 4px 12px rgba(0, 100, 0, 0.2)'
    },
    {
      name: 'Neon Pink',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      widgetShadow: '0 4px 12px rgba(255, 0, 100, 0.2)'
    },
    {
      name: 'Dark Mode',
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      widgetShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
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

  const handleThemeSelect = (theme) => {
    onThemeChange({ ...currentTheme, ...theme });
  };

  const handleFontChange = (fontFamily) => {
    onThemeChange({ ...currentTheme, fontFamily });
  };

  const handleCustomBackground = (color) => {
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
                  style={{ background: theme.background }}
                  onClick={() => handleThemeSelect(theme)}
                >
                  <span className="theme-name">{theme.name}</span>
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