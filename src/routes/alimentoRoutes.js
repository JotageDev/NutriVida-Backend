const express = require("express");
const router = express.Router();

const {
  listarAlimentos,
  buscarAlimentoPorId
} = require("../controllers/alimentoController");

const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, listarAlimentos);

router.get(
  "/:id",
  authMiddleware,
  buscarAlimentoPorId
);

module.exports = router;