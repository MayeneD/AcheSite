function processarCSVTexto(csvTexto) {
    const tabelaFiltrada = document.querySelector("#tabelaFiltrada tbody");
    const tabelaSempre = document.querySelector("#tabelaSempre tbody");
    const mensagemVazia = document.getElementById("mensagemVazia");

    tabelaFiltrada.innerHTML = "";
    tabelaSempre.innerHTML = "";
    mensagemVazia.textContent = "";

    const filtroSegmento = document.getElementById("segmento").value;
    const filtroCategoria = document.getElementById("categoria").value;
    const filtroFase = document.getElementById("fase").value;

    const linhas = csvTexto.split("\n").slice(1);
    let contador = 0;

    linhas.forEach(linha => {
        const colunas = linha.includes(";") ? linha.split(";") : linha.split(",");
        if (colunas.length >= 10) {
            const [numero, classificacao, categoria, fase, condicao, tarefa, duracao, comofazer, documento, concluido] = colunas.map(c => c.trim());

            const correspondeSegmento = !filtroSegmento || filtroSegmento === "nenhuma" || classificacao.toLowerCase().trim() === filtroSegmento.toLowerCase().trim();
            const correspondeCategoria = !filtroCategoria || filtroCategoria === "nenhuma" || categoria.toLowerCase().trim() === filtroCategoria.toLowerCase().trim();
            const correspondeFase = !filtroFase || filtroFase === "nenhuma" || fase.toLowerCase().trim() === filtroFase.toLowerCase().trim();

            const obrigatoria = condicao.toLowerCase() === "sempre";

            if (obrigatoria || (correspondeSegmento && correspondeCategoria && correspondeFase)) {
                const novaLinha = document.createElement("tr");
                novaLinha.innerHTML = `
                    <td>${numero}</td>
                    <td>${tarefa}</td>
                    <td>${fase}</td>
                    <td>${condicao}</td>
                    <td>${duracao}</td>
                    <td>${comofazer}</td>
                    <td>${documento}</td>
                    <td>${concluido}</td>
                `;

                if (obrigatoria) {
                    tabelaSempre.appendChild(novaLinha);
                } else {
                    tabelaFiltrada.appendChild(novaLinha);
                    contador++;
                }
            }
        }
    });

    if (contador === 0) {
        let msg = "Não há nenhuma atividade";

        if (filtroSegmento && filtroSegmento !== "nenhuma") {
            msg += ` de ${filtroSegmento}`;
        }
        if (filtroCategoria && filtroCategoria !== "nenhuma") {
            msg += ` com ${filtroCategoria}`;
        }
        if (filtroFase && filtroFase !== "nenhuma") {
            msg += ` na fase ${filtroFase}`;
        }

        msg += " neste arquivo.";
        mensagemVazia.textContent = msg;
    }
}

function processarCSV() {
    const fileInput = document.getElementById("csvFile");
    if (!fileInput.files.length) {
        alert("Por favor, selecione um arquivo .csv");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        processarCSVTexto(e.target.result);
    };
    
    reader.readAsText(fileInput.files[0]); 
}

// Exportar CSV
document.getElementById("exportarCSV").addEventListener("click", () => {
    const tabela = document.querySelector("#tabelaFiltrada");
    const linhas = tabela.querySelectorAll("tr");

    if (linhas.length <= 1) {
        alert("Nenhum cronograma gerado para exportar.");
        return;
    }

    let csv = [];

    linhas.forEach(linha => {
        const colunas = linha.querySelectorAll("th, td");
        let linhaCSV = [];
        colunas.forEach(coluna => {
            const texto = coluna.innerText.replace(/"/g, '""');
            linhaCSV.push(`"${texto}"`);
        });
        csv.push(linhaCSV.join(";"));
    });

    const bom = "\uFEFF";
    const blob = new Blob([bom + csv.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "cronograma_filtrado.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

async function carregarPlanilhas() {
    const lista = document.getElementById("listaPlanilhas");
    lista.innerHTML = "<li>Carregando...</li>";

    try {
        const response = await fetch("http://localhost:3000/api/planilhas");
        const planilhas = await response.json();

        if (planilhas.length === 0) {
            lista.innerHTML = "<li>Nenhuma planilha disponível.</li>";
            return;
        }

        lista.innerHTML = "";

        planilhas.forEach(p => {
            const item = document.createElement("li");
            item.innerHTML = `${p.nome} (${p.categoria} - ${p.fase}) <button>Carregar</button>`;
            item.querySelector("button").addEventListener("click", () => {
                carregarCSVDaAPI(p.id);
            });
            lista.appendChild(item);
        });
    } catch (err) {
        console.error("Erro ao carregar planilhas:", err);
        lista.innerHTML = "<li>Erro ao carregar planilhas.</li>";
    }
}

function carregarCSVDaAPI(id) {
    fetch(`http://localhost:3000/api/planilhas/${id}/csv`)
        .then(res => res.text())
        .then(csv => {
            console.log("CSV recebido da API:", csv);
            processarCSVTexto(csv);
        })
        .catch(err => {
            console.error("Erro ao carregar CSV:", err);
            alert("Erro ao carregar o cronograma.");
        });
}

document.addEventListener("DOMContentLoaded", () => {
    carregarPlanilhas();
});


document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

if (res.ok) {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("loginStatus").textContent = `Logado como ${data.tipo}`;

  // Exibir formulário e tabela para qualquer logado
  document.getElementById("formularioSection").style.display = "block";
  document.getElementById("tabelaResultado").style.display = "block";
  document.getElementById("planilhasSection").style.display = "block";

  if (data.tipo === "admin") {
    document.getElementById("uploadSection").style.display = "block";
  }

  carregarPlanilhas();
}
