import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string, formData: Record<string, string>) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormData {
  [key: string]: string;
}

export interface FormErrors {
  [key: string]: string;
}

export function useForm(initialState: FormData, validationRules: ValidationRules = {}) {
  const [formData, setFormData] = useState<FormData>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((fieldName: string, value: string): string => {
    const rule = validationRules[fieldName];
    if (!rule) return '';

    // Required validation
    if (rule.required && (!value || value.trim() === '')) {
      return 'Ce champ est requis';
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') {
      return '';
    }

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      return `Minimum ${rule.minLength} caractères requis`;
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      return `Maximum ${rule.maxLength} caractères autorisés`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      if (fieldName === 'email') {
        return 'Format d\'email invalide';
      }
      if (fieldName === 'password') {
        return 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
      }
      return 'Format invalide';
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value, formData);
      if (customError) return customError;
    }

    return '';
  }, [formData, validationRules]);

  const handleChange = useCallback((fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const error = validateField(fieldName, formData[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, [formData, validateField]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName] || '');
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return isValid;
  }, [formData, validationRules, validateField]);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  const getFieldError = useCallback((fieldName: string): string => {
    return touched[fieldName] ? errors[fieldName] || '' : '';
  }, [errors, touched]);

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    getFieldError,
    isFieldValid: (fieldName: string) => !getFieldError(fieldName) && touched[fieldName],
    hasErrors: Object.values(errors).some(error => error !== ''),
  };
}