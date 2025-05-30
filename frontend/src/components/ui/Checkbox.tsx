import React from 'react';
import styled from 'styled-components';
import { borderRadius, colors, spacing, transitions } from '../../styles/design-system';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  onChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, fullWidth, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <CheckboxWrapper fullWidth={fullWidth}>
        <HiddenCheckbox
          ref={ref}
          type="checkbox"
          onChange={handleChange}
          {...props}
        />
        <StyledCheckbox error={!!error}>
          <Checkmark />
        </StyledCheckbox>
        {label && <Label htmlFor={props.id}>{label}</Label>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </CheckboxWrapper>
    );
  }
);

Checkbox.displayName = 'Checkbox';

const CheckboxWrapper = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  position: relative;
`;

const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
`;

const StyledCheckbox = styled.div<{ error?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid ${({ error }) => error ? colors.error.main : colors.border.main};
  border-radius: ${borderRadius.sm};
  background: ${colors.background.main};
  transition: all ${transitions.fast};
  cursor: pointer;

  ${HiddenCheckbox}:checked + & {
    background: ${colors.primary.main};
    border-color: ${colors.primary.main};
  }

  ${HiddenCheckbox}:focus + & {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.primary.light};
  }

  ${HiddenCheckbox}:disabled + & {
    background: ${colors.background.light};
    cursor: not-allowed;
  }
`;

const Checkmark = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  background: ${colors.background.main};
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  transform: scale(0);
  transition: transform ${transitions.fast};

  ${HiddenCheckbox}:checked + ${StyledCheckbox} & {
    transform: scale(1);
  }
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: ${colors.text.primary};
  font-weight: 500;
  cursor: pointer;
`;

const ErrorMessage = styled.span`
  font-size: 0.75rem;
  color: ${colors.error.main};
  position: absolute;
  bottom: -${spacing.xs};
  left: 0;
`;

export default Checkbox; 