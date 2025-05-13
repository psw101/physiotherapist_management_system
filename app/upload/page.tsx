"use client";
import React, { useState } from "react";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { sources } from "next/dist/compiled/webpack/webpack";

interface CloudinaryResult {
  public_id: string;
}

const UploadPage = () => {
  const [publicId, setPublicId] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  return (
    <>
      {/* {publicId && <CldImage src={publicId} width={270} height={180} alt="spidy" />} */}
      <CldUploadWidget
        uploadPreset="jssffgghhjjkk"
        options={{
          sources: ["local"],
        }}
        onSuccess={(result, { widget }) => {
          const info = result.info as CloudinaryResult;
          setPublicId(info.public_id);
          console.log("Upload successful!", info.public_id);
        }}
      >
        {({ open }) => (
          <button className="btn btn-primary" onClick={() => open()}>
            Upload
          </button>
        )}
      </CldUploadWidget>
    </>
  );
};

export default UploadPage;
