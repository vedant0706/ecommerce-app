import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₹ ";
  const delivery_fee = 50;

  // ✅ FIX: Detect environment properly
  const backendUrl = 
    import.meta.env.VITE_BACKEND_URL || 
    (window.location.hostname === "localhost"
      ? "http://localhost:4000"
      : "https://aura-backend-ecommerce-app.vercel.app");

  console.log("🌍 Environment:", window.location.hostname);
  console.log("🔧 Backend URL:", backendUrl);

  // GLOBAL STATES
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ AXIOS INSTANCE - Works for both localhost and production
  const axiosInstance = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Response interceptor for error handling
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("❌ API Error:", error.response?.status, error.response?.data);
      
      if (error.response?.status === 401) {
        console.log("❌ 401 Unauthorized - clearing auth state");
        setIsLoggedin(false);
        setUserData(null);
        setCurrentUserId(null);
      }
      
      if (error.response?.status === 404) {
        console.error("❌ 404 Not Found:", error.config?.url);
      }
      
      return Promise.reject(error);
    }
  );

  // CHECK AUTH USING COOKIE
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      console.log("🔐 Checking auth status...");

      const { data } = await axiosInstance.get("/api/auth/is-auth");

      console.log("🔐 Auth check response:", data);

      if (data.success) {
        console.log("✅ User is authenticated");
        setIsLoggedin(true);
        await getUserData();
      } else {
        console.log("❌ User is NOT authenticated");
        setIsLoggedin(false);
        setUserData(null);
        setCurrentUserId(null);
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error.response?.data || error.message);
      setIsLoggedin(false);
      setUserData(null);
      setCurrentUserId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // FETCH USER DATA
  const getUserData = async () => {
    try {
      console.log("👤 Fetching user data...");
      
      const { data } = await axiosInstance.get("/api/user/data");

      console.log("👤 User data response:", data);

      if (data.success) {
        setUserData(data.userData);
        setCurrentUserId(data.userData._id);
        console.log("✅ User data loaded:", data.userData.name);
        
        // Load cart after user data is set
        getUserCart();
      } else {
        console.error("❌ Failed to get user data:", data.message);
      }
    } catch (error) {
      console.error("❌ Get user data error:", error.response?.data || error.message);
    }
  };

  // LOGIN SUCCESS HANDLER
  const handleLoginSuccess = async () => {
    console.log("✅ Login success handler called");
    
    // Set logged in state immediately
    setIsLoggedin(true);

    // Wait for cookie to be set, then check auth status
    setTimeout(async () => {
      console.log("🔄 Re-checking auth status after login...");
      await checkAuthStatus();
    }, 800);
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out...");
      
      const { data } = await axiosInstance.post("/api/auth/logout");

      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        setCurrentUserId(null);
        setCartItems({});
        console.log("✅ Logged out successfully");
        toast.success("Logged out!");
      }
    } catch (error) {
      console.error("❌ Logout error:", error);
      toast.error("Logout failed!");
    }
  };

  const isAdmin = userData?.role === "admin";

  // CART LOGIC
  const addToCart = async (itemId, size) => {
    if (!size) return toast.error("Select size");

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
    }

    setCartItems(cartData);

    if (isLoggedin) {
      try {
        await axiosInstance.post("/api/cart/add", { itemId, size });
        console.log("✅ Added to cart on server");
      } catch (error) {
        console.error("❌ Add to cart failed:", error);
      }
    }
  };

  const getCartCount = () => {
    let total = 0;
    for (const items in cartItems) {
      for (const size in cartItems[items]) {
        total += cartItems[items][size];
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
          totalAmount += product.price * cartItems[id][size];
        }
      }
    }
    return totalAmount;
  };

  // FETCH PRODUCTS (no auth needed)
  const getProductsData = async () => {
    try {
      console.log("📦 Fetching products...");
      const { data } = await axios.get(`${backendUrl}/api/product/list`);
      
      if (data.success) {
        setProducts(data.products);
        console.log(`✅ Loaded ${data.products.length} products`);
      }
    } catch (error) {
      console.error("❌ Get products failed:", error);
    }
  };

  // FETCH CART
  const getUserCart = async () => {
    if (!isLoggedin) {
      console.log("⚠️ Not logged in, skipping cart fetch");
      return;
    }

    try {
      console.log("🛒 Fetching user cart...");
      const { data } = await axiosInstance.post("/api/cart/get");
      
      if (data.success) {
        setCartItems(data.cartData);
        console.log("✅ Cart loaded");
      }
    } catch (error) {
      console.error("❌ Get cart failed:", error);
    }
  };

  // EFFECTS
  useEffect(() => {
    console.log("🚀 ShopContext mounted");
    getProductsData();
    checkAuthStatus();
  }, []);

  // ✅ DEBUG: Log when isLoggedin changes
  useEffect(() => {
    console.log("🔄 isLoggedin changed to:", isLoggedin);
  }, [isLoggedin]);

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
    getCartAmount,
    getCartCount,
    backendUrl,

    isLoggedin,
    userData,
    currentUserId,
    handleLoginSuccess,
    handleLogout,
    isAdmin,
    axiosInstance,
    isLoading,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;