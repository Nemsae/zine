import { Shape } from './shape';

export interface Page {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  shapes: Shape[];
}

export interface Document {
  id: string;
  version: number;
  pages: Page[];
  activePageId: string;
  createdAt: string;
  updatedAt: string;
}

export const createDefaultDocument = (): Document => {
  const pageId = 'page-1';
  return {
    id: 'doc-1',
    version: 1,
    pages: [
      {
        id: pageId,
        name: 'Page 1',
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        shapes: [],
      },
    ],
    activePageId: pageId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
