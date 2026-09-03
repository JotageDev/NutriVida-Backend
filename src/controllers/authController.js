const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// LOGIN
async function login(req, res) {
  try {
    let { email_usuario, senha_usuario } = req.body;

    if (!email_usuario || !senha_usuario) {
      return res.status(400).json({
        mensagem: "E-mail e senha são obrigatórios."
      });
    }

    email_usuario = email_usuario.trim().toLowerCase();

    // Busca o usuário
    const resultado = await pool.query(
      `
      SELECT
        id_usuario,
        nome_usuario,
        email_usuario,
        senha_usuario,
        status_usuario
      FROM usuario
      WHERE LOWER(email_usuario) = LOWER($1)
      `,
      [email_usuario]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        mensagem: "E-mail ou senha inválidos."
      });
    }

    const usuario = resultado.rows[0];

    // Verifica status
    if (usuario.status_usuario !== "ATIVO") {
      return res.status(403).json({
        mensagem: "Usuário não está ativo."
      });
    }

    // Compara senha enviada com o hash
    const senhaCorreta = await bcrypt.compare(
      senha_usuario,
      usuario.senha_usuario
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        mensagem: "E-mail ou senha inválidos."
      });
    }

    // Gera JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        email_usuario: usuario.email_usuario
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h"
      }
    );

    // Atualiza último acesso
    const acesso = await pool.query(
      `
      UPDATE usuario
      SET ultimo_acesso = CURRENT_TIMESTAMP
      WHERE id_usuario = $1
      RETURNING ultimo_acesso
      `,
      [usuario.id_usuario]
    );

    return res.status(200).json({
      mensagem: "Login realizado com sucesso.",

      token,

      usuario: {
        id_usuario: usuario.id_usuario,
        nome_usuario: usuario.nome_usuario,
        email_usuario: usuario.email_usuario,
        status_usuario: usuario.status_usuario,
        ultimo_acesso: acesso.rows[0].ultimo_acesso
      }
    });

  } catch (error) {
    console.error("Erro ao realizar login:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao realizar login."
    });
  }
}


// USUÁRIO LOGADO
async function usuarioLogado(req, res) {
  try {
    const resultado = await pool.query(
      `
      SELECT
        id_usuario,
        nome_usuario,
        email_usuario,
        ultimo_acesso,
        status_usuario,
        data_cadastro
      FROM usuario
      WHERE id_usuario = $1
      `,
      [req.usuario.id_usuario]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado."
      });
    }

    return res.status(200).json({
      usuario: resultado.rows[0]
    });

  } catch (error) {
    console.error("Erro ao buscar usuário autenticado:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao buscar usuário."
    });
  }
}


module.exports = {
  login,
  usuarioLogado
};