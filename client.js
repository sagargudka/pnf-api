'use strict';

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

  try {
    let result = await database.insertRow('clients', req);
    res.json(result);
  } catch (err) {
    res.json(`${JSON.stringify(err)}`);
  }
}

async function deleteClient(params, res) {
  try {
    let result = await database.deleteRow('clients', params.id);
    res.send(result);
  } catch (err) {
    res.send(err);
  }
}

async function updateClient(req, params, res) {
  try {
    var clientList = await readData();
    var clientInfo = _.find(clientList, cli => cli.id === params.id);

    updateClientProperties(clientInfo, req);

    let result = await database.updateRow('clients', params.id, clientInfo);

    res.send(result);
  } catch (err) {
    res.send(err);
  }
}

function readData() {
  return database.getAll('clients');
}

function updateClientProperties(destination, source) {
  _.each(_.keys(source), property => {
    if (_.has(destination, property)) {
      destination[property] = source[property];
    }
  });
}
