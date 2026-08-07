// --- INVENTÁRIO ---

// Função que carrega o inventário salvo e corrige o bug de texto
function carregarInventario() {
    // TRAVA DE SEGURANÇA: Se não achar o campo de carga, para por aqui!
    if (!document.getElementById('carga-max')) return;

    let cargaSalva = localStorage.getItem('cargaMaxManual') || 0;
    document.getElementById('carga-max').value = cargaSalva;

    let dadosInv = JSON.parse(localStorage.getItem('dadosInventario'));
    let corpoTabela = document.querySelector('#tabela-inv tbody');

    corpoTabela.innerHTML = ""; // Limpa para não duplicar

    if (dadosInv && dadosInv.length > 0) {
        dadosInv.forEach(item => {
            let novaLinha = corpoTabela.insertRow();
            novaLinha.innerHTML = `
                <td><input type="text" value="${item.nome}" oninput="salvarInventario()"></td>
                <td><textarea rows="2" oninput="salvarInventario()">${item.desc}</textarea></td>
                <td><input type="number" class="peso-item" value="${item.peso}" oninput="calcularPeso(); salvarInventario()"></td>
                <td><button class="btn-remover" onclick="removerLinha(this)">X</button></td>
            `;
        });
    } else {
        adicionarItem();
    }
    
    calcularPeso(); // Força o cálculo inicial ao abrir a página
}
// Função atualizada para enxergar o <textarea> e salvar os itens do inventário
function salvarInventario(){
    let tabela = document.querySelector("#tabela-inv tbody");
    let linhas = tabela.getElementsByTagName("tr");
    let inventario = [];

    // O código vai varrer linha por linha da sua tabela
    for (let i = 0; i < linhas.length; i++) {
        let colunas = linhas[i].getElementsByTagName("td");
        
        // Pega o NOME (que é um input normal)
        let nomeItem = colunas[0].querySelector("input").value;
        
        // Pega os DETALHES (que agora é um textarea)
        let descItem = colunas[1].querySelector("textarea").value;
        
        // Pega o PESO (que é um input de número)
        let pesoItem = colunas[2].querySelector("input").value;

        // Guarda no pacote do inventário
        inventario.push({ 
            nome: nomeItem, 
            desc: descItem, 
            peso: pesoItem 
        });
    }

    // Salva o pacote completo na gaveta do navegador
    localStorage.setItem('dadosInventario', JSON.stringify(inventario));
}


// Função de adicionar linha corrigida
function adicionarItem() {
    let tabela = document.querySelector("#tabela-inv tbody");
    let novaLinha = tabela.insertRow();
    novaLinha.innerHTML = `
        <td><input type="text" placeholder="Item" oninput="salvarInventario()"></td>
        <td><textarea rows="2" placeholder="Detalhes" oninput="salvarInventario()"></textarea></td>
        <td><input type="number" class="peso-item" value="0" oninput="calcularPeso(); salvarInventario()"></td>
        <td><button class="btn-remover" onclick="removerLinha(this)">X</button></td>
    `;
    // Não precisa chamar salvarInventario() direto aqui, só se o usuário digitar algo
}

// Função para salvar a carga máxima digitada manualmente
function salvarCargaMax() {
    let valorCarga = document.getElementById('carga-max').value;
    localStorage.setItem('cargaMaxManual', valorCarga);
}


function removerLinha(botao) {
    let linha = botao.parentNode.parentNode;
    linha.parentNode.removeChild(linha);
    salvarInventario();
}

function calcularPeso() {
    // Agora pegamos o .value porque é um input
    let cargaMaxTexto = document.getElementById('carga-max').value; 
    let cargaMax = parseInt(cargaMaxTexto) || 0;
    
    // ... (o resto do código fica igual)
    let itens = document.getElementsByClassName('peso-item');
    let pesoTotal = 0;

    for (let i = 0; i < itens.length; i++) {
        pesoTotal += parseFloat(itens[i].value) || 0;
    }

    let displayAtual = document.getElementById('carga-atual');
    if(displayAtual) {
        displayAtual.innerText = pesoTotal;
        let aviso = document.getElementById('aviso-sobrecarga');
        if (pesoTotal > cargaMax && cargaMax > 0) {
            displayAtual.style.color = "#ff4d4d";
            aviso.style.display = "block";
        } else {
            displayAtual.style.color = "#aaa";
            aviso.style.display = "none";
        }
    }
}

function atualizarCapacidade() {
    // 1. Pega o valor da Força (Certifique-se que o ID no HTML é 'forca' ou 'atributo-forca')
    // Se o seu input de força tiver outro ID, mude aqui embaixo onde diz "forca"
    const forca = document.getElementById("forca").value; 
    
    // 2. Define a regra. (Geralmente é igual à força, ou força/5 para itens grandes)
    // Aqui estou colocando que o Máximo é igual ao valor da Força.
    const capacidadeMaxima = parseInt(forca) || 0;

    // 3. Joga esse valor para o mostrador do inventário
    const mostradorMaximo = document.getElementById("capacidade-maxima");
    
    if (mostradorMaximo) {
        mostradorMaximo.innerText = capacidadeMaxima;
    }
}

