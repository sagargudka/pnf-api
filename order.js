//post order -->
//if its new client save his details if not then check address is existing in it or not if it not there add its details to ckient
//decrease quantity ,consume stock method
// 1. item check. qty minus
//2. check client exixts o not
//3. add client
//4. bill order in pdf format
//5. getOrders
var fs = require('fs');
var _ = require('underscore');
var client = require('./client');
var user = require('./database/clients.json');
var uuid = require('uuid/v4');
var pdfGenerator = require('./pdfGenerator');
var inventory = require('./inventory');
var database = require('./database.js');

module.exports = {
  getOrders,
  postOrder,
  getOrderByOrderID
};

async function getOrders(req, res) {
  try {
    let result = await database.getAll('orders');
    res.send(result);
  } catch (err) {
    res.send(err);
  }
}

async function postOrder(req, res) {
  let itemsDB = inventory.getItemsDatabase();
  let errors = [];

  _.each(req.items, item => {
    let i = _.find(itemsDB, itm => itm.id === item.id);
    if (item.quantity) {
      if (i) {
        if (i.quantity < item.quantity) {
          errors.push(`Item ${item.name} is having insufficient stock`);
        }
      } else {
        errors.push('Unknown item');
      }
    }
  });

  if (errors.length) {
    return res.send({ err: errors });
  }

  _.each(req.items, item => {
    if (item.quantity) {
      inventory.consumeStock(item);
    }
  });

  pdfGenerator.generatePdf(req, (err, result) => {
    if (err) {
      return res.send({ err: err });
    }
    var data = readData();
    data.push(req);

    database.insertRow('orders', req)
      .then(res => {
        console.log(res);
      })
      .catch(errr => {
        console.log(errr);
      });

    writeData(data);

    res.send({ err: null, data: result });
  });

  // var clientIndex = _.find(user, cli => cli.id === req.id);
  // console.log(clientIndex);
  // var clientId = 0;
  // if (clientIndex === undefined) {
  //     client.persistClient(req, res);
  //     clientId = req.id;
  // } else {
  //     var clientAddress = req.address[0].addressLine;
  //     console.log(clientAddress);
  //     client.updateClient(clientAddress, req, res);
  // }
  // var data = readData();
  // // req.clientId = clientId;
  // // console.log(req.clientId);
  // req.orderID = uuid();
  // data.push(req);
  // res.send(fs.writeFileSync('database/orders.json', JSON.stringify(data)));
}

function getOrderByOrderID(req, res) {
  var orderList = readData();
  var orderDetails = _find(orderList, ord => ord.id === req.id);
  res.send(JSON.parse(orderDetails));
}

function readData() {
  return JSON.parse(fs.readFileSync('database/orders.json'));
}

function writeData(data) {
  fs.writeFileSync('database/orders.json', JSON.stringify(data));
}
