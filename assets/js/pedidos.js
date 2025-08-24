//Tomar los valores del carrito
document.addEventListener('DOMContentLoaded', function() {
    const addToCartButtons = document.querySelectorAll('.addToCart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = button.parentElement.querySelector('h3').innerText;
            const productPrice = button.parentElement.querySelector('.price').innerText;

            // Aquí puedes almacenar el producto en una estructura de datos (puedes usar localStorage, sessionStorage, o simplemente un array en memoria)
            const product = {
                name: productName,
                price: productPrice
            };

            // Obtener el carrito del localStorage
            let cart = JSON.parse(localStorage.getItem('cart')) || [];

            // Verificar si el producto ya está en el carrito
            const existingProductIndex = cart.findIndex(item => item.name === productName);

            if (existingProductIndex !== -1) {
            // El producto ya existe en el carrito, podrías mostrar un mensaje o simplemente no hacer nada
            Swal.fire({
                title: "El producto ya esta en el carrito",
                icon : "info"
            });
            } else {
            // Agregar el producto al carrito
            cart.push(product);
            localStorage.setItem('cart', JSON.stringify(cart));
            Swal.fire({
                title: "Producto agregado correctamente",
                icon: "success"
            });
            }
        })
    });
    
});

//Ejemplos de ingredientes para modificacion
let ingredientes = ["Piña", "Chile", "Queso", "Cebolla"];

function generarCheckboxes(ingredientes, action, productoId) {
    return `<div class="checkbox-container">` + 
        ingredientes.map((ingrediente, index) => `
            <div>
                <input type="checkbox" id="producto-${productoId}-ingrediente-${index}${action}" name="producto-${productoId}-ingrediente-${index}" value="${ingrediente}" data-action="${action}" data-index="${index}">
                <label for="producto-${productoId}-ingrediente-${index}${action}">${ingrediente}</label>
            </div>
        `).join('') + 
        `</div>`;
}

function generarCheckboxesAdd(ingredientes, productoId) {
    return generarCheckboxes(ingredientes, "Add", productoId);
}

function generarCheckboxesQuit(ingredientes, productoId) {
    return generarCheckboxes(ingredientes, "Quit", productoId);
}

function setupCheckboxListeners(productoId) {
    const checkboxesAdd = document.querySelectorAll(`#product-${productoId} [data-action="Add"]`);
    const checkboxesQuit = document.querySelectorAll(`#product-${productoId} [data-action="Quit"]`);

    checkboxesAdd.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const index = this.getAttribute('data-index');
            const correspondingCheckbox = document.querySelector(`#producto-${productoId}-ingrediente-${index}Quit`);
            correspondingCheckbox.disabled = this.checked;
        });
    });

    checkboxesQuit.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const index = this.getAttribute('data-index');
            const correspondingCheckbox = document.querySelector(`#producto-${productoId}-ingrediente-${index}Add`);
            correspondingCheckbox.disabled = this.checked;
        });
    });
}

// Función para renderizar el carrito en la página carrito.html
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const subtotalPrice = document.getElementById('subtotal-price');
    const ivaPrice = document.getElementById('iva-price');
    const totalPrice = document.getElementById('total-price');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        cartItems.innerHTML = 'No se ha agregado ningún producto al carrito';
    } else {
        cartItems.innerHTML = ''; // Limpiar el contenido existente

        let total = 0;

        cart.forEach((product, index) => {
            const row = document.createElement('tr');
            row.id = `product-${index}`;
            row.innerHTML = `
                <td>${product.name}</td>
                <td>C$ ${product.price}</td>
                <td id="quantity-${index}">1</td>
                <td id="productChangeAdd">${generarCheckboxesAdd(ingredientes, index)}</td>
                <td id="productChangeRemove">${generarCheckboxesQuit(ingredientes, index)}</td>
                <td>
                    <button class="btn btn-primary" onclick="decreaseQuantity(${index})">-</button>
                    <button class="btn btn-danger" onclick="increaseQuantity(${index})">+</button>
                    <button class="btn btn-danger" onclick="removeProduct(${index})">Eliminar</button>
                </td>
            `;
            cartItems.appendChild(row);

            // Setup listeners for the current product's checkboxes
            setupCheckboxListeners(index);

            total += parseFloat(product.price);
        });

        const iva = total * 0.15;
        const totalConIva = total + iva;

        subtotalPrice.textContent = total.toFixed(2); // Mostrar el total con dos decimales
        ivaPrice.textContent = iva.toFixed(2);
        totalPrice.textContent = totalConIva.toFixed(2);
    }
}


