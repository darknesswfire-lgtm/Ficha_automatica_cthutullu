/* --- PARTE 1: CÁLCULOS E LÓGICA VISUAL --- */

/* --- VERIFICAÇÃO DE SESSÃO --- */
// Este código roda sozinho assim que a página abre
document.addEventListener("DOMContentLoaded", function() {
    // Verifica se estamos na página que tem a tela de login
    const telaLogin = document.getElementById('tela-login-secreta');
    
    if (telaLogin) {
        "O usuário já fez login nesta aba?"
        if (sessionStorage.getItem('sessaoSADM') === 'ativa') {
            // SIM: Então esconde a tela de login IMEDIATAMENTE
            telaLogin.style.display = 'none';
        }
    }
});


// Carregar Foto
function carregarFoto(event) {
    const arquivo = event.target.files[0];
    if (arquivo) {
        const leitor = new FileReader();
        leitor.onload = function(e) {
            // Salva a imagem (string gigante) na memória
            localStorage.setItem('fotoPersonagem', e.target.result);
            mostrarFoto(e.target.result);
        }
        leitor.readAsDataURL(arquivo);
    }
}

function mostrarFoto(src) {
    const imgPreview = document.getElementById('img-preview');
    const textoUpload = document.querySelector('.texto-upload');
    if (imgPreview && src) {
        imgPreview.src = src;
        imgPreview.style.display = 'block';
        if(textoUpload) textoUpload.style.display = 'none';
    }
}


/* --- FUNÇÕES DE IMAGEM --- */

function carregarFoto(event) {
    const arquivo = event.target.files[0];
    if (arquivo) {
        const leitor = new FileReader();
        leitor.onload = function(e) {
            localStorage.setItem('fotoPersonagem', e.target.result);
            mostrarFoto(e.target.result);
        }
        leitor.readAsDataURL(arquivo);
    }
}

function mostrarFoto(src) {
    const imgPreview = document.getElementById('img-preview');
    const textoUpload = document.querySelector('.texto-upload');
    const btnRemove = document.getElementById('btn-remove-foto');

    if (imgPreview && src) {
        imgPreview.src = src;
        imgPreview.style.display = 'block';
        
        // Mostra o botão de remover
        if(btnRemove) btnRemove.style.display = 'flex'; 
        
        // Esconde o texto
        if(textoUpload) textoUpload.style.display = 'none';
    }
}

// NOVA FUNÇÃO: Remover a foto
function removerFoto(event) {
    // Evita que o clique no X abra a janela de upload sem querer
    if(event) event.stopPropagation();

    // 1. Limpa a memória
    localStorage.removeItem('fotoPersonagem');

    // 2. Reseta o visual
    document.getElementById('img-preview').src = "";
    document.getElementById('img-preview').style.display = 'none';
    document.getElementById('btn-remove-foto').style.display = 'none';
    document.querySelector('.texto-upload').style.display = 'block';

    // 3. Limpa o input (para permitir selecionar a mesma foto se quiseres)
    document.getElementById('upload-foto').value = "";
}




/* --- PARTE 2: SALVAR E CARREGAR (O CÉREBRO) --- */

// Detecta qual página abriu e carrega os dados certos
window.onload = function() {
    // Se estiver na Ficha (index.html)
    if (document.querySelector('.grid-pericias')) {
        carregarFicha();
    }
    // Se estiver no Inventário (inventario.html)
    if (document.getElementById('tabela-inv')) {
        carregarInventario();
    }
};

// --- FICHA ---


function carregarFicha() {
    // 1. Carrega Foto
    let fotoSalva = localStorage.getItem('fotoPersonagem');
    if (fotoSalva) mostrarFoto(fotoSalva);

    // 2. Carrega TODOS os inputs de Texto e Textareas que tenham ID
    // Isto inclui Nome, Jogador, História, Fobias, etc.
    let todosInputs = document.querySelectorAll('input[type="text"][id], textarea[id]');
    
    todosInputs.forEach(input => {
        let valorSalvo = localStorage.getItem(input.id);
        if (valorSalvo) {
            input.value = valorSalvo;
        }
    });

    // 3. Carrega Atributos Numéricos (STR, CON, etc)
    // Precisamos fazer isso separado para disparar o cálculo automático
    let atributos = ['str','con','siz','dex','app','int','pow','edu', 
        'hp-lost', 'san-lost', 'mp-lost', 
        'luck', 'mov', 'db', 'build']; // Adicionei Luck se tiveres


    atributos.forEach(idAttr => {
        let input = document.getElementById(idAttr);
        let valor = localStorage.getItem(idAttr); // Pega da memória
        
        if (input && valor) {
            input.value = valor;
            // Só roda o cálculo se for atributo base (os novos não precisam de calc)
            if(['str','con','siz','dex','app','int','pow','edu'].includes(idAttr)) {
                calcular(idAttr); 
            }
        }
    });


    atributos.forEach(idAttr => {
        let input = document.getElementById(idAttr);
        let valor = localStorage.getItem(idAttr);
        if (input && valor) {
            input.value = valor;
            calcular(idAttr); // Recalcula metades e quintos
        }
    });

    // 4. Carrega Perícias (O código complexo das perícias mantém-se igual)
    let dadosPericias = JSON.parse(localStorage.getItem('dadosPericias'));
    if (dadosPericias) {
        let periciasDOM = document.querySelectorAll('.pericia-item');
        
        periciasDOM.forEach((item, index) => {
            if (dadosPericias[index]) {
                let inputValor = item.querySelector('.input-pericia');
                if(inputValor) inputValor.value = dadosPericias[index].valor;
                
                let inputNome = item.querySelector('.input-nome-custom');
                if (inputNome && dadosPericias[index].nomeCustom) {
                    inputNome.value = dadosPericias[index].nomeCustom;
                }
                
                if(inputValor) calcPericia(inputValor);
            }
        });
    }
    
    atualizarDerivados(); 
}


