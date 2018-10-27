var fs = require('fs');
var uuid = require('uuid/v4');
var _ = require('underscore');

module.exports = {
  getClient,
  persistClient,
  deleteClient,
  updateClient
};

function getClient(req, res) {
  res.send(readData());
}

function persistClient(req, res) {
  var data = readData();
  req.id = uuid();
  data.push(req);
  writeData(data);
  res.json({ id: req.id });
}

function deleteClient(params, res) {
  var clientList = readData();
  var clientIndex = _.findIndex(
    clientList,
    clientInfo => clientInfo.id == params.id
  );
  if (clientIndex >= 0) {
    clientList.splice(clientIndex, 1);
    writeData(clientList);
    res.send('ok');
  }
}

function updateClient(req, params, res) {
  var clientList = readData();
  var clientInfo = _.find(clientList, cli => cli.id === params.id);
  console.log(clientInfo + 'client info');
  updateCLientProperties(clientInfo, params);
  writeData(clientList);
  res.send('update done');
}

function readData() {
  return JSON.parse(fs.readFileSync('database/clients.json'));
}

function writeData(data) {
  fs.writeFileSync('database/clients.json', JSON.stringify(data));
}

function updateCLientProperties(destination, source) {
  _.each(_.keys(source), property => {
    if (_.has(destination, property)) {
      destination[property] = source[property];
    }
  });
}
