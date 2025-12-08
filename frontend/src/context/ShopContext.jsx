// ShopContextProvider.jsx
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const navigate = useNavigate();
  const currency = "₹ ";
  const delivery_fee = 50;

  // Production uses Vercel rewrite: "/api" so frontend -> /api/...
  // Dev uses full backend URL and includes /api
  const backendUrl =
    import.meta.env.MODE === "production"
      ? "/api"
      : import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api";

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // IMPORTANT: axiosInstance baseURL points to backendUrl.
  // In production backendUrl === "/api", so calling "/auth/..." becomes "/api/auth/..."
  const axiosInstance = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Remove global axios.defaults.withCredentials to avoid bypassing rewrites
  // axios.defaults.withCredentials = true;  <-- intentionally removed

  // Interceptors (kept minimal)
  axiosInstance.interceptors.request.use(
    (config) => {
      // You can add auth headers here if needed in future
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Centralize error handling for debugging
      return Promise.reject(error);
    }
  );

  // ----------------------
  // Auth & user functions
  // ----------------------

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get("/auth/is-auth");
      if (data?.success) {
        setIsLoggedin(true);
        await getUserData();
      } else {
        setIsLoggedin(false);
        setUserData(null);
        setCurrentUserId(null);
      }
    } catch (error) {
      setIsLoggedin(false);
      setUserData(null);
      setCurrentUserId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserData = async () => {
    try {
      const { data } = await axiosInstance.get("/auth/data");
      if (data?.success) {
        setUserData(data.userData);
        setCurrentUserId(data.userData._id);
        // load cart for logged in user
        await getUserCart();
      } else {
        toast.error(data?.message || "Failed to fetch user data");
      }
    } catch (error) {
      // swallow or log - avoid noisy UI on initial load
    }
  };

  const handleRegistrationSuccess = async () => {
    // small delay to let backend set cookies/session
    await new Promise((resolve) => setTimeout(resolve, 200));
    await checkAuthStatus();
    toast.success("Registration Successful");
    navigate("/");
  };

  const handleLoginSuccess = async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await checkAuthStatus();
    toast.success("Login successful!");
    navigate("/");
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      setIsLoggedin(false);
      setUserData(null);
      setCurrentUserId(null);
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed!");
    }
  };

  const isAdmin = userData?.role === "admin";

  // ----------------------
  // Cart & product helpers
  // ----------------------

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }

    const prevCart = structuredClone(cartItems);
    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
    }

    setCartItems(cartData);

    if (isLoggedin) {
      try {
        const { data } = await axiosInstance.post("/cart/add", {
          itemId,
          size,
        });
        if (data?.success) {
          toast.success("Added to cart");
        } else {
          toast.error(data?.message || "Failed to add to cart");
          setCartItems(prevCart);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to add to cart");
        setCartItems(prevCart);
      }
    } else {
      toast.info("Please login to save your cart");
    }
  };

  const updateCart = async (itemId, size, quantity) => {
    const prevCart = structuredClone(cartItems);
    let cartData = structuredClone(cartItems);

    if (quantity === 0) {
      if (cartData[itemId]) {
        delete cartData[itemId][size];
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
    } else {
      cartData[itemId] = cartData[itemId] || {};
      cartData[itemId][size] = quantity;
    }

    setCartItems(cartData);

    if (isLoggedin) {
      try {
        await axiosInstance.post("/cart/update", { itemId, size, quantity });
      } catch (error) {
        toast.error("Failed to update cart");
        setCartItems(prevCart);
      }
    }
  };

  const getCartCount = () => {
    let total = 0;
    for (const items in cartItems) {
      for (const size in cartItems[items]) {
        try {
          if (cartItems[items][size] > 0) {
            total += cartItems[items][size];
          }
        } catch (error) {
          // ignore
        }
      }
    }
    return total;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const id in cartItems) {
      const product = products.find((p) => p._id === id);
      if (product) {
        for (const size in cartItems[id]) {
          try {
            if (cartItems[id][size] > 0) {
              totalAmount += product.price * cartItems[id][size];
            }
          } catch (error) {
            // ignore
          }
        }
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const { data } = await axiosInstance.get("/product/list");
      if (data?.success) {
        setProducts(data.products);
      } else {
        toast.error(data?.message || "Failed to load products");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load products");
    }
  };

  const getUserCart = async () => {
    if (!isLoggedin) return;

    try {
      const { data } = await axiosInstance.post("/cart/get");
      if (data?.success) {
        setCartItems(data.cartData || {});
      } else {
        toast.error(data?.message || "Failed to load cart");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load cart");
    }
  };

  // Initial load: products and auth status
  useEffect(() => {
    getProductsData();
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    updateCart,
    getCartAmount,
    getCartCount,
    backendUrl,
    getUserCart,
    getProductsData,

    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    currentUserId,
    handleLoginSuccess,
    handleRegistrationSuccess,
    handleLogout,
    checkAuthStatus,
    getUserData,
    isAdmin,
    axiosInstance,
    isLoading,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
