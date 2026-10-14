import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  id,
  name,
  className = '',
  size = 'md',
  disabled = false,
  ariaLabel
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, bottom: 'auto', left: 0, width: 0, openUp: false });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedHeight = 220;

    const openUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    setCoords({
      top: openUp ? 'auto' : rect.bottom + 4,
      bottom: openUp ? window.innerHeight - rect.top + 4 : 'auto',
      left: rect.left,
      width: Math.max(rect.width, size === 'sm' ? 140 : 160),
      openUp
    });
  }, [size]);

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleClickOutside = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = (e) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      updatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  const handleSelect = (optionValue) => {
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  const isSmall = size === 'sm';

  return (
    <div className={`custom-select-container ${isSmall ? 'custom-select-sm' : ''} ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        name={name}
        className={`custom-select-trigger ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={toggleOpen}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
      >
        <span className="custom-select-value">
          {selectedOption ? (
            <span className="custom-select-item-content">
              {selectedOption.dotColor && (
                <span
                  className="custom-select-dot"
                  style={{ backgroundColor: selectedOption.dotColor }}
                />
              )}
              {selectedOption.icon && (
                <span className="custom-select-item-icon">{selectedOption.icon}</span>
              )}
              <span className="custom-select-label">{selectedOption.label}</span>
            </span>
          ) : (
            <span className="custom-select-placeholder">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          size={isSmall ? 14 : 16}
          className={`custom-select-chevron ${isOpen ? 'rotate' : ''}`}
        />
      </button>

      {isOpen &&
        createPortal(
          <ul
            ref={dropdownRef}
            className={`custom-select-dropdown ${coords.openUp ? 'open-upward' : ''}`}
            role="listbox"
            tabIndex={-1}
            style={{
              position: 'fixed',
              top: coords.top !== 'auto' ? `${coords.top}px` : 'auto',
              bottom: coords.bottom !== 'auto' ? `${coords.bottom}px` : 'auto',
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 9999,
            }}
          >
            {normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <li
                  key={String(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                  className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <span className="custom-select-item-content">
                    {opt.dotColor && (
                      <span
                        className="custom-select-dot"
                        style={{ backgroundColor: opt.dotColor }}
                      />
                    )}
                    {opt.icon && (
                      <span className="custom-select-item-icon">{opt.icon}</span>
                    )}
                    <span className="custom-select-label">{opt.label}</span>
                  </span>
                  {isSelected && <Check size={15} className="custom-select-check" />}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </div>
  );
}
