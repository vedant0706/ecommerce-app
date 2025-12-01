import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const navigate = useNavigate();
  const { backendUrl, isLoggedin, currency, axiosInstance, isLoading } =
    useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrderData = async () => {
    try {
      if (!isLoggedin) {
        toast.error("Please login to view orders");
        navigate("/login");
        return;
      }

      setLoading(true);

      const response = await axiosInstance.post("/api/order/userorders");

      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            allOrdersItem.push({
              ...item,
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.date,
            });
          });
        });

        setOrderData(allOrdersItem.reverse());
      } else {
        toast.error(response.data.message || "Failed to load orders");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.message || "Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (isLoggedin) {
        loadOrderData();
      } else {
        toast.error("Please login to view orders");
        navigate("/login");
      }
    }
  }, [isLoggedin, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="border-t pt-16">
        <div className="text-2xl mb-8">
          <Title text1={"MY"} text2={"ORDERS"} />
        </div>
        <div className="text-center py-20">
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-16">
      <div className="text-2xl mb-8">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {orderData.length > 0 ? (
          orderData.map((item, index) => (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-start text-sm gap-6">
                <img src={item.image[0]} className="w-16 sm:w-20" alt="" />
                <div>
                  <p className="sm:text-base font-medium">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                    <p>
                      {currency}
                      {item.price}
                    </p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className="mt-1">
                    Date:{" "}
                    <span className="text-gray-500">
                      {new Date(item.date).toDateString()}
                    </span>
                  </p>
                  <p className="mt-1">
                    Payment Method:{" "}
                    <span className="text-gray-500">{item.paymentMethod}</span>
                  </p>
                </div>
              </div>

              <div className="md:w-1/2 flex justify-between">
                <div className="flex items-center gap-2">
                  <p className="min-w-2 h-2 rounded-full bg-green-600"></p>
                  <p className="text-sm md:text-base">{item.status}</p>
                </div>
                <button
                  onClick={loadOrderData}
                  className="border bg-gray-200 px-4 py-2 text-sm font-medium rounded-sm cursor-pointer hover:bg-gray-300"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Track Order"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg mb-2">No orders found</p>
            <p className="text-sm">Place your first order to see it here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
