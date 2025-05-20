const express = require("express");
const cors = require("cors");
const app = express();

const planilhasRouter = require("./routes/planilhas");

app.use(cors());
app.use(express.json());

// Rotas da API
app.use("/api/planilhas", planilhasRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
