import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { FileUploader } from '../FileUploader';

describe('FileUploader', () => {
  const mockOnFilesSelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

    expect(screen.getByText('Přidat soubory')).toBeInTheDocument();
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
  });

  it('handles file selection', () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
  });

  it('handles multiple file selection', () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

    const fileInput = screen.getByTestId('file-input');
    const files = [
      new File(['test1'], 'test1.txt', { type: 'text/plain' }),
      new File(['test2'], 'test2.txt', { type: 'text/plain' })
    ];

    fireEvent.change(fileInput, { target: { files } });

    expect(mockOnFilesSelected).toHaveBeenCalledWith(files);
  });

  it('shows file size limit message', () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

    expect(screen.getByText(/Maximální velikost souboru: 10MB/)).toBeInTheDocument();
  });

  it('handles drag and drop', () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

    const dropZone = screen.getByTestId('drop-zone');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    fireEvent.dragEnter(dropZone);
    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file]
      }
    });

    expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
  });

  it('prevents default on drag events', () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

    const dropZone = screen.getByTestId('drop-zone');
    const preventDefault = jest.fn();

    fireEvent.dragEnter(dropZone, { preventDefault });
    fireEvent.dragOver(dropZone, { preventDefault });

    expect(preventDefault).toHaveBeenCalledTimes(2);
  });

  it('shows error message for invalid file type', () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText('Nepodporovaný typ souboru')).toBeInTheDocument();
  });

  it('shows error message for file too large', () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />);

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['x'.repeat(11 * 1024 * 1024)], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText('Soubor je příliš velký')).toBeInTheDocument();
  });
}); 