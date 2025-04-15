import React from 'react';
import styled from 'styled-components';
import { borderRadius, colors, spacing, transitions } from '../../styles/design-system';

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  onChange?: (files: FileList | null) => void;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ label, error, fullWidth, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.files);
    };

    return (
      <FileInputWrapper fullWidth={fullWidth}>
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <StyledFileInput
          ref={ref}
          type="file"
          error={!!error}
          onChange={handleChange}
          {...props}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </FileInputWrapper>
    );
  }
);

FileInput.displayName = 'FileInput';

const FileInputWrapper = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  position: relative;
`;

const StyledFileInput = styled.input<{ error?: boolean }>`
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${({ error }) => error ? colors.error.main : colors.border.main};
  border-radius: ${borderRadius.md};
  background: ${colors.background.main};
  color: ${colors.text.primary};
  font-size: 0.875rem;
  transition: all ${transitions.fast};
  outline: none;
  width: 100%;

  &:focus {
    border-color: ${colors.primary.main};
    box-shadow: 0 0 0 2px ${colors.primary.light};
  }

  &:disabled {
    background: ${colors.background.light};
    cursor: not-allowed;
  }

  &::file-selector-button {
    padding: ${spacing.xs} ${spacing.sm};
    border: none;
    border-radius: ${borderRadius.sm};
    background: ${colors.primary.main};
    color: ${colors.text.light};
    font-size: 0.875rem;
    cursor: pointer;
    margin-right: ${spacing.sm};
    transition: all ${transitions.fast};

    &:hover {
      background: ${colors.primary.dark};
    }

    &:disabled {
      background: ${colors.background.light};
      cursor: not-allowed;
    }
  }
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: ${colors.text.primary};
  font-weight: 500;
`;

const ErrorMessage = styled.span`
  font-size: 0.75rem;
  color: ${colors.error.main};
  position: absolute;
  bottom: -${spacing.xs};
  left: 0;
`;

export default FileInput; 