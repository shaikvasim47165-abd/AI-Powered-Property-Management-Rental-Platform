import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext(null);

export const CompareProvider = ({ children }) => {
  const [comparedProperties, setComparedProperties] = useState(() => {
    try {
      const saved = localStorage.getItem('prop_ai_compared');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('prop_ai_compared', JSON.stringify(comparedProperties));
  }, [comparedProperties]);

  const addToCompare = (property) => {
    if (comparedProperties.some((p) => p._id === property._id)) {
      return { success: false, message: 'Property is already in your comparison list' };
    }
    if (comparedProperties.length >= 4) {
      return { success: false, message: 'You can compare up to 4 properties simultaneously' };
    }
    setComparedProperties((prev) => [...prev, property]);
    return { success: true };
  };

  const removeFromCompare = (propertyId) => {
    setComparedProperties((prev) => prev.filter((p) => p._id !== propertyId));
  };

  const toggleCompare = (property) => {
    if (comparedProperties.some((p) => p._id === property._id)) {
      removeFromCompare(property._id);
      return { added: false };
    } else {
      const res = addToCompare(property);
      return { added: res.success, message: res.message };
    }
  };

  const clearCompare = () => {
    setComparedProperties([]);
  };

  const isInCompare = (propertyId) => {
    return comparedProperties.some((p) => p._id === propertyId);
  };

  return (
    <CompareContext.Provider
      value={{
        comparedProperties,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        isInCompare,
        compareCount: comparedProperties.length,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
