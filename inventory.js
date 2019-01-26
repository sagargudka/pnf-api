var fs = require('fs');
var uuid = require('uuid/v4');
var _ = require('underscore');
var database = require('./database.js');

module.exports = {
  getItemsDatabase,
  getItems,
  addItem,
  addStock,
  consumeStock,
  editItem,
  deleteItem
};

async function getItemsDatabase() {
  return readData();
}

async function getItems(req, res) {
  let result = await readData();
  res.send(result);
}

async function addItem(req, res) {
  var data = await readData();
  req.id = uuid();
  data.push(req);

  try {
    await database.insertRow('inventory', req);
    // res.json(result);
  } catch (err) {
    res.json(`${JSON.stringify(err)}`);
  }

  res.send('OK');
}

async function addStock(req, res) {
  var itemList = await readData();
  var item = _.find(itemList, itm => itm.id === req.id);
  if (!item) {
    res.status(400);
    res.send('No such product exists');
    return;
  }
  item.quantity += parseInt(req.quantity);
  let result = await database.updateRow('inventory', item.id, item);

  res.send(item);
}

async function consumeStock(req) {
  var itemList = await readData();
  var item = _.find(itemList, itm => itm.id === req.id);
  item.quantity -= req.quantity;
  let result = await database.updateRow('inventory', item.id, item);
}

async function editItem(req, params, res) {
  var itemList = await readData();
  var item = _.find(itemList, itm => itm.id === params.id);

  updateProperties(item, req);
  let result = await database.updateRow('inventory', item.id, item);
  res.send(item);
}

async function deleteItem(params, res) {
  // var itemList = await readData();
  // var itemIndex = _.findIndex(itemList, itm => itm.id === params.id);
  // if (itemIndex >= 0) {
  //   itemList.splice(itemIndex, 1);
  //   writeData(itemList);
  // }

  let result = await database.deleteRow('inventory', params.id);

  res.send('ok');
}

function readData() {
  return database.getAll('inventory');
}

function updateProperties(destination, source) {
  _.each(_.keys(source), property => {
    if (_.has(destination, property)) {
      destination[property] = source[property];
    }
  });
}
