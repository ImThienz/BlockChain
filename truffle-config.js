module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // localhost
      port: 7545,            // cổng mặc định của Ganache GUI (CLI dùng 8545)
      network_id: "*",       // match bất kỳ network id nào
    },
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  compilers: {
    solc: {
      version: "0.8.0",      // Solidity version
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
      }
    }
  },

  db: {
    enabled: false
  }
};
