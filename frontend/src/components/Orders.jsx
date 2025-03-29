// src/components/Orders.jsx
import React, { useState, useEffect } from "react";
import { loadContract } from "../config/web3";  // Chỉ cần load hợp đồng mà không cần web3

const Orders = () => {
  const [orders, setOrders] = useState([]);  // Danh sách các lệnh đang chờ khớp
  const [loading, setLoading] = useState(true);  // Trạng thái khi đang tải lệnh

  // Hàm lấy các lệnh đang chờ khớp
  const fetchOrders = async () => {
    setLoading(true);  // Bắt đầu trạng thái loading
    try {
      const contract = await loadContract();  // Lấy hợp đồng
      const totalOrders = await contract.methods.orderCount().call();  // Lấy số lượng lệnh đã đặt
      const allOrders = [];

      // Lấy thông tin từng lệnh
      for (let i = 1; i <= totalOrders; i++) {
        const order = await contract.methods.orders(i).call();  // Lấy thông tin từng lệnh
        allOrders.push(order);  // Thêm lệnh vào mảng
      }

      setOrders(allOrders);  // Cập nhật trạng thái orders
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
    setLoading(false);  // Kết thúc trạng thái loading
  };

  useEffect(() => {
    fetchOrders();  // Gọi hàm lấy lệnh
  }, []);

  // Hiển thị loading nếu đang tải dữ liệu
  if (loading) {
    return <p>Đang tải lệnh...</p>;
  }

  // Nếu không có lệnh nào
  if (orders.length === 0) {
    return <p>Không có lệnh nào đang chờ khớp.</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Lệnh Mua/Bán Đang Chờ</h2>
      {/* Hiển thị các lệnh */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID Lệnh</th>
            <th className="border p-2">Người tạo</th>
            <th className="border p-2">Loại lệnh</th>
            <th className="border p-2">Số lượng CRT</th>
            <th className="border p-2">Giá (ETH)</th>
            <th className="border p-2">Trạng thái</th>
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
              <td className="border p-2">{order.fulfilled ? "Đã khớp" : "Chưa khớp"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
