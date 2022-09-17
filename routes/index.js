const express = require("express");

const {
  paymentController,
} = require("../controllers");

const router = express.Router();

router.post("/payments/orders",  paymentController.createOrder);
router.post("/payments/verify",  paymentController.verifyPayment);

module.exports = router;