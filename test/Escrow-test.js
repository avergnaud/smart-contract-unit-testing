const assert = require("chai").assert;
const Test = require("./Test");
const Web3 = require("web3");
// requieres cat-blockchain-dev up
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

Test.getInstance("escrow")
  .then(function(escrowContract) {
    assert.isNotNull(escrowContract, "escrowContract is null !");

    return new Test.transactionBuilder()
      .contract(escrowContract)
      .method(escrowContract.setup)
      .params(web3.eth.accounts[0], web3.eth.accounts[1])
      .eventToWatch(escrowContract.SetupEvent)
      .send();
  })
  .then(function(contract) {
    assert.equal(
      web3.eth.accounts[0],
      contract.seller(),
      "Escrow.sol : setup seller mal initialisé"
    );
    assert.equal(
      web3.eth.accounts[1],
      contract.buyer(),
      "Escrow.sol : setup buyer mal initialisé"
    );
  })
  .catch(error => console.log(error));
