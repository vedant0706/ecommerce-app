import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₹ ";
  const delivery_fee = 50;

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:4000"
      : "https://aura-ecommerce-backend-seven.vercel.app");

  // GLOBAL STATES
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // AXIOS INSTANCE (COOKIE BASED)
  const axiosInstance = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
  });

  // CHECK AUTH USING COOKIE
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      const { data } = await axiosInstance.get("/api/auth/is-auth");

      if (data.success) {
        setIsLoggedin(true);
        await getUserData();
      } else {
        setIsLoggedin(false);
        setUserData(null);
        setCurrentUserId(null);
      }
    } catch (error) {
      setIsLoggedin(false);
    } finally {
      setIsLoading(false);
    }
  };

  // FETCH USER DATA
  const getUserData = async () => {
    try {
      const { data } = await axiosInstance.get("/api/user/data");

      if (data.success) {
        setUserData(data.userData);
        setCurrentUserId(data.userData._id);
        getUserCart();
      }
    } catch (error) {}
  };

  // LOGIN SUCCESS HANDLER
  const handleLoginSuccess = () => {
    setIsLoggedin(true);

    // Wait for cookie to be set
    setTimeout(() => {
      getUserData();
    }, 300);
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      const { data } = await axiosInstance.post("/api/auth/logout");

      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        setCurrentUserId(null);
        setCartItems({});
        toast.success("Logged out!");
      }
    } catch (error) {
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
      await axiosInstance.post("/api/cart/add", { itemId, size });
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

  // FETCH PRODUCTS
  const getProductsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/product/list`);
      if (data.success) setProducts(data.products);
    } catch {}
  };

  // FETCH CART
  const getUserCart = async () => {
    if (!isLoggedin) return;

    try {
      const { data } = await axiosInstance.post("/api/cart/get");
      if (data.success) setCartItems(data.cartData);
    } catch {}
  };

  // EFFECTS
  useEffect(() => {
    getProductsData();
    checkAuthStatus(); // cookie-based auto login
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
