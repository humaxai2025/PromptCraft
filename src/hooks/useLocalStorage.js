import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

export const usePromptHistory = () => {
  const [history, setHistory] = useLocalStorage('promptAnalyzer_history', []);

  const addToHistory = (promptText, analysisData) => {
    if (!promptText.trim() || !analysisData) return;

    const historyItem = {
      id: Date.now() + Math.random(),
      prompt: promptText,
      analysis: analysisData,
      timestamp: new Date().toISOString(),
      preview: promptText.slice(0, 100) + (promptText.length > 100 ? '...' : '')
    };

    setHistory(prevHistory => [historyItem, ...prevHistory].slice(0, 100));
  };

  const removeFromHistory = (itemId) => {
    setHistory(prevHistory => prevHistory.filter(item => item.id !== itemId));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return { history, addToHistory, removeFromHistory, clearHistory };
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage('promptAnalyzer_favorites', []);

  const addToFavorites = (item, type = 'prompt') => {
    const favoriteItem = {
      id: Date.now() + Math.random(),
      type: type,
      title: type === 'prompt' 
        ? (item.prompt ? item.prompt.slice(0, 50) + '...' : 'Untitled Prompt')
        : item.name,
      content: type === 'prompt' ? item.prompt : item.template,
      analysis: type === 'prompt' ? item.analysis : null,
      category: type === 'template' ? item.category : 'Custom',
      description: type === 'template' ? item.description : '',
      icon: type === 'template' ? item.icon : null,
      timestamp: new Date().toISOString(),
      tags: []
    };

    setFavorites(prevFavorites => [favoriteItem, ...prevFavorites]);
    return favoriteItem.id;
  };

  const removeFromFavorites = (itemId) => {
    setFavorites(prevFavorites => prevFavorites.filter(item => item.id !== itemId));
  };

  const isFavorited = (content) => {
    return favorites.some(fav => fav.content === content);
  };

  const toggleFavorite = (item, type = 'prompt') => {
    const content = type === 'prompt' ? item.prompt : item.template;
    
    if (isFavorited(content)) {
      const existingFav = favorites.find(fav => fav.content === content);
      if (existingFav) {
        removeFromFavorites(existingFav.id);
        return false; // removed
      }
    } else {
      addToFavorites(item, type);
      return true; // added
    }
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return { 
    favorites, 
    addToFavorites, 
    removeFromFavorites, 
    isFavorited, 
    toggleFavorite, 
    clearFavorites 
  };
};

export const useCompletedLessons = () => {
  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem('promptAnalyzer_completedLessons');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const markLessonComplete = (lessonId) => {
    setCompletedLessons(prev => {
      const updated = new Set(prev);
      updated.add(lessonId);
      localStorage.setItem('promptAnalyzer_completedLessons', JSON.stringify(Array.from(updated)));
      return updated;
    });
  };

  return { completedLessons, markLessonComplete };
};