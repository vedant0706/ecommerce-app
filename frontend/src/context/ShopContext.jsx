import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const currency = "₹ ";
    const delivery_fee = 50;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    // Existing states
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);

    // TOKEN FIXED HERE
    const [token, setToken] = useState('');

    // Authentication states 
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    const axiosInstance = axios.create({
        baseURL: backendUrl,
        withCredentials: true,
    });

    axios.defaults.withCredentials = true;

    // --------------------------------------------
    // TOKEN FIX FUNCTIONS
    // --------------------------------------------
    const saveToken = (newToken) => {
        setToken(newToken);
        localStorage.setItem("token", newToken);
    };

    const loadTokenOnStart = () => {
        const saved = localStorage.getItem("token");
        if (saved) {
            setToken(saved);
            getUserCart(saved);
        }
    };

    // --------------------------------------------

    const getAuthState = async () => {
        try {
            const { data } = await axiosInstance.get("/api/auth/is-auth");
            if (data.success) {
                setIsLoggedin(true);
                getUserData();
            } else {
                setIsLoggedin(false);
            }
        } catch (error) {
            console.log(error);
            toast.error("Auth check failed!");
        }
    };

    const getUserData = async () => {
        try {
            const { data } = await axiosInstance.get("/api/user/data");
            if (data.success) {
                setUserData(data.userData);
                setCurrentUserId(data.userData._id);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const handleLoginSuccess = (loginToken) => {
        saveToken(loginToken);   // FIXED
        setIsLoggedin(true);
        getUserData();
        toast.success("Login successful!");
        navigate("/");
    };

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/api/auth/logout");

            setIsLoggedin(false);
            setUserData(null);
            setCurrentUserId(null);

            saveToken(""); // clear token
            setCartItems({});

            toast.success("Logged out successfully!");
            navigate("/login");
        } catch (error) {
            console.log(error);
            toast.error("Logout failed!");
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

        if (token) {
            try {
                await axios.post(
                    backendUrl + "/api/cart/add",
                    { itemId, size },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.log(error);
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

        if (token) {
            try {
                await axios.post(
                    backendUrl + "/api/cart/update",
                    { itemId, size, quantity },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    };

    const getCartAmount = () => {
        let totalAmount = 0;

        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);

            for (const item in cartItems[items]) {
                if (cartItems[items][item] > 0) {
                    totalAmount += itemInfo.price * cartItems[items][item];
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
            console.log(error);
            toast.error(error.message);
        }
    };

    const getUserCart = async (tokenParam) => {
        try {
            const response = await axios.post(
                backendUrl + "/api/cart/get",
                {},
                { headers: { token: tokenParam || token } },
                {header: { Authorization: `Bearer ${token}` }}
            );

            if (response.data.success) {
                setCartItems(response.data.cartData);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    // --------------------------------------------
    // EFFECTS
    // --------------------------------------------

    useEffect(() => {
        getProductsData();
    }, []);

    useEffect(() => {
        loadTokenOnStart();    // FIXED
    }, []);

    useEffect(() => {
        getAuthState();
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
        navigate,
        backendUrl,

        // TOKEN FIXED
        token,
        saveToken,

        // Auth values
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData,
        currentUserId,
        getAuthState,
        handleLoginSuccess,
        handleLogout,
        isAdmin,
        axiosInstance,
    };

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
