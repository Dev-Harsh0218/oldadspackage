import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { serverUrl } from "./const";

const ImageUpload = ({ onUploadSuccess }) => {
  const fileInputRef = useRef(null);
  const [refresh, setrefresh] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [packageUrl, setPackageUrl] = useState("");
  const [isbanner, setIsbanner] = useState(0);
  const [closeBtnColor, setCloseBtnColor] = useState(0);

  useEffect(() => {
    if (refresh !== 0) {
      setSelectedFile(null);
      setImageUrl("");
      setPackageUrl("");
      setIsbanner(0);
      setCloseBtnColor(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setrefresh(0);
    }
  }, [refresh]);
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const handleOptionChange = () => {
    if (isbanner == 0) {
      setIsbanner(1);
    } else {
      setIsbanner(0);
    }
  };
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("appUrl", packageUrl);
    formData.append("isWhite", closeBtnColor);
    formData.append("isBanner", isbanner);

    try {
      const response = await axios.post(
        `http://${serverUrl}/uploadImage`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    }
  };
  //   const adsDataList = [
  //     [false, 'com.as.speakercleaner-1.png', 'https://play.google.com/store/apps/details?id=com.as.speakercleaner&hl=en-IN'],
  //     [false, 'com.as.speakercleaner.png', 'https://play.google.com/store/apps/details?id=com.as.speakercleaner&hl=en-IN'],
  //     [true, 'com.clock.sandtimer-1.png', 'https://play.google.com/store/apps/details?id=com.clock.sandtimer&hl=en-IN'],
  //     [true, 'com.clock.sandtimer.png', 'https://play.google.com/store/apps/details?id=com.clock.sandtimer&hl=en-IN'],
  //     [false, 'com.meditation.medit8-1.png', 'https://play.google.com/store/apps/details?id=com.meditation.medit8&hl=en-IN'],
  //     [false, 'com.meditation.medit8-2.png', 'https://play.google.com/store/apps/details?id=com.meditation.medit8&hl=en-IN'],
  //     [false, 'com.walli.hd.wallpapervideo.mp4', 'https://play.google.com/store/apps/details?id=com.walli.hd.wallpaper&hl=en-IN'],
  //     [false, 'commeditationmedit8video.mp4', 'https://play.google.com/store/apps/details?id=com.walli.hd.wallpaper&hl=en-IN'],
  //     [false, 'com.meditation.medit8.png', 'https://play.google.com/store/apps/details?id=com.meditation.medit8&hl=en-IN'],
  //     [false, 'com.music.focusflow-1.png', 'https://play.google.com/store/apps/details?id=com.music.focusflow&hl=en-IN'],
  //     [false, 'com.music.focusflow.png', 'https://play.google.com/store/apps/details?id=com.music.focusflow&hl=en-IN'],
  //     [true, 'com.walli.hd.wallpaper1.png', 'https://play.google.com/store/apps/details?id=com.walli.hd.wallpaper&hl=en-IN'],
  //     [true, 'com.walli.hd.wallpaper2.png', 'https://play.google.com/store/apps/details?id=com.walli.hd.wallpaper&hl=en-IN'],
  //     [true, 'com.walli.hd.wallpaper3.png', 'https://play.google.com/store/apps/details?id=com.walli.hd.wallpaper&hl=en-IN']
  // ];

  //   try {
  //     const response = await axios.post(
  //       `http://${serverUrl}/api/v1/ads/upload-multiple-ads`,
  //       { adsData : adsDataList },
  //       {
  //         headers:{
  //           "content-Type" : "application/json"
  //         },
  //       }
  //     );
  //     toast.success('Files uploaded successfully here');
  //   } catch (error){
  //     console.error('Error uploading files:', error);
  //     alert(error);
  //   }
  // };

  return (
    <div className="">
      <h2>Upload Image</h2>
      <div>
        <input
          ref={fileInputRef}
          multiple={true}
          type="file"
          onChange={handleFileChange}
        />
      </div>

      <div className="mt-6">
        <div className="">
          <div className="my-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {" "}
              close button color :{" "}
            </label>
            <div className="flex items-center justify-start gap-5">
              <input
                type="radio"
                name="closeBtnColor"
                value="0"
                checked={closeBtnColor === 0}
                onChange={(e) => setCloseBtnColor(0)}
              />
              <label className="">Light</label>
            </div>
            <div className="flex items-center justify-start gap-5">
              <input
                type="radio"
                name="closeBtnColor"
                value="0"
                checked={closeBtnColor === 1}
                onChange={(e) => setCloseBtnColor(1)}
              />
              <label className="">Dark</label>
            </div>
          </div>
        </div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          App Redirection URL:
        </label>
        <input
          type="text"
          placeholder="Enter package URL"
          value={packageUrl}
          onChange={(e) => setPackageUrl(e.target.value)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="flex items-center justify-start gap-5 mt-4">
        <input type="checkbox" onChange={handleOptionChange} />
        <label className="">Banner</label>
      </div>
      <button
        className=" mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={handleUpload}
      >
        Upload
      </button>
      {imageUrl && (
        <div>
          <h3>Uploaded Image:</h3>
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: "100px" }} />
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default ImageUpload;
