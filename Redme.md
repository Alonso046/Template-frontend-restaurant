# 🍔 Menú Digital - Frontend (Cliente Web)

Interfaz de usuario dinámica y responsiva para un sistema de pedidos y delivery. Diseñada con un enfoque "Mobile-First" y construida íntegramente con tecnologías web nativas para garantizar el máximo rendimiento y un control absoluto sobre el DOM.

## 🚀 Características Principales

*   **Catálogo Dinámico:** Consumo asíncrono de una API RESTful (FastAPI) para renderizar categorías y productos en tiempo real.
*   **Gestión de Estado Local:** Manejo del carrito de compras en la memoria del navegador (`Vanilla JS`), permitiendo agregar, restar y eliminar productos sin recargar la página.
*   **Panel Lateral (Off-canvas Cart):** Implementación de un *sidebar* interactivo para el carrito, mejorando la retención y experiencia del usuario (UX).
*   **Checkout vía WhatsApp:** Consolidación de la orden y comunicación con el backend para generar una redirección automatizada a la API de WhatsApp con el pedido estructurado.
*   **Modo Oscuro Nativo:** Diseño UI moderno utilizando variables CSS (`:root`), transiciones suaves y fondos animados.

## 💻 Stack Tecnológico

*   **Estructura:** HTML5 Semántico
*   **Estilos:** CSS3 (Flexbox, CSS Grid, Custom Properties, Animaciones Keyframes)
*   **Lógica y Control:** JavaScript Vanilla (ES6+)
*   **Peticiones HTTP:** Fetch API (Promesas y Async/Await)

## ⚙️ Arquitectura del Cliente

El código se mantiene modular y fácil de escalar:
1.  **`index.html`**: Define la estructura base, incluyendo el contenedor del menú y el esqueleto del panel lateral oculto.
2.  **`styles.css`**: Separa el diseño en bloques lógicos (Reset, Layout, Tarjetas, Sidebar, Botones Flotantes) sin depender de librerías externas.
3.  **`app.js`**: Actúa como el controlador de la aplicación.
    *   `initApp()`: Orquesta la carga inicial resolviendo múltiples promesas en paralelo (`Promise.all`).
    *   `updateCartUI()`: Funciona como un motor de renderizado reactivo, recalculando totales y repintando el DOM del carrito cada vez que el estado cambia.

## 🛠️ Instalación y Uso Local

1. Clonar el repositorio:
   ```bash
   git clone [https://github.com/TU_USUARIO/template-frontend-restaurant.git](https://github.com/TU_USUARIO/template-frontend-restaurant.git)