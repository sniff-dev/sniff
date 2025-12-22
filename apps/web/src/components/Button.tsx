import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'colored';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: 'amber' | 'brown' | 'green';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  color,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-300 cursor-pointer';

  const variantClasses = {
    primary: 'bg-sniff-accent text-sniff-bg hover:bg-sniff-accent-hover',
    secondary:
      'border border-sniff-border bg-transparent text-sniff-text-primary hover:border-sniff-accent hover:text-sniff-accent',
    text: 'text-sniff-text-secondary hover:text-sniff-text-primary',
    colored:
      color === 'amber'
        ? 'bg-sniff-accent text-sniff-bg hover:bg-sniff-accent-hover'
        : color === 'brown'
          ? 'bg-sniff-accent-muted text-sniff-text-primary hover:bg-sniff-border'
          : 'bg-sniff-success text-sniff-bg hover:opacity-90',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-lg',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed hover:bg-current' : '';

  const combinedClasses =
    `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`.trim();

  return (
    <button className={combinedClasses} disabled={disabled} {...props}>
      {children}
    </button>
  );
};
