// backend/paypalClient.js
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

function environment() {
  const clientId = 'AYD07XbnTJt7-JYeoacGFA3aPoiRRl-j4NjL8HK1U5IddJhs8j-Fy_dfInMeOkvOFkKTJUSMDfPGIxcS';
  const clientSecret = 'ECmToX3wnPBbPwt2Wrg9HMcMvspPWWz3h5Hf7bwzo0r06zXHpofsFQdRka1kS2m77u9yCclbc-PfHnxI';
  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };
