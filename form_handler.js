// Form handler to redirect to consent terms page after submission

/**
 * Function to intercept form submission, send via AJAX and redirect to consent terms page
 * @param {HTMLFormElement} form - The form element
 */
function handleFormSubmit(form) {
    // Prevent normal form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form action URL
        const formAction = form.getAttribute('action');
        
        // Create FormData object with form data
        const formData = new FormData(form);
        
        // Get client name for email subject
        const clientName = form.querySelector('#name').value;
        const formType = form.id === 'physiotherapyForm' ? 'Physiotherapy' : 'Pilates';
        formData.set('_subject', `New ${formType} Assessment - ${clientName}`);
        
        // Show loading indicator
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner"></span> Sending...';
        submitButton.disabled = true;
        
        // Store form data in localStorage for use in consent page
        const formDataObj = {};
        for (const [key, value] of formData.entries()) {
            formDataObj[key] = value;
        }
        localStorage.setItem('formData', JSON.stringify(formDataObj));
        
        // Send form via fetch API
        fetch(formAction, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            // Mark access key as used after successful submission
            const currentKey = localStorage.getItem('currentAccessKey');
            if (currentKey) {
                const usedKeys = JSON.parse(localStorage.getItem('usedKeys') || '[]');
                if (!usedKeys.includes(currentKey)) {
                    usedKeys.push(currentKey);
                    localStorage.setItem('usedKeys', JSON.stringify(usedKeys));
                }
            }
            
            // Redirect to appropriate consent terms page based on form type
            if (formType === 'Physiotherapy') {
                window.location.href = 'consent_terms_physiotherapy.html';
            } else {
                window.location.href = 'consent_terms_pilates.html';
            }
        })
        .catch(error => {
            console.error('Error sending form:', error);
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
            alert('An error occurred while sending the form. Please try again.');
        });
    });
}

// Inicializa os manipuladores de formulário quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Procura por formulários que usam FormSubmit
    const forms = document.querySelectorAll('form[action*="formsubmit.co"]');
    
    // Aplica o manipulador a cada formulário encontrado
    forms.forEach(form => {
        handleFormSubmit(form);
    });
});