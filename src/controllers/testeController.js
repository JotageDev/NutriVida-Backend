const pool = require("../config/database");

async function testarApi(req, res) {
  return res.status(200).json({
    mensagem: "API do NutriVida funcionando!"
  });
}

async function testarBanco(req, res) {
  try {
    const resultado = await pool.query("SELECT NOW() AS data_hora");

    return res.status(200).json({
      mensagem: "Conexão com PostgreSQL funcionando!",
      banco: resultado.rows[0]
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao conectar com o PostgreSQL.",
      erro: error.message
    });
  }
}

module.exports = {
  testarApi,
  testarBanco
};