// Funciones para incrementar y disminuir la cantidad
function increaseQuantity(index) {
    const quantityElement = document.getElementById(`quantity-${index}`);
    let quantity = parseInt(quantityElement.textContent);
    quantity++;
    quantityElement.textContent = quantity;

    updateTotalPrice();
}

function decreaseQuantity(index) {
    const quantityElement = document.getElementById(`quantity-${index}`);
    let quantity = parseInt(quantityElement.textContent);
    if (quantity > 1) {
        quantity--;
        quantityElement.textContent = quantity;
    }

    updateTotalPrice();
}

// Función para eliminar un producto del carrito
function removeProduct(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1); // Eliminar el producto del array
    localStorage.setItem('cart', JSON.stringify(cart)); // Actualizar el localStorage
    Swal.fire({
        title: "Producto eliminado correctamente",
        icon: "warning"
    });
    renderCart(); // Volver a renderizar el carrito
}

function updateTotalPrice() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = 0;

    cart.forEach((product, index) => {
        const quantity = parseInt(document.getElementById(`quantity-${index}`).textContent);
        total += parseFloat(product.price) * quantity;
    });

    const iva = total * 0.15;
    const totalConIva = total + iva;

    document.getElementById('subtotal-price').textContent = total.toFixed(2);
    document.getElementById('iva-price').textContent = iva.toFixed(2);
    document.getElementById('total-price').textContent = totalConIva.toFixed(2);
}

// Función para vaciar completamente el carrito
function clearCart() {
    // Limpiar el localStorage
    localStorage.removeItem('cart');
    const formCompra = document.getElementById("formCompra");
    
    formCompra.style.display = 'none';


    // Vaciar la representación visual del carrito en la página
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = 'No hay ningun elemento en el carrito';

    // Actualizar los totales mostrados
    document.getElementById('subtotal-price').textContent = '0.00';
    document.getElementById('iva-price').textContent = '0.00';
    document.getElementById('total-price').textContent = '0.00';

    // Opcional: Mostrar un mensaje o realizar cualquier otra acción necesaria
    Swal.fire({
        title: "El carrito ha sido vaciado",
        icon: "warning"
    });
}

// Llama a renderCart() cuando se carga la página carrito.html
document.addEventListener('DOMContentLoaded', function() {
    renderCart();
});


//Desplegar formulario de compra
function viewForm(){

    const formCompra = document.getElementById("formCompra");

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if(cart.length === 0){
        swal.fire({
            title: "No ha agregado ningun elemento al carrito",
            icon: "warning"
        })
    }else{
        formCompra.style.display = 'block';
    }
}

function validateInputsDatos() {
    event.preventDefault();
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');

    const namePattern = /^[a-zA-Z\s]+$/;
    const phonePattern = /^\d{8}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameInput.value.trim().match(namePattern)) {
        swal.fire({
            title: "Por favor, ingrese un nombre válido",
            icon: "warning"
        });
        return false;
    }

    if (!phoneInput.value.trim().match(phonePattern)) {
        swal.fire({
            title: "Por favor, ingrese un número de teléfono válido de 8 dígitos",
            icon: "warning"
        });
        return false;
    }

    if (!emailInput.value.trim().match(emailPattern)) {
        swal.fire({
            title: "Por favor, ingrese un correo electrónico válido",
            icon: "warning"
        });
        return false;
    }

    // Si todas las validaciones son exitosas, cambia a la pestaña de envío
    const shippingTab = new bootstrap.Tab(document.getElementById('shipping-tab'));
    shippingTab.show();
    return true;
}

function volverDatos(){
    event.preventDefault();
    const personalTab = new bootstrap.Tab(document.getElementById('personal-tab'));
    personalTab.show();
}

