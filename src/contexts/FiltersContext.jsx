// FiltersContext.jsx
import React, { createContext, useContext, useState } from "react";

const FiltersContext = createContext();

export const FiltersProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: null,
    colors: [],
    productLabels: [],
    features: [],
    status: []
  });

  const [currentPage, setCurrentPage] = useState(1);

  const handleFilterChange = (filterType, value, checked = null) => {
    setCurrentPage(1);

    if (filterType === "category") {
      if (checked) {
        setFilters(prev => ({
          ...prev,
          categories: [...prev.categories, value]
        }));
      } else {
        setFilters(prev => ({
          ...prev,
          categories: prev.categories.filter(cat => cat !== value)
        }));
      }
      return;
    }

    if (filterType === "priceRange") {
      setFilters(prev => ({
        ...prev,
        priceRange: value
      }));
    } else if (filterType === "color") {
      if (checked) {
        setFilters(prev => ({
          ...prev,
          colors: [...prev.colors, value]
        }));
      } else {
        setFilters(prev => ({
          ...prev,
          colors: prev.colors.filter(color => color !== value)
        }));
      }
    } else if (filterType === "productLabel") {
      if (checked) {
        setFilters(prev => ({
          ...prev,
          productLabels: [...prev.productLabels, value]
        }));
      } else {
        setFilters(prev => ({
          ...prev,
          productLabels: prev.productLabels.filter(id => id !== value)
        }));
      }
    } else if (filterType === "feature") {
      if (checked) {
        setFilters(prev => ({
          ...prev,
          features: [...prev.features, value]
        }));
      } else {
        setFilters(prev => ({
          ...prev,
          features: prev.features.filter(feat => feat !== value)
        }));
      }
    } else if (filterType === "status") {
      if (checked) {
        setFilters(prev => ({
          ...prev,
          status: [...prev.status, value]
        }));
      } else {
        setFilters(prev => ({
          ...prev,
          status: prev.status.filter(status => status !== value)
        }));
      }
    }
  };

  return (
    <FiltersContext.Provider
      value={{
        filters,
        setFilters,
        currentPage,
        setCurrentPage,
        handleFilterChange
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => useContext(FiltersContext);
