import { useContext, useState } from "react";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext.jsx";

const Login = () => {
  const navigate = useNavigate();

  const { axiosInstance, handleLoginSuccess } = useContext(ShopContext);

  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      if (state === "Sign Up") {
        const { data } = await axiosInstance.post("/api/auth/register", {
          name,
          email,
          password,
        });

        if (data.success) {
          handleLoginSuccess();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axiosInstance.post("/api/auth/login", {
          email,
          password,
        });

        if (data.success) {
          handleLoginSuccess();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 ssm:px-0 text-white ">
      <div className="bg-white p-10 rounded-lg shadow-2xl w-full sm:w-96 text-black text-sm">
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
          <button className="text-lg w-full py-2.5 rounded-full bg-black text-white hover:scale-y-110 font-medium cursor-pointer">
            {state}
          </button>
        </form>

        {state === "Sign Up" ? (
          <p className="text-black text-center text-xs mt-4">
            Already have an account?
            <span
              onClick={() => setState("Login")}
              className="text-blue-700 hover:text-blue-900 cursor-pointer underline"
            >
              Login here
            </span>
          </p>
        ) : (
          <p
            onClick={() => setState("Sign Up")}
            className="text-gray-900 text-center text-xs mt-4"
          >
            Don't have an account?
            <span className="text-blue-700 hover:text-blue-300 cursor-pointer underline">
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
