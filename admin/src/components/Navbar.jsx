import React from "react";
import { assets } from "../assets/assets.js";

const Navbar = ({ setToken }) => {
  return (
    <div className="flex items-center py-2 px-[4%] justify-between">
      <img className="w-120 h-100%" src={assets.nav1_logo} alt="" />
      <button
        onClick={() => setToken("")}
        className="bg-black text-white hover:scale-105 px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm cursor-pointer "
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
