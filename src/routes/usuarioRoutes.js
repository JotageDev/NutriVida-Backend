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

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");


// CADASTRO PÚBLICO
router.post("/", criarUsuario);


// ROTAS ADMINISTRATIVAS
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  listarUsuarios
);

router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  buscarUsuarioPorId
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  atualizarUsuario
);

router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  alterarStatusUsuario
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  excluirUsuario
);


module.exports = router;