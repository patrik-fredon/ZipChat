import React from 'react';
import styled from 'styled-components';
import { borderRadius, colors, spacing, transitions } from '../../styles/design-system';

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  onChange?: (value: string) => void;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, fullWidth, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <TextareaWrapper fullWidth={fullWidth}>
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <StyledTextarea
          ref={ref}
          onChange={handleChange}
          error={!!error}
          {...props}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </TextareaWrapper>
    );
  }
);

Textarea.displayName = 'Textarea';

const TextareaWrapper = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
`;

const StyledTextarea = styled.textarea<{ error?: boolean }>`
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${({ error }) => error ? colors.error.main : colors.border.main};
  border-radius: ${borderRadius.medium};
  background: ${colors.background.main};
  color: ${colors.text.primary};
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;
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

export default Textarea; 