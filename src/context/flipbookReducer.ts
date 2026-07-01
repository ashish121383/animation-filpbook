import { useReducer } from 'react';
import type { FlipbookState, FlipbookAction } from '@/types';

const initialState: FlipbookState = {
  currentPage: 0,
  totalPages: 0,
  isLoading: false,
  loadingProgress: 0,
  error: null,
  documentInfo: null,
  pageAnalyses: new Map(),
  settings: {
    zoom: 1,
    isFullscreen: false,
    readingMode: false,
    showThumbnails: false,
    animationsEnabled: true,
    coverType: 'hard',
    magazineStyle: true,
    lazyLoadRange: 3,
  },
  searchQuery: '',
  searchResults: [],
  activeSearchIndex: -1,
  bookmarks: [],
  notes: [],
  activeReadingElementId: null,
};

function flipbookReducer(state: FlipbookState, action: FlipbookAction): FlipbookState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_PROGRESS':
      return { ...state, loadingProgress: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_DOCUMENT_INFO':
      return { ...state, documentInfo: action.payload };
    case 'SET_TOTAL_PAGES':
      return { ...state, totalPages: action.payload };
    case 'SET_PAGE_ANALYSIS': {
      const pageAnalyses = new Map(state.pageAnalyses);
      pageAnalyses.set(action.payload.pageNumber, action.payload.analysis);
      return { ...state, pageAnalyses };
    }
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload, activeSearchIndex: action.payload.length > 0 ? 0 : -1 };
    case 'SET_ACTIVE_SEARCH_INDEX':
      return { ...state, activeSearchIndex: action.payload };
    case 'ADD_BOOKMARK':
      return { ...state, bookmarks: [...state.bookmarks, action.payload] };
    case 'REMOVE_BOOKMARK':
      return { ...state, bookmarks: state.bookmarks.filter((b) => b.id !== action.payload) };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] };
    case 'REMOVE_NOTE':
      return { ...state, notes: state.notes.filter((n) => n.id !== action.payload) };
    case 'SET_ACTIVE_READING_ELEMENT':
      return { ...state, activeReadingElementId: action.payload };
    default:
      return state;
  }
}

export function useFlipbookReducer() {
  return useReducer(flipbookReducer, initialState);
}
