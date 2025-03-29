// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CRTExchange {
    address public owner;  // Địa chỉ của chủ sở hữu hợp đồng
    mapping(address => string) public roles;  // Đánh dấu vai trò người dùng
    uint public orderCount = 0;  // Số lượng lệnh đã được tạo

    // Cấu trúc Order (Lệnh mua/bán)
    struct Order {
        uint id;           // ID của lệnh
        address user;      // Địa chỉ người dùng tạo lệnh
        bool isBuy;        // true = Mua, false = Bán
        uint amount;       // Số lượng CRT
        uint price;        // Giá mỗi CRT (tính bằng Wei)
        bool fulfilled;    // Lệnh đã được khớp hay chưa
    }

    // Cấu trúc Transaction (Lịch sử giao dịch)
    struct Transaction {
        uint orderId;
        address user;
        bool isBuy;
        uint amount;
        uint price;
        uint timestamp;
    }

    // Mảng lưu lịch sử giao dịch
    Transaction[] public transactionHistory;

    // Mappings để lưu trữ số dư của người dùng và các đơn hàng
    mapping(address => uint) public balances;
    mapping(uint => Order) public orders;

    // Events
    event Deposited(address indexed user, uint amount);  // Sự kiện nạp CRT
    event Withdrawn(address indexed user, uint amount);  // Sự kiện rút CRT
    event OrderPlaced(uint id, address indexed user, bool isBuy, uint amount, uint price);  // Sự kiện đặt lệnh
    event OrderMatched(uint id, address indexed user);  // Sự kiện khớp lệnh

    constructor() {
        owner = msg.sender;  // Người triển khai hợp đồng là chủ sở hữu
    }

    // ✅ Nạp CRT (gửi ETH vào hợp đồng) - chỉ cho phép admin nạp
    function deposit() public payable {
        require(keccak256(abi.encodePacked(roles[msg.sender])) == keccak256(abi.encodePacked("ADMIN")), "You are not authorized to deposit CRT");
        require(msg.value > 0, "Must send ETH amount greater than 0");
        balances[msg.sender] += msg.value;  // Tăng số dư của người gửi
        emit Deposited(msg.sender, msg.value);  // Ghi lại sự kiện nạp CRT
    }

    // ✅ Rút CRT (rút ETH từ hợp đồng) - chỉ cho phép admin rút
    function withdraw(uint amount) public {
        require(keccak256(abi.encodePacked(roles[msg.sender])) == keccak256(abi.encodePacked("ADMIN")), "You are not authorized to withdraw CRT");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;  // Giảm số dư của người gửi

        // Gửi ETH về ví của người yêu cầu rút
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit Withdrawn(msg.sender, amount);  // Ghi lại sự kiện rút CRT
    }

    // ✅ Tạo lệnh mua/bán (dành cho cả admin và user)
    function placeOrder(bool isBuy, uint amount, uint price) public {
        require(amount > 0 && price > 0, "Quantity and price must be greater than 0");
        uint total = amount * price;

        // Kiểm tra nếu là lệnh mua, người dùng cần đủ số dư ETH
        if (isBuy) {
            require(balances[msg.sender] >= total, "Insufficient balance to purchase");
        } else {
            // Kiểm tra nếu là lệnh bán, người dùng cần có đủ CRT để bán
            require(balances[msg.sender] >= amount, "Not enough CRTs to sell");
        }

        orderCount++;  // Tăng số lượng lệnh
        orders[orderCount] = Order(orderCount, msg.sender, isBuy, amount, price, false);  // Lưu thông tin lệnh
        emit OrderPlaced(orderCount, msg.sender, isBuy, amount, price);  // Ghi lại sự kiện đặt lệnh
    }

    // ✅ Khớp lệnh mua/bán (dành cho cả admin và user)
    function matchOrder(uint id) public {
        Order storage order = orders[id];
        require(!order.fulfilled, "Order already fulfilled");  // Kiểm tra lệnh đã được khớp chưa
        require(order.user != msg.sender, "Cannot match your own orders");  // Người khớp không thể khớp lệnh của chính mình

        uint totalPrice = order.amount * order.price;  // Tính giá trị tổng của lệnh

        if (order.isBuy) {
            // Nếu là lệnh mua: người khớp sẽ là người bán
            require(balances[msg.sender] >= order.amount, "Not enough CRT to sell");
            require(balances[order.user] >= totalPrice, "Not enough ETH to buy");

            // Người mua trả tiền cho người bán
            balances[order.user] -= totalPrice;
            balances[msg.sender] += totalPrice;

            // Người bán chuyển CRT cho người mua
            balances[msg.sender] -= order.amount;
            balances[order.user] += order.amount;
        } else {
            // Nếu là lệnh bán: người khớp sẽ là người mua
            require(balances[msg.sender] >= totalPrice, "Not enough ETH to buy");
            require(balances[order.user] >= order.amount, "Not enough CRT to sell");

            // Người mua trả tiền cho người bán
            balances[msg.sender] -= totalPrice;
            balances[order.user] += totalPrice;

            // Người mua nhận CRT từ người bán
            balances[order.user] -= order.amount;
            balances[msg.sender] += order.amount;
        }

        // Ghi lại giao dịch trong lịch sử
        recordTransaction(order.id, msg.sender, order.isBuy, order.amount, order.price);

        order.fulfilled = true;  // Đánh dấu lệnh đã được khớp
        emit OrderMatched(order.id, msg.sender);  // Ghi lại sự kiện khớp lệnh
    }

    // Ghi lại giao dịch trong lịch sử
    function recordTransaction(uint orderId, address user, bool isBuy, uint amount, uint price) private {
        transactionHistory.push(Transaction(orderId, user, isBuy, amount, price, block.timestamp));
    }

    // ✅ Lấy lịch sử giao dịch
    function getTransactionHistory() public view returns (Transaction[] memory) {
        return transactionHistory;
    }

    // ✅ Lấy số dư của người dùng
    function getBalance(address user) public view returns (uint) {
        return balances[user];
    }

    // ✅ Cập nhật vai trò của người dùng
    function setRole(address user, string memory role) public {
        require(msg.sender == owner, "Only the owner can set roles");  // Chỉ chủ sở hữu hợp đồng mới có thể thay đổi vai trò
        roles[user] = role;
    }
}
