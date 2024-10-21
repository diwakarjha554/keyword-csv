import React from 'react';

interface PromptInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    isLoading: boolean;
    buttonText: string;
}

const PromptInput: React.FC<PromptInputProps> = ({ value, onChange, onSubmit, isLoading, buttonText }) => {
    return (
        <div className="flex flex-col space-y-4">
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder="Enter your prompt here"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                onClick={onSubmit}
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Processing...' : buttonText}
            </button>
        </div>
    );
};

export default PromptInput;
