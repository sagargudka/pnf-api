var inventory = require('./inventory');
var user = require('./client'); //for jsfile
var vendor = require('./vendor'); //for accessing js file
var order = require('./order'); //for accessing js file
var express = require('express');
var moment = require('moment');
var bodyParser = require('body-parser');
var client = require('./client');
var vendors = require('./database/vendors');
var items = require('./database/inventory');
// client.date = moment().format('YYYY - MM - DD');
// client.time = moment().format('hh : mm : ss');
var app = express();
// respond with "hello world" when a GET request is made to the homepage
const { DATABASE_URL } = process.env;
const { Client } = require('pg');

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Reqested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
  next();
});

app.get('/livecheck', (req, res) => {
  // res.send(`Running ${DATABASE_URL}`);
  const client = new Client({ connectionString: DATABASE_URL });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  client
    .connect()
    .then(() => client.query('SELECT * FROM Orders'))
    .then(result => {
      res.end(`${result}`);
      client.end();
    })
    .catch(err => {
      res.end(`${err}`);
      client.end();
    });
});

app.get('/items', function(req, res) {
  inventory.getItems(req, res);
});
app.patch('/items/:id/stock/:quantity', (req, res) => {
  inventory.addStock(req.params, res);
});

app.patch('/items/:id/consume/:quantity', (req, res) => {
  inventory.consumeStock(req.params, res);
});
app.post('/items', function(req, res) {
  inventory.addItem(req.body, res);
});

app.patch('/items/:id', (req, res) => {
  inventory.editItem(req.body, req.params, res);
});

app.delete('/items/:id', (req, res) => {
  inventory.deleteItem(req.params, res);
});

app.get('/clients', (req, res) => {
  client.getClient(req, res);
});

app.post('/client', (req, res) => {
  client.persistClient(req.body, res);
});
app.delete('/client/:id', (req, res) => {
  client.deleteClient(req.params, res);
});

app.patch('/client/:id', (req, res) => {
  client.updateClient(req.body, req.params, res);
});

app.get('/vendors', (req, res) => {
  vendor.getVendorDetails(req, res);
});

app.post('/order', (req, res) => {
  order.postOrder(req.body, res);
});

app.get('/orders', (req, res) => {
  order.getOrder(res);
});

app.get('/client/:id', (req, res) => {
  order.getOrderByOrderID(req, res);
});
app.listen(process.env.PORT || 5000);
