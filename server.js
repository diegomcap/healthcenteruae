const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Função para garantir que o arquivo keys.json existe
async function ensureKeysFile() {
    const keysPath = path.join(__dirname, 'keys.json');
    try {
        await fs.access(keysPath);
    } catch {
        // Se o arquivo não existir, cria com estrutura padrão
        await fs.writeFile(keysPath, JSON.stringify({
            validKeys: [],
            adminKey: 'ADMIN2024'
        }, null, 4));
    }
}

// Rota para obter as chaves
app.get('/keys', async (req, res) => {
    try {
        await ensureKeysFile();
        const data = await fs.readFile(path.join(__dirname, 'keys.json'), 'utf8');
        const keysData = JSON.parse(data);
        res.json(keysData);
    } catch (error) {
        console.error('Erro ao ler as chaves:', error);
        res.status(500).json({ error: 'Erro ao ler as chaves', details: error.message });
    }
});

// Rota para atualizar as chaves
app.put('/keys', async (req, res) => {
    try {
        if (!req.body || !Array.isArray(req.body.validKeys)) {
            return res.status(400).json({ error: 'Formato de dados inválido' });
        }

        await ensureKeysFile();
        await fs.writeFile(
            path.join(__dirname, 'keys.json'),
            JSON.stringify(req.body, null, 4)
        );
        res.json({ success: true, message: 'Chaves atualizadas com sucesso' });
    } catch (error) {
        console.error('Erro ao salvar as chaves:', error);
        res.status(500).json({ error: 'Erro ao salvar as chaves', details: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});