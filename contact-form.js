document.getElementById("contactForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Configuración directa (no sensible, es una URL pública)
    const API_ENDPOINT = 'https://fabydev.cl/wp-json/simple-contact/v1/send';
    const IS_LOCAL = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
    
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
    
    // Debug solo en local
    if (IS_LOCAL) {
        console.log('Entorno: Local');
        console.log('Endpoint:', API_ENDPOINT);
        console.log('Datos del formulario:');
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
    }
    
    fetch(API_ENDPOINT, {
        method: "POST",
        body: formData,
        mode: 'cors'
    })
    .then(response => {
        if (IS_LOCAL) {
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
        if (IS_LOCAL) {
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
            userMessage = "🚫 Acceso no autorizado. El servidor no permite peticiones desde este dominio.";
        } else if (error.message.includes("404")) {
            userMessage = "🔗 Endpoint no encontrado. Verifica que el plugin esté activado.";
        } else if (error.message.includes("Failed to fetch")) {
            userMessage = "🌐 Error de conexión. Verifica tu internet o que el servidor esté funcionando.";
        }
        
        showMessage(userMessage + (IS_LOCAL ? '\nDetalles: ' + error.message : ''), "error");
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