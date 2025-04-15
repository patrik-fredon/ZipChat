import React from 'react';
import styled from 'styled-components';
import { borderRadius, colors, spacing, transitions } from '../../styles/design-system';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  onChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <CheckboxWrapper>
        <HiddenCheckbox
          type="checkbox"
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        <StyledCheckbox checked={props.checked} disabled={props.disabled}>
          <CheckIcon viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </CheckIcon>
        </StyledCheckbox>
        {label && <Label htmlFor={props.id}>{label}</Label>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </CheckboxWrapper>
    );
  }
);

Checkbox.displayName = 'Checkbox';

const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  cursor: pointer;
  user-select: none;
`;

const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const StyledCheckbox = styled.div<{ checked?: boolean; disabled?: boolean }>`
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid ${({ checked, disabled }) =>
    disabled ? colors.border.light :
      checked ? colors.primary.main :
        colors.border.main};
  border-radius: ${borderRadius.small};
  background: ${({ checked, disabled }) =>
    disabled ? colors.background.light :
      checked ? colors.primary.main :
        colors.background.main};
  transition: all ${transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;

  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 2px ${colors.primary.light};
  }

  ${HiddenCheckbox}:hover + & {
    border-color: ${({ disabled, checked }) =>
    disabled ? colors.border.light :
      checked ? colors.primary.dark :
        colors.border.dark};
  }
`;

const CheckIcon = styled.svg`
  width: 0.75rem;
  height: 0.75rem;
  stroke: ${colors.background.main};
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  opacity: 0;
  transition: opacity ${transitions.fast};

  ${StyledCheckbox}[checked] & {
    opacity: 1;
  }
`;

const Label = styled.span`
  font-size: 0.875rem;
  color: ${colors.text.primary};
`;

const ErrorMessage = styled.span`
  font-size: 0.75rem;
  color: ${colors.error.main};
  margin-top: ${spacing.xs};
`;

export default Checkbox; 