function validateInputsDirection() {
    event.preventDefault();
    const deliveryRadio = document.getElementById('delivery');
    const pickupRadio = document.getElementById('pickup');
    const sucursalEnvio = document.querySelector('sucursalEnvio');
    const sucursalPickup = document.querySelector('sucursalPickup');
    const barrioSelect = document.getElementById('barrio');
    const direccionInput = document.getElementById('direccion');

  
    if (deliveryRadio.checked) {
        if (sucursalEnvio.value.trim() === '') {
            swal.fire({
                title: "Selecciones una sucursal",
                icon: "warning"
            })
            return false;
        }
        if (barrioSelect.value.trim() === '' && direccionInput.value.trim() === '') {
            swal.fire({
                title: "Selecciones su barrio",
                icon: "warning"
            })
            return false;
        }
        if (direccionInput.value.trim() === '') {
            swal.fire({
                title: "Introudzca una direccion mas exacta",
                icon: "warning"
            })
            return false;
        }
    } else if (pickupRadio.checked) {
        if (sucursalp.value.trim() === '') {
            swal.fire({
                title: "Seleccione una sucursal para su retiro",
                icon: "warning"
            })
            return false;
        }
    }
   
    const paymentTab = new bootstrap.Tab(document.getElementById('payment-tab'));
    paymentTab.show();
    return true;
}

function volverDirection(){
    event.preventDefault();
    const shippingTab = new bootstrap.Tab(document.getElementById('shipping-tab'));
    shippingTab.show();
}

function validateInputsPago() {
    event.preventDefault(); // Prevenir el comportamiento predeterminado de envío del formulario

    // Obtener los elementos del formulario
    const cardRadio = document.getElementById('card');
    const cashRadio = document.getElementById('cash');
    const cardHolderInput = document.getElementById('cardHolder');
    const cardNumberInput = document.getElementById('cardNumber');
    const cardExpiryMonthSelect = document.getElementById('cardExpiryMonth');
    const cardExpiryYearSelect = document.getElementById('cardExpiryYear');
    const cardCVVInput = document.getElementById('cardCVV');
    const moneyTypeSelect = document.getElementById('moneyType');
    const montoInput = document.getElementById('monto');

    // Patrones de validación
    const namePattern = /^[a-zA-Z\s]+$/;
    const cardNumberPattern = /^\d{16}$/;
    const cvvPattern = /^\d{3}$/;
    const amountPattern = /^\d+(\.\d{1,2})?$/;

    // Validación para pago con tarjeta
    if (cardRadio.checked) {
        if (!cardHolderInput.value.trim().match(namePattern)) {
            swal.fire({
                title: "Por favor, ingrese un nombre y apellido válido",
                icon: "warning"
            });
            return false;
        }
        if (!cardNumberInput.value.trim().match(cardNumberPattern)) {
            swal.fire({
                title: "Por favor, ingrese un número de tarjeta válido de 16 dígitos",
                icon: "warning"
            });
            return false;
        }
        if (cardExpiryMonthSelect.value.trim() === '' || cardExpiryYearSelect.value.trim() === '') {
            swal.fire({
                title: "Por favor, seleccione una fecha de expiración válida",
                icon: "warning"
            });
            return false;
        }
        if (!cardCVVInput.value.trim().match(cvvPattern)) {
            swal.fire({
                title: "Por favor, ingrese un CVV válido de 3 dígitos",
                icon: "warning"
            });
            return false;
        }
    }

    // Validación para pago en efectivo
    else if (cashRadio.checked) {
        if (moneyTypeSelect.value.trim() === '') {
            swal.fire({
                title: "Por favor, seleccione el tipo de moneda con la que pagará",
                icon: "warning"
            });
            return false;
        }
        if (!montoInput.value.trim().match(amountPattern)) {
            swal.fire({
                title: "Por favor, ingrese un monto válido",
                icon: "warning"
            });
            return false;
        }
    }

    return true; 

}

function submitForm() {
    if (!validateInputsDatos() || !validateInputsDirection() || !validateInputsPago()) {
        return;
    }else{
        swal.fire({
            title: "Complete todo el formulario",
            icon: "warning"
        })
    }

    const deliveryRadio = document.getElementById('delivery');
    const pickupRadio = document.getElementById('pickup');

    if (deliveryRadio.checked) {
        swal.fire({
            title: "Pedido realizado con éxito",
            text: "Tiempo de espera aprox. : 30 minutos",
            icon: "succes"
        })
    } else if (pickupRadio.checked) {
        swal.fire({
            title: "Pedido realizado con éxito",
            text: "Se le notificará cuando este listo para su retiro",
            icon: "succes"
        })
    }
}









