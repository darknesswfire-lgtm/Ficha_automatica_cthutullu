
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


