import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const currency = "₹ ";
    const delivery_fee = 50;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Existing states
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);

    // ✅ Token stored in state
    const [token, setToken] = useState('');

    // Authentication states 
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // ✅ Added loading state

    // ✅ Create axios instance with credentials
    const axiosInstance = axios.create({
        baseURL: backendUrl,
        withCredentials: true, // Send cookies with requests
        headers: {
            'Content-Type': 'application/json',
        }
    });

    // ✅ Set global axios defaults
    axios.defaults.withCredentials = true;

    // --------------------------------------------
    // TOKEN MANAGEMENT (Cookie-based)
    // --------------------------------------------
    const saveToken = (newToken) => {
        setToken(newToken);
        // Token is saved in httpOnly cookie by backend automatically
    };

    // --------------------------------------------
    // ✅ Check if user is authenticated via cookie
    // --------------------------------------------
    const checkAuthStatus = async () => {
        try {
            
            const { data } = await axiosInstance.get("/api/auth/is-auth");
            
            if (data.success) {
                setIsLoggedin(true);
                await getUserData();
                // ✅ Get token from cookie by making a request
                setToken("authenticated"); // Set a placeholder since cookie is httpOnly
            } else {
                setIsLoggedin(false);
                setToken("");
            }
        } catch (error) {
            setIsLoggedin(false);
            setToken("");
        } finally {
            setIsLoading(false); // ✅ Done loading
        }
    };

    const getUserData = async () => {
        try {
            const { data } = await axiosInstance.get("/api/user/data");
            if (data.success) {
                setUserData(data.userData);
                setCurrentUserId(data.userData._id);
                // Load cart when user data is fetched
                getUserCart();
            } else {
                // Don't show error if not authenticated
                if (data.message !== "Not authenticated") {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            // Silent fail on auth check
        }
    };

    const handleLoginSuccess = (loginToken) => { //loginToken
        
        saveToken(loginToken);
        setIsLoggedin(true); // ✅ Set logged in immediately
        setToken(loginToken); // ✅ Set token immediately
        
        getUserData();
        // toast.success("Login successful!");
    };

    const handleLogout = async () => {
        try {
            
            const response = await axiosInstance.post("/api/auth/logout");
            

            if (response.data.success) {
                setIsLoggedin(false);
                setUserData(null);
                setCurrentUserId(null);
                setToken(""); // clear token from state
                setCartItems({});

                toast.success("Logged out successfully!");
                // Components will handle navigation themselves
            } else {
                toast.error(response.data.message || "Logout failed");
            }
        } catch (error) {
            
            // Even if request fails, clear local state
            setIsLoggedin(false);
            setUserData(null);
            setCurrentUserId(null);
            setToken("");
            setCartItems({});
            
            toast.error(error.response?.data?.message || "Logout failed!");
            // Components will handle navigation themselves
        }
    };

    const isAdmin = userData?.role === 'admin';

    // --------------------------------------------
    // CART
    // --------------------------------------------

    const addToCart = async (itemId, size) => {
        if (!size) {
            toast.error("Select Product Size");
            return;
        }

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
        } else {
            cartData[itemId] = { [size]: 1 };
        }

        setCartItems(cartData);

        if (token && isLoggedin) {
            try {
                await axiosInstance.post("/api/cart/add", { itemId, size });
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                if (cartItems[items][item] > 0) {
                    totalCount += cartItems[items][item];
                }
            }
        }
        return totalCount;
    };

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);

        if (token && isLoggedin) {
            try {
                await axiosInstance.post("/api/cart/update", { itemId, size, quantity });
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const getCartAmount = () => {
        let totalAmount = 0;

        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);

            if (itemInfo) {
                for (const item in cartItems[items]) {
                    if (cartItems[items][item] > 0) {
                        totalAmount += itemInfo.price * cartItems[items][item];
                    }
                }
            }
        }
        return totalAmount;
    };

    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + "/api/product/list");

            if (response.data.success) {
                setProducts(response.data.products);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getUserCart = async () => {
        try {
            if (!isLoggedin) {
                return;
            }

            const response = await axiosInstance.post("/api/cart/get", {});

            if (response.data.success) {
                setCartItems(response.data.cartData);
            }
        } catch (error) {
            // Don't show error for unauthenticated users
        }
    };

    // --------------------------------------------
    // EFFECTS
    // --------------------------------------------

    useEffect(() => {
        getProductsData();
    }, []);

    // ✅ Check authentication status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // --------------------------------------------
    // CONTEXT VALUES
    // --------------------------------------------

    const value = {
        products,
        currency,
        delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        setProducts,
        addToCart,
        setCartItems,
        getCartCount,
        updateQuantity,
        getCartAmount,
        backendUrl,

        // TOKEN (state only)
        token,
        saveToken,

        // Auth values
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData,
        currentUserId,
        handleLoginSuccess,
        handleLogout,
        isAdmin,
        axiosInstance,
        isLoading, // ✅ Export loading state
    };

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;