const express = require('express');
const router = express.Router();
const { client } = require('../paypalClient');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

// Crear orden de pago
router.post('/create-order', async (req, res) => {
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: '10.00' // puedes hacerlo dinámico
      }
    }]
  });

  try {
    const order = await client().execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear la orden');
  }
});

// Capturar el pago
router.post('/capture-order', async (req, res) => {
  const { orderID } = req.body;

  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client().execute(request);
    res.json(capture.result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al capturar la orden');
  }
});

module.exports = router;
