
// Cálculos de Perícias
function calcPericia(elementoInput) {
    let valor = parseInt(elementoInput.value) || 0;
    let caixaPai = elementoInput.parentElement;
    let spanMetade = caixaPai.querySelector('.half');
    let spanQuinto = caixaPai.querySelector('.fifth');

    if (spanMetade && spanQuinto) {
        if (valor > 0) {
            spanMetade.innerText = Math.floor(valor / 2);
            spanQuinto.innerText = Math.floor(valor / 5);
        } else {
            spanMetade.innerText = "-";
            spanQuinto.innerText = "-";
        }
    }
    // Dispara o salvamento geral das perícias
    salvarPericias(); 
}

function atualizarDerivados() {
    // Tenta pegar os valores, se não existirem (página inventário), usa 0
    let con = parseInt(document.getElementById('con')?.value) || 0;
    let siz = parseInt(document.getElementById('siz')?.value) || 0;
    let pow = parseInt(document.getElementById('pow')?.value) || 0;
    
    // Se não estamos na página da ficha, paramos aqui
    if (!document.getElementById('hp-max')) return;

    let hpLost = parseInt(document.getElementById('hp-lost').value) || 0;
    let sanLost = parseInt(document.getElementById('san-lost').value) || 0;
    let mpLost = parseInt(document.getElementById('mp-lost').value) || 0;

    let hpMax = Math.floor((con + siz) / 10);
    let sanMax = pow; 
    let mpMax = Math.floor(pow / 5);

    document.getElementById('hp-max').innerText = hpMax;
    document.getElementById('hp-current').innerText = hpMax - hpLost;
    document.getElementById('san-max').innerText = sanMax;
    document.getElementById('san-current').innerText = sanMax - sanLost;
    document.getElementById('mp-max').innerText = mpMax;
    document.getElementById('mp-current').innerText = mpMax - mpLost;
}

// -------------------------------------------------------------------------------


// Adiciona "Ouvinte" em todos os inputs da ficha para salvar auto
document.addEventListener('input', function(e) {
    // Se for um campo da ficha com ID (Atributos, Info)
    if (e.target.id && !e.target.classList.contains('input-pericia')) {
        localStorage.setItem(e.target.id, e.target.value);
    }
    
    // Se for nome de perícia customizada
    if (e.target.classList.contains('input-nome-custom')) {
        salvarPericias();
    }
});

function salvarPericias() {
    // Pega todas as caixas de perícia
    let pericias = document.querySelectorAll('.pericia-item');
    let dadosPericias = [];

    pericias.forEach((item, index) => {
        let inputValor = item.querySelector('.input-pericia');
        let inputNome = item.querySelector('.input-nome-custom');
        
        dadosPericias.push({
            valor: inputValor.value,
            nomeCustom: inputNome ? inputNome.value : null // Salva o nome se for custom
        });
    });

    localStorage.setItem('dadosPericias', JSON.stringify(dadosPericias));
}


// ----------------------------------------------------------------------

// Função de cálculo (caso ainda não tenhas essa versão genérica)
function calcPericia(input) {
    let valor = parseInt(input.value) || 0;
    // Acha os spans vizinhos dentro da mesma div pai (ou avô dependendo da estrutura)
    let parent = input.parentElement; 
    let halfSpan = parent.querySelector('.half');
    let fifthSpan = parent.querySelector('.fifth');

    if(halfSpan && fifthSpan) {
        halfSpan.innerText = Math.floor(valor / 2);
        fifthSpan.innerText = Math.floor(valor / 5);
    }
}

// =================================================================
// 🎯 GESTÃO DE PERÍCIAS E ESPECIALIZAÇÕES
// =================================================================

/**
 * Adiciona uma nova especialização dentro de um container específico.
 * @param {string} idContainer - O ID da div que receberá a nova linha.
 * @param {number} valorBase - O valor numérico inicial (padrão 0).
 */
function addEspecializacao(idContainer, valorBase = 0) {
    const container = document.getElementById(idContainer);

    if (!container) {
        console.error(`❌ Erro: O container '${idContainer}' não foi encontrado!`);
        return;
    }

    const metade = Math.floor(valorBase / 2);
    const quinto = Math.floor(valorBase / 5);

    const novaLinha = document.createElement('div');
    novaLinha.className = 'item-pericia item-especializacao';

    novaLinha.innerHTML = `
        <input type="checkbox" class="check-evoluir" title="Marque para testar evolução">
        <input type="text" class="input-nome-spec" placeholder="Especialização..." value="">
        
        <div class="bloco-valores-pericia">
            <div class="campo-valor">
                <span class="rotulo-valor">Total</span>
                <input type="number" class="val-pericia" value="${valorBase}" min="0" max="99" oninput="atualizarMetadeQuinto(this)">
            </div>
            <div class="campo-valor derivado">
                <span class="rotulo-valor">1/2</span>
                <span class="val-metade">${metade}</span>
            </div>
            <div class="campo-valor derivado">
                <span class="rotulo-valor">1/5</span>
                <span class="val-quinto">${quinto}</span>
            </div>
        </div>

        <button type="button" class="btn-remover" onclick="removerPericiaCustomizada(this)" title="Remover">❌</button>
    `;

    container.appendChild(novaLinha);

    if (typeof salvarAutomaticamente === "function") {
        salvarAutomaticamente();
    }
}

/**
 * Recalcula as frações de 1/2 e 1/5 em tempo real quando o valor muda.
 * @param {HTMLInputElement} inputNumero - O campo numérico alterado.
 */
function atualizarMetadeQuinto(inputNumero) {
    const valor = parseInt(inputNumero.value) || 0;
    const linha = inputNumero.closest('.item-pericia');
    
    if (linha) {
        const campoMetade = linha.querySelector('.val-metade');
        const campoQuinto = linha.querySelector('.val-quinto');
        
        if (campoMetade) campoMetade.textContent = Math.floor(valor / 2);
        if (campoQuinto) campoQuinto.textContent = Math.floor(valor / 5);
    }

    if (typeof salvarAutomaticamente === "function") {
        salvarAutomaticamente();
    }
}

/**
 * Localiza a linha do elemento clicado e remove do HTML.
 * @param {HTMLElement} botao - O botão ❌ clicado pelo jogador.
 */
function removerPericiaCustomizada(botao) {
    // Procura o elemento pai mais próximo que possui a classe .item-pericia
    const linhaPericia = botao.closest('.item-pericia');

    if (linhaPericia) {
        linhaPericia.remove(); // Remove o elemento do HTML

        // Atualiza o salvamento automático do navegador
        if (typeof salvarAutomaticamente === "function") {
            salvarAutomaticamente();
        }
    }
}