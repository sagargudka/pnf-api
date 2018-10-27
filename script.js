var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name: 'PNF Api Service',
  description: 'Api Service to run PNF Application',
  script: 'C:\\Users\\Sandeep\\Downloads\\pnf-api\\server.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function() {
  svc.start();
});

svc.install();
