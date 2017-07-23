const assert = require("chai").assert;
const Test = require("./Test");
const Web3 = require("web3");
// requiert une blockchain up sur le port 8545
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

/**
 * avec deux wallets
 * Account #0 : l'acheteur
 * Account #1 : le vendeur
 */

let soldeVendeurEnETH = web3.fromWei(
  web3.eth.getBalance(web3.eth.accounts[1]),
  "ether"
);
// console.log('soldeVendeurEnWei : ' + soldeVendeurEnWei);
console.log("soldeVendeur en ETH : " + soldeVendeurEnETH);

/* 1. insertion d'un contrat SimpleBalanceContract */
Test.getInstance("SimpleBalanceContract")
  .then(function(simpleContract) {
    /* 2. Assert solde du contrat à zéro */
    assert.equal(simpleContract.getBalance(), 0, "initial balance not zero");
    // console.log(
    //   "Insertion OK. simpleContract.getBalance() : " +
    //     simpleContract.getBalance()
    // );

    /* 3. appel de simpleContract.deposit avec 1 ETH */
    return new Promise(function(onSuccess, onError) {
      // start watching before sending the transaction - avoids overlapping
      let theEvent = simpleContract.DepositEvent({
        _from: web3.eth.accounts[0]
      });
      theEvent.watch(function(err, result) {
        if (err) {
          onError(err);
        }
        theEvent.stopWatching();
        onSuccess(simpleContract);
      });
      simpleContract.deposit.sendTransaction({
        from: web3.eth.accounts[0],
        value: web3.toWei(1, "ether")
      });
    });
  })
  .then(function(simpleContract) {
    /* 4. Assert solde du contrat à 1 ETH */
    assert.equal(
      simpleContract.getBalance(),
      web3.toWei(1, "ether"),
      "expected balance vs actual balance: " + simpleContract.getBalance()
    );
    // console.log(
    //   "deposit OK. simpleContract.getBalance() : " +
    //     web3.fromWei(simpleContract.getBalance())
    // );

    /* 5. appel de simpleContract.payVendeur */

    web3.personal.unlockAccount(web3.eth.accounts[1], "my-password");

    return new Promise(function(onSuccess, onError) {
      // start watching before sending the transaction - avoids overlapping
      let theEvent = simpleContract.PayEvent({
        _from: web3.eth.accounts[0]
      });
      theEvent.watch(function(err, result) {
        if (err) {
          onError(err);
        }
        theEvent.stopWatching();
        onSuccess(simpleContract);
      });
      /* Error: Insufficient funds for gas * price + value : */
      simpleContract.payVendeur.sendTransaction(web3.eth.accounts[1], {
        from: web3.eth.accounts[0]
      });
    });
  })
  .then(function(simpleContract) {
    /* 6. Assert solde du contrat à 0 ETH */
    assert.equal(
      simpleContract.getBalance(),
      web3.toWei(0, "ether"),
      "6. KO simpleContract.getBalance() : " + simpleContract.getBalance()
    );

    console.log(
      "soldeVendeur en ETH : " +
        web3.fromWei(web3.eth.getBalance(web3.eth.accounts[1]), "ether")
    );

    // console.log(
    //   "payVendeur OK. simpleContract.getBalance() : " +
    //     web3.fromWei(simpleContract.getBalance())
    // );

    /* 7. Assert solde du vendeur + 1 ETH */
    assert.equal(
      web3.fromWei(web3.eth.getBalance(web3.eth.accounts[1]), "ether"),
      parseInt(soldeVendeurEnETH) + 1,
      "7. web3.eth.getBalance(web3.eth.accounts[1]), ether) : " +
        web3.fromWei(web3.eth.getBalance(web3.eth.accounts[1]), "ether")
    );
  })
  .catch(error => console.log(error));
