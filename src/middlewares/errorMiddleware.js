function errorMiddleware(error, req, res, next) {
  console.error(error);

  return res.status(500).json({
    mensagem: "Erro interno do servidor."
  });
}

module.exports = errorMiddleware;
