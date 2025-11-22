import React, { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { useDebounce, useThrottle } from '../hooks/usePerformance';

const OptimizedSearch = memo(({
  onSearch,
  placeholder = "Search...",
  debounceMs = 300,
  suggestions = [],
  showSuggestions = false,
  className = '',
  minSearchLength = 2,
  maxSuggestions = 5,
  onSuggestionClick = () => {},
  ...props
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounce search query for performance
  const debouncedQuery = useDebounce(query, debounceMs);

  // Filter and limit suggestions
  const filteredSuggestions = useMemo(() => {
    if (!showSuggestions || !query || query.length < minSearchLength) {
      return [];
    }

    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, maxSuggestions);
  }, [suggestions, query, showSuggestions, minSearchLength, maxSuggestions]);

  // Throttled search function
  const throttledSearch = useThrottle(useCallback((searchQuery) => {
    if (searchQuery.length >= minSearchLength) {
      onSearch(searchQuery);
    }
  }, [onSearch, minSearchLength]), 100);

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      throttledSearch(debouncedQuery);
    }
  }, [debouncedQuery, throttledSearch]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
  }, []);

  // Handle input focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Handle input blur
  const handleBlur = useCallback(() => {
    // Delay blur to allow suggestion clicks
    setTimeout(() => {
      setIsFocused(false);
      setSelectedIndex(-1);
    }, 200);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selectedSuggestion = filteredSuggestions[selectedIndex];
          setQuery(selectedSuggestion);
          onSuggestionClick(selectedSuggestion);
          setIsFocused(false);
        } else if (query) {
          onSearch(query);
          setIsFocused(false);
        }
        break;
      case 'Escape':
        setIsFocused(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, filteredSuggestions, selectedIndex, query, onSuggestionClick, onSearch]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    setQuery(suggestion);
    onSuggestionClick(suggestion);
    setIsFocused(false);
    setSelectedIndex(-1);
  }, [onSuggestionClick]);

  // Handle form submit
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (query) {
      onSearch(query);
      setIsFocused(false);
    }
  }, [query, onSearch]);

  // Clear search
  const handleClear = useCallback(() => {
    setQuery('');
    setSelectedIndex(-1);
    inputRef.current?.focus();
    onSearch('');
  }, [onSearch]);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            {...props}
          />
          
          {/* Search/Clear Icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {query ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && isFocused && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === filteredSuggestions.length - 1 ? 'rounded-b-lg' : ''
              }`}
            >
              <span className="block truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

OptimizedSearch.displayName = 'OptimizedSearch';

export default OptimizedSearch;