import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets.js";
import axios from "axios";
import { toast } from "react-toastify";
import ShopContext from "../../context/ShopContext.jsx";
import { MdOutlineMail } from "react-icons/md";


const ResetPassword = () => {

    const {backendUrl} = useContext(ShopContext);
    axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState("");
  const [otp, SetOtp] = useState(0);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);

  const inputRefs = React.useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
        const {data} = await axios.post(backendUrl + '/api/auth/send-reset-otp', {email})
        data.success ? toast.success(data.message) : toast.error(toast.message)
        data.success && setIsEmailSent(true)
    } catch (error) {
        toast.error(error.message)
    }
  }

  const onSubmitOTP = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map(e => e.value)
    SetOtp(otpArray.join(''))
    setIsOtpSubmitted(true)
  }

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
        const {data} = await axios.post(backendUrl + '/api/auth/reset-password', {email,otp, newPassword})
        data.success ? toast.success(data.message) : toast.error(data.message)
        data.success && navigate('/login')
    } catch (error) {
        toast.error(error.message)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-0 from-purple-900 to-purple-600">

      {/* enter email id */}
      {!isEmailSent && 
      <form onSubmit={onSubmitEmail} className="bg-white p-8 rounded-lg shadow-lg w-96 text-sm">
        <h1 className="text-black text-2xl font-semibold text-center mb-4">
          Reset Password
        </h1>
        <p className="text-center mb-6 text-zinc-900">
          Enter your registered email address.
        </p>
        <div className="mb-4 flex items-center gap-3 w-full px-2.5 py-2.5 rounded-full bg-black">
          {/* <img src={assets.mail_icon} alt="" className="w-3.5 h-3.5" /> */}
          <span className="text-lg text-white">
            <MdOutlineMail />
          </span>
          <input
            type="email"
            placeholder="Email id"
            className="bg-transparent outline-none text-white text-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button className="text-lg w-full py-2.5 bg-gradient-to-r from-purple-900 to-purple-500 text-black hover:text-white hover:scale-y-105 rounded-full mt-3 cursor-pointer">
          Submit
        </button>
      </form>
      }

      {/* OTP input form */}
      {!isOtpSubmitted && isEmailSent && 
      <form
        onSubmit={onSubmitOTP}
        className="bg-white p-8 rounded-lg shadow-lg w-96 text-sm"
      >
        <h1 className="text-black text-2xl font-semibold text-center mb-4">
          Reset Password OTP
        </h1>
        <p className="text-center mb-6 text-black">
          Enter the 6-digit code sent to your email id.
        </p>
        <div className="flex justify-between mb-8" onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                type="text"
                maxLength="1"
                key={index}
                ref={(e) => (inputRefs.current[index] = e)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                required
                className="w-12 h-12 bg-black text-white text-center text-xl rounded-md"
              />
            ))}
        </div>
        <button className="text-lg w-full py-2.5 bg-linear-to-r from-purple-500 to-purple-900 text-black hover:text-white hover:scale-y-105 rounded-full cursor-pointer">
          Submit
        </button>
      </form>
      }

      {/* Enter new password */}
      {isOtpSubmitted && isEmailSent &&
      <form onSubmit={onSubmitNewPassword} className="bg-white p-8 rounded-lg shadow-lg w-96 text-sm">
        <h1 className="text-black text-2xl font-semibold text-center mb-4">
          New Password
        </h1>
        <p className="text-center mb-6 text-black">
          Enter the new password below
        </p>
        <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-black">
          <img src={assets.lock_icon} alt="" className="w-3.5 h-3.5" />
          <input
            type="password"
            placeholder="Password"
            className="bg-transparent outline-none text-white"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button className="text-lg w-full py-2.5 bg-linear-to-r from-purple-500 to-purple-900 text-black hover:text-white hover:scale-y-105 rounded-full mt-3 cursor-pointer">
          Submit
        </button>
      </form>
      }
    </div>
  );
};

export default ResetPassword;