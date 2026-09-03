const express = require("express");

const router = express.Router();

const {
  criarUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  atualizarUsuario,
  alterarStatusUsuario,
  excluirUsuario
} = require("../controllers/usuarioController");

router.post("/", criarUsuario);

router.get("/", listarUsuarios);

router.get("/:id", buscarUsuarioPorId);

router.put("/:id", atualizarUsuario);

router.patch("/:id/status", alterarStatusUsuario);

router.delete("/:id", excluirUsuario);

module.exports = router;