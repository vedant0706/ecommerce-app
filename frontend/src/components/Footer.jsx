import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <Link to="/">
            <img src={assets.nav1_logo} className="mb-5 w-32" alt="" />
          </Link>
          <p className="w-full md:w-2/3 text-gray-600">
            Elegant styles, curated trends, and timeless fashion delivered
            effortlessly to your wardrobe—discover premium fabrics, bold
            designs, and exclusive collections crafted for confidence, comfort,
            and modern sophistication.
          </p>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <span>
              <a href="/" className="hover:underline">
                Home
              </a>
            </span>
            <span>
              <a href="/" className="hover:underline">
                About us
              </a>
            </span>
            <span>
              <a href="/" className="hover:underline">
                Delivery
              </a>
            </span>
            <span>
              <a href="/" className="hover:underline">
                Privacy policy
              </a>
            </span>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+91 xxxxxxxxxx</li>
            <li>contact @AURA.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="py-5 text-sm text-center">
        Copyright 2025 @AURA.com - All rights reserved
      </p>
    </div>
  );
};

export default Footer;
