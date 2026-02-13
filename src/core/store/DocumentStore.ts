import { Document, Page, Shape, createDefaultDocument } from '../types';

export class DocumentStore {
  private document: Document;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.document = createDefaultDocument();
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('zine-document');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.version === 1) {
          this.document = parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load document from storage:', e);
    }
  }

  private saveToStorage() {
    try {
      this.document.updatedAt = new Date().toISOString();
      localStorage.setItem('zine-document', JSON.stringify(this.document));
    } catch (e) {
      console.error('Failed to save document to storage:', e);
    }
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getDocument(): Document {
    return this.document;
  }

  getActivePage(): Page {
    return this.document.pages.find(p => p.id === this.document.activePageId) || this.document.pages[0];
  }

  getActivePageId(): string {
    return this.document.activePageId;
  }

  setActivePage(pageId: string) {
    if (this.document.pages.some(p => p.id === pageId)) {
      this.document.activePageId = pageId;
      this.notify();
    }
  }

  getPage(pageId: string): Page | undefined {
    return this.document.pages.find(p => p.id === pageId);
  }

  getShapes(pageId: string): Shape[] {
    const page = this.getPage(pageId);
    return page?.shapes || [];
  }

  getActivePageShapes(): Shape[] {
    return this.getActivePage().shapes;
  }

  getShape(pageId: string, shapeId: string): Shape | undefined {
    const page = this.getPage(pageId);
    return page?.shapes.find(s => s.id === shapeId);
  }

  addShape(pageId: string, shape: Shape) {
    const page = this.getPage(pageId);
    if (page) {
      page.shapes.push(shape);
      this.notify();
    }
  }

  removeShape(pageId: string, shapeId: string) {
    const page = this.getPage(pageId);
    if (page) {
      page.shapes = page.shapes.filter(s => s.id !== shapeId);
      this.notify();
    }
  }

  removeShapes(pageId: string, shapeIds: string[]) {
    const page = this.getPage(pageId);
    if (page) {
      page.shapes = page.shapes.filter(s => !shapeIds.includes(s.id));
      this.notify();
    }
  }

  updateShape(pageId: string, shapeId: string, updates: Partial<Shape>) {
    const page = this.getPage(pageId);
    if (page) {
      const index = page.shapes.findIndex(s => s.id === shapeId);
      if (index !== -1) {
        const existing = page.shapes[index];
        const updated = { ...existing, ...updates } as Shape;
        page.shapes[index] = updated;
        this.notify();
      }
    }
  }

  moveShapes(pageId: string, shapeIds: string[], deltaX: number, deltaY: number) {
    const page = this.getPage(pageId);
    if (page) {
      const newShapes: Shape[] = [];
      for (const shape of page.shapes) {
        if (shapeIds.includes(shape.id)) {
          const updated = { ...shape } as Shape;
          updated.x = shape.x + deltaX;
          updated.y = shape.y + deltaY;
          newShapes.push(updated);
        } else {
          newShapes.push(shape);
        }
      }
      page.shapes = newShapes;
      this.notify();
    }
  }

  updatePage(pageId: string, updates: Partial<Page>) {
    const page = this.getPage(pageId);
    if (page) {
      Object.assign(page, updates);
      this.notify();
    }
  }

  addPage(page: Page) {
    this.document.pages.push(page);
    this.notify();
  }

  removePage(pageId: string) {
    if (this.document.pages.length > 1) {
      this.document.pages = this.document.pages.filter(p => p.id !== pageId);
      if (this.document.activePageId === pageId) {
        this.document.activePageId = this.document.pages[0].id;
      }
      this.notify();
    }
  }

  clear() {
    this.document = createDefaultDocument();
    this.notify();
  }
}
