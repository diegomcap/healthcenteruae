// Auth0 SDK para autenticação JWT
let auth0 = null;

// Configuração do Auth0
const configureAuth0 = async () => {
  auth0 = await createAuth0Client({
    domain: 'SEU-DOMINIO.auth0.com', // Substitua pelo seu domínio Auth0
    client_id: 'SEU-CLIENT-ID', // Substitua pelo seu Client ID
    redirect_uri: window.location.origin + '/login.html',
    cacheLocation: 'localstorage'
  });
};

// Verificar se o usuário está autenticado
const isAuthenticated = async () => {
  if (!auth0) {
    await configureAuth0();
  }
  return await auth0.isAuthenticated();
};

// Login
const login = async () => {
  if (!auth0) {
    await configureAuth0();
  }
  await auth0.loginWithRedirect();
};

// Logout
const logout = async () => {
  if (!auth0) {
    await configureAuth0();
  }
  await auth0.logout({
    returnTo: window.location.origin + '/login.html'
  });
};

// Obter token JWT
const getToken = async () => {
  if (!auth0) {
    await configureAuth0();
  }
  const token = await auth0.getTokenSilently();
  return token;
};

// Obter informações do usuário
const getUserInfo = async () => {
  if (!auth0) {
    await configureAuth0();
  }
  return await auth0.getUser();
};

// Verificar se o usuário é admin
const isAdmin = async () => {
  const user = await getUserInfo();
  // Você pode usar roles ou metadata do Auth0 para definir admins
  return user && user['https://seu-namespace/roles'] && 
         user['https://seu-namespace/roles'].includes('admin');
};

// Verificar autenticação na página
const checkAuthentication = async () => {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    window.location.href = 'login.html';
    return false;
  }
  
  // Para páginas de admin, verificar se o usuário é admin
  if (window.location.pathname.includes('admin.html')) {
    const admin = await isAdmin();
    if (!admin) {
      window.location.href = 'login.html';
      return false;
    }
  }
  
  return true;
};