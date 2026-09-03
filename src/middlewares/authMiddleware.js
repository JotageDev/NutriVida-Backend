const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        mensagem: "Token não informado."
      });
    }

    const partes = authorization.split(" ");

    if (
      partes.length !== 2 ||
      partes[0] !== "Bearer"
    ) {
      return res.status(401).json({
        mensagem: "Formato de token inválido."
      });
    }

    const token = partes[1];

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = payload;

    next();

  } catch (error) {

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        mensagem: "Token expirado."
      });
    }

    return res.status(401).json({
      mensagem: "Token inválido."
    });
  }
}

module.exports = authMiddleware;