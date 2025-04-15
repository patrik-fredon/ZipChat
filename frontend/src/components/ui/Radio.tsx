import React from 'react';
import styled from 'styled-components';
import { colors, spacing, transitions } from '../../styles/design-system';

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  onChange?: (checked: boolean) => void;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, fullWidth, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <RadioWrapper fullWidth={fullWidth}>
        <HiddenRadio
          ref={ref}
          type="radio"
          onChange={handleChange}
          {...props}
        />
        <StyledRadio error={!!error}>
          <RadioDot />
        </StyledRadio>
        {label && <Label htmlFor={props.id}>{label}</Label>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </RadioWrapper>
    );
  }
);

Radio.displayName = 'Radio';

const RadioWrapper = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  position: relative;
`;

const HiddenRadio = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
`;

const StyledRadio = styled.div<{ error?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid ${({ error }) => error ? colors.error.main : colors.border.main};
  border-radius: 50%;
  background: ${colors.background.main};
  transition: all ${transitions.fast};
  cursor: pointer;

  ${HiddenRadio}:checked + & {
    border-color: ${colors.primary.main};
  }

  ${HiddenRadio}:focus + & {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.primary.light};
  }

  ${HiddenRadio}:disabled + & {
    background: ${colors.background.light};
    cursor: not-allowed;
  }
`;

const RadioDot = styled.div`
  width: 0.75rem;
  height: 0.75rem;
  background: ${colors.primary.main};
  border-radius: 50%;
  transform: scale(0);
  transition: transform ${transitions.fast};

  ${HiddenRadio}:checked + ${StyledRadio} & {
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

export default Radio; 