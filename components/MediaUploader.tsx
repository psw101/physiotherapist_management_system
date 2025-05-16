"use client";
import React from "react";
import { CldImage, CldUploadWidget } from "next-cloudinary";

interface CloudinaryResult {
  public_id: string;
  secure_url: string;
  resource_type: string;
}

interface MediaUploaderProps {
  mediaType: "image" | "video" | "any"; // Type of media to upload
  setUrl: (url: string) => void; // Function to set URL in parent component
  setPublicId?: (id: string) => void; // Optional function to set public ID in parent
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ mediaType = "image", setUrl, setPublicId }) => {
  const [selectedMedia, setSelectedMedia] = React.useState<string>("");
  const [previewUrl, setPreviewUrl] = React.useState<string>("");

  const handleSuccess = (result: any) => {
    const info = result.info as CloudinaryResult;

    // Set the media URL in the parent component
    setUrl(info.secure_url);

    // Set the public ID if the parent wants it
    if (setPublicId) {
      setPublicId(info.public_id);
    }

    // Set local state for preview
    setSelectedMedia(info.public_id);
    setPreviewUrl(info.secure_url);

    console.log(`Upload successful! Type: ${info.resource_type}`, info);
  };

  // Determine allowed media types for the upload widget
  const getMediaSources = () => {
    switch (mediaType) {
      case "image":
        return { sources: ["local", "camera", "url"], resourceType: "image" };
      case "video":
        return { sources: ["local", "camera", "url"], resourceType: "video" };
      case "any":
      default:
        return { sources: ["local", "camera", "url"] };
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Preview Media */}
      {selectedMedia && mediaType === "image" && (
        <div className="relative w-full max-w-sm rounded overflow-hidden shadow-lg">
          <CldImage
            src={selectedMedia}
            width={400}
            height={300}
            alt="Uploaded image"
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </div>
      )}

      {selectedMedia && mediaType === "video" && (
        <div className="relative w-full max-w-sm rounded overflow-hidden shadow-lg">
          <video src={previewUrl} controls className="w-full" />
        </div>
      )}

      {/* Upload Widget */}
      <CldUploadWidget
        uploadPreset="jssffgghhjjkk"
        options={{
          sources: ["local"],
        }}
        onSuccess={handleSuccess}
      >
        {({ open }) => (
          <button type="button" onClick={() => open()} className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {selectedMedia ? "Replace" : "Select"} {mediaType === "any" ? "Media" : mediaType}
          </button>
        )}
      </CldUploadWidget>
    </div>
  );
};

export default MediaUploader;
