document.getElementById("contactForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Validación básica del lado cliente
    const name = this.querySelector('[name="your-name"]').value.trim();
    const email = this.querySelector('[name="your-email"]').value.trim();
    
    if (name.length < 2) {
        alert('El nombre debe tener al menos 2 caracteres');
        return;
    }
    
    if (!email.includes('@')) {
        alert('Por favor ingresa un email válido');
        return;
    }
    
    // Deshabilitar botón y mostrar loading
    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";

    const formData = new FormData(this);
    
    // Usar configuración externa
    const endpoint = CONFIG?.API_ENDPOINT || 'https://fabydev.cl/wp-json/simple-contact/v1/send';
    
    fetch(endpoint, {
        method: "POST",
        body: formData,
        mode: 'cors'
    })
    .then(response => {
        if (CONFIG?.DEBUG) {
            console.log("Status:", response.status);
        }
        
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || `HTTP ${response.status}`);
            });
        }
        
        return response.json();
    })
    .then(data => {
        if (CONFIG?.DEBUG) {
            console.log("Respuesta:", data);
        }
        
        if (data.status === "mail_sent") {
            showMessage("✅ " + data.message, "success");
            document.getElementById("contactForm").reset();
        } else {
            showMessage("❌ " + (data.message || "Error desconocido"), "error");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        
        let userMessage = "❌ Error al enviar el mensaje.";
        
        if (error.message.includes("429")) {
            userMessage = "⏳ Demasiados intentos. Espera un momento antes de intentar nuevamente.";
        } else if (error.message.includes("400")) {
            userMessage = "⚠️ Por favor verifica que todos los campos estén correctos.";
        } else if (error.message.includes("403")) {
            userMessage = "🚫 Acceso no autorizado. Contacta al administrador.";
        }
        
        showMessage(userMessage, "error");
    })
    .finally(() => {
        // Restaurar botón
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    });
});

function showMessage(message, type) {
    alert(message);
}