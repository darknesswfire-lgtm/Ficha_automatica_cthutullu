// =================================================================
// 📷 SISTEMA DE FOTO COMPLETO (UPLOAD, DRAG & DROP E REMOÇÃO)
// =================================================================

/**
 * 1. Processa a imagem selecionada pelo input do arquivo
 */
function carregarFoto(event) {
    const arquivo = event.target.files[0];
    if (arquivo) {
        processarEMostrarFoto(arquivo);
    }
}

/**
 * Converte, redimensiona via Canvas (512x512) e centraliza mantendo a proporção original.
 */
function processarEMostrarFoto(arquivo) {
    if (!arquivo.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem válido!');
        return;
    }

    const leitor = new FileReader();

    leitor.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
            // 1. Cria um Canvas invisível em memória de exatamente 512x512px
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 512;
            canvas.height = 512;

            // 2. Preenche o fundo do canvas com tom escuro elegante
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, 512, 512);

            // 3. Calcula a escala ideal para não distorcer (Proporção Aspect Ratio)
            const escala = Math.min(512 / img.width, 512 / img.height);
            const larguraFinal = img.width * escala;
            const alturaFinal = img.height * escala;

            // 4. Centraliza a imagem no meio do quadrado
            const posicaoX = (512 - larguraFinal) / 2;
            const posicaoY = (512 - alturaFinal) / 2;

            // 5. Desenha a foto otimizada
            ctx.drawImage(img, posicaoX, posicaoY, larguraFinal, alturaFinal);

            // 6. Converte para Base64 leve e em alta definição (qualidade 92%)
            const base64Otimizado = canvas.toDataURL('image/jpeg', 0.92);

            // Exibe e grava no localStorage
            exibirFotoNaTela(base64Otimizado);
            localStorage.setItem('foto_investigador_base64', base64Otimizado);
        };

        img.src = e.target.result;
    };

    leitor.readAsDataURL(arquivo);
}

/**
 * 3. Exibe a imagem no elemento <img> e ajusta a visibilidade dos botões
 */
function exibirFotoNaTela(srcBase64) {
    const imgPreview = document.getElementById('img-preview');
    const textoUpload = document.querySelector('.texto-upload');
    const btnRemove = document.getElementById('btn-remove-foto');

    if (imgPreview && textoUpload && btnRemove) {
        imgPreview.src = srcBase64;
        imgPreview.style.display = 'block';
        textoUpload.style.display = 'none';
        btnRemove.style.display = 'block';
    }
}

/**
 * 4. Remove a foto da tela e limpa o localStorage
 */
function removerFoto(event) {
    // Evita que o clique no botão 'X' abra a janela de seleção de arquivos
    if (event) event.stopPropagation();

    const imgPreview = document.getElementById('img-preview');
    const textoUpload = document.querySelector('.texto-upload');
    const btnRemove = document.getElementById('btn-remove-foto');
    const inputFoto = document.getElementById('upload-foto');

    // Reseta os elementos visuais
    if (imgPreview) {
        imgPreview.src = '';
        imgPreview.style.display = 'none';
    }
    if (textoUpload) textoUpload.style.display = 'block';
    if (btnRemove) btnRemove.style.display = 'none';
    if (inputFoto) inputFoto.value = '';

    // Apaga do armazenamento
    localStorage.removeItem('foto_investigador_base64');
}

/**
 * 5. Configura os eventos de Arrastar e Soltar (Drag & Drop)
 */
function inicializarDragAndDrop() {
    const quadro = document.getElementById('quadro-foto-512');
    if (!quadro) return;

    // Impede o comportamento padrão do navegador de abrir a imagem numa aba nova
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(nomeEvento => {
        quadro.addEventListener(nomeEvento, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    // Destaca a caixa quando a imagem estiver sobrevoando
    ['dragenter', 'dragover'].forEach(nomeEvento => {
        quadro.addEventListener(nomeEvento, () => {
            quadro.style.borderColor = '#d4af37'; // Borda dourada ao arrastar
            quadro.style.background = '#2a2a1a';
        }, false);
    });

    // Remove o destaque ao sair ou soltar
    ['dragleave', 'drop'].forEach(nomeEvento => {
        quadro.addEventListener(nomeEvento, () => {
            quadro.style.borderColor = '#555'; // Volta à cor original
            quadro.style.background = '#222';
        }, false);
    });

    // Processa o arquivo quando solto na área
    quadro.addEventListener('drop', (e) => {
        const arquivos = e.dataTransfer.files;
        if (arquivos.length > 0) {
            processarEMostrarFoto(arquivos[0]);
        }
    }, false);

    // Carrega a foto que já estava salva ao abrir o site
    carregarFotoSalva();
}

/**
 * 6. Restaura a foto do localStorage ao carregar a página
 */
function carregarFotoSalva() {
    const fotoSalva = localStorage.getItem('foto_investigador_base64');
    if (fotoSalva) {
        exibirFotoNaTela(fotoSalva);
    }
}

// Inicializa o sistema assim que a página termina de carregar
window.addEventListener('DOMContentLoaded', inicializarDragAndDrop);