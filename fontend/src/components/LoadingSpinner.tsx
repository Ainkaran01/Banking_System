import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => (
  <Loader2 className={`${sizes[size]} animate-spin text-primary`} />
);

export default LoadingSpinner;
