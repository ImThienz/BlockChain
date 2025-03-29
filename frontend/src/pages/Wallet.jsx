import React, { useState, useEffect, useCallback } from "react";  // Import useCallback
import { getBalance, deposit, withdraw } from "../config/web3";

const Wallet = ({ account, role }) => {
  const [balance, setBalance] = useState("0");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Use useCallback to memoize the fetchData function
  const fetchData = useCallback(async () => {
    try {
      const userBalance = await getBalance(account);
      setBalance(userBalance);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi lấy số dư.");
    }
  }, [account]);  // Add account as a dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]);  // Use fetchData as the dependency for useEffect

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await deposit(depositAmount, account);
      await fetchData();
      setDepositAmount("");
      alert("✅ Nạp CRT thành công!");
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi nạp CRT.");
    }
    setLoading(false);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await withdraw(withdrawAmount, account);
      await fetchData();
      setWithdrawAmount("");
      alert("✅ Rút CRT thành công!");
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi rút CRT.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">🎒 Ví CRT của bạn</h1>

      <div className="space-y-2 mb-6">
        <p>👤 <strong>Tài khoản:</strong> {account}</p>
        <p>💰 <strong>Số dư:</strong> {balance} ETH</p>
      </div>

      {role === "ADMIN" ? (
        <>
          <form onSubmit={handleDeposit} className="mb-6 space-y-2">
            <label className="block font-medium">💸 Nhập số lượng muốn nạp:</label>
            <input
              type="number"
              step="0.0001"
              min="0"
              className="border p-2 w-full rounded"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <button
              type="submit"
              className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full ${loading ? "bg-gray-400 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Nạp CRT"}
            </button>
          </form>

          <form onSubmit={handleWithdraw} className="space-y-2">
            <label className="block font-medium">🏧 Nhập số lượng muốn rút:</label>
            <input
              type="number"
              step="0.0001"
              min="0"
              className="border p-2 w-full rounded"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <button
              type="submit"
              className={`bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full ${loading ? "bg-gray-400 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Rút CRT"}
            </button>
          </form>
        </>
      ) : (
        <div className="text-yellow-600 font-medium">
          ⚠️ Bạn không có quyền nạp hoặc rút CRT. Chỉ quản trị viên (ADMIN) mới được phép.
        </div>
      )}
    </div>
  );
};

export default Wallet;
