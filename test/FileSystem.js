const fs = require("fs");

/**
 * Promise wrapped fs.readFile
 * @param {*} fileName to read from filesystem
 */
let readFile = function(fileName) {
  return new Promise(function(onSuccess, onError) {
    fs.readFile(fileName, "utf8", function(error, data) {
      if (error) {
        onError("[FileSystem.readFile] " + error);
      } else {
        onSuccess(data);
      }
    });
  });
};

module.exports.readFile = readFile;
