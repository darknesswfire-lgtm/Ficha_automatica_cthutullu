// Cálculos de Atributos
function calcular(idBase) {
    let input = document.getElementById(idBase);
    let valor = parseInt(input.value) || 0; 
    
    // Salva Força especificamente para o inventário usar
    if(idBase === 'str') localStorage.setItem('forcaPersonagem', valor);

    // Salva o valor deste campo específico
    localStorage.setItem(idBase, input.value);

    let spanMetade = document.getElementById(idBase + "-half");
    let spanQuinto = document.getElementById(idBase + "-fifth");

    if (spanMetade && spanQuinto) {
        if (valor > 0) {
            spanMetade.innerText = Math.floor(valor / 2);
            spanQuinto.innerText = Math.floor(valor / 5);
        } else {
            spanMetade.innerText = "-";
            spanQuinto.innerText = "-";
        }
    }
    atualizarDerivados();
}