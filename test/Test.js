const resolve = require('path').resolve;
const Web3 = require('web3');
const filesystem = require('./FileSystem');

// requieres cat-blockchain-dev up
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8080"));

/* "my-password" defined in cat-blockchain-dev/src/passwordFile.txt */
web3.personal.unlockAccount(web3.eth.accounts[0], "my-password");

// build directory
const BUILD_DIR = resolve(process.env.PWD + '/build') + '/';

/* insert a contract in the blockchain from the binaries */
let getInstance = function (contractName, ...constructorParams) {

    // contract files
    let contractBinFileName = BUILD_DIR + contractName + '.bin';
    let contractAbiFileName = BUILD_DIR + contractName + '.abi';
    let contractBin;
    let contractAbi;

    return new Promise(function (onSuccess, onError) {
        //1. read the bin
        filesystem.readFile(contractBinFileName)
            //2. read the abi  
            .then(function (contractBinReturned) {
                contractBin = contractBinReturned
                return filesystem.readFile(contractAbiFileName);
            })
            //3. inserts contract
            .then(function (contractAbiReturned) {
                contractAbi = JSON.parse(contractAbiReturned);
                return newContract(contractAbi, contractBin, '4700000', ...constructorParams);
            })
            //4. returns the contract instance
            .then(function (contractInstance) {
                onSuccess(contractInstance);
            })
            .catch(function (rejected) {
                // just passing the cause
                onError(rejected);
            });
    });

}

/* (local method) inserts contract */
let newContract = function (contractAbi, contractBin, gasValue, ...constructorParams) {

    return new Promise(function (onSuccess, onError) {
        /* Creates a contract object for a solidity contract, which can be used to initiate contracts on an address */
        let contractInitiator = web3.eth.contract(contractAbi);

        /* insert contract into the blockchain */
        let contractInstance = contractInitiator.new(...constructorParams, {
            from: web3.eth.accounts[0],
            data: '0x' + contractBin,
            gas: gasValue
        }, function (error, contractReturnedFromWeb3) {
            if (error) {
                onError('[Test.newContract] ' + error);
            } else if (typeof contractReturnedFromWeb3.address !== 'undefined') {
                onSuccess(contractInstance);
            }
        });
    });

}

/* (builder pattern) send transaction and watch for event */
let transactionBuilder = function () {

    let thisContract;
    let thisMethod;
    let thisParams;
    let thisEventToWatch;

    return {
        contract: function(passedContract) {
            thisContract = passedContract;
            return this;
        },
        method: function(passedMethod) {
            thisMethod = passedMethod;
            return this;
        },
        params: function(...passedParams) {
            thisParams = passedParams;
            return this;
        },
        eventToWatch: function(passedEventToWatch) {
            thisEventToWatch = passedEventToWatch;
            return this;
        },
        send: function () {

            return new Promise(function (onSuccess, onError) {

                // start watching before sending the transaction - avoids overlapping
                let theEvent = thisEventToWatch({ _from: web3.eth.accounts[0] });
                theEvent.watch(function (err, result) {
                    if (err) {
                        onError(err);
                    }
                    theEvent.stopWatching();
                    onSuccess(thisContract);
                })
                thisMethod.sendTransaction(...thisParams, { from: web3.eth.accounts[0] });
            });
        }
    };
};


module.exports.getInstance = getInstance;
module.exports.transactionBuilder = transactionBuilder;