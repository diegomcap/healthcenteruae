// Sistema de segurança para garantir que todas as páginas só possam ser acessadas após validação do código de acesso
// Integrado com Firebase para armazenamento em nuvem das chaves

// Carrega o script de configuração do Firebase
document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('firebase-config-script')) {
        const script = document.createElement('script');
        script.id = 'firebase-config-script';
        script.src = 'firebase-config.js';
        script.async = true;
        document.head.appendChild(script);
    }
});

// Função para sincronizar chaves com o Firebase e GitHub Pages
async function syncKeysWithGitHub() {
    // Sempre considerar como ambiente web para permitir compartilhamento entre dispositivos
    // Isso garante que as chaves funcionem em qualquer lugar do mundo, não apenas na mesma rede
    const isWebEnvironment = true;
    
    // Usar parâmetros de URL para chaves em qualquer ambiente
    if (isWebEnvironment) {
        // Tentar obter chaves de parâmetros de URL se disponíveis
        const urlParams = new URLSearchParams(window.location.search);
        const keyParam = urlParams.get('key');
        
        if (keyParam) {
            // Armazenar a chave atual - funciona em qualquer dispositivo em qualquer lugar do mundo
            localStorage.setItem('currentAccessKey', keyParam);
            
            // Adicionar à lista de chaves válidas no Firebase se não existir
            // Isso permite que a mesma chave seja usada em diferentes dispositivos
            if (window.firebaseKeyManager) {
                await window.firebaseKeyManager.addValidKey(keyParam);
            } else {
                // Fallback para localStorage se o Firebase não estiver disponível
                let validKeys = JSON.parse(localStorage.getItem('validKeys') || '[]');
                if (!validKeys.includes(keyParam)) {
                    validKeys.push(keyParam);
                    localStorage.setItem('validKeys', JSON.stringify(validKeys));
                    console.log('Chave compartilhada adicionada com sucesso (localStorage):', keyParam);
                }
            }
            
            // Remover parâmetro da URL para segurança, mas manter a chave ativa na sessão
            // A chave permanece válida no banco de dados mesmo após a remoção da URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Retornar true para indicar que uma chave foi sincronizada
            return true;
        }
    }
    
    // Retornar false se nenhuma chave foi sincronizada
    return false;
}

// Função para verificar se o usuário está autenticado
async function checkPageSecurity() {
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
    
    // Sincronizar chaves com Firebase e GitHub Pages
    await syncKeysWithGitHub();
    
    // Tenta obter as chaves do Firebase primeiro, com fallback para localStorage
    let validKeys = [];
    let usedKeys = [];
    
    if (window.firebaseKeyManager) {
        try {
            validKeys = await window.firebaseKeyManager.getValidKeys();
            usedKeys = await window.firebaseKeyManager.getUsedKeys();
            console.log('Chaves obtidas do Firebase com sucesso');
        } catch (error) {
            console.error('Erro ao obter chaves do Firebase:', error);
            // Fallback para localStorage
            validKeys = JSON.parse(localStorage.getItem('validKeys') || '[]');
            usedKeys = JSON.parse(localStorage.getItem('usedKeys') || '[]');
        }
    } else {
        // Fallback para localStorage se o Firebase não estiver disponível
        validKeys = JSON.parse(localStorage.getItem('validKeys') || '[]');
        usedKeys = JSON.parse(localStorage.getItem('usedKeys') || '[]');
    }
    
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
    // Aguarda o carregamento do script do Firebase antes de verificar a segurança
    if (document.getElementById('firebase-config-script')) {
        document.getElementById('firebase-config-script').onload = function() {
            // Aguarda um momento para garantir que o Firebase esteja inicializado
            setTimeout(() => {
                checkPageSecurity();
            }, 1000);
        };
    } else {
        // Se o script do Firebase não foi carregado, verifica a segurança diretamente
        checkPageSecurity();
    }
});