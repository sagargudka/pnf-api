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
  getOrderByOrderID,
  downloadBill
};

async function getOrders(req, res) {
  try {
    let result = await readData();
    res.send(result);
  } catch (err) {
    res.send(err);
  }
}

async function postOrder(req, res) {
  let itemsDB = await inventory.getItemsDatabase();
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

  // pdfGenerator.generatePdf(req, async (err, result) => {
  //   if (err) {
  //     return res.send({ err: err });
  //   }
  //   var data = await readData();
  //   data.push(req);

  //   await database.insertRow('orders', req);

  //   res.send({ err: null, data: result });
  // });

  var data = await readData();
  data.push(req);

  await database.insertRow('orders', req);
  res.send({ err: null, data: 'success!' });


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

async function getOrderByOrderID(req, res) {
  var orderList = await readData();
  var orderDetails = _.find(orderList, ord => ord.id === req.id);
  res.send(JSON.parse(orderDetails));
}

async function downloadBill(req, res) {
  let id = req.query.id;
  var orderList = await readData();
  var orderDetails = _.find(orderList, ord => ord.id === id);

  pdfGenerator.generatePdf(orderDetails, async (err, result) => {
    if (err) {
      return res.send({ err: err });
    }

    res.send({ err: null, data: result });
  });
}

function readData() {
  return database.getAll('orders');
}

