var fs = require('fs')

module.exports = {
    getVendorDetails
}

function getVendorDetails(req, res) {
    res.send(readData());
}

function readData() {
    return JSON.parse(fs.readFileSync('database/vendors.json'));
}