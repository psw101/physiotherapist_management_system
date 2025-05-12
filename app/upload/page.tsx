'use client'
import React, { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

const UploadPage = () => {
  const [publicId, setPublicId] = useState('');
  return (
    <div>
      <CldUploadWidget uploadPreset="jssffgghhjjkk" onUploadAdded={(result, options) => console.log(result)}>

        {({ open }) => <button className="btn btn-primary" onClick={() => open()}>Upload an Image</button>}
      </CldUploadWidget>
    </div>
  );
};

export default UploadPage;
