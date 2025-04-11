const { Storage } = require("@google-cloud/storage");
const path = require("path");

const storage = new Storage({
  keyFilename: path.join(__dirname, "service_account.json"),
});

const bucket = storage.bucket("hdk_22028022_bucket");
module.exports = bucket;
