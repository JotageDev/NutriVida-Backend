const pool = require("../config/database");


// Validação auxiliar
function validarDadosCliente(peso, altura, dataNascimento) {
  if (peso !== undefined && peso !== null) {
    const pesoNumero = Number(peso);

    if (isNaN(pesoNumero) || pesoNumero <= 0) {
      return "Peso inválido.";
    }
  }

  if (altura !== undefined && altura !== null) {
    const alturaNumero = Number(altura);

    if (isNaN(alturaNumero) || alturaNumero <= 0) {
      return "Altura inválida.";
    }
  }

  if (dataNascimento) {
    const data = new Date(dataNascimento);

    if (isNaN(data.getTime())) {
      return "Data de nascimento inválida.";
    }

    if (data > new Date()) {
      return "A data de nascimento não pode estar no futuro.";
    }
  }

  return null;
}


// CRIAR O PRÓPRIO PERFIL DE CLIENTE
async function criarMeuCliente(req, res) {
  try {
    const idUsuario = req.usuario.id_usuario;

    const {
      peso_cliente,
      altura_cliente,
      data_nascimento_cliente
    } = req.body;

    if (!data_nascimento_cliente) {
      return res.status(400).json({
        mensagem: "Data de nascimento é obrigatória."
      });
    }

    const erroValidacao = validarDadosCliente(
      peso_cliente,
      altura_cliente,
      data_nascimento_cliente
    );

    if (erroValidacao) {
      return res.status(400).json({
        mensagem: erroValidacao
      });
    }

    // Verifica se já existe cliente para esse usuário
    const clienteExistente = await pool.query(
      `
      SELECT id_usuario
      FROM cliente
      WHERE id_usuario = $1
      `,
      [idUsuario]
    );

    if (clienteExistente.rows.length > 0) {
      return res.status(409).json({
        mensagem: "Este usuário já possui um perfil de cliente."
      });
    }

    const resultado = await pool.query(
      `
      INSERT INTO cliente (
        id_usuario,
        peso_cliente,
        altura_cliente,
        data_nascimento_cliente
      )
      VALUES ($1, $2, $3, $4)

      RETURNING
        id_usuario,
        peso_cliente,
        altura_cliente,
        data_nascimento_cliente
      `,
      [
        idUsuario,
        peso_cliente ?? null,
        altura_cliente ?? null,
        data_nascimento_cliente
      ]
    );

    return res.status(201).json({
      mensagem: "Perfil de cliente criado com sucesso.",
      cliente: resultado.rows[0]
    });

  } catch (error) {
    console.error("Erro ao criar cliente:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao criar perfil de cliente."
    });
  }
}


// BUSCAR O PRÓPRIO PERFIL
async function buscarMeuCliente(req, res) {
  try {
    const idUsuario = req.usuario.id_usuario;

    const resultado = await pool.query(
      `
      SELECT
        c.id_usuario,
        u.nome_usuario,
        u.email_usuario,
        c.peso_cliente,
        c.altura_cliente,
        c.data_nascimento_cliente
      FROM cliente c
      INNER JOIN usuario u
        ON u.id_usuario = c.id_usuario
      WHERE c.id_usuario = $1
      `,
      [idUsuario]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Perfil de cliente não encontrado."
      });
    }

    return res.status(200).json({
      cliente: resultado.rows[0]
    });

  } catch (error) {
    console.error("Erro ao buscar cliente:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao buscar perfil de cliente."
    });
  }
}


// ATUALIZAR O PRÓPRIO PERFIL
async function atualizarMeuCliente(req, res) {
  try {
    const idUsuario = req.usuario.id_usuario;

    const {
      peso_cliente,
      altura_cliente,
      data_nascimento_cliente
    } = req.body;

    const clienteAtual = await pool.query(
      `
      SELECT *
      FROM cliente
      WHERE id_usuario = $1
      `,
      [idUsuario]
    );

    if (clienteAtual.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Perfil de cliente não encontrado."
      });
    }

    const atual = clienteAtual.rows[0];

    const novoPeso =
      peso_cliente !== undefined
        ? peso_cliente
        : atual.peso_cliente;

    const novaAltura =
      altura_cliente !== undefined
        ? altura_cliente
        : atual.altura_cliente;

    const novaDataNascimento =
      data_nascimento_cliente !== undefined
        ? data_nascimento_cliente
        : atual.data_nascimento_cliente;

    const erroValidacao = validarDadosCliente(
      novoPeso,
      novaAltura,
      novaDataNascimento
    );

    if (erroValidacao) {
      return res.status(400).json({
        mensagem: erroValidacao
      });
    }

    const resultado = await pool.query(
      `
      UPDATE cliente
      SET
        peso_cliente = $1,
        altura_cliente = $2,
        data_nascimento_cliente = $3
      WHERE id_usuario = $4

      RETURNING
        id_usuario,
        peso_cliente,
        altura_cliente,
        data_nascimento_cliente
      `,
      [
        novoPeso,
        novaAltura,
        novaDataNascimento,
        idUsuario
      ]
    );

    return res.status(200).json({
      mensagem: "Perfil atualizado com sucesso.",
      cliente: resultado.rows[0]
    });

  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao atualizar perfil."
    });
  }
}


// LISTAR CLIENTES - SOMENTE ADMIN
async function listarClientes(req, res) {
  try {
    const resultado = await pool.query(
      `
      SELECT
        c.id_usuario,
        u.nome_usuario,
        u.email_usuario,
        c.peso_cliente,
        c.altura_cliente,
        c.data_nascimento_cliente
      FROM cliente c
      INNER JOIN usuario u
        ON u.id_usuario = c.id_usuario
      ORDER BY u.nome_usuario
      `
    );

    return res.status(200).json(resultado.rows);

  } catch (error) {
    console.error("Erro ao listar clientes:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao listar clientes."
    });
  }
}


// BUSCAR CLIENTE POR USUÁRIO - ADMIN
async function buscarClientePorId(req, res) {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `
      SELECT
        c.id_usuario,
        u.nome_usuario,
        u.email_usuario,
        c.peso_cliente,
        c.altura_cliente,
        c.data_nascimento_cliente
      FROM cliente c
      INNER JOIN usuario u
        ON u.id_usuario = c.id_usuario
      WHERE c.id_usuario = $1
      `,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Cliente não encontrado."
      });
    }

    return res.status(200).json({
      cliente: resultado.rows[0]
    });

  } catch (error) {
    console.error("Erro ao buscar cliente:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao buscar cliente."
    });
  }
}


module.exports = {
  criarMeuCliente,
  buscarMeuCliente,
  atualizarMeuCliente,
  listarClientes,
  buscarClientePorId
};