import React from 'react';

interface FormInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

const FormInput: React.FC<FormInputProps> = ({
  label, type = 'text', value, onChange, placeholder, error, required = false, onFocus, onBlur
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-foreground">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
    />
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

export default FormInput;
