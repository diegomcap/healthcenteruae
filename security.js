// Sistema de segurança para garantir que todas as páginas só possam ser acessadas após validação do código de acesso

// Função para sincronizar chaves com o GitHub Pages
function syncKeysWithGitHub() {
    // Verificar se estamos em ambiente GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    // Se estamos no GitHub Pages, usar parâmetros de URL para chaves
    if (isGitHubPages) {
        // Tentar obter chaves de parâmetros de URL se disponíveis
        const urlParams = new URLSearchParams(window.location.search);
        const keyParam = urlParams.get('key');
        
        if (keyParam) {
            // Armazenar a chave atual
            localStorage.setItem('currentAccessKey', keyParam);
            
            // Adicionar à lista de chaves válidas se não existir
            let validKeys = JSON.parse(localStorage.getItem('validKeys') || '[]');
            if (!validKeys.includes(keyParam)) {
                validKeys.push(keyParam);
                localStorage.setItem('validKeys', JSON.stringify(validKeys));
            }
            
            // Remover parâmetro da URL para segurança
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

// Função para verificar se o usuário está autenticado
function checkPageSecurity() {
    // Lista de páginas que não precisam de autenticação
    const publicPages = [
        'login.html',
        'already_used.html'
    ];
    
    // Obtém o nome da página atual
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Se a página atual estiver na lista de páginas públicas, não precisa verificar autenticação
    if (publicPages.includes(currentPage)) {
        return true;
    }
    
    // Sincronizar chaves com GitHub Pages
    syncKeysWithGitHub();
    
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
    
    // Não registramos a chave como usada aqui, isso será feito após o usuário completar a avaliação
    // A marcação como usada deve ser feita nos formulários de avaliação, não durante a verificação de segurança

    return true;
}

// Executa a verificação quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    checkPageSecurity();
});