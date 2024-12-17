// src/AddAdsHandleData.js
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import ImageUpload from "./ImageUpload";
import { serverUrl } from "./const";
import AdsData from "./AdsData";

const AddAdsHandleData = () => {
  const [refreshAdsImages, setRefreshAdsImages] = useState(0);
  const [apkUniqueKey, setApkUniqueKey] = useState("");
  const [adsListData, setAdsListData] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  const refreshAdsData =()=>{
    setRefreshAdsImages(prev => prev+1);
  }
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
           `http://${serverUrl}/api/images`
        );
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, [refreshAdsImages]);

  const handleSuggestionClick = (imageName) => {
    if (adsListData) {
      setAdsListData(`${adsListData},${imageName}`);
    } else {
      setAdsListData(imageName);
    }
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://${serverUrl}/addAdsHandleData`,
        {
          ApkUniqueKey: apkUniqueKey,
          AdslistData: adsListData.split(",").map((item) => item.trim()), // Convert comma-separated string to array  
        }
      );
      if (response.status === 200) {
        alert("Data inserted successfully");
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      alert("Error inserting data");
    }
  };
  
  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-2xl font-bold">Add Ads Handle Data</h2>
      <div className=" grid grid-cols-3 mt-20 ">
        <div className="flex flex-col col-span-1 items-center">
          <form className="w-full max-w-sm" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Apk Unique Key:
              </label>
              <input
                type="text"
                value={apkUniqueKey}
                onChange={(e) => setApkUniqueKey(e.target.value)}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-6 relative" ref={wrapperRef}>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Ads List Data (comma-separated):
              </label>
              <input
                type="text"
                value={adsListData}
                onChange={(e) => setAdsListData(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              {showSuggestions && suggestions.length > 0 && (
                // <div className="absolute h-72 overflow-scroll bg-white border border-gray-300 w-full mt-1 rounded-md shadow-lg z-10">
                <div className="absolute h-72 overflow-scroll bg-white border border-gray-300 w-full mt-1 rounded-md shadow-lg z-10">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200 border-b border-[#CFE1EE] border-1 flex items-center justify-between"
                      onClick={() => handleSuggestionClick(suggestion)}>
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Submit
              </button>
            </div>
          </form>
        </div>
        <div className=" col-span-1"></div>
        <div className="flex flex-col col-span-1 items-center">
        <ImageUpload onUploadSuccess={refreshAdsData} />
        </div>
      </div>
      <div className=" w-screen flex items-center justify-center">
        <AdsData/>
      </div>
    </div>
  );
};

export default AddAdsHandleData;
