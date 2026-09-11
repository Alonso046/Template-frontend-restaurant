// URL base de tu backend en FastAPI
const API_BASE_URL = "http://127.0.0.1:8000";

// Estado global de la aplicación
let allProducts = [];
let cart = {}; // Estructura: { id_producto: { ...datos, quantity: 1 } }

// Referencias al DOM (HTML)
const productsContainer = document.getElementById('products-container');
const categoriesContainer = document.getElementById('categories-container');
const cartItemsList = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const orderForm = document.getElementById('order-form');
const btnSubmit = document.getElementById('btn-submit-order');

// 1. Inicializar la app: Descargar datos de PostgreSQL
async function initApp() {
    try {
        // Ejecutar ambas peticiones en paralelo para mayor velocidad
        const [catRes, prodRes] = await Promise.all([
            fetch(`${API_BASE_URL}/catalog/categories/`),
            fetch(`${API_BASE_URL}/catalog/products/`)
        ]);

        const categories = await catRes.json();
        allProducts = await prodRes.json();

        renderCategories(categories);
        filterProducts('all'); // Mostrar todos los productos al inicio
    } catch (error) {
        console.error("Error de conexión:", error);
        productsContainer.innerHTML = "<p>Error al conectar con el servidor. Verifica que Uvicorn esté corriendo.</p>";
        categoriesContainer.innerHTML = "";
    }
}

// 2. Renderizar los botones de Categorías
function renderCategories(categories) {
    // Botón "Todos" por defecto
    categoriesContainer.innerHTML = `<button class="active" onclick="filterProducts('all')">Todos</button>`;
    
    categories.forEach(cat => {
        if (cat.is_active) {
            categoriesContainer.innerHTML += `<button onclick="filterProducts(${cat.id})">${cat.name}</button>`;
        }
    });
}

// 3. Filtrar y renderizar las tarjetas de Productos
window.filterProducts = (categoryId) => {
    let filtered = allProducts;
    if (categoryId !== 'all') {
        filtered = allProducts.filter(p => p.category_id === categoryId);
    }

    productsContainer.innerHTML = '';
    
    if (filtered.length === 0) {
        productsContainer.innerHTML = '<p>No hay productos disponibles.</p>';
        return;
    }

    filtered.forEach(prod => {
        if (prod.is_available) {
            // Se inyecta la imagen. Si no hay URL, ponemos un color oscuro por defecto.
            const imgHtml = prod.image_url 
                ? `<img src="${prod.image_url}" alt="${prod.name}" class="product-image">`
                : `<div class="product-image" style="background-color: #2a2f4c;"></div>`;

            productsContainer.innerHTML += `
                <div class="product-card">
                    ${imgHtml}
                    <div>
                        <h3>${prod.name}</h3>
                        <div class="price">$${prod.price}</div>
                    </div>
                    <button onclick="addToCart(${prod.id})">Agregar al Carrito</button>
                </div>
            `;
        }
    });
};

// 4. Lógica del Carrito de Compras
window.addToCart = (productId) => {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    // Si el producto ya está en el carrito, sumamos 1. Si no, lo agregamos.
    if (cart[productId]) {
        cart[productId].quantity += 1;
    } else {
        cart[productId] = { ...product, quantity: 1 };
    }
    
    updateCartUI();
};

// Función para aumentar o disminuir la cantidad directamente en el carrito
window.changeQuantity = (productId, delta) => {
    if (cart[productId]) {
        cart[productId].quantity += delta;
        
        // Si la cantidad llega a 0 al restar, eliminamos el producto del carrito
        if (cart[productId].quantity <= 0) {
            delete cart[productId];
        }
        
        // Volvemos a dibujar el carrito con los nuevos valores
        updateCartUI();
    }
};

// Función para eliminar un producto del carrito completamente
window.removeFromCart = (productId) => {
    delete cart[productId];
    updateCartUI();
};

// Dibujar la interfaz del carrito
function updateCartUI() {
    cartItemsList.innerHTML = '';
    let total = 0;
    let hasItems = false;

    for (const id in cart) {
        const item = cart[id];
        total += item.price * item.quantity;
        hasItems = true;

        cartItemsList.innerHTML += `
            <li class="cart-item">
                <div class="cart-item-info">
                    <span class="item-name">${item.name}</span>
                    <div class="quantity-controls">
                        <button type="button" onclick="changeQuantity(${item.id}, -1)" class="btn-qty">-</button>
                        <span>${item.quantity}</span>
                        <button type="button" onclick="changeQuantity(${item.id}, 1)" class="btn-qty">+</button>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <span>$${item.price * item.quantity}</span>
                    <button type="button" onclick="removeFromCart(${item.id})" class="btn-remove" title="Eliminar producto">✖</button>
                </div>
            </li>
        `;
    }

    cartTotalEl.innerText = `$${total}`;
    
    // Habilitar o deshabilitar el botón de envío
    if (!hasItems) {
        cartItemsList.innerHTML = '<li class="empty-cart">Tu carrito está vacío</li>';
        btnSubmit.disabled = true;
    } else {
        btnSubmit.disabled = false;
    }

    // Actualizar el número en el botón flotante
    const totalItems = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cart-badge').innerText = totalItems;
}

// 5. Enviar la Orden al Backend
orderForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitar que la página se recargue
    
    // Capturar datos del formulario
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const notes = document.getElementById('order-notes').value;

    // Formatear los items al esquema Pydantic (OrderItemCreate)
    const items = Object.values(cart).map(item => ({
        product_id: item.id,
        quantity: item.quantity
    }));

    const payload = {
        customer_name: name,
        customer_phone: phone,
        notes: notes,
        items: items
    };

    // Cambiar estado del botón
    btnSubmit.innerText = "Procesando...";
    btnSubmit.disabled = true;

    try {
        const res = await fetch(`${API_BASE_URL}/sales/orders/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            // Redirigir automáticamente a la app de WhatsApp con el mensaje armado
            window.location.href = data.whatsapp_redirect_url;
        } else {
            alert("Hubo un error al procesar la orden en el servidor.");
            resetButton();
        }
    } catch (error) {
        console.error("Error de red:", error);
        alert("No se pudo conectar con el servidor.");
        resetButton();
    }
});

function resetButton() {
    btnSubmit.innerText = "Enviar pedido por WhatsApp";
    btnSubmit.disabled = false;
}

// 6. Abrir / Cerrar panel lateral del carrito
window.toggleCart = () => {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.toggle('closed');
};

// Iniciar la aplicación cuando el script cargue
initApp();