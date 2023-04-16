const mongoose = require("mongoose");
require("./db.js");

// const linkSchema = new mongoose.Schema({
//   href: String,
//   method: String,
//   rel: String,
// });

// const payerSchema = new mongoose.Schema({
//   name: String,
//   payerId: String,
//   phone: String,
//   email: String,
// });

// const paymentsSchema = new mongoose.Schema({
//   paymentId: String,
//   createTime: String,
//   finalCapture: Boolean,
//   amount: {
//     currencyCode: String,
//     value: String,
//   },
// });

// const shippingSchema = new mongoose.Schema({
//   fullName: String,
//   address: {
//     addressLineOne: String,
//     adminAreaOne: String,
//     adminAreaTwo: String,
//     countryCode: String,
//     postalCode: String,
//   }
// });

// const purchaseUnitSchema = new mongoose.Schema({
//   referenceId: String,
//   payments: paymentsSchema,
//   shipping: shippingSchema,
// });

const orderSchema = new mongoose.Schema({
  orderId: String,
  status: String,
  links: [{
    href: String,
    method: String,
    rel: String,
  }],
  payer: {
    name: String,
    payerId: String,
    phone: String,
    email: String,
  },
  purchaseUnits: [{
    referenceId: String,
    payments: [{
      paymentId: String,
      createTime: String,
      finalCapture: Boolean,
      amount: {
        currencyCode: String,
        value: String,
      },
    }],
    shipping: {
      fullName: String,
      address: {
        addressLineOne: String,
        adminAreaOne: String,
        adminAreaTwo: String,
        countryCode: String,
        postalCode: String,
      }
    },
  }],
});

module.exports = mongoose.model('Order', orderSchema);
