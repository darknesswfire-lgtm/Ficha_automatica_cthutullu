
// 1. Função que o botão chama ao digitar a senha
// =================================================================
// 🔐 AUTENTICAÇÃO COM HASH CRIPTOGRÁFICO (SHA-256)
// =================================================================

/**
 * Converte qualquer texto para um Hash SHA-256 usando a Web Crypto API
 * @param {string} texto - A senha digitada pelo usuário
 * @returns {Promise<string>} O hash de 64 caracteres
 */
async function gerarHashSHA256(texto) {
    const encoder = new TextEncoder();
    const dados = encoder.encode(texto);
    const bufferHash = await crypto.subtle.digest('SHA-256', dados);
    const arrayHash = Array.from(new Uint8Array(bufferHash));
    
    // Converte cada byte em representação hexadecimal de 2 dígitos
    return arrayHash.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Valida a senha digitada comparando os hashes criptográficos
 */
async function acessarSistema() {
    const campoSenha = document.getElementById('codigo-acesso');
    const msgErro = document.getElementById('msg-erro');
    const senhaDigitada = campoSenha ? campoSenha.value.trim() : "";


    const hashCorreto = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";

    if (!senhaDigitada) {
        if (msgErro) msgErro.style.display = 'block';
        return;
    }

    // Converte a senha digitada no momento para hash
    const hashDigitado = await gerarHashSHA256(senhaDigitada);

    // Compara os dois hashes
    if (hashDigitado === hashCorreto) {
        // Grava a sessão autorizada no navegador
        sessionStorage.setItem('acessoSADM', 'autorizado');

        // Transição de tela
        const telaLogin = document.getElementById('tela-login-secreta');
        const conteudoPrincipal = document.getElementById('conteudo-principal');

        if (telaLogin) telaLogin.style.display = 'none';
        if (conteudoPrincipal) conteudoPrincipal.style.display = 'block';
        if (msgErro) msgErro.style.display = 'none';

    } else {
        // Exibe erro e limpa o campo
        if (msgErro) msgErro.style.display = 'block';
        campoSenha.value = "";
    }
}

// 2. NOVA FUNÇÃO: Verifica se o agente já tem a pulseira VIP
function verificarAcessoPrevio() {
    // Procura no navegador se o acesso já foi autorizado antes
    let acesso = sessionStorage.getItem('acessoSADM');
    
    // Se o valor for 'autorizado', pula a tela de login automaticamente
    if (acesso === 'autorizado') {
        document.getElementById('tela-login-secreta').style.display = 'none';
        document.getElementById('conteudo-principal').style.display = 'block';
    }
}

// 3. Dispara a verificação assim que a página termina de carregar
// Isso garante que a verificação ocorra na fração de segundo em que o jogador volta do Inventário
window.addEventListener('DOMContentLoaded', verificarAcessoPrevio);

// =================================================================
// 💾 EXPORTAR FICHA (Gera o arquivo .json automaticamente)
// =================================================================
function exportarFichaJSON() {
    try {
        let dadosFicha = {};

        // 1. Varre a página e pega automaticamente TODOS os campos que têm um ID
        document.querySelectorAll('input, textarea, select').forEach(campo => {
            if (campo.id && campo.type !== 'file') {
                if (campo.type === 'checkbox') {
                    dadosFicha[campo.id] = campo.checked; // Salva se está marcado ou não
                } else {
                    dadosFicha[campo.id] = campo.value;   // Salva o texto ou número
                }
            }
        });

        // 2. Pega também o que estiver salvo no inventário (localStorage)
        dadosFicha._inventario_salvo = JSON.parse(localStorage.getItem('dadosInventario')) || [];
        dadosFicha._carga_max_salva = localStorage.getItem('cargaMaxManual') || 0;

        // 3. Converte tudo em texto JSON bonito e formatado
        let jsonString = JSON.stringify(dadosFicha, null, 4);

        // 4. Cria o arquivo na memória e força o download
        let blob = new Blob([jsonString], { type: "application/json" });
        let url = URL.createObjectURL(blob);
        let linkTemporario = document.createElement("a");

        // Define o nome do arquivo usando o nome do personagem (ou 'ficha_cthulhu' se estiver vazio)
        let nomeInput = document.getElementById('nome-investigador');
        let nomePersonagem = (nomeInput && nomeInput.value.trim() !== "") ? nomeInput.value.trim() : "investigador";
        
        linkTemporario.download = `${nomePersonagem.replace(/\s+/g, '_')}_cthulhu.json`;
        linkTemporario.href = url;

        document.body.appendChild(linkTemporario);
        linkTemporario.click();
        document.body.removeChild(linkTemporario);
        URL.revokeObjectURL(url);

        console.log("✅ Ficha exportada com sucesso:", dadosFicha);
    } catch (erro) {
        alert("❌ Erro ao exportar ficha. Abra o console (F12) para ver detalhes.");
        console.error("Erro na exportação:", erro);
    }
}


// =================================================================
// 📂 IMPORTAR FICHA (Lê o .json e preenche a tela)
// =================================================================
function importarFichaJSON(event) {
    let arquivo = event.target.files[0];
    if (!arquivo) return;

    let leitor = new FileReader();

    leitor.onload = function(e) {
        try {
            let dadosCarregados = JSON.parse(e.target.result);

            // 1. Preenche automaticamente todos os campos da tela usando os IDs
            for (let id in dadosCarregados) {
                // Pula as chaves internas do inventário por enquanto
                if (id.startsWith('_')) continue; 

                let campo = document.getElementById(id);
                if (campo) {
                    if (campo.type === 'checkbox') {
                        campo.checked = dadosCarregados[id];
                    } else {
                        campo.value = dadosCarregados[id];
                    }
                }
            }

            // 2. Restaura os dados do inventário no localStorage
            if (dadosCarregados._inventario_salvo) {
                localStorage.setItem('dadosInventario', JSON.stringify(dadosCarregados._inventario_salvo));
            }
            if (dadosCarregados._carga_max_salva !== undefined) {
                localStorage.setItem('cargaMaxManual', dadosCarregados._carga_max_salva);
            }

            alert("📂 Ficha carregada com sucesso!");

            // 3. Força os cálculos automáticos a rodarem para atualizar Metade/Quinto
            if (typeof calcularAtributos === "function") calcularAtributos();
            if (typeof carregarInventario === "function") carregarInventario();

        } catch (erro) {
            alert("❌ O arquivo selecionado não é um JSON válido.");
            console.error("Erro na importação:", erro);
        }
    };

    leitor.readAsText(arquivo);
    event.target.value = ""; // Limpa o input
}



// =================================================================
// 🧠 SALVAMENTO AUTOMÁTICO (localStorage)
// =================================================================

// 1. Salva tudo no navegador em segundo plano à medida que o usuário digita
function salvarAutomaticamente() {
    try {
        let dadosFicha = {};

        // Varre todos os campos com ID e salva o valor
        document.querySelectorAll('input, textarea, select').forEach(campo => {
            if (campo.id && campo.type !== 'file') {
                if (campo.type === 'checkbox') {
                    dadosFicha[campo.id] = campo.checked;
                } else {
                    dadosFicha[campo.id] = campo.value;
                }
            }
        });

        // Grava na memória permanente do navegador
        localStorage.setItem('ficha_cthulhu_autosave', JSON.stringify(dadosFicha));
    } catch (erro) {
        console.error("Erro no salvamento automático:", erro);
    }
}

// 2. Carrega os dados salvos assim que a página é aberta
function carregarSalvoAutomatico() {
    let dadosSalvos = localStorage.getItem('ficha_cthulhu_autosave');
    if (!dadosSalvos) return; // Se não tem nada salvo ainda, não faz nada

    try {
        let dadosCarregados = JSON.parse(dadosSalvos);

        for (let id in dadosCarregados) {
            let campo = document.getElementById(id);
            if (campo) {
                if (campo.type === 'checkbox') {
                    campo.checked = dadosCarregados[id];
                } else {
                    campo.value = dadosCarregados[id];
                }
            }
        }

        console.log("🔄 Ficha restaurada automaticamente da memória do navegador!");

        // Recalcula os status após preencher os dados
        if (typeof calcularAtributos === "function") calcularAtributos();
        if (typeof carregarInventario === "function") carregarInventario();
    } catch (erro) {
        console.error("Erro ao carregar salvamento automático:", erro);
    }
}

// 3. Ouve qualquer digitação na página para disparar o salvamento automático
document.addEventListener('input', function(event) {
    // Só salva se o elemento mexido tiver um ID
    if (event.target && event.target.id && event.target.type !== 'file') {
        salvarAutomaticamente();
    }
});


// =================================================================
// 🗑️ LIMPAR FICHA (Para criar um novo personagem)
// =================================================================
function limparFicha() {
    if (confirm("⚠️ Tem certeza que deseja apagar todos os dados da ficha para criar um novo personagem? Isso não apagará seus arquivos .json já exportados.")) {
        localStorage.removeItem('ficha_cthulhu_autosave');
        localStorage.removeItem('dadosInventario');
        localStorage.removeItem('cargaMaxManual');
        location.reload(); // Recarrega a página limpa
    }
}


// =================================================================
// 💾 EXPORTAR FICHA (Gera o arquivo .json no PC)
// =================================================================
function exportarFichaJSON() {
    try {
        // Antes de exportar, garante que o autosave está atualizado
        salvarAutomaticamente();

        let dadosSalvos = localStorage.getItem('ficha_cthulhu_autosave');
        let dadosFicha = dadosSalvos ? JSON.parse(dadosSalvos) : {};

        // Adiciona os dados do inventário (se existirem)
        dadosFicha._inventario_salvo = JSON.parse(localStorage.getItem('dadosInventario')) || [];
        dadosFicha._carga_max_salva = localStorage.getItem('cargaMaxManual') || 0;

        let jsonString = JSON.stringify(dadosFicha, null, 4);

        let blob = new Blob([jsonString], { type: "application/json" });
        let url = URL.createObjectURL(blob);
        let linkTemporario = document.createElement("a");

        let nomeInput = document.getElementById('nome-investigador');
        let nomePersonagem = (nomeInput && nomeInput.value.trim() !== "") ? nomeInput.value.trim() : "investigador";
        
        linkTemporario.download = `${nomePersonagem.replace(/\s+/g, '_')}_cthulhu.json`;
        linkTemporario.href = url;

        document.body.appendChild(linkTemporario);
        linkTemporario.click();
        document.body.removeChild(linkTemporario);
        URL.revokeObjectURL(url);

        console.log("✅ Ficha exportada com sucesso!");
    } catch (erro) {
        alert("❌ Erro ao exportar ficha. Abra o console (F11/F12) para ver detalhes.");
        console.error("Erro na exportação:", erro);
    }
}


// =================================================================
// 📂 IMPORTAR FICHA (Lê o .json do PC e preenche a tela)
// =================================================================
function importarFichaJSON(event) {
    let arquivo = event.target.files[0];
    if (!arquivo) return;

    let leitor = new FileReader();

    leitor.onload = function(e) {
        try {
            let dadosCarregados = JSON.parse(e.target.result);

            for (let id in dadosCarregados) {
                if (id.startsWith('_')) continue; 

                let campo = document.getElementById(id);
                if (campo) {
                    if (campo.type === 'checkbox') {
                        campo.checked = dadosCarregados[id];
                    } else {
                        campo.value = dadosCarregados[id];
                    }
                }
            }

            if (dadosCarregados._inventario_salvo) {
                localStorage.setItem('dadosInventario', JSON.stringify(dadosCarregados._inventario_salvo));
            }
            if (dadosCarregados._carga_max_salva !== undefined) {
                localStorage.setItem('cargaMaxManual', dadosCarregados._carga_max_salva);
            }

            // ATUALIZA O SALVAMENTO AUTOMÁTICO COM OS DADOS RECÉM-IMPORTADOS
            salvarAutomaticamente();

            alert("📂 Ficha carregada com sucesso!");

            if (typeof calcularAtributos === "function") calcularAtributos();
            if (typeof carregarInventario === "function") carregarInventario();

        } catch (erro) {
            alert("❌ O arquivo selecionado não é um JSON válido.");
            console.error("Erro na importação:", erro);
        }
    };

    leitor.readAsText(arquivo);
    event.target.value = "";
}

// 🚀 Dispara o carregamento automático logo que a página termina de abrir
window.addEventListener('DOMContentLoaded', carregarSalvoAutomatico);