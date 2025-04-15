import React from 'react';
import styled from 'styled-components';
import { borderRadius, colors, spacing, transitions } from '../../styles/design-system';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  onChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, fullWidth, options, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <SelectWrapper fullWidth={fullWidth}>
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <StyledSelect
          ref={ref}
          onChange={handleChange}
          error={!!error}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </StyledSelect>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </SelectWrapper>
    );
  }
);

Select.displayName = 'Select';

const SelectWrapper = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
`;

const StyledSelect = styled.select<{ error?: boolean }>`
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${({ error }) => error ? colors.error.main : colors.border.main};
  border-radius: ${borderRadius.medium};
  background: ${colors.background.main};
  color: ${colors.text.primary};
  font-size: 0.875rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right ${spacing.md};
  background-size: 1em;
  padding-right: ${spacing.xl};
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
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: ${colors.text.primary};
`;

const ErrorMessage = styled.span`
  font-size: 0.75rem;
  color: ${colors.error.main};
`;

export default Select; 