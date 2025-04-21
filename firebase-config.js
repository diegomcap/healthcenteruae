// Configuração do Firebase para armazenamento de chaves de acesso

// Inicialização do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCpNBqJC-bhe80e4C6ka7C8QDI6ZPdGM5o",
  authDomain: "assessmentdatabase-uae.firebaseapp.com",
  databaseURL: "https://assessmentdatabase-uae-default-rtdb.firebaseio.com",
  projectId: "assessmentdatabase-uae",
  storageBucket: "assessmentdatabase-uae.firebasestorage.app",
  messagingSenderId: "956944878345",
  appId: "1:956944878345:web:1920989b57a447bdc761d8",
  measurementId: "G-GFD44SSK9V"
};

// Inicializa o Firebase
function initializeFirebase() {
  // Verifica se o Firebase já foi inicializado
  if (!window.firebase || !firebase.apps.length) {
    // Carrega os scripts do Firebase se ainda não estiverem carregados
    const loadFirebaseScripts = () => {
      return new Promise((resolve) => {
        // Verifica se os scripts já foram carregados
        if (typeof firebase !== 'undefined') {
          resolve();
          return;
        }

        // Carrega o script principal do Firebase
        const firebaseScript = document.createElement('script');
        firebaseScript.src = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
        firebaseScript.onload = () => {
          // Carrega o script do Realtime Database
          const databaseScript = document.createElement('script');
          databaseScript.src = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';
          databaseScript.onload = resolve;
          document.head.appendChild(databaseScript);
        };
        document.head.appendChild(firebaseScript);
      });
    };

    // Carrega os scripts e inicializa o Firebase
    return loadFirebaseScripts().then(() => {
      firebase.initializeApp(firebaseConfig);
      console.log('Firebase inicializado com sucesso');
      return firebase;
    });
  }

  // Retorna a instância do Firebase se já estiver inicializada
  console.log('Firebase já inicializado');
  return Promise.resolve(firebase);
}

// Funções para gerenciar chaves no Firebase Realtime Database

// Função para obter todas as chaves válidas do Firebase
async function getValidKeysFromFirebase() {
  try {
    await initializeFirebase();
    const database = firebase.database();
    const snapshot = await database.ref('validKeys').once('value');
    const data = snapshot.val();
    
    // Verificar se os dados são um objeto ou um array
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      // Se for um objeto (formato usado em login.html), converter para array
      console.log('Dados de validKeys no formato de objeto, convertendo para array');
      return Object.keys(data);
    }
    
    // Se for array ou null, retornar como está
    return data || [];
  } catch (error) {
    console.error('Erro ao obter chaves do Firebase:', error);
    // Fallback para localStorage se o Firebase falhar
    return JSON.parse(localStorage.getItem('validKeys') || '[]');
  }
}

// Função para obter todas as chaves usadas do Firebase
async function getUsedKeysFromFirebase() {
  try {
    await initializeFirebase();
    const database = firebase.database();
    const snapshot = await database.ref('usedKeys').once('value');
    const data = snapshot.val();
    
    // Verificar se os dados são um objeto ou um array
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      // Se for um objeto, converter para array
      console.log('Dados de usedKeys no formato de objeto, convertendo para array');
      return Object.keys(data);
    }
    
    // Se for array ou null, retornar como está
    return data || [];
  } catch (error) {
    console.error('Erro ao obter chaves usadas do Firebase:', error);
    // Fallback para localStorage se o Firebase falhar
    return JSON.parse(localStorage.getItem('usedKeys') || '[]');
  }
}

// Função para adicionar uma chave válida ao Firebase
async function addValidKeyToFirebase(key) {
  try {
    await initializeFirebase();
    const database = firebase.database();
    const validKeys = await getValidKeysFromFirebase();
    
    if (!validKeys.includes(key)) {
      validKeys.push(key);
      await database.ref('validKeys').set(validKeys);
      console.log('Chave adicionada ao Firebase com sucesso:', key);
    }
    
    // Atualiza também o localStorage como fallback
    localStorage.setItem('validKeys', JSON.stringify(validKeys));
    return true;
  } catch (error) {
    console.error('Erro ao adicionar chave ao Firebase:', error);
    // Fallback para localStorage se o Firebase falhar
    let localValidKeys = JSON.parse(localStorage.getItem('validKeys') || '[]');
    if (!localValidKeys.includes(key)) {
      localValidKeys.push(key);
      localStorage.setItem('validKeys', JSON.stringify(localValidKeys));
    }
    return false;
  }
}

// Função para marcar uma chave como usada no Firebase
async function markKeyAsUsedInFirebase(key) {
  try {
    await initializeFirebase();
    const database = firebase.database();
    const usedKeys = await getUsedKeysFromFirebase();
    
    if (!usedKeys.includes(key)) {
      usedKeys.push(key);
      await database.ref('usedKeys').set(usedKeys);
      console.log('Chave marcada como usada no Firebase:', key);
    }
    
    // Atualiza também o localStorage como fallback
    localStorage.setItem('usedKeys', JSON.stringify(usedKeys));
    return true;
  } catch (error) {
    console.error('Erro ao marcar chave como usada no Firebase:', error);
    // Fallback para localStorage se o Firebase falhar
    let localUsedKeys = JSON.parse(localStorage.getItem('usedKeys') || '[]');
    if (!localUsedKeys.includes(key)) {
      localUsedKeys.push(key);
      localStorage.setItem('usedKeys', JSON.stringify(localUsedKeys));
    }
    return false;
  }
}

// Exporta as funções para uso em outros arquivos
window.firebaseKeyManager = {
  getValidKeys: getValidKeysFromFirebase,
  getUsedKeys: getUsedKeysFromFirebase,
  addValidKey: addValidKeyToFirebase,
  markKeyAsUsed: markKeyAsUsedInFirebase
};