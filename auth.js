// Função para verificar se o usuário está autenticado
function checkAuthentication() {
    const validKeys = JSON.parse(localStorage.getItem('validKeys') || '[]');
    const usedKeys = JSON.parse(localStorage.getItem('usedKeys') || '[]');
    const currentKey = localStorage.getItem('currentAccessKey');
    const adminKey = 'ADMIN2024';

    // Se não houver chave de acesso armazenada
    if (!currentKey) {
        window.location.href = 'login.html';
        return false;
    }

    // Se for a chave de admin, permite acesso
    if (currentKey === adminKey) {
        return true;
    }

    // Se a chave já foi usada, redireciona para página de chave já utilizada
    if (usedKeys.includes(currentKey)) {
        window.location.href = 'already_used.html';
        return false;
    }

    // Se a chave não for válida, redireciona para o login
    if (!validKeys.includes(currentKey)) {
        window.location.href = 'login.html';
        return false;
    }

    return true;
}

// Executa a verificação quando a página carrega
document.addEventListener('DOMContentLoaded', checkAuthentication);