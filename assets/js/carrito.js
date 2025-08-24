//Divs de envio
document.addEventListener('DOMContentLoaded', function () {
    const deliveryOption = document.getElementById('delivery');
    const pickupOption = document.getElementById('pickup');
    const deliveryAddress = document.getElementById('deliveryAddress');
    const pickupAddress = document.getElementById('pickupAddress');
  
    // Función para mostrar/ocultar divs según la opción seleccionada
    function updateDisplay() {
      if (deliveryOption.checked) {
        deliveryAddress.style.display = 'block';
        pickupAddress.style.display = 'none';
      } else if (pickupOption.checked) {
        deliveryAddress.style.display = 'none';
        pickupAddress.style.display = 'block';
      }
    }
  
    // Añadir event listeners a los radio buttons
    deliveryOption.addEventListener('change', updateDisplay);
    pickupOption.addEventListener('change', updateDisplay);
  
    // Llamar a la función al cargar la página para establecer el estado inicial
    updateDisplay();
  });

  //divs de tipo de pago
  document.addEventListener('DOMContentLoaded', function () {
    const cardOption = document.getElementById('card');
    const cashOption = document.getElementById('cash');
    const cashDetails = document.getElementById('cashDetails');
    const cardDetails = document.getElementById('cardDetails');
  
    // Función para mostrar/ocultar divs según la opción seleccionada
    function updateDisplay() {
      if (cardOption.checked) {
        cardDetails.style.display = 'block';
        cashDetails.style.display = 'none';
      } else if (cashOption.checked) {
        cardDetails.style.display = 'none';
        cashDetails.style.display = 'block';
      }
    }
  
    // Añadir event listeners a los radio buttons
    cardOption.addEventListener('change', updateDisplay);
    cashOption.addEventListener('change', updateDisplay);
  
    // Llamar a la función al cargar la página para establecer el estado inicial
    updateDisplay();
  });
  

  









