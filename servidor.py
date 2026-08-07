from flask import Flask, request, jsonify  # type: ignore[import-not-found]
from flask_cors import CORS  # type: ignore[import-not-found]
import json
import os


# Cria o servidor
app = Flask(__name__)
CORS(app) # Permite que seu HTML converse com este servidor

ARQUIVO_BD = 'banco_de_dados.json' # Nosso cofre de arquivo

# Rota para RECEBER a ficha do JavaScript e salvar
@app.route('/salvar', methods=['POST'])
def salvar_ficha():
    dados = request.json
    # Abre o cofre e guarda os dados
    with open(ARQUIVO_BD, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=4)
    return jsonify({"mensagem": "Ficha salva com sucesso pelo Python!"})

# Rota para ENVIAR a ficha de volta para o JavaScript
@app.route('/carregar', methods=['GET'])
def carregar_ficha():
    # Verifica se o cofre existe
    if os.path.exists(ARQUIVO_BD):
        with open(ARQUIVO_BD, 'r', encoding='utf-8') as f:
            dados = json.load(f)
        return jsonify(dados)
    return jsonify({}) # Retorna vazio se ninguém salvou nada ainda

if __name__ == '__main__':
    print("🐙 Servidor do Diretor rodando na porta 5000 (Modo Local)...")
    app.run(debug=True, port=5000)