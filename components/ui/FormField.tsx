"use client";

import React from 'react';
import { 
  Text, 
  TextField, 
  TextArea, 
  Checkbox, 
  Switch,
  Select
} from "@radix-ui/themes";
import { RegisterOptions, UseFormRegister, FieldError } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  type?: 'text' | 'password' | 'email' | 'number' | 'date' | 'textarea' | 'checkbox' | 'switch' | 'select';
  placeholder?: string;
  required?: boolean;
  error?: FieldError | undefined;
  options?: { value: string; label: string }[];
  icon?: React.ReactNode;
  autoComplete?: string;
  registerOptions?: RegisterOptions;
  className?: string;
}

/**
 * A reusable form field component that supports various input types
 * and integrates with React Hook Form.
 */
export function FormField({
  label,
  name,
  register,
  type = 'text',
  placeholder = '',
  required = false,
  error,
  options = [],
  icon,
  autoComplete,
  registerOptions = {},
  className = '',
}: FormFieldProps) {
  // Combine any passed registerOptions with the required flag
  const finalRegisterOptions = {
    ...registerOptions,
    required: required ? `${label} is required` : false,
  };
  
  // Register the field with React Hook Form
  const fieldProps = register(name, finalRegisterOptions);

  return (
    <div className={className}>
      <Text as="div" size="2" mb="1" weight="medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Text>
      
      {/* Render appropriate field based on type */}
      {type === 'textarea' ? (
        <TextArea 
          placeholder={placeholder} 
          {...fieldProps} 
        />
      ) : type === 'checkbox' ? (
        <Checkbox 
          {...fieldProps}
        />
      ) : type === 'switch' ? (
        <Switch 
          {...fieldProps} 
        />
      ) : type === 'select' ? (
        <Select.Root 
          defaultValue={options[0]?.value} 
          {...fieldProps}
        >
          <Select.Trigger />
          <Select.Content>
            {options.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      ) : (
        <TextField.Root 
          type={type} 
          placeholder={placeholder} 
          {...fieldProps} 
          autoComplete={autoComplete}
        >
          {icon && (
            <TextField.Slot>
              {icon}
            </TextField.Slot>
          )}
        </TextField.Root>
      )}
      
      {/* Error message */}
      {error && (
        <Text color="red" size="1">
          {error.message}
        </Text>
      )}
    </div>
  );
}
