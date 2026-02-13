import { Shape } from '../types';

export interface Command {
  id: string;
  pageId: string;
  execute: () => void;
  undo: () => void;
  redo: () => void;
  getDescription: () => string;
  getAffectedShapeIds: () => string[];
}

export class CreateShapeCommand implements Command {
  id: string;
  pageId: string;
  private shape: Shape;
  private addShape: (pageId: string, shape: Shape) => void;
  private removeShape: (pageId: string, shapeId: string) => void;

  constructor(
    id: string,
    pageId: string,
    shape: Shape,
    addShape: (pageId: string, shape: Shape) => void,
    removeShape: (pageId: string, shapeId: string) => void
  ) {
    this.id = id;
    this.pageId = pageId;
    this.shape = shape;
    this.addShape = addShape;
    this.removeShape = removeShape;
  }

  execute() {
    this.addShape(this.pageId, this.shape);
  }

  undo() {
    this.removeShape(this.pageId, this.shape.id);
  }

  redo() {
    this.execute();
  }

  getDescription() {
    return `Create ${this.shape.type}`;
  }

  getAffectedShapeIds() {
    return [this.shape.id];
  }
}

export class DeleteShapesCommand implements Command {
  id: string;
  pageId: string;
  private shapeIds: string[];
  private getShapes: (pageId: string, shapeIds: string[]) => Shape[];
  private addShape: (pageId: string, shape: Shape) => void;
  private removeShapes: (pageId: string, shapeIds: string[]) => void;
  private deletedShapes: Shape[] = [];

  constructor(
    id: string,
    pageId: string,
    shapeIds: string[],
    getShapes: (pageId: string, shapeIds: string[]) => Shape[],
    addShape: (pageId: string, shape: Shape) => void,
    removeShapes: (pageId: string, shapeIds: string[]) => void
  ) {
    this.id = id;
    this.pageId = pageId;
    this.shapeIds = shapeIds;
    this.getShapes = getShapes;
    this.addShape = addShape;
    this.removeShapes = removeShapes;
    this.deletedShapes = getShapes(pageId, shapeIds);
  }

  execute() {
    this.removeShapes(this.pageId, this.shapeIds);
  }

  undo() {
    this.deletedShapes.forEach(shape => {
      this.addShape(this.pageId, shape);
    });
  }

  redo() {
    this.execute();
  }

  getDescription() {
    return `Delete ${this.shapeIds.length} shape(s)`;
  }

  getAffectedShapeIds() {
    return this.shapeIds;
  }
}

export class MoveShapesCommand implements Command {
  id: string;
  pageId: string;
  private shapeIds: string[];
  private deltaX: number;
  private deltaY: number;
  private moveShapes: (pageId: string, shapeIds: string[], dx: number, dy: number) => void;

  constructor(
    id: string,
    pageId: string,
    shapeIds: string[],
    deltaX: number,
    deltaY: number,
    moveShapes: (pageId: string, shapeIds: string[], dx: number, dy: number) => void
  ) {
    this.id = id;
    this.pageId = pageId;
    this.shapeIds = shapeIds;
    this.deltaX = deltaX;
    this.deltaY = deltaY;
    this.moveShapes = moveShapes;
  }

  execute() {
    this.moveShapes(this.pageId, this.shapeIds, this.deltaX, this.deltaY);
  }

  undo() {
    this.moveShapes(this.pageId, this.shapeIds, -this.deltaX, -this.deltaY);
  }

  redo() {
    this.execute();
  }

  getDescription() {
    return `Move ${this.shapeIds.length} shape(s)`;
  }

  getAffectedShapeIds() {
    return this.shapeIds;
  }
}

export class TransformShapeCommand implements Command {
  id: string;
  pageId: string;
  private shapeId: string;
  private oldProps: Record<string, unknown>;
  private newProps: Record<string, unknown>;
  private updateShapeProps: (pageId: string, shapeId: string, props: Record<string, unknown>) => void;

  constructor(
    id: string,
    pageId: string,
    shapeId: string,
    oldProps: Record<string, unknown>,
    newProps: Record<string, unknown>,
    updateShapeProps: (pageId: string, shapeId: string, props: Record<string, unknown>) => void
  ) {
    this.id = id;
    this.pageId = pageId;
    this.shapeId = shapeId;
    this.oldProps = oldProps;
    this.newProps = newProps;
    this.updateShapeProps = updateShapeProps;
  }

  execute() {
    this.updateShapeProps(this.pageId, this.shapeId, this.newProps);
  }

  undo() {
    this.updateShapeProps(this.pageId, this.shapeId, this.oldProps);
  }

  redo() {
    this.execute();
  }

  getDescription() {
    return 'Transform shape';
  }

  getAffectedShapeIds() {
    return [this.shapeId];
  }
}

export class UpdateShapePropertyCommand implements Command {
  id: string;
  pageId: string;
  private shapeId: string;
  private property: string;
  private oldValue: unknown;
  private newValue: unknown;
  private updateShapeProp: (pageId: string, shapeId: string, prop: string, value: unknown) => void;

  constructor(
    id: string,
    pageId: string,
    shapeId: string,
    property: string,
    oldValue: unknown,
    newValue: unknown,
    updateShapeProp: (pageId: string, shapeId: string, prop: string, value: unknown) => void
  ) {
    this.id = id;
    this.pageId = pageId;
    this.shapeId = shapeId;
    this.property = property;
    this.oldValue = oldValue;
    this.newValue = newValue;
    this.updateShapeProp = updateShapeProp;
  }

  execute() {
    this.updateShapeProp(this.pageId, this.shapeId, this.property, this.newValue);
  }

  undo() {
    this.updateShapeProp(this.pageId, this.shapeId, this.property, this.oldValue);
  }

  redo() {
    this.execute();
  }

  getDescription() {
    return `Update ${this.property}`;
  }

  getAffectedShapeIds() {
    return [this.shapeId];
  }
}
