'use strict';

var fs = require('fs');
var uuid = require('uuid/v4');
var _ = require('underscore');
const database = require('./database.js');

module.exports = {
  getClient,
  persistClient,
  deleteClient,
  updateClient
};

async function getClient(req, res) {
  try {
    let result = await readData();
    res.send(result);
  } catch (err) {
    res.send(err);
  }
}

async function persistClient(req, res) {
  var data = await readData();
  req.id = uuid();
  data.push(req);
  writeData(data);

  try {
    let result = await database.insertRow('clients', req);
    res.json(result);
  } catch (err) {
    res.json(`${JSON.stringify(err)}`);
  }
}

async function deleteClient(params, res) {
  // var clientList = await readData();

  try {
    let result = await database.deleteRow('clients', params.id);
    res.send(result);
  } catch (err) {
    res.send(err);
  }


  // var clientIndex = _.findIndex(
  //   clientList,
  //   clientInfo => clientInfo.id == params.id
  // );
  // if (clientIndex >= 0) {
  //   clientList.splice(clientIndex, 1);
  //   writeData(clientList);
  //   res.send('ok');
  // }
}

async function updateClient(req, params, res) {
  var clientList = await readData();
  var clientInfo = _.find(clientList, cli => cli.id === params.id);
  console.log(clientInfo + 'client info');
  updateCLientProperties(clientInfo, params);
  writeData(clientList);
  res.send('update done');
}

function readData() {

  //return JSON.parse(fs.readFileSync('database/clients.json'));

  return database.getAll('clients');
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
