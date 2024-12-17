import React, { useEffect, useState } from "react";
import { serverUrl } from "./const";
import { MdDelete } from "react-icons/md";

const AdsData = () => {
  const [adsListData, setAdsListData] = useState([]);

  useEffect(() => {
    fetchAdsData();
  }, []);

  const fetchAdsData = async () => {
    try {
      const response = await fetch(`http://${serverUrl}/getsAllData`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        //   body: JSON.stringify({ username }),
      });

      if (response.ok) {
        const data = await response.json();
        setAdsListData(data);
      } else {
        const data = await response.json();
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handleDelete = (ApkUniqueKey, adItem) => {
    fetch(`http://${serverUrl}/deleteAdItem`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ApkUniqueKey, adItem }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Ad item deleted successfully") {
          // console.log(data);
          setAdsListData((prevData) =>
            prevData.map((item) =>
              item.ApkUniqueKey === ApkUniqueKey
                ? {
                    ...item,
                    AdslistData: item.AdslistData.filter((ad) => ad !== adItem),
                  }
                : item
            )
          );
        } else {
          // console.log(data);
          console.error("Error deleting ad item:", data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  function trimExtension(str) {
    const lastDotIndex = str.lastIndexOf('.');
    if (lastDotIndex === -1) {
      // No extension found
      return str;
    }
    return str.slice(0, lastDotIndex);
  }

  // console.log(adsListData);
  return (
    <div className=" w-full flex flex-col items-center justify-center">
      <h1 className=" text-2xl font-bold text-[#252525] mb-[3%]">
        Ads Sdk data
      </h1>
      <table className="w-[90%]">
        <thead>
          <tr>
            {/* <th className="text-left">Index</th> */}
            <th className="text-center">Apk Unique Key</th>
            <th className="text-center">Package Name</th>
            <th className="text-left">Ads Image</th>
            <th className="text-center">preview</th>
            <th className="text-center">Total Impressions</th>
            <th className="text-center">Total Clicks</th>
            {/* <th className="text-left">Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {adsListData.map((dataItem, dataIndex) => (
            <React.Fragment key={dataIndex}>
              {dataItem.AdslistData.map((ad, adIndex) => (
                <tr
                  key={adIndex}
                  className={`w-[80%] h-10 ${
                    adIndex % 2 === 0 ? "bg-[#E0F1FB]" : "bg-white"
                  }`}
                >
                  {/* <td>{adIndex + 1}</td> */}
                  <td className=" text-center">{dataItem.ApkUniqueKey}</td>
                  <td className=" text-center">{trimExtension(ad.packageName)}</td>
                  <td className=" text-left">{ad.packageName}</td>
                  <td className=" h-10 w-10 py-4 hover:scale-150 transition-transform transform-gpu duration-300">
                   <a href={`http://${serverUrl}/images/${ad.packageName}`} target="_blank">
                   <img src={`http://${serverUrl}/images/${ad.packageName}`}/>
                    </a> </td>
                  <td className=" text-center">{ad.totalImpressions}</td>
                  <td className=" text-center">
                    <div className=" flex items-center justify-center">
                    <h2 className=" text-center">{ad.totalClicks} </h2>
                    <span>
                      <MdDelete
                        onClick={() =>
                          handleDelete(dataItem.ApkUniqueKey, ad.packageName)
                          }
                          className="text-blue-500 ml-2 cursor-pointer"
                          />
                    </span>
                    </div>
                  </td>
                  {/* <td>
                </td> */}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdsData;
