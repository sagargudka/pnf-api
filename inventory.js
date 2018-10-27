var fs = require('fs');
var uuid = require('uuid/v4');
var _ = require('underscore');
module.exports = {
  getItemsDatabase,
  getItems,
  addItem,
  addStock,
  consumeStock,
  editItem,
  deleteItem
};

function getItemsDatabase() {
  return readData();
}

function getItems(req, res) {
  res.send(readData());
}

function addItem(req, res) {
  var data = readData();
  req.id = uuid();
  data.push(req);
  writeData(data);
  res.send('OK');
}

function addStock(req, res) {
  var itemList = readData();
  var item = _.find(itemList, itm => itm.id === req.id);
  if (!item) {
    res.status(400);
    res.send('No such product exists');
    return;
  }
  item.quantity += parseInt(req.quantity);
  writeData(itemList);
  res.send(item);
}

function consumeStock(req) {
  var itemList = readData();
  var item = _.find(itemList, itm => itm.id === req.id);
  item.quantity -= req.quantity;
  writeData(itemList);
}

function editItem(req, params, res) {
  var itemList = readData();
  var item = _.find(itemList, itm => itm.id === params.id);

  updateProperties(item, req);
  writeData(itemList);

  res.send(item);
}

function deleteItem(params, res) {
  var itemList = readData();
  var itemIndex = _.findIndex(itemList, itm => itm.id === params.id);
  if (itemIndex >= 0) {
    itemList.splice(itemIndex, 1);
    writeData(itemList);
  }

  res.send('ok');
}

function readData() {
  return JSON.parse(fs.readFileSync('database/inventory.json'));
}

function writeData(data) {
  fs.writeFileSync('database/inventory.json', JSON.stringify(data));
}

function updateProperties(destination, source) {
  _.each(_.keys(source), property => {
    if (_.has(destination, property)) {
      destination[property] = source[property];
    }
  });
}
