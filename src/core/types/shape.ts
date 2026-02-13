export type ShapeType = 'rectangle' | 'circle' | 'text' | 'image' | 'line' | 'arrow' | 'freehand';

export interface BaseShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
}

export interface RectangleShape extends BaseShape {
  type: 'rectangle';
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
}

export interface CircleShape extends BaseShape {
  type: 'circle';
  radius: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface TextShape extends BaseShape {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  width: number;
  align: 'left' | 'center' | 'right';
}

export interface ImageShape extends BaseShape {
  type: 'image';
  src: string;
  width: number;
  height: number;
}

export interface LineShape extends BaseShape {
  type: 'line';
  points: number[];
  stroke: string;
  strokeWidth: number;
  lineCap: 'butt' | 'round' | 'square';
  lineJoin: 'miter' | 'round' | 'bevel';
}

export interface ArrowShape extends BaseShape {
  type: 'arrow';
  points: number[];
  stroke: string;
  strokeWidth: number;
  lineCap: 'butt' | 'round' | 'square';
  lineJoin: 'miter' | 'round' | 'bevel';
  pointerLength: number;
  pointerWidth: number;
}

export interface FreehandShape extends BaseShape {
  type: 'freehand';
  points: number[];
  stroke: string;
  strokeWidth: number;
  tension: number;
}

export type Shape = RectangleShape | CircleShape | TextShape | ImageShape | LineShape | ArrowShape | FreehandShape;

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const getShapeBounds = (shape: Shape): BoundingBox => {
  switch (shape.type) {
    case 'rectangle':
      return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
    case 'circle':
      return { x: shape.x - shape.radius, y: shape.y - shape.radius, width: shape.radius * 2, height: shape.radius * 2 };
    case 'text':
      return { x: shape.x, y: shape.y, width: shape.width || 100, height: shape.fontSize * 1.2 };
    case 'image':
      return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
    case 'line':
    case 'arrow': {
      const xs = shape.points.filter((_, i) => i % 2 === 0);
      const ys = shape.points.filter((_, i) => i % 2 === 1);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      return { x: shape.x + minX, y: shape.y + minY, width: maxX - minX, height: maxY - minY };
    }
    case 'freehand': {
      const xs = shape.points.filter((_, i) => i % 2 === 0);
      const ys = shape.points.filter((_, i) => i % 2 === 1);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      return { x: shape.x + minX, y: shape.y + minY, width: maxX - minX, height: maxY - minY };
    }
  }
};

export const DEFAULT_SHAPE_STYLES = {
  rectangle: {
    fill: '#4a90d9',
    stroke: '#2c5282',
    strokeWidth: 2,
    cornerRadius: 0,
  },
  circle: {
    fill: '#48bb78',
    stroke: '#276749',
    strokeWidth: 2,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Arial, sans-serif',
    fill: '#1a202c',
    align: 'left' as const,
    width: 200,
  },
  line: {
    stroke: '#1a202c',
    strokeWidth: 2,
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
  },
  arrow: {
    stroke: '#1a202c',
    strokeWidth: 2,
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
    pointerLength: 10,
    pointerWidth: 10,
  },
  freehand: {
    stroke: '#e53e3e',
    strokeWidth: 3,
    tension: 0.5,
  },
};
