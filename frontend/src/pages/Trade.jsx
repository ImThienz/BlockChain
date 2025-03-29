import React, { useState, useEffect } from "react";
import {  loadContract } from "../config/web3";
import TradeForm from "../components/TradeForm";

const Trade = ({ account, role }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const contract = await loadContract();
      const totalOrders = await contract.methods.orderCount().call();
      const allOrders = [];

      for (let i = 1; i <= totalOrders; i++) {
        const order = await contract.methods.orders(i).call();
        allOrders.push(order);
      }

      setOrders(allOrders);
    } catch (err) {
      console.error("Lỗi khi lấy lệnh:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleMatchOrder = async (orderId) => {
    try {
      const contract = await loadContract();
      const result = await contract.methods.matchOrder(orderId).send({ from: account });

      if (result.status) {
        alert("✅ Khớp lệnh thành công!");
        fetchOrders();
      } else {
        alert("❌ Lỗi khi khớp lệnh.");
      }
    } catch (err) {
      console.error("Lỗi khi khớp lệnh:", err);
      alert("❌ Lỗi khi khớp lệnh.");
    }
  };

  const renderOrders = () => {
    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (orders.length === 0) return <p>Không có lệnh nào đang chờ khớp.</p>;

    return (
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID Lệnh</th>
            <th className="border p-2">Người tạo</th>
            <th className="border p-2">Loại lệnh</th>
            <th className="border p-2">Số lượng CRT</th>
            <th className="border p-2">Giá (ETH)</th>
            {role === "ADMIN" && <th className="border p-2">Hành động</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="border p-2">{order.id}</td>
              <td className="border p-2">{order.user}</td>
              <td className="border p-2">{order.isBuy ? "Mua" : "Bán"}</td>
              <td className="border p-2">{order.amount}</td>
              <td className="border p-2">{order.price}</td>
              {role === "ADMIN" && (
                <td className="border p-2">
                  <button
                    onClick={() => handleMatchOrder(order.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Khớp lệnh
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">📈 Giao dịch CRT</h1>
      <TradeForm account={account} />
      <h2 className="text-xl font-semibold mt-6">Lệnh đang chờ khớp:</h2>
      {renderOrders()}
    </div>
  );
};

export default Trade;
