import React from 'react';
import styled, { css } from 'styled-components';
import { borderRadius, colors, spacing, transitions, typography } from '../../styles/design-system';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'medium', fullWidth = false, isLoading = false, children, ...props }, ref) => {
    return (
      <StyledButton
        ref={ref}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        isLoading={isLoading}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? 'Načítání...' : children}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${typography.fontFamily};
  font-weight: 500;
  border-radius: ${borderRadius.medium};
  transition: all ${transitions.fast};
  cursor: pointer;
  border: none;
  outline: none;

  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return css`
          background-color: ${colors.primary.main};
          color: ${colors.primary.contrast};
          
          &:hover {
            background-color: ${colors.primary.dark};
          }
          
          &:active {
            background-color: ${colors.primary.dark};
          }
          
          &:disabled {
            background-color: ${colors.text.disabled};
            cursor: not-allowed;
          }
        `;
      case 'secondary':
        return css`
          background-color: ${colors.secondary.main};
          color: ${colors.secondary.contrast};
          
          &:hover {
            background-color: ${colors.secondary.dark};
          }
          
          &:active {
            background-color: ${colors.secondary.dark};
          }
          
          &:disabled {
            background-color: ${colors.text.disabled};
            cursor: not-allowed;
          }
        `;
      case 'text':
        return css`
          background-color: transparent;
          color: ${colors.primary.main};
          
          &:hover {
            background-color: ${colors.background.light};
          }
          
          &:active {
            background-color: ${colors.background.light};
          }
          
          &:disabled {
            color: ${colors.text.disabled};
            cursor: not-allowed;
          }
        `;
    }
  }}

  ${({ size }) => {
    switch (size) {
      case 'small':
        return css`
          padding: ${spacing.xs} ${spacing.sm};
          font-size: 0.875rem;
        `;
      case 'medium':
        return css`
          padding: ${spacing.sm} ${spacing.md};
          font-size: 1rem;
        `;
      case 'large':
        return css`
          padding: ${spacing.md} ${spacing.lg};
          font-size: 1.125rem;
        `;
    }
  }}

  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}

  ${({ isLoading }) =>
    isLoading &&
    css`
      position: relative;
      color: transparent;
      
      &::after {
        content: '';
        position: absolute;
        width: 1em;
        height: 1em;
        border: 2px solid currentColor;
        border-radius: 50%;
        border-right-color: transparent;
        animation: spin 0.75s linear infinite;
      }
    `}

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default Button; 