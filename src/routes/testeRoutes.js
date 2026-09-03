const express = require("express");
const router = express.Router();

const {
  testarApi,
  testarBanco
} = require("../controllers/testeController");

router.get("/", testarApi);
router.get("/banco", testarBanco);

module.exports = router;
