const express = require("express");
const router = express.Router();

// Simulação de usuários
const users = [
  { username: "admin", password: "admin123", tipo: "admin" },
  { username: "leitor", password: "leitor123", tipo: "leitor" }
];

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ erro: "Credenciais inválidas" });
  }

  req.session.user = { username: user.username, tipo: user.tipo };
  res.json({ mensagem: "Login bem-sucedido", tipo: user.tipo });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.json({ mensagem: "Logout feito com sucesso" });
});

router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ erro: "Não autenticado" });
  }
  res.json(req.session.user);
});

module.exports = router;


function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.tipo !== "admin") {
    return res.status(403).json({ erro: "Acesso negado" });
  }
  next();
}

module.exports = { requireAdmin };
