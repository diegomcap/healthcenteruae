// Form submission handler to redirect to local thank_you.html

/**
 * Function to intercept form submission, send it via AJAX and redirect to thank_you.html
 * @param {HTMLFormElement} form - The form element
 */
function handleFormSubmit(form) {
    // Flag para controlar envios múltiplos
    let isSubmitting = false;
    
    // Remove event listeners anteriores para evitar duplicação
    const clonedForm = form.cloneNode(true);
    form.parentNode.replaceChild(clonedForm, form);
    form = clonedForm;
    
    // Previne o envio normal do formulário
    form.addEventListener('submit', function(event) {
        // Previne múltiplos envios
        if (isSubmitting) {
            event.preventDefault();
            return;
        }
        isSubmitting = true;
        event.preventDefault();
        
        // Obtém a URL de ação do formulário
        const formAction = form.getAttribute('action');
        
        // Cria um objeto FormData com os dados do formulário
        const formData = new FormData(form);
        
        // Show loading indicator (optional)
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner"></span> Sending...';
        submitButton.disabled = true;
        
        // Envia o formulário via fetch API
        fetch(formAction, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            // After successful submission, mark the key as used
            const currentKey = localStorage.getItem('currentAccessKey');
            if (currentKey) {
                const usedKeys = JSON.parse(localStorage.getItem('usedKeys') || '[]');
                if (!usedKeys.includes(currentKey)) {
                    usedKeys.push(currentKey);
                    localStorage.setItem('usedKeys', JSON.stringify(usedKeys));
                }
            }
            
            // Redirect to local thank you page
            window.location.href = 'thank_you.html';
        })
        .catch(error => {
            console.error('Error sending form:', error);
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
            isSubmitting = false;
            alert('An error occurred while sending the form. Please try again.');
        });
    });
}

// Initialize form handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Look for forms that use FormSubmit
    const forms = document.querySelectorAll('form[action*="formsubmit.co"]');
    
    // Apply handler to each form found
    forms.forEach(form => {
        handleFormSubmit(form);
    });
});