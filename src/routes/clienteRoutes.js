const express = require("express");

const router = express.Router();

const {
  criarMeuCliente,
  buscarMeuCliente,
  atualizarMeuCliente,
  listarClientes,
  buscarClientePorId
} = require("../controllers/clienteController");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");


// CLIENTE LOGADO

router.post(
  "/me",
  authMiddleware,
  criarMeuCliente
);

router.get(
  "/me",
  authMiddleware,
  buscarMeuCliente
);

router.patch(
  "/me",
  authMiddleware,
  atualizarMeuCliente
);


// ADMIN

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  listarClientes
);

router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  buscarClientePorId
);

module.exports = router;