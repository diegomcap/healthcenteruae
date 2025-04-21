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
            
            // Verificar se a chave já está marcada como usada no Firebase
            let isUsed = false;
            let validKeys = [];
            if (window.firebaseKeyManager) {
                try {
                    const usedKeys = await window.firebaseKeyManager.getUsedKeys();
                    isUsed = usedKeys.includes(keyParam);
                    // Obter também as chaves válidas para verificar se já existe
                    validKeys = await window.firebaseKeyManager.getValidKeys();
                } catch (error) {
                    console.error('Erro ao verificar chaves usadas:', error);
                    // Fallback para localStorage
                    const localUsedKeys = JSON.parse(localStorage.getItem('usedKeys') || '[]');
                    isUsed = localUsedKeys.includes(keyParam);
                    validKeys = JSON.parse(localStorage.getItem('validKeys') || '[]');
                }
            } else {
                // Fallback para localStorage
                const localUsedKeys = JSON.parse(localStorage.getItem('usedKeys') || '[]');
                isUsed = localUsedKeys.includes(keyParam);
                validKeys = JSON.parse(localStorage.getItem('validKeys') || '[]');
            }
            
            // Se a chave não estiver marcada como usada e não estiver já na lista de válidas, adicionar à lista de chaves válidas
            if (!isUsed && !validKeys.includes(keyParam)) {
                if (window.firebaseKeyManager) {
                    await window.firebaseKeyManager.addValidKey(keyParam);
                    console.log('Chave adicionada ao Firebase com sucesso:', keyParam);
                } else {
                    // Fallback para localStorage se o Firebase não estiver disponível
                    let validKeys = JSON.parse(localStorage.getItem('validKeys') || '[]');
                    if (!validKeys.includes(keyParam)) {
                        validKeys.push(keyParam);
                        localStorage.setItem('validKeys', JSON.stringify(validKeys));
                        console.log('Chave compartilhada adicionada com sucesso (localStorage):', keyParam);
                    }
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
            // Obter chaves válidas do Firebase
            validKeys = await window.firebaseKeyManager.getValidKeys();
            
            // Sincronizar chaves válidas do localStorage com o Firebase
            const localValidKeys = JSON.parse(localStorage.getItem('validKeys') || '[]');
            let syncedNewKeys = 0;
            
            // Adicionar chaves locais que não estão no Firebase
            for (const key of localValidKeys) {
                if (!validKeys.includes(key)) {
                    await window.firebaseKeyManager.addValidKey(key);
                    syncedNewKeys++;
                    // Adicionar à lista local de validKeys para contabilização correta
                    validKeys.push(key);
                }
            }
            
            // Atualizar localStorage com chaves do Firebase
            localStorage.setItem('validKeys', JSON.stringify(validKeys));
            console.log(`Sincronização completa! Adicionadas ${syncedNewKeys} novas chaves ao Firebase.`);
            
            // Obter chaves usadas do Firebase
            usedKeys = await window.firebaseKeyManager.getUsedKeys();
            
            // Atualizar localStorage com chaves usadas do Firebase
            localStorage.setItem('usedKeys', JSON.stringify(usedKeys));
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
    // Mas apenas se não estiver na página de agradecimento ou nos formulários de avaliação
    const assessmentPages = ['physiotherapy_assessment_form.html', 'pilates_assessment_form.html', 'consent_terms_physiotherapy.html', 'consent_terms_pilates.html', 'thank_you.html'];
    const isAssessmentPage = assessmentPages.some(page => window.location.pathname.includes(page));
    
    // Se for a chave de admin ou estiver na lista de chaves válidas, continua a verificação
    // Caso contrário, redireciona para o login
    if (!validKeys.includes(currentKey) && currentKey !== adminKey && !isAssessmentPage) {
        window.location.href = 'login.html';
        return false;
    }
    
    // Se a chave já foi usada, redireciona para página de chave já utilizada
    // Mas apenas se não estiver na página de agradecimento ou nos formulários de avaliação
    if (usedKeys.includes(currentKey) && !isAssessmentPage) {
        window.location.href = 'already_used.html';
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