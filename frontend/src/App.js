// App.js
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Wallet from "./pages/Wallet";
import Trade from "./pages/Trade";
import Orders from "./components/Orders";
import Login from "./components/Login";

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(null);
  const isLoggedIn = !!account;

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (address, role) => {
    setAccount(address);
    setRole(role);
    navigate("/wallet"); // Tự động chuyển sang trang ví sau khi đăng nhập
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">💱 CRT Exchange</h1>
        {isLoggedIn && (
          <nav className="space-x-4">
            <Link
              to="/wallet"
              className={
                location.pathname === "/wallet"
                  ? "underline font-bold"
                  : "hover:underline"
              }
            >
              Ví
            </Link>
            <Link
              to="/trade"
              className={
                location.pathname === "/trade"
                  ? "underline font-bold"
                  : "hover:underline"
              }
            >
              Giao dịch
            </Link>
            <Link
              to="/orders"
              className={
                location.pathname === "/orders"
                  ? "underline font-bold"
                  : "hover:underline"
              }
            >
              Lệnh của tôi
            </Link>
          </nav>
        )}
      </header>

      <main className="p-4">
        {!isLoggedIn ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Routes>
            <Route path="/" element={<Wallet account={account} role={role} />} />
            <Route path="/wallet" element={<Wallet account={account} role={role} />} />
            <Route path="/trade" element={<Trade account={account} role={role} />} />
            <Route path="/orders" element={<Orders account={account} />} />
          </Routes>
        )}
      </main>
    </div>
  );
}

export default AppWrapper;
