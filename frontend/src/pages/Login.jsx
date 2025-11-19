import { useContext, useState } from "react";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext.jsx";

const Login = () => {
  const navigate = useNavigate();

  // ✅ FIXED: Use handleLoginSuccess instead of manual token setting
  const { backendUrl, handleLoginSuccess } = useContext(ShopContext);

  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      axios.defaults.withCredentials = true;

      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          name,
          email,
          password,
        });

        // console.log("📝 Register response:", data); // Debug

        if (data.success && data.token) {
          // ✅ Use handleLoginSuccess which properly sets everything
          handleLoginSuccess(data.token);
        } else {
          toast.error(data.message || "Registration failed");
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/auth/login", {
          email,
          password,
        });

        // console.log("🔐 Login response:", data); // Debug
        // console.log("Token received:", data.token); // Debug

        if (data.success && data.token) {
          // ✅ Use handleLoginSuccess which properly sets everything
          handleLoginSuccess(data.token);
        } else {
          toast.error(data.message || "Login failed");
        }
      }
    } catch (error) {
      // console.error("Login error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 ssm:px-0 bg-gradient-to-br from-purple-900 to-purple-600 ">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full sm:w-96 text-black text-sm">
        <h2 className="text-3xl font-semibold text-black text-center mb-3">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>
        <p className="text-center text-sm mb-6">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account!"}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full text-white bg-black">
              <img src={assets.person_icon} alt="" />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Full Name"
                required
                className="bg-transparent outline-none"
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full text-white bg-black">
            <img src={assets.mail_icon} alt="" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email id"
              required
              className="bg-transparent outline-none"
            />
          </div>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full text-white bg-black">
            <img src={assets.lock_icon} alt="" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              required
              className="bg-transparent outline-none"
            />
          </div>
          <p
            onClick={() => navigate("/reset-password")}
            className="mb-4 text-indigo-500"
          >
            <span className="text-black hover:text-blue-800 hover:font-bold cursor-pointer">
              Forgot Password ?
            </span>
          </p>
          <button className="text-lg w-full py-2.5 rounded-full bg-gradient-to-r from-purple-900 to-purple-500 text-black hover:text-white hover:scale-y-105 font-medium cursor-pointer">
            {state}
          </button>
        </form>

        {state === "Sign Up" ? (
          <p className="text-black text-center text-xs mt-4">
            Already have an account?
            <span
              onClick={() => setState("Login")}
              className="text-blue-700 hover:text-blue-900 cursor-pointer underline ml-1"
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="text-black text-center text-xs mt-4">
            Don't have an account?
            <span
              onClick={() => setState("Sign Up")}
              className="text-blue-700 hover:text-blue-900 cursor-pointer underline ml-1"
            >
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;