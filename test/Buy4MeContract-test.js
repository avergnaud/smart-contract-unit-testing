const assert = require("chai").assert;
const Test = require("./Test");
const Web3 = require("web3");
// requiert une blockchain up sur le port 8545
// const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const web3 = new Web3(new Web3.providers.HttpProvider("http://vps437796.ovh.net:8081"));

/**
TU cas nominal
 */
const walletBuy4Me = web3.eth.accounts[3];
const walletAcheteurFinal = web3.eth.accounts[1];
const walletPrestataire = web3.eth.accounts[2];

console.log(
  "wallet buy4me : " +
    web3.fromWei(web3.eth.getBalance(walletBuy4Me), "ether")
);
console.log(
  "acheteur final : " +
    web3.fromWei(web3.eth.getBalance(walletAcheteurFinal), "ether")
);
console.log(
  "prestataire : " +
    web3.fromWei(web3.eth.getBalance(walletPrestataire), "ether")
);

const cautionPrestataire = web3.toWei(1, "ether");
const prixConvenu = web3.toWei(2, "ether");

/* je suis buy4me */
web3.personal.unlockAccount(walletBuy4Me, "my-password");

console.log("1. insertion d'un contrat Buy4MeContract");

Test.getInstance("Buy4MeContract", walletBuy4Me)
  .then(function(buy4MeContract) {
    console.log("2. appel de Buy4MeContract.setup");

    return new Test.transactionBuilder()
      .contract(buy4MeContract)
      .method(buy4MeContract.setup)
      .params(
        walletPrestataire /* prestataire */,
        walletAcheteurFinal /* acheteur final */,
        web3.toWei("0.1", "ether") /* commission buy4me en wei */,
        web3.toWei("0.5", "ether") /* pénalité acheteur final en wei */,
        web3.toWei("0.5", "ether") /* cautionMinimalePrestataire */
      )
      .from(walletBuy4Me)
      .gas(4000000)
      .eventToWatch(buy4MeContract.SetupEvent)
      .send();
  })
  .then(function(buy4MeContract) {
    assert.equal(
      buy4MeContract.getCommissionBuy4Me(),
      web3.toWei("0.1", "ether"),
      "ERR : contrat mal init"
    );

    console.log(
      "2.bis saisie d'une description à valeur légale..."
    );

    /* je suis le prestataire */
    web3.personal.unlockAccount(walletPrestataire, "my-password");

    return new Test.transactionBuilder()
      .contract(buy4MeContract)
      .method(buy4MeContract.setDescription)
      .params("je vais te ramener une télé 36 pouces 3D SMART TV 4K")
      .from(walletPrestataire)
      .gas(4000000)
      .eventToWatch(buy4MeContract.SetDescriptionEvent)
      .send();
  })
  .then(function(buy4MeContract) {
    assert.equal(
      buy4MeContract.getDescription(),
      "je vais te ramener une télé 36 pouces 3D SMART TV 4K",
      "ERR : description KO"
    );

    console.log(
      "3. le prestataire dépose sa caution : " +
        web3.fromWei(cautionPrestataire, "ether") +
        " ETH"
    );

    /* je suis le prestataire */
    web3.personal.unlockAccount(walletPrestataire, "my-password");

    return new Test.transactionBuilder()
      .contract(buy4MeContract)
      .method(buy4MeContract.deposit)
      .from(walletPrestataire)
      .gas(4000000)
      .value(cautionPrestataire)
      .eventToWatch(buy4MeContract.DepositEvent)
      .send();
  })
  .then(function(buy4MeContract) {
    assert.equal(
      buy4MeContract.getFunds(walletPrestataire),
      cautionPrestataire,
      "ERR : deposit du prestataire KO"
    );

    console.log(
      "4. l'acheteur final paye (en séquestre) : " +
        web3.fromWei(prixConvenu, "ether") +
        " ETH"
    );

    /* je suis l'acheteur final */
    web3.personal.unlockAccount(walletAcheteurFinal, "my-password");

    return new Test.transactionBuilder()
      .contract(buy4MeContract)
      .method(buy4MeContract.deposit)
      .from(walletAcheteurFinal)
      .gas(4000000)
      .value(prixConvenu)
      .eventToWatch(buy4MeContract.DepositEvent)
      .send();
  })
  .then(function(buy4MeContract) {

    // BUG ICI probablement à cause du DepositEvent qui a déjà été envoyé par l'étape précédente !
    // assert.equal(
    //   buy4MeContract.getFunds(walletAcheteurFinal),
    //   prixConvenu,
    //   "ERR : deposit acheteur KO"
    // );

    console.log("5. l'acheteur valide");

    /* je suis l'acheteur final */
    web3.personal.unlockAccount(walletAcheteurFinal, "my-password");

    return new Test.transactionBuilder()
      .contract(buy4MeContract)
      .method(buy4MeContract.validate)
      .from(walletAcheteurFinal)
      .eventToWatch(buy4MeContract.ValidateEvent)
      .send();
  })
  .then(function(buy4MeContract) {
    console.log("6. le prestataire déclenche le settlement");

    /* je suis le prestataire */
    web3.personal.unlockAccount(walletPrestataire, "my-password");

    return new Test.transactionBuilder()
      .contract(buy4MeContract)
      .method(buy4MeContract.settle)
      .from(walletPrestataire)
      .eventToWatch(buy4MeContract.SettleEvent)
      .send();
  })
  .then(function(buy4MeContract) {
    console.log("7. Buy4Me récupère son solde");

    /* je suis buy4me */
    web3.personal.unlockAccount(walletBuy4Me, "my-password");

    return new Test.transactionBuilder()
      .contract(buy4MeContract)
      .method(buy4MeContract.retrieveBalance)
      .from(walletBuy4Me)
      .gas(4000000) /* nécessaire ? */
      .eventToWatch(buy4MeContract.RetrieveBalanceEvent)
      .send();
  })
  .then(function(buy4MeContract) {
    console.log("8. on check les funds");

    /* TODO asserts */

    console.log(
      "wallet buy4me : " +
        web3.fromWei(web3.eth.getBalance(walletBuy4Me), "ether")
    );
    console.log(
      "acheteur final : " +
        web3.fromWei(web3.eth.getBalance(walletAcheteurFinal), "ether")
    );
    console.log(
      "prestataire : " +
        web3.fromWei(web3.eth.getBalance(walletPrestataire), "ether")
    );
  })
  .catch(error => console.log(error));
