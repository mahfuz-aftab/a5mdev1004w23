const express = require("express");
//const paypal = require("paypal-rest-sdk");
const paypal = require("@paypal/checkout-server-sdk");

const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected successfully to MongoDB server');
    // Further code here
  })
  .catch(err => console.error('Connection error:', err));

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    currency: String,
    //qty: Number,
    price: String
  });
  
  // Create a model
//const Transaction = mongoose.model('Transaction', transactionSchema);

  // Insert a document
// const transaction = new Transaction({ price: '100', currency: 'CAD' });
// transaction.save()
//   .then(savedTransaction => {
//     console.log('Transaction saved:', savedTransaction);
//   })
//   .catch(err => console.error('Save error:', err));

// // Find documents
// Transaction.find({ name: 'John' })
//   .then(allTransactions => {
//     console.log('Transactions found:', allTransactions);
//   })
//   .catch(err => console.error('Find error:', err));

// paypal.configure({
//   mode: "sandbox", //sandbox or live
//   client_id:
//     "ASGwCcPLZE8Xzts1LNPWMTp0gOtiVR86A-nBy6GiyLycYpiYWzua3Wc-VXFCEE2CngoBnRCnwPXtALrO",
//   client_secret:
//     "ENGoTViTunBPrOgKiOUCUVitLYyFJw_ipNWg7ViavDEo5xEkoJnt10wFUUqc4cOspmJ2_MdPL1_3nMev",
// });

const clientId = "ASGwCcPLZE8Xzts1LNPWMTp0gOtiVR86A-nBy6GiyLycYpiYWzua3Wc-VXFCEE2CngoBnRCnwPXtALrO";
const clientSecret = "ENGoTViTunBPrOgKiOUCUVitLYyFJw_ipNWg7ViavDEo5xEkoJnt10wFUUqc4cOspmJ2_MdPL1_3nMev";
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.get("/success", (req, res) => res.sendFile(__dirname + "/success.html"));

// app.post("/pay", (req, res) => {
//   const create_payment_json = {
//     intent: "Book Fair",
//     payer: {
//       payment_method: "paypal",
//     },
//     redirect_urls: {
//       return_url: "https://paypalnode.com/success",
//       cancel_url: "https://paypalnode.com/cancel",
//     },
//     transactions: [
//       {
//         books_list: {
//           books: [
//             {
//               name: "Mobile Data Mangement",
//               Author: "Shivali Dhaka",
//               price: "50.00",
//               currency: "CAD",
//               quantity: 10,
//             },
//           ],
//         },
//         amount: {
//           currency: "CAD",
//           total: "500.00",
//         },
//         description: "Mobile Data Managemnt course Book",
//       },
//     ],
//   };

//   paypal.payment.create(create_payment_json, function (error, payment) {
//     if (error) {
//       console.log(error)
//       throw error;
//     } else {
//       for (let i = 0; i < payment.links.length; i++) {
//         if (payment.links[i].rel === "approval_url") {
//           res.redirect(payment.links[i].href);
//         }
//       }
//     }
//   });
// });

// app.get("/success", (req, res) => {
//   const payerId = req.query.PayerID;
//   const paymentId = req.query.paymentId;

//   const execute_payment_json = {
//     payer_id: payerId,
//     transactions: [
//       {
//         amount: {
//           currency: "USD",
//           total: "5.00",
//         },
//       },
//     ],
//   };

//   paypal.payment.execute(paymentId, execute_payment_json, function (
//     error,
//     payment
//   ) {
//     if (error) {
//       console.log(error.response);
//       throw error;
//     } else {
//       console.log(JSON.stringify(payment));
//       res.send("Success");
//     }
//   });
// });

app.post("/pay", async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "CAD",
          value: "500.00",
          breakdown: {
            item_total: {
              currency_code: "CAD",
              value: "500.00",
            },
          },
        },
        description: "Mobile Data Management course Book",
        items: [
          {
            name: "Mobile Data Management",
            unit_amount: {
              currency_code: "CAD",
              value: "50.00",
            },
            quantity: "10",
          },
        ],
      },
    ],
    application_context: {
      return_url: "http://localhost:3000/success",
      cancel_url: "https://developer.paypal.com/home",
    },
  });

  try {
    const order = await paypalClient.execute(request);
    const approvalUrl = order.result.links.find(link => link.rel === 'approve').href;
    res.redirect(approvalUrl);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).send("Failed to create order");
  }
});

app.get("/success", async (req, res) => {
  const orderId = req.query.orderId;
  const request = new paypal.orders.OrdersGetRequest(orderId);

  try {
    const order = await paypalClient.execute(request);
    const captureId = order.result.purchase_units[0].payments.captures[0].id;

    // Capture the payment
    const captureRequest = new paypal.payments.CapturesCaptureRequest(captureId);
    captureRequest.requestBody({});

    const capture = await paypalClient.execute(captureRequest);
    console.log("Capture details:", capture.result);
    res.send("Payment captured successfully");
  } catch (error) {
    console.error("Failed to capture payment:", error);
    res.status(500).send("Failed to capture payment");
  }
});

app.get("/cancel", (req, res) => res.send("Cancelled"));


app.listen(PORT, () => console.log(`Server Started on ${PORT}`));
mongoose.connection.close();
