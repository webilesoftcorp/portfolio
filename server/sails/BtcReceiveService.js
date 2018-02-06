/*globals JobService, WalletService, Users, Transactions, Config, Promise, sails */

var bitGoJS = require('bitgo');
var _ = require('lodash');

var Web3 = require('web3');
var web3 = new Web3(
  new Web3.providers.HttpProvider(process.env.ETHER_PROT + '://' + process.env.ETHER_HOST + (process.env.ETHER_PORT ? ':' + process.env.ETHER_PORT : '') + '/')
);

var abiArray = [{
  constant: false,
  inputs: [
    {
      name: '_investor',
      type: 'address'
    },
    {
      name: '_recivedTokens',
      type: 'uint256'
    }
  ],
  name: 'investFromThirdParty',
  outputs: [],
  payable: false,
  stateMutability: 'nonpayable',
  type: 'function'
}];

var bitgo = new bitGoJS.BitGo({
  env: 'test',
  accessToken: process.env.BITGO_TOKEN
});

var realBitgo = bitgo;

function checkIsWalletAddress(walletId, address) {
  return new Promise(function(resolve, reject) {
    bitgo.wallets().get({ id: walletId }, function(err, wallet) {
      if (err) {
        reject(err);
      }
      wallet.address({address: address}, function(err, addressData) {
        if (err) {
          reject(err);
        }
        resolve(addressData);
      });
    });
  });
}

function getConversionRate() {
  return parseFloat(process.env.CONVERSION_RATE);
}

function getTransactionData(transactionHash) {
  return new Promise(function(resolve, reject) {
    bitgo.blockchain().getTransaction({id: transactionHash}, function(err, response) {
      if (err) {
        reject(err);
      }
      resolve(response);
    });
  });
}

function getProcessedAddressesInTransaction(transactionHash) {
  return new Promise(function(resolve, reject) {
    Transactions.find({hash: transactionHash}).exec(function(err, payments) {
      if (err) {
        reject(err);
      }
      var addresses = _.map(payments, function(item) {
        return item.address;
      });
      resolve(addresses);
    });
  });
}

function increaseTokenBalance(address, btcAmount, conversionRate) {
  var user;
  return WalletService.getPublicSaleBalence()
    .then(function(balance) {
      if (balance !== 0) {
        return Users.findOne({btcAddress: address});
      } else {
        throw { message: 'No tokens on public sale address'};
      }
    })
    .then(function(userRecord) {
      if (userRecord) {
        user = userRecord;
        return Config.findOne({ name: 'icoAddress'});
      } else {
        throw {message: 'No user with such btc address'};
      }
    })
    .then(function(icoAddress) {
      if (icoAddress) {
        var tokensAmount = Math.floor(btcAmount / conversionRate);
        JobService.transferTokensToInvestorInBackground(icoAddress.address, user.wallet, tokensAmount);
      } else {
        throw {message: 'ICO address not found'};
      }
    });
}

module.exports.createWallet = function() {
  return bitgo.wallets().get({ id: process.env.BTC_WALLET_ID })
    .then(function(wallet) {
      return wallet.createAddress({ chain: 0 });
    })
    .then(function(address) {
      return address.address;
    });
};

module.exports.transferTokensToInvestor = function(icoAddress, investorAddress, amount) {
  return new Promise(function(resolve, reject) {
    try {
      web3.eth.contract(abiArray)
        .at(icoAddress)
        .investFromThirdParty(investorAddress, amount, {from: process.env.ETH_INVEST_AGENT, gasPrice: 10000000000 }, function(result) {
          resolve(result);
        });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports.handleInvestment = function(transactionObject) {
  var transactionHash = transactionObject.hash;
  var walletId = transactionObject.walletId;
  return Promise.all([
    getTransactionData(transactionHash),
    getProcessedAddressesInTransaction(transactionHash),
    getConversionRate()
  ])
    .then(function(results) {
      var transactionData = results[0];
      var processedAddressesInTransaction = results[1];
      var conversionRate = results[2];
      var operations = transactionData.outputs;
      operations = _.filter(operations, function(item) {
        return !_.includes(processedAddressesInTransaction, item.address);
      });
      var payments = _.map(operations, function(operation) {
        return checkIsWalletAddress(walletId, operation.account)
          .then(function() {
            return new Promise(function(resolve, reject) {
              var transaction = {
                hash: transactionHash,
                address: operation.account
              };
              Transactions.create(transaction).exec(function(err, transaction) {
                if (err) {
                  reject({message: 'One or more payment processed'});
                }
                resolve(transaction);
              });
            });
          })
          .then(function() {
            var btcAmount = operation.value;
            return increaseTokenBalance(operation.account, btcAmount, conversionRate);
          });
      });
      return Promise.all(payments);
    });
};

module.exports._setFakeBitgo = function(fakeBitgo) {
  bitgo = fakeBitgo;
};

module.exports._restoreBitgo = function() {
  bitgo = realBitgo;
};
