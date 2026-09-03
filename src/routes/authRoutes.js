const express = require("express");

const router = express.Router();

const {
  login,
  usuarioLogado
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");

router.post("/login", login);
router.get("/me", authMiddleware, usuarioLogado);

module.exports = router;