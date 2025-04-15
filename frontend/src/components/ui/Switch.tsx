import React from 'react';
import styled from 'styled-components';
import { colors, spacing, transitions } from '../../styles/design-system';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  onChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, error, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <SwitchWrapper>
        <HiddenSwitch
          type="checkbox"
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        <StyledSwitch checked={props.checked} disabled={props.disabled}>
          <SwitchThumb checked={props.checked} />
        </StyledSwitch>
        {label && <Label htmlFor={props.id}>{label}</Label>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </SwitchWrapper>
    );
  }
);

Switch.displayName = 'Switch';

const SwitchWrapper = styled.label`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  cursor: pointer;
  user-select: none;
`;

const HiddenSwitch = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const StyledSwitch = styled.div<{ checked?: boolean; disabled?: boolean }>`
  width: 2.5rem;
  height: 1.5rem;
  border-radius: 1rem;
  background: ${({ checked, disabled }) =>
    disabled ? colors.background.light :
      checked ? colors.primary.main :
        colors.border.main};
  transition: all ${transitions.fast};
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.125rem;

  ${HiddenSwitch}:focus + & {
    box-shadow: 0 0 0 2px ${colors.primary.light};
  }

  ${HiddenSwitch}:hover + & {
    background: ${({ disabled, checked }) =>
    disabled ? colors.background.light :
      checked ? colors.primary.dark :
        colors.border.dark};
  }
`;

const SwitchThumb = styled.div<{ checked?: boolean }>`
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: ${colors.background.main};
  transition: all ${transitions.fast};
  transform: ${({ checked }) => checked ? 'translateX(1rem)' : 'translateX(0)'};
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

export default Switch; 