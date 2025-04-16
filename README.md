# Sistema de Acesso - Health & Pilates Center

Este é um sistema local de gerenciamento de chaves de acesso para o Health & Pilates Center.

## Estrutura do Sistema

- `keys.json`: Armazena as chaves de acesso válidas
- `admin.html`: Painel de administração para gerenciar chaves
- `login.html`: Página de login para validação de acesso
- `server.py`: Servidor local para gerenciar o armazenamento de chaves

## Configuração Inicial

1. Instale o Python 3.x em seu computador
2. Instale o Flask usando o comando: `pip install flask`
3. Execute o servidor local: `python server.py`
4. Acesse o sistema através do navegador: `http://localhost:3000`

## Funcionalidades

- Geração de novas chaves de acesso
- Validação de chaves
- Controle de chaves já utilizadas
- Acesso administrativo protegido

## Observações

- O sistema funciona completamente offline
- As chaves são armazenadas localmente em arquivo JSON
- O sistema mantém registro de chaves já utilizadas no localStorage do navegador