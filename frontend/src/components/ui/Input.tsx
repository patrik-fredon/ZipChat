import React from 'react';
import styled from 'styled-components';
import { borderRadius, colors, spacing, transitions } from '../../styles/design-system';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  onChange?: (value: string) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <InputWrapper fullWidth={fullWidth}>
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <StyledInput
          ref={ref}
          onChange={handleChange}
          error={!!error}
          {...props}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </InputWrapper>
    );
  }
);

Input.displayName = 'Input';

const InputWrapper = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
`;

const StyledInput = styled.input<{ error?: boolean }>`
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${({ error }) => error ? colors.error.main : colors.border.main};
  border-radius: ${borderRadius.medium};
  background: ${colors.background.main};
  color: ${colors.text.primary};
  font-size: 0.875rem;
  transition: all ${transitions.fast};

  &:focus {
    outline: none;
    border-color: ${colors.primary.main};
    box-shadow: 0 0 0 2px ${colors.primary.light};
  }

  &:disabled {
    background: ${colors.background.light};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${colors.text.secondary};
  }
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: ${colors.text.primary};
`;

const ErrorMessage = styled.span`
  font-size: 0.75rem;
  color: ${colors.error.main};
`;

export default Input; 