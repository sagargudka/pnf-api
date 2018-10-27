var fs = require('fs');
var pdf = require('html-pdf');
var handleBar = require('handlebars');
var html = fs.readFileSync('./template.html', 'utf8');
var vendors = require('./database/vendors.json');
var nToWconverter = require('number-to-words');
var capitalize = require('capitalize');
var _ = require('underscore');
var moment = require('moment');

module.exports = {
  generatePdf
};

function generatePdf(order, callback) {
  const data = {
    vendor: vendors,
    order: JSON.parse(JSON.stringify(order))
  };

  data.order.total = formatTotal(data.order.total);
  formatItems(data.order.items);
  data.order.isTaxInvoice = Boolean(data.order.type === 'bill');
  data.order.type = data.order.isTaxInvoice ? 'Tax Invoice' : 'Challan';
  data.order.client.address = order.client.address[0];
  data.order.client.shippingAddress = order.client.address[1];

  data.order.date = order.date;

  var interpolatedTemplate = handleBar.compile(html);
  var result = interpolatedTemplate(data);
  pdf
    .create(result, {
      format: 'A4'
    })
    .toBuffer((err, res) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, {
        pdf: res.toString('base64')
      });
    });
  // .toFile('./pdfs/Order.pdf', function(err, res) {
  //   if (err) {
  //     callback(err);
  //     return;
  //   }
  //   callback(null, res);
  // });
}

// generatePdf(
//   {
//     id: '20180706142345',
//     transporter: 'Fedex',
//     payTerms: '50000 left',
//     client: {
//       name: 'Bisat Mahesh',
//       gstNo: 'EAAZS018H',
//       address: {
//         addressLine: 'plot 14, sarva shreya apt, malad west',
//         state: 'Maharashtra'
//       },
//       contactNumber: '9658968965'
//     },
//     items: [
//       {
//         sr: 1,
//         name: 'Sublime transfer paper',
//         quantity: '5000',
//         hsn: 'HSN007',
//         description: 'abc no desc',
//         basePrice: '500',
//         unit: 'sheets',
//         amount: '1000'
//       },
//       {
//         sr: 2,
//         name: 'sublime',
//         quantity: '5000',
//         hsn: 'HSN008',
//         description: 'xyz no desc',
//         basePrice: '300',
//         unit: 'roll',
//         amount: '14005'
//       }
//     ],
//     amount: {
//       netAmount: '15005',
//       transportCharges: '500',
//       cgst: {
//         percent: '',
//         value: ''
//       },
//       sgst: {
//         percent: '',
//         value: ''
//       },
//       igst: {
//         percent: '12',
//         value: '267.86'
//       },
//       roundedBy: '0.14',
//       total: '18223'
//     },
//     type: 'Tax Invoice',
//     date: '2018-05-12'
//   },
//   function(err, res) {
//     // console.log(err);
//     console.log(res);
//   }
// );

function toWord(amount) {
  if (typeof amount === 'string') {
    amount = parseInt(amount);
  }
  return capitalize(nToWconverter.toWords(amount));
}

function formatTotal(amount) {
  return {
    netAmount: formatNumber(amount.netAmount),
    transportCharges: formatNumber(amount.transportCharges),
    cgst: formatNumber(amount.cgst),
    sgst: formatNumber(amount.sgst),
    igst: formatNumber(amount.igst),
    roundedBy: formatNumber(amount.roundedBy),
    grossAmount: formatNumber(amount.grossAmount),
    totalInWords: toWord(amount.grossAmount),
    paymentGiven: formatNumber(amount.paymentGiven),
    paymentLeft: formatNumber(amount.paymentLeft)
  };
}

function formatNumber(value) {
  if (typeof value === 'string' && value !== '' && value !== null) {
    value = parseFloat(value);
  }

  if (typeof value === 'number') {
    return value.toFixed(2);
  }

  return '0.00';
}

function formatItems(items) {
  _.each(items, (itm, index) => {
    itm.sr = index + 1;
    itm.amount = {
      netAmount: formatNumber(itm.amount.netAmount),
      grossAmount: formatNumber(itm.amount.grossAmount),
      cgst: {
        value: formatNumber(itm.amount.cgst.value),
        percent: formatNumber(itm.amount.cgst.percent)
      },
      sgst: {
        value: formatNumber(itm.amount.sgst.value),
        percent: formatNumber(itm.amount.sgst.percent)
      },
      igst: {
        value: formatNumber(itm.amount.igst.value),
        percent: formatNumber(itm.amount.igst.percent)
      }
    };
    itm.basePrice = formatNumber(itm.basePrice);
  });
}
