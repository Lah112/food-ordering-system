/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { createContext, useEffect, useState } from "react";
import axios from 'axios'

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});

    const url = import.meta.env.VITE_BACKEND_URL

    const [token, setToken] = useState("")

    const [discount, setDiscount] = useState(0);

    const [food_list, setFoodList] = useState([]);

    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        } else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
    
        if (token) {
            try {
                await axios.post(
                    url + "/api/cart/add",
                    { itemId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            } catch (error) {
                console.error("Add to cart failed:", error.response?.data?.message || error.message);
            }
        }
    };
    

    const removeFromCart = async (itemId) => {
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}))

        if (token) {
            await axios.post(url+"/api/cart/remove", {itemId}, {headers:{token}})
        }
    }

    const loadCartData = async (token) => {
        try {
          const response = await axios.post(url + "/api/cart/get", {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setCartItems(response.data.cartData);
        } catch (error) {
          console.error("Failed to load cart data:", error.response?.data?.message || error.message);
        }
      };
      

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item]>0) {
                let itemInfo = food_list.find((product)=>product._id === item);
                totalAmount += itemInfo.price * cartItems[item];
            }
        }
        return totalAmount;
    }

    const fetchFoodList = async () => {
        const response = await axios.get(url+"/api/food/list")
        setFoodList(response.data.data);
    }

    useEffect(()=>{
        async function loadData(){
            await fetchFoodList();
            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"));
                await loadCartData(localStorage.getItem("token"));
            }
        }
        loadData();
    },[])

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        discount,
        setDiscount,
        url,
        token,
        setToken
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
