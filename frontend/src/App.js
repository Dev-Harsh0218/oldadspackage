import logo from "./logo.svg";
import "./App.css";
import AddAdsHandleData from "./AdsHandleData";
import AdsData from "./AdsData";
import { FaPlus } from "react-icons/fa";

function App() {
  return (
    <div className=" w-screen h-screen relative">
      <AddAdsHandleData/>
      {/* <AdsData /> */}
      {/* <div className=" absolute bottom-16 right-16 flex items-center justify-center bg-[#CFE1EE] h-[7%] rounded-md shadow-sm w-[10%]">
        <span className=" pr-1">
          <FaPlus className=" text-black" />
        </span>
        <h3>Add Data</h3>
      </div> */}
    </div>
  );
}

export default App;
