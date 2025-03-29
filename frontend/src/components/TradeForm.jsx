import React, { useState } from "react";
import { loadWeb3, loadContract } from "../config/web3";  // Các hàm để kết nối Web3 và hợp đồng

const TradeForm = ({ account }) => {
  const [isBuy, setIsBuy] = useState(true);  // Mặc định là "Mua"
  const [amount, setAmount] = useState("");  // Số lượng CRT
  const [price, setPrice] = useState("");    // Giá mỗi CRT (tính bằng ETH)
  const [loading, setLoading] = useState(false);  // Trạng thái khi giao dịch

  // Hàm để xử lý việc đặt lệnh
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const web3 = await loadWeb3();  // Kết nối Web3
      const contract = await loadContract();  // Lấy hợp đồng thông minh

      // Kiểm tra số lượng và giá có hợp lệ không
      if (amount <= 0 || price <= 0) {
        alert("❌ Số lượng và giá phải lớn hơn 0");
        setLoading(false);
        return;
      }

      const value = web3.utils.toWei(price.toString(), "ether");

      // Đặt lệnh mua/bán vào hợp đồng
      await contract.methods.placeOrder(isBuy, amount, value).send({
        from: account,  // Gửi từ tài khoản của người dùng
      });

      alert(`✅ Đặt lệnh ${isBuy ? "Mua" : "Bán"} CRT thành công!`);
      setAmount("");  // Làm trống trường nhập số lượng
      setPrice("");   // Làm trống trường nhập giá
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi đặt lệnh.");
    }
    setLoading(false);  // Kết thúc trạng thái loading
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">📈 Đặt lệnh {isBuy ? "Mua" : "Bán"} CRT</h1>

      <div className="space-y-4">
        {/* Radio Button để chọn mua/bán */}
        <div className="flex items-center">
          <input
            type="radio"
            id="buy"
            name="tradeType"
            checked={isBuy}
            onChange={() => setIsBuy(true)}
            className="mr-2"
          />
          <label htmlFor="buy" className="mr-4">Mua</label>
          <input
            type="radio"
            id="sell"
            name="tradeType"
            checked={!isBuy}
            onChange={() => setIsBuy(false)}
            className="mr-2"
          />
          <label htmlFor="sell">Bán</label>
        </div>

        {/* Nhập số lượng CRT */}
        <div className="space-y-2">
          <label className="block font-medium">💸 Nhập số lượng CRT:</label>
          <input
            type="number"
            className="border p-2 w-full rounded"
            placeholder="Số lượng CRT"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.0001"
          />
        </div>

        {/* Nhập giá mỗi CRT */}
        <div className="space-y-2">
          <label className="block font-medium">💵 Nhập giá mỗi CRT (ETH):</label>
          <input
            type="number"
            className="border p-2 w-full rounded"
            placeholder="Giá mỗi CRT"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.0001"
          />
        </div>

        {/* Nút Submit */}
        <button
          onClick={handleSubmit}
          className={`w-full py-3 rounded-full text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : `${isBuy ? "Mua" : "Bán"} CRT`}
        </button>
      </div>
    </div>
  );
};

export default TradeForm;
