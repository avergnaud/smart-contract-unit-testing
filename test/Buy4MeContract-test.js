const assert = require("chai").assert;
const Test = require("./Test");
const Web3 = require("web3");
// requiert une blockchain up sur le port 8545
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

/**
TU cas nominal

le wallet buy4me :
> web3.fromWei(eth.getBalance(eth.accounts[3]), "ether")
L'acheteur final :
> web3.fromWei(eth.getBalance(eth.accounts[1]), "ether")
Le prestataire :
> web3.fromWei(eth.getBalance(eth.accounts[2]), "ether")
 */
console.log(
  "wallet buy4me : " +
    web3.fromWei(web3.eth.getBalance(web3.eth.accounts[3]), "ether")
);
console.log(
  "acheteur final : " +
    web3.fromWei(web3.eth.getBalance(web3.eth.accounts[1]), "ether")
);
console.log(
  "prestataire : " +
    web3.fromWei(web3.eth.getBalance(web3.eth.accounts[2]), "ether")
);

const cautionPrestataire = web3.toWei(2, "ether");
const prixConvenu = web3.toWei(10, "ether");

/* je suis buy4me */
web3.personal.unlockAccount(web3.eth.accounts[3], "my-password");

console.log("1. insertion d'un contrat Buy4MeContract");

Test.getInstance("Buy4MeContract", web3.eth.accounts[3])
  .then(function(buy4MeContract) {
    console.log("2. appel de Buy4MeContract.setup");

    return new Test.transactionBuilder()
      .contract(buy4MeContract)
      .method(buy4MeContract.setup)
      .params(
        web3.eth.accounts[2] /* prestataire */,
        web3.eth.accounts[1] /* acheteur final */,
        web3.toWei("1", "ether") /* commission buy4me en wei */,
        web3.toWei("1", "ether") /* pénalité acheteur final en wei */,
        web3.toWei("1", "ether") /* cautionMinimalePrestataire */
      )
      .from(web3.eth.accounts[3])
      .gas(1000000)
      .eventToWatch(buy4MeContract.SetupEvent)
      .send();
  })
  .then(function(buy4MeContract) {
    assert.equal(
      buy4MeContract.getCommissionBuy4Me(),
      web3.toWei("1", "ether"),
      "ERR : contrat mal init"
    );

    console.log(
      "2.bis saisie d'une description à valeur légale..."
    );

    /* je suis le prestataire */
    web3.personal.unlockAccount(web3.eth.accounts[2], "my-password");

    return new Test.transactionBuilder()
      .contract(buy4MeContract)
      .method(buy4MeContract.setDescription)
      .params("je vais te ramener une télé 36 pouces 3D SMART TV 4K de ouf")
      .from(web3.eth.accounts[2])
      .gas(4000000)
      .eventToWatch(buy4MeContract.SetDescriptionEvent)
      .send();
  })
  .then(function(buy4MeContract) {
    assert.equal(
      buy4MeContract.getDescription(),
      "je vais te ramener une télé 36 pouces 3D SMART TV 4K de ouf",
      "ERR : description KO"
    );

    console.log(
      "3. le prestataire dépose sa caution : " +
        web3.fromWei(cautionPrestataire, "ether") +
        " ETH"
    );

    /* je suis le prestataire */
    web3.personal.unlockAccount(web3.eth.accounts[2], "my-password");

    return new Test.transactionBuilder()
      .contract(buy4MeContract)
      .method(buy4MeContract.deposit)
      .from(web3.eth.accounts[2])
      .gas(4000000)
      .value(cautionPrestataire)
      .eventToWatch(buy4MeContract.DepositEvent)
      .send();
  })
  .then(function(buy4MeContract) {
    assert.equal(
      buy4MeContract.getFunds(web3.eth.accounts[2]),
      cautionPrestataire,
      "ERR : deposit du prestataire KO"
    );

    console.log(
      "4. l'acheteur final paye (en séquestre) : " +
        web3.fromWei(prixConvenu, "ether") +
        " ETH"
    );

    /* je suis l'acheteur final */
    web3.personal.unlockAccount(web3.eth.accounts[1], "my-password");

    return new Test.transactionBuilder()
      .contract(buy4MeContract)
      .method(buy4MeContract.deposit)
      .from(web3.eth.accounts[1])
      .gas(2000000)
      .value(prixConvenu)
      .eventToWatch(buy4MeContract.DepositEvent)
      .send();
  })
  .then(function(buy4MeContract) {

    assert.equal(
      buy4MeContract.getFunds(web3.eth.accounts[1]),
      prixConvenu,
      "ERR : deposit acheteur KO"
    );

    console.log("5. l'acheteur valide");

    /* je suis l'acheteur final */
    web3.personal.unlockAccount(web3.eth.accounts[1], "my-password");

    return new Test.transactionBuilder()
      .contract(buy4MeContract)
      .method(buy4MeContract.validate)
      .from(web3.eth.accounts[1])
      .eventToWatch(buy4MeContract.ValidateEvent)
      .send();
  })
  .then(function(buy4MeContract) {
    console.log("6. le prestataire déclenche le settlement");

    /* je suis le prestataire */
    web3.personal.unlockAccount(web3.eth.accounts[2], "my-password");

    return new Test.transactionBuilder()
      .contract(buy4MeContract)
      .method(buy4MeContract.settle)
      .from(web3.eth.accounts[2])
      .eventToWatch(buy4MeContract.SettleEvent)
      .send();
  })
  .then(function(buy4MeContract) {
    console.log("7. Buy4Me récupère son solde");

    /* je suis buy4me */
    web3.personal.unlockAccount(web3.eth.accounts[3], "my-password");

    return new Test.transactionBuilder()
      .contract(buy4MeContract)
      .method(buy4MeContract.retrieveBalance)
      .from(web3.eth.accounts[3])
      .gas(1000000) /* nécessaire ? */
      .eventToWatch(buy4MeContract.RetrieveBalanceEvent)
      .send();
  })
  .then(function(buy4MeContract) {
    console.log("8. on check les funds");

    /* TODO asserts */

    console.log(
      "wallet buy4me : " +
        web3.fromWei(web3.eth.getBalance(web3.eth.accounts[3]), "ether")
    );
    console.log(
      "acheteur final : " +
        web3.fromWei(web3.eth.getBalance(web3.eth.accounts[1]), "ether")
    );
    console.log(
      "prestataire : " +
        web3.fromWei(web3.eth.getBalance(web3.eth.accounts[2]), "ether")
    );
  })
  .catch(error => console.log(error));
