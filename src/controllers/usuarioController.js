const pool = require("../config/database");
const bcrypt = require("bcryptjs");

// CADASTRAR USUÁRIO
async function criarUsuario(req, res) {
  try {
    let {
      nome_usuario,
      email_usuario,
      senha_usuario
    } = req.body;

    // Verifica campos obrigatórios
    if (!nome_usuario || !email_usuario || !senha_usuario) {
      return res.status(400).json({
        mensagem: "Nome, e-mail e senha são obrigatórios."
      });
    }

    // Limpa os dados
    nome_usuario = nome_usuario.trim();
    email_usuario = email_usuario.trim().toLowerCase();

    // Validação básica do nome
    if (nome_usuario.length < 3) {
      return res.status(400).json({
        mensagem: "O nome deve possuir pelo menos 3 caracteres."
      });
    }

    // Validação básica do e-mail
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(email_usuario)) {
      return res.status(400).json({
        mensagem: "E-mail inválido."
      });
    }

    // Validação da senha
    if (senha_usuario.length < 6) {
      return res.status(400).json({
        mensagem: "A senha deve possuir pelo menos 6 caracteres."
      });
    }

    // Verifica se o e-mail já está cadastrado
    const usuarioExistente = await pool.query(
      `
      SELECT id_usuario
      FROM usuario
      WHERE LOWER(email_usuario) = LOWER($1)
      `,
      [email_usuario]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(409).json({
        mensagem: "Este e-mail já está cadastrado."
      });
    }

    // Criptografa a senha
    const senhaHash = await bcrypt.hash(senha_usuario, 12);

    // Salva o usuário
    const resultado = await pool.query(
      `
      INSERT INTO usuario (
        nome_usuario,
        email_usuario,
        senha_usuario
      )
      VALUES ($1, $2, $3)

      RETURNING
        id_usuario,
        nome_usuario,
        email_usuario,
        status_usuario,
        ultimo_acesso,
        data_cadastro
      `,
      [
        nome_usuario,
        email_usuario,
        senhaHash
      ]
    );

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso.",
      usuario: resultado.rows[0]
    });

  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar usuário."
    });
  }
}


// LISTAR TODOS OS USUÁRIOS
async function listarUsuarios(req, res) {
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
      ORDER BY id_usuario
      `
    );

    return res.status(200).json(resultado.rows);

  } catch (error) {
    console.error("Erro ao listar usuários:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao listar usuários."
    });
  }
}


// BUSCAR USUÁRIO POR ID
async function buscarUsuarioPorId(req, res) {
  try {
    const { id } = req.params;

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
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado."
      });
    }

    return res.status(200).json(resultado.rows[0]);

  } catch (error) {
    console.error("Erro ao buscar usuário:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao buscar usuário."
    });
  }
}


// ATUALIZAR USUÁRIO
async function atualizarUsuario(req, res) {
  try {
    const { id } = req.params;

    let {
      nome_usuario,
      email_usuario
    } = req.body;

    if (!nome_usuario || !email_usuario) {
      return res.status(400).json({
        mensagem: "Nome e e-mail são obrigatórios."
      });
    }

    nome_usuario = nome_usuario.trim();
    email_usuario = email_usuario.trim().toLowerCase();

    const usuario = await pool.query(
      `
      SELECT id_usuario
      FROM usuario
      WHERE id_usuario = $1
      `,
      [id]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado."
      });
    }

    const emailExistente = await pool.query(
      `
      SELECT id_usuario
      FROM usuario
      WHERE LOWER(email_usuario) = LOWER($1)
        AND id_usuario <> $2
      `,
      [email_usuario, id]
    );

    if (emailExistente.rows.length > 0) {
      return res.status(409).json({
        mensagem: "Este e-mail já pertence a outro usuário."
      });
    }

    const resultado = await pool.query(
      `
      UPDATE usuario
      SET
        nome_usuario = $1,
        email_usuario = $2
      WHERE id_usuario = $3

      RETURNING
        id_usuario,
        nome_usuario,
        email_usuario,
        ultimo_acesso,
        status_usuario,
        data_cadastro
      `,
      [
        nome_usuario,
        email_usuario,
        id
      ]
    );

    return res.status(200).json({
      mensagem: "Usuário atualizado com sucesso.",
      usuario: resultado.rows[0]
    });

  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao atualizar usuário."
    });
  }
}


// ALTERAR STATUS
async function alterarStatusUsuario(req, res) {
  try {
    const { id } = req.params;
    const { status_usuario } = req.body;

    const statusPermitidos = [
      "ATIVO",
      "INATIVO",
      "BLOQUEADO"
    ];

    if (!statusPermitidos.includes(status_usuario)) {
      return res.status(400).json({
        mensagem: "Status inválido."
      });
    }

    const resultado = await pool.query(
      `
      UPDATE usuario
      SET status_usuario = $1
      WHERE id_usuario = $2

      RETURNING
        id_usuario,
        nome_usuario,
        email_usuario,
        status_usuario
      `,
      [
        status_usuario,
        id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado."
      });
    }

    return res.status(200).json({
      mensagem: "Status atualizado com sucesso.",
      usuario: resultado.rows[0]
    });

  } catch (error) {
    console.error("Erro ao alterar status:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao alterar status."
    });
  }
}


// EXCLUIR USUÁRIO
async function excluirUsuario(req, res) {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `
      DELETE FROM usuario
      WHERE id_usuario = $1

      RETURNING
        id_usuario,
        nome_usuario,
        email_usuario
      `,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado."
      });
    }

    return res.status(200).json({
      mensagem: "Usuário excluído com sucesso.",
      usuario: resultado.rows[0]
    });

  } catch (error) {
    console.error("Erro ao excluir usuário:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao excluir usuário."
    });
  }
}


module.exports = {
  criarUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  atualizarUsuario,
  alterarStatusUsuario,
  excluirUsuario
};