const pool = require("../config/database");

async function adminMiddleware(req, res, next) {
  try {
    // O authMiddleware já colocou os dados do JWT aqui
    const idUsuario = req.usuario?.id_usuario;

    if (!idUsuario) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado."
      });
    }

    // Verifica se o usuário também existe na tabela admin
    const resultado = await pool.query(
      `
      SELECT id_usuario
      FROM admin
      WHERE id_usuario = $1
      `,
      [idUsuario]
    );

    if (resultado.rows.length === 0) {
      return res.status(403).json({
        mensagem: "Acesso permitido apenas para administradores."
      });
    }

    // Guarda a informação para controllers futuros
    req.admin = resultado.rows[0];

    next();

  } catch (error) {
    console.error("Erro ao verificar administrador:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao verificar permissão."
    });
  }
}

module.exports = adminMiddleware;