// Função para verificar se o usuário está autenticado
function checkAuthentication() {
    const validKeys = JSON.parse(localStorage.getItem('validKeys') || '[]');
    const usedKeys = JSON.parse(localStorage.getItem('usedKeys') || '[]');
    const currentKey = localStorage.getItem('currentAccessKey');
    const adminKey = 'ADMIN2024';

    // If there is no stored access key
    if (!currentKey) {
        window.location.href = 'login.html';
        return false;
    }

    // If it's the admin key, allow access
    if (currentKey === adminKey) {
        return true;
    }

    // If the key has already been used, redirect to the already used key page
    if (usedKeys.includes(currentKey)) {
        window.location.href = 'already_used.html';
        return false;
    }

    // If the key is not valid, redirect to login
    if (!validKeys.includes(currentKey)) {
        window.location.href = 'login.html';
        return false;
    }

    return true;
}

// Executa a verificação quando a página carrega
document.addEventListener('DOMContentLoaded', checkAuthentication);