const express = require("express");
const router = express.Router();

const { sendMail } = require("./controller");

router.post("/send-email", sendMail);

module.exports = router;