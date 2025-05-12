"use client";
import React, { useState, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { Text } from "@radix-ui/themes";

interface ImageUploaderProps {
  onChange: (file: File | null) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
}

const ImageUploader = ({
  onChange,

  acceptedFileTypes = "image/*",
  maxSizeMB = 5,
}: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (file: File | null) => {
      setError(null);

      if (!file) {
        setPreview(null);
        onChange(null);
        return;
      }

      // Validate file type
      const fileType = file.type.split("/")[0];
      if (!file.type.match(acceptedFileTypes.replace("*", ""))) {
        setError(`Please select a valid image file`);
        return;
      }

      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes
      if (file.size > maxSizeBytes) {
        setError(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Pass the file back to the parent component
      onChange(file);
    },
    [acceptedFileTypes, maxSizeMB, onChange]
  );

  return (
    <div className="space-y-2">      
      <div className="border-2 border-dashed rounded-lg p-4 relative">
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-64 mx-auto rounded-md object-contain"
            />
            <button 
              onClick={() => handleFileChange(null)} 
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
              aria-label="Remove image"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 cursor-pointer">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <Text as="p" size="2" className="mb-2 text-gray-500">
              Click to upload or drag and drop
            </Text>
            <Text as="p" size="1" className="text-gray-400">
              PNG, JPG or WEBP (max. {maxSizeMB}MB)
            </Text>
            <input
              type="file"
              accept={acceptedFileTypes}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                handleFileChange(file);
              }}
            />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default ImageUploader;