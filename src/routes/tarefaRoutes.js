const express = require("express");

const router = express.Router();

const {
  listarTarefas,
  criarTarefa,
  atualizarStatusTarefa,
  excluirTarefa
} = require("../controllers/tarefaController");

const authMiddleware = require("../middlewares/authMiddleware");

router.get(
  "/",
  authMiddleware,
  listarTarefas
);

router.post(
  "/",
  authMiddleware,
  criarTarefa
);

router.patch(
  "/:id/status",
  authMiddleware,
  atualizarStatusTarefa
);

router.delete(
  "/:id",
  authMiddleware,
  excluirTarefa
);

module.exports = router;