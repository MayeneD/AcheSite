const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../data/planilhas.json");

// 🔧 Rota que o front-end precisa para listar todas as planilhas
router.get("/", (req, res) => {
  const data = fs.readFileSync(dbPath);
  const planilhas = JSON.parse(data);
  res.json(planilhas);
});

// Rota para retornar o conteúdo de um CSV específico
router.get("/:id/csv", (req, res) => {
  const id = parseInt(req.params.id);
  const data = fs.readFileSync(dbPath);
  const planilhas = JSON.parse(data);
  const planilha = planilhas.find(p => p.id === id);

  if (!planilha) {
    return res.status(404).json({ erro: "Planilha não encontrada" });
  }

  const arquivoPath = path.join(__dirname, `../data/planilhas/${planilha.arquivo}`);

  if (!fs.existsSync(arquivoPath)) {
    return res.status(404).json({ erro: "Arquivo CSV não encontrado" });
  }

  const conteudo = fs.readFileSync(arquivoPath, "utf-8");
  res.send(conteudo);
});

module.exports = router;


//comentarios teste do git