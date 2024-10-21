import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  fileName: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, fileName }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <div 
      {...getRootProps()} 
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-lg">Drop the CSV file here...</p>
      ) : (
        <div>
          {fileName ? (
            <p className="text-lg mb-2">Current file: {fileName}</p>
          ) : (
            <p className="text-lg mb-2">Drag and drop a CSV file here, or click to select a file</p>
          )}
          <p className="text-sm text-gray-500">Only .csv files are accepted</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;