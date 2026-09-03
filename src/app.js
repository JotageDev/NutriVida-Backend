const express = require("express");
const cors = require("cors");

const testeRoutes = require("./routes/testeRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    projeto: "NutriVida",
    status: "Back-End funcionando"
  });
});

app.use("/api/teste", testeRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;
