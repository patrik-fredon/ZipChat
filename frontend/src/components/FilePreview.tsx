import React from 'react';
import { getFileIcon } from '../utils/fileIcons';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
      <span className="text-2xl">{getFileIcon(file.type)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
      </div>
      <button
        onClick={onRemove}
        className="p-1 text-gray-500 hover:text-gray-700"
      >
        ×
      </button>
    </div>
  );
}; 