var fs = require('fs');
var uuid = require('uuid/v4');
var _ = require('underscore');
const { DATABASE_URL } = process.env;
const { Client } = require('pg');

const dbClient = new Client({ connectionString: DATABASE_URL });

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

  dbClient
    .connect()
    .then(() =>
      dbClient.query(
        `insert into clients(id, data) values (${req.id}, ${JSON.stringify(
          req
        )});`
      )
    )
    .then(result => {
      console.log(result);
      res.json(result);
      dbClient.end();
    })
    .catch(err => {
      console.log(err);
      res.json(`${JSON.stringify(err)}`);
      dbClient.end();
    });
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
