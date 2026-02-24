import React, { useRef, useEffect } from 'react';
import { useAutocomplete } from '../../hooks/useAutocomplete';
import { SearchResult } from '../../types';

interface AutocompleteSearchProps {
  onSelect: (item: SearchResult) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function AutocompleteSearch({ onSelect, disabled, placeholder }: AutocompleteSearchProps) {
  const { query, results, isOpen, loading, search, setIsOpen, clear } = useAutocomplete();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  function handleSelect(item: SearchResult) {
    onSelect(item);
    clear();
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => search(e.target.value)}
        disabled={disabled}
        placeholder={placeholder || 'Type to search...'}
        className="mc-input"
        aria-label="Search for an item, block, or mob"
      />
      {loading && (
        <div className="absolute right-3 top-3 text-mc-gold text-xs">...</div>
      )}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-mc-dark border-2 border-mc-stone max-h-60 overflow-y-auto">
          {results.map((item) => (
            <li
              key={item.id}
              onClick={() => handleSelect(item)}
              className="px-4 py-2 cursor-pointer hover:bg-mc-stone flex items-center gap-3 text-sm"
            >
              <span className="text-mc-gold text-xs">[{item.type}]</span>
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
