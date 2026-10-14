import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CustomDatePicker({
  value,
  onChange,
  id,
  name,
  placeholder = 'Select date...',
  disabled = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, bottom: 'auto', left: 0, openUp: false });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const parseDate = (val) => {
    if (!val) return null;
    const parts = val.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day);
      }
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const selectedDate = parseDate(value);

  const initialViewDate = selectedDate || new Date();
  const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());

  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 290;
    const popoverHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < popoverHeight && rect.top > popoverHeight;

    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 10) {
      left = Math.max(10, window.innerWidth - popoverWidth - 10);
    }

    setCoords({
      top: openUp ? 'auto' : rect.bottom + 4,
      bottom: openUp ? window.innerHeight - rect.top + 4 : 'auto',
      left,
      openUp
    });
  }, []);

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
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
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
      if (popoverRef.current && popoverRef.current.contains(e.target)) return;
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

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const formatOutputDate = (year, month, day) => {
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleDateClick = (year, month, day) => {
    if (disabled) return;
    const dateStr = formatOutputDate(year, month, day);
    onChange({ target: { name, value: dateStr } });
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: '' } });
  };

  const handleSelectToday = () => {
    const today = new Date();
    handleDateClick(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const formatDisplay = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCalendarDays = () => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      days.push({ day: d, month: m, year: y, isOtherMonth: true });
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({ day: i, month: viewMonth, year: viewYear, isOtherMonth: false });
    }

    // Next month leading days (fill up to 35 or 42 grid cells)
    const totalCells = days.length > 35 ? 42 : 35;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      days.push({ day: i, month: m, year: y, isOtherMonth: true });
    }

    return days;
  };

  const today = new Date();
  const isToday = (y, m, d) =>
    today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;

  const isSelected = (y, m, d) =>
    selectedDate &&
    selectedDate.getFullYear() === y &&
    selectedDate.getMonth() === m &&
    selectedDate.getDate() === d;

  return (
    <div className={`custom-datepicker-container ${className}`}>
      <div
        ref={triggerRef}
        id={id}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Choose date"
        className={`custom-datepicker-trigger ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={toggleOpen}
      >
        <span className="custom-datepicker-trigger-content">
          <CalendarIcon size={16} className="custom-datepicker-icon" />
          <span className={selectedDate ? 'custom-datepicker-value' : 'custom-datepicker-placeholder'}>
            {selectedDate ? formatDisplay(selectedDate) : placeholder}
          </span>
        </span>

        <span className="custom-datepicker-actions">
          {selectedDate && !disabled && (
            <button
              type="button"
              className="custom-datepicker-clear"
              onClick={handleClear}
              title="Clear date"
              aria-label="Clear date"
            >
              <X size={14} />
            </button>
          )}
        </span>
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            className={`custom-datepicker-popover ${coords.openUp ? 'open-upward' : ''}`}
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              top: coords.top !== 'auto' ? `${coords.top}px` : 'auto',
              bottom: coords.bottom !== 'auto' ? `${coords.bottom}px` : 'auto',
              left: `${coords.left}px`,
              zIndex: 9999,
            }}
          >
            <div className="custom-datepicker-header">
              <span className="custom-datepicker-month-year">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <div className="custom-datepicker-nav">
                <button
                  type="button"
                  className="custom-datepicker-nav-btn"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  className="custom-datepicker-nav-btn"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="custom-datepicker-weekdays">
              {DAYS_OF_WEEK.map((d) => (
                <span key={d} className="custom-datepicker-weekday">
                  {d}
                </span>
              ))}
            </div>

            <div className="custom-datepicker-grid">
              {getCalendarDays().map((cell, idx) => {
                const selected = isSelected(cell.year, cell.month, cell.day);
                const currentToday = isToday(cell.year, cell.month, cell.day);
                return (
                  <button
                    key={`${cell.year}-${cell.month}-${cell.day}-${idx}`}
                    type="button"
                    className={`custom-datepicker-day ${
                      cell.isOtherMonth ? 'other-month' : ''
                    } ${currentToday ? 'today' : ''} ${selected ? 'selected' : ''}`}
                    onClick={() => handleDateClick(cell.year, cell.month, cell.day)}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            <div className="custom-datepicker-footer">
              <button
                type="button"
                className="custom-datepicker-footer-btn"
                onClick={handleClear}
              >
                Clear
              </button>
              <button
                type="button"
                className="custom-datepicker-footer-btn primary"
                onClick={handleSelectToday}
              >
                Today
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
