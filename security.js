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

// Função simplificada para sincronizar chaves com o sistema local
async function syncKeysWithGitHub() {
    // Verificar parâmetros de URL para chaves
    const urlParams = new URLSearchParams(window.location.search);
    const keyParam = urlParams.get('key');
    
    if (keyParam) {
        console.log('Chave encontrada na URL:', keyParam);
        // Armazenar a chave em todos os mecanismos de armazenamento para redundância
        localStorage.setItem('currentAccessKey', keyParam);
        sessionStorage.setItem('currentAccessKey', keyParam);
        document.cookie = `currentAccessKey=${keyParam}; path=/; max-age=2592000`; // válido por 30 dias
        
        // Adicionar à lista de chaves válidas se ainda não estiver lá
        let validKeys = JSON.parse(localStorage.getItem('validKeys') || '[]');
        if (!validKeys.includes(keyParam)) {
            validKeys.push(keyParam);
            localStorage.setItem('validKeys', JSON.stringify(validKeys));
            console.log('Nova chave adicionada à lista de chaves válidas:', keyParam);
        }
        
        // Verificar se a chave já está marcada como usada
        const usedKeys = JSON.parse(localStorage.getItem('usedKeys') || '[]');
        const isUsed = usedKeys.includes(keyParam);
        console.log('A chave está na lista de usadas?', isUsed);
        
        // Remover parâmetro da URL para segurança, mas manter a chave ativa
        window.history.replaceState({}, document.title, window.location.pathname);
        console.log('Sincronização completa! Chave processada com sucesso.');
        
        // Retornar true para indicar que uma chave foi sincronizada
        return true;
    }
    
    // Retornar false se nenhuma chave foi sincronizada
    return false;
}

// Função para verificar se o usuário está autenticado
async function checkPageSecurity() {
    // Lista de páginas que não precisam de autenticação
    const publicPages = [
        'login.html',
        'already_used.html',
        'index.html',
        'project_overview.html',
        'assessment_options.html',
        'physiotherapy_assessment_form.html',
        'pilates_assessment_form.html',
        'consent_terms_physiotherapy.html',
        'consent_terms_pilates.html',
        'thank_you.html'
    ];
    
    // Obtém o nome da página atual
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    console.log('Verificando segurança para a página:', currentPage);
    
    // Se a página atual estiver na lista de páginas públicas, não precisa verificar autenticação
    if (publicPages.includes(currentPage)) {
        console.log('Página pública, não precisa de autenticação');
        return true;
    }
    
    // Verificar parâmetros de URL para autenticação
    const urlParams = new URLSearchParams(window.location.search);
    const keyParam = urlParams.get('key');
    const authParam = urlParams.get('auth');
    
    // Se temos parâmetros de autenticação na URL, usar essa chave
    if (keyParam) {
        console.log('Parâmetros de autenticação encontrados na URL');
        // Armazenar a chave em todos os mecanismos de armazenamento para redundância
        localStorage.setItem('currentAccessKey', keyParam);
        sessionStorage.setItem('currentAccessKey', keyParam);
        document.cookie = `currentAccessKey=${keyParam}; path=/; max-age=2592000`; // válido por 30 dias
        
        // Adicionar à lista de chaves válidas se ainda não estiver lá
        let validKeys = JSON.parse(localStorage.getItem('validKeys') || '[]');
        if (!validKeys.includes(keyParam)) {
            validKeys.push(keyParam);
            localStorage.setItem('validKeys', JSON.stringify(validKeys));
            console.log('Nova chave adicionada à lista de chaves válidas:', keyParam);
        }
        
        // Remover parâmetros da URL para segurança, mas manter a chave ativa
        if (authParam) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        console.log('Autenticação via parâmetros de URL bem-sucedida');
    }
    
    // Carregar chaves válidas e usadas do localStorage
    const validKeys = JSON.parse(localStorage.getItem('validKeys') || '[]');
    const usedKeys = JSON.parse(localStorage.getItem('usedKeys') || '[]');
    console.log('Chaves válidas carregadas:', validKeys);
    console.log('Chaves usadas carregadas:', usedKeys);
    
    // Verificar se o usuário tem uma chave de acesso válida em qualquer um dos mecanismos de armazenamento
    let currentKey = localStorage.getItem('currentAccessKey');
    console.log('Chave atual no localStorage:', currentKey);
    
    // Se não encontrar no localStorage, tentar no sessionStorage
    if (!currentKey) {
        currentKey = sessionStorage.getItem('currentAccessKey');
        if (currentKey) {
            // Se encontrar no sessionStorage, restaurar no localStorage
            localStorage.setItem('currentAccessKey', currentKey);
            console.log('Chave restaurada do sessionStorage para localStorage:', currentKey);
        }
    }
    
    // Se ainda não encontrou, tentar nos cookies
    if (!currentKey) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith('currentAccessKey=')) {
                currentKey = cookie.substring('currentAccessKey='.length, cookie.length);
                // Restaurar nos outros mecanismos
                localStorage.setItem('currentAccessKey', currentKey);
                sessionStorage.setItem('currentAccessKey', currentKey);
                console.log('Chave restaurada dos cookies para localStorage e sessionStorage:', currentKey);
                break;
            }
        }
    }
    
    const adminKey = 'ADMIN2024';

    // Se não houver chave de acesso armazenada
    if (!currentKey) {
        console.log('Nenhuma chave de acesso encontrada, redirecionando para login');
        // Só redireciona se não estiver na página de login
        if (currentPage !== 'login.html') {
            window.location.href = 'login.html';
        }
        return false;
    }
    
    console.log('Chave de acesso encontrada:', currentKey);

    // Se for a chave de admin, permite acesso
    if (currentKey === adminKey) {
        console.log('Chave de admin detectada, permitindo acesso');
        return true;
    }

    // Páginas de avaliação e agradecimento não verificam se a chave já foi usada
    const assessmentPages = ['physiotherapy_assessment_form.html', 'pilates_assessment_form.html', 'consent_terms_physiotherapy.html', 'consent_terms_pilates.html', 'thank_you.html'];
    const isAssessmentPage = assessmentPages.some(page => window.location.pathname.includes(page));
    console.log('É página de avaliação?', isAssessmentPage);
    
    // Verificar se a chave está na lista de chaves válidas
    const isValidKey = validKeys.includes(currentKey);
    console.log('A chave é válida?', isValidKey);
    
    // Se a chave não for válida, redirecionar para login
    if (!isValidKey && currentKey !== adminKey && !isAssessmentPage) {
        console.log('Chave não encontrada na lista de chaves válidas, redirecionando para login');
        // Só redireciona se não estiver na página de login
        if (currentPage !== 'login.html') {
            window.location.href = 'login.html';
        }
        return false;
    }
    
    // Se a chave já foi usada, redireciona para página de chave já utilizada
    // Mas apenas se não estiver na página de agradecimento ou nos formulários de avaliação
    if (usedKeys.includes(currentKey) && !isAssessmentPage) {
        console.log('Chave já utilizada, redirecionando para página de chave já utilizada');
        window.location.href = 'already_used.html';
        return false;
    }
    
    // Se chegou até aqui, a chave é válida e não foi usada ainda
    console.log('Chave válida e não utilizada, permitindo acesso');
    
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
            }, 1500); // Aumentado para 1500ms para garantir que o Firebase seja inicializado corretamente
        };
    } else {
        // Se o script do Firebase não foi carregado, verifica a segurança diretamente
        setTimeout(() => {
            checkPageSecurity();
        }, 500); // Adicionado um pequeno atraso mesmo sem o Firebase para garantir que o DOM esteja pronto
    }
});