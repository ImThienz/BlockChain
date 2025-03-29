import React, { useState } from "react";
import { loadContract } from "../config/web3";

const Login = ({ onLogin }) => {
  const [selectedAccount, setSelectedAccount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Danh sách tài khoản hiển thị trong dropdown
  const accountList = [
    { name: "Quản trị", address: "0xd85Ed025C08186AaccaA455E4667E62CCA026c55" },
    { name: "Tuấn", address: "0x6EdfD2d75750CBC7D7b89C42B933eCF0A46cA412" },
    { name: "Đạt", address: "0x4b44045C248a4789e704F172e10C2F1f7d306Ea9" },
    { name: "Sơn", address: "0xc8aDdF0b07a70831226FEFc0b40c4bB685922C99" },
    { name: "Dung", address: "0x6b5762c7b386D9a277182c48d5731D13E8b73A01" },
    { name: "Hiếu", address: "0xCCfd87e3f52E1853F00FB873B868a7339CD8a9Ed" }
  ];

  // Hàm xử lý đăng nhập
  const handleLogin = async () => {
    if (!selectedAccount) {
      setErrorMessage("❌ Bạn chưa chọn tài khoản để đăng nhập!");
      return;
    }

    try {
      const contract = await loadContract();
      const role = await contract.methods.roles(selectedAccount).call();

      if (role) {
        onLogin(selectedAccount, role);
        alert(`✅ Đăng nhập thành công với vai trò ${role}`);
      } else {
        setErrorMessage("❌ Địa chỉ ví không có vai trò được gán trên blockchain!");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("❌ Lỗi khi kết nối tới smart contract!");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">📈 Đăng nhập vào Crypto Trading</h1>

      <div className="space-y-4">
        <label className="block text-sm font-medium">Chọn tài khoản để đăng nhập:</label>
        <select
          className="border p-2 rounded w-full"
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
        >
          <option value="">Chọn tài khoản...</option>
          {accountList.map((account) => (
            <option key={account.address} value={account.address}>
              {account.name} ({account.address.slice(0, 6)}...)
            </option>
          ))}
        </select>

        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 w-full"
        >
          Đăng nhập
        </button>

        {errorMessage && (
          <div className="text-red-600 mt-3 text-sm">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
