// Security system to ensure all pages can only be accessed after access code validation

// Function to check if user is authenticated
function checkPageSecurity() {
    // List of pages that don't require authentication
    const publicPages = [
        'login.html',
        'already_used.html',
        'thank_you.html'
    ];
    
    // Get current page name
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // If current page is in the public pages list, no authentication needed
    if (publicPages.includes(currentPage)) {
        return true;
    }
    
    const validKeys = JSON.parse(localStorage.getItem('validKeys') || '[]');
    const usedKeys = JSON.parse(localStorage.getItem('usedKeys') || '[]');
    const currentKey = localStorage.getItem('currentAccessKey');
    const adminKey = 'ADMIN2024';

    // If no access key is stored, redirect to login
    if (!currentKey) {
        window.location.href = 'login.html';
        return false;
    }

    // If it's the admin key, allow access
    if (currentKey === adminKey) {
        return true;
    }

    // If the key has already been used, redirect to already used page
    if (usedKeys.includes(currentKey)) {
        window.location.href = 'already_used.html';
        return false;
    }

    // If the key is not valid, redirect to login
    if (!validKeys.includes(currentKey)) {
        window.location.href = 'login.html';
        return false;
    }
    
    // We don't mark the key as used here, this will be done after the user completes the assessment
    // Marking as used should be done in the assessment forms, not during security verification

    return true;
}

// Executa a verificação quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    checkPageSecurity();
});