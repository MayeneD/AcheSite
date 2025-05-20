const express = require("express");
const cors = require("cors");
const session = require("express-session");

const app = express();
const planilhasRouter = require("./routes/planilhas");
const authRouter = require("./routes/auth");

app.use(cors({
  origin: "http://localhost:5500",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "secreto-aché",
  resave: false,
  saveUninitialized: false
}));

// Rotas
app.use("/api/planilhas", planilhasRouter);
app.use("/api/auth", authRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