/* --- FUNÇÃO DE RESET (NOVO PERSONAGEM) --- */

function resetarFicha() {
    // 1. Pergunta de segurança (para não apagar sem querer)
    if (confirm("ATENÇÃO: Isso vai apagar TODOS os dados da ficha e do inventário permanentemente.\n\nTem a certeza que quer criar um novo personagem?")) {
        
        // 2. Limpa toda a memória do navegador para este site
        localStorage.clear();

        // 3. Recarrega a página para ela voltar em branco
        location.reload();
    }
}


/* --- SISTEMA DE LOGIN S.A.D.M. --- */

function acessarSistema() {
    const nome = document.getElementById('agente-nome').value;
    const senha = document.getElementById('agente-senha').value;
    const tela = document.getElementById('tela-login-secreta');
    const erro = document.getElementById('msg-erro');
    

    // Se quiseres que qualquer coisa sirva, remove o if(nome === "")
    if (nome.trim() === "" || senha.trim() === "") {
        erro.style.display = 'block';
        erro.innerText = "⛔ ERRO: IDENTIFICAÇÃO INCOMPLETA";
        return;
    }

    // Efeito sonoro opcional (se quiseres adicionar depois)
    // playSound('access_granted.mp3');

    // Salva o nome do "Agente" na sessão (só dura enquanto o navegador estiver aberto)
    sessionStorage.setItem('agenteLogado', nome);

    // Efeito visual de desbloqueio
    erro.style.display = 'none';
    
    // Muda o texto do botão para "ACESSANDO..."
    const btn = document.querySelector('.caixa-login button');
    btn.innerText = "ACESSO CONCEDIDO...";
    btn.style.backgroundColor = "#2e7d32"; // Verde

    // Espera 1 segundo para dar suspense e depois some
    setTimeout(() => {
        tela.style.opacity = "0"; // Fica transparente
        
        // Depois de ficar transparente, remove da tela para poder clicar na ficha
        setTimeout(() => {
            tela.style.display = "none";
        }, 1500); // Tem de ser igual ou maior que a transition do CSS (1.5s)
    }, 800);
}

// Verifica se já fez login antes (para não pedir toda vez que der F5 se não quiseres)
window.addEventListener('load', function() {
    // Se quiseres que peça login TODA vez, apaga este bloco IF abaixo.
    if (sessionStorage.getItem('agenteLogado')) {
        document.getElementById('tela-login-secreta').style.display = 'none';
    }
});


function acessarSistema() {
    const nome = document.getElementById('agente-nome').value;
    const senha = document.getElementById('agente-senha').value;
    const erro = document.getElementById('msg-erro');
    
    // Validação simples
    if (nome.trim() === "" || senha.trim() === "") {
        erro.style.display = 'block';
        erro.innerText = "⛔ ERRO: IDENTIFICAÇÃO INCOMPLETA";
        return;
    }

    // --- O SEGREDO ESTÁ AQUI ---
    // Salva uma "bandeira" na memória temporária dizendo que já entraste
    sessionStorage.setItem('sessaoSADM', 'ativa'); 
    // ---------------------------

    erro.style.display = 'none';
    
    const btn = document.querySelector('.caixa-login button');
    btn.innerText = "ACESSO CONCEDIDO...";
    btn.style.backgroundColor = "#2e7d32"; 

    const tela = document.getElementById('tela-login-secreta');
    
    setTimeout(() => {
        tela.style.opacity = "0"; 
        setTimeout(() => {
            tela.style.display = "none";
        }, 1500);
    }, 800);
}


// Adiciona uma nova linha de especialização
function addEspecializacao(idContainer, valorBase) {
    const container = document.getElementById(idContainer);
    
    // Cria a div da linha
    const div = document.createElement('div');
    div.className = 'linha-spec';

    // HTML interno da nova linha
    div.innerHTML = `
        <button class="btn-remove-spec" onclick="this.parentElement.remove()">X</button>
        <input type="text" placeholder="Nome (Ex: Biologia)" class="input-nome-custom">
        <input type="number" class="input-pericia" value="${valorBase}" oninput="calcPericia(this)">
        <div class="pericia-derivados">
            <span class="half">${Math.floor(valorBase/2)}</span>|<span class="fifth">${Math.floor(valorBase/5)}</span>
        </div>
    `;

    container.appendChild(div);
}

