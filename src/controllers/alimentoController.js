const pool = require("../config/database");

async function listarAlimentos(req, res) {
  try {
    const busca = (req.query.busca || "").trim();

    const resultado = await pool.query(
      `
      SELECT
        a.id_alimento,
        a.id_categoria,
        c.nome_categoria,
        a.nome_alimento,
        a.porcao_referencia,
        a.unidade_medida,
        a.calorias_alimento,
        a.proteinas_alimento,
        a.carboidratos_alimento,
        a.gorduras_alimento,
        a.fibras_alimento,
        a.sodio_alimento
      FROM alimento a
      INNER JOIN categoria_alimento c
        ON c.id_categoria = a.id_categoria
      WHERE LOWER(a.nome_alimento) LIKE LOWER($1)
      ORDER BY a.nome_alimento ASC
      `,
      [`%${busca}%`]
    );

    return res.status(200).json({
      alimentos: resultado.rows
    });

  } catch (error) {
    console.error("Erro ao listar alimentos:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao listar alimentos."
    });
  }
}

async function buscarAlimentoPorId(req, res) {
  try {
    const resultado = await pool.query(
      `
      SELECT
        a.id_alimento,
        a.id_categoria,
        c.nome_categoria,
        a.nome_alimento,
        a.porcao_referencia,
        a.unidade_medida,
        a.calorias_alimento,
        a.proteinas_alimento,
        a.carboidratos_alimento,
        a.gorduras_alimento,
        a.fibras_alimento,
        a.sodio_alimento
      FROM alimento a
      INNER JOIN categoria_alimento c
        ON c.id_categoria = a.id_categoria
      WHERE a.id_alimento = $1
      `,
      [req.params.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Alimento não encontrado."
      });
    }

    return res.status(200).json({
      alimento: resultado.rows[0]
    });

  } catch (error) {
    console.error("Erro ao buscar alimento:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao buscar alimento."
    });
  }
}

module.exports = {
  listarAlimentos,
  buscarAlimentoPorId
};