
const pool = require("../config/database");

// LISTAR TAREFAS
async function listarTarefas(req, res) {
  try {
    const resultado = await pool.query(
      `
      SELECT
        id_tarefa,
        nome_tarefa,
        descricao_tarefa,
        data_tarefa,
        horario_tarefa,
        status_tarefa
      FROM tarefa
      WHERE id_cliente = $1
      ORDER BY
        data_tarefa ASC,
        horario_tarefa ASC NULLS LAST,
        id_tarefa ASC
      `,
      [req.usuario.id_usuario]
    );

    return res.status(200).json({
      tarefas: resultado.rows
    });

  } catch (error) {
    console.error("Erro ao listar tarefas:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao listar tarefas."
    });
  }
}

// CRIAR TAREFA
async function criarTarefa(req, res) {
  try {
    const {
      nome_tarefa,
      descricao_tarefa,
      data_tarefa,
      horario_tarefa
    } = req.body;

    if (!nome_tarefa || !data_tarefa) {
      return res.status(400).json({
        mensagem: "Nome e data da tarefa são obrigatórios."
      });
    }

    const resultado = await pool.query(
      `
      INSERT INTO tarefa
      (
        id_cliente,
        nome_tarefa,
        descricao_tarefa,
        data_tarefa,
        horario_tarefa
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id_tarefa,
        nome_tarefa,
        descricao_tarefa,
        data_tarefa,
        horario_tarefa,
        status_tarefa
      `,
      [
        req.usuario.id_usuario,
        nome_tarefa.trim(),
        descricao_tarefa?.trim() || null,
        data_tarefa,
        horario_tarefa || null
      ]
    );

    return res.status(201).json({
      tarefa: resultado.rows[0]
    });

  } catch (error) {
    console.error("Erro ao criar tarefa:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao criar tarefa."
    });
  }
}

// EDITAR TAREFA
async function editarTarefa(req, res) {
  try {
    const {
      nome_tarefa,
      descricao_tarefa,
      data_tarefa,
      horario_tarefa
    } = req.body;

    if (!nome_tarefa || !data_tarefa) {
      return res.status(400).json({
        mensagem: "Nome e data da tarefa são obrigatórios."
      });
    }

    const resultado = await pool.query(
      `
      UPDATE tarefa
      SET
        nome_tarefa = $1,
        descricao_tarefa = $2,
        data_tarefa = $3,
        horario_tarefa = $4
      WHERE id_tarefa = $5
        AND id_cliente = $6
      RETURNING
        id_tarefa,
        nome_tarefa,
        descricao_tarefa,
        data_tarefa,
        horario_tarefa,
        status_tarefa
      `,
      [
        nome_tarefa.trim(),
        descricao_tarefa?.trim() || null,
        data_tarefa,
        horario_tarefa || null,
        req.params.id,
        req.usuario.id_usuario
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Tarefa não encontrada."
      });
    }

    return res.status(200).json({
      mensagem: "Tarefa atualizada com sucesso.",
      tarefa: resultado.rows[0]
    });

  } catch (error) {
    console.error("Erro ao editar tarefa:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao editar tarefa."
    });
  }
}

// ATUALIZAR STATUS
async function atualizarStatusTarefa(req, res) {
  try {
    const { status_tarefa } = req.body;

    if (
      !["PENDENTE", "CONCLUIDA", "CANCELADA"].includes(status_tarefa)
    ) {
      return res.status(400).json({
        mensagem: "Status de tarefa inválido."
      });
    }

    const resultado = await pool.query(
      `
      UPDATE tarefa
      SET status_tarefa = $1
      WHERE id_tarefa = $2
        AND id_cliente = $3
      RETURNING
        id_tarefa,
        nome_tarefa,
        descricao_tarefa,
        data_tarefa,
        horario_tarefa,
        status_tarefa
      `,
      [
        status_tarefa,
        req.params.id,
        req.usuario.id_usuario
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Tarefa não encontrada."
      });
    }

    return res.status(200).json({
      tarefa: resultado.rows[0]
    });

  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao atualizar tarefa."
    });
  }
}

// EXCLUIR TAREFA
async function excluirTarefa(req, res) {
  try {
    const resultado = await pool.query(
      `
      DELETE FROM tarefa
      WHERE id_tarefa = $1
        AND id_cliente = $2
      RETURNING id_tarefa
      `,
      [
        req.params.id,
        req.usuario.id_usuario
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Tarefa não encontrada."
      });
    }

    return res.status(200).json({
      mensagem: "Tarefa excluída com sucesso."
    });

  } catch (error) {
    console.error("Erro ao excluir tarefa:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao excluir tarefa."
    });
  }
}

// EXPORTAR FUNÇÕES
module.exports = {
  listarTarefas,
  criarTarefa,
  editarTarefa,
  atualizarStatusTarefa,
  excluirTarefa
};
