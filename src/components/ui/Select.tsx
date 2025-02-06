import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: Option[];
  error?: string;
  icon?: LucideIcon;
  onChange?: (value: string) => void;
}

export function Select({
  label,
  options,
  error,
  icon: Icon,
  onChange,
  className = '',
  id,
  name,
  ...props
}: SelectProps) {
  // Generate a unique ID if none provided
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
        <select
          id={selectId}
          name={name}
          className={`
            block w-full rounded-md shadow-sm
            ${Icon ? 'pl-10' : 'pl-3'} pr-10 py-2
            ${error
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
            }
            ${className}
          `}
          onChange={(e) => onChange?.(e.target.value)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p 
          className="mt-1 text-sm text-red-600"
          id={`${selectId}-error`}
        >
          {error}
        </p>
      )}
    </div>
  );
}