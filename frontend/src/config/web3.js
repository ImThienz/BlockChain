import Web3 from "web3";
import contractAddress from "../contracts/ContractAddress";  // Địa chỉ hợp đồng của bạn
import ABI from "../contracts/ChainABI";  // ABI của hợp đồng

let web3;
let contract;
let userAccount;

// Hàm loadWeb3 để kết nối với Ganache (hoặc Infura) mà không cần MetaMask
const loadWeb3 = async () => {
  if (window.ethereum) {
    try {
      // Yêu cầu người dùng cho phép kết nối với MetaMask
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
    } catch (error) {
      console.error("Lỗi khi kết nối MetaMask:", error);
      throw error;
    }
  } else {
    alert("Vui lòng cài đặt MetaMask để sử dụng ứng dụng!");
    throw new Error("MetaMask không được cài đặt");
  }
  return web3;
};

// Hàm loadContract để load ABI và địa chỉ contract
const loadContract = async () => {
  if (!web3) await loadWeb3(); // Kiểm tra nếu web3 chưa được khởi tạo
  contract = new web3.eth.Contract(ABI, contractAddress);
  return contract;
};

// Hàm kết nối với ví người dùng qua Private Key
// **Cảnh báo: Việc dùng private key trực tiếp trong frontend là không an toàn!**
const connectWithPrivateKey = (privateKey) => {
  const account = web3.eth.accounts.privateKeyToAccount(privateKey); // Tạo tài khoản từ private key
  userAccount = account.address; // Lưu địa chỉ ví
  web3.eth.accounts.wallet.add(account); // Thêm tài khoản vào ví Web3
  return userAccount;
};

// Hàm lấy tài khoản người dùng (địa chỉ ví)
const getAccount = () => {
  return userAccount;
};

// Hàm lấy số dư tài khoản
const getBalance = async (account) => {
  const contract = await loadContract();
  const balance = await contract.methods.getBalance(account).call();
  return web3.utils.fromWei(balance, "ether");
};

// Hàm nạp CRT (ETH vào hợp đồng)
const deposit = async (amount, account) => {
  const contract = await loadContract();
  const value = web3.utils.toWei(amount.toString(), "ether");

  try {
    await contract.methods.deposit().send({
      from: account,
      value,
    });
    console.log("Nạp thành công!");
  } catch (err) {
    console.error("Lỗi khi nạp:", err);
  }
};

// Hàm rút CRT (ETH từ hợp đồng)
const withdraw = async (amount, account) => {
  const contract = await loadContract();
  const value = web3.utils.toWei(amount.toString(), "ether");

  try {
    await contract.methods.withdraw(value).send({
      from: account,
    });
    console.log("Rút thành công!");
  } catch (err) {
    console.error("Lỗi khi rút:", err);
  }
};

// Export các hàm để sử dụng ở các file khác
export { loadWeb3, loadContract, getAccount, connectWithPrivateKey, getBalance, deposit, withdraw };
