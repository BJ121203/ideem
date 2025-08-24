function calcularCotizacion() {
    event.preventDefault();
    // Precios definidos
    const precios = {
        buffet: 7, // Precio por persona por hora para buffet
        a_la_carta: 12, // Precio por persona por hora para menú a la carta
        bebidas_alcoholicas: 5, // Precio por persona por hora para bebidas alcohólicas
        bebidas_no_alcoholicas: 4, // Precio por persona por hora para bebidas no alcohólicas
        zonas: {
            zona1: 100, // Precio por día para Zona 1
            zona2: 150, // Precio por día para Zona 2
            zona3: 180 // Precio por día para Zona 3
        },
        serviciosAdicionales: {
            dj: 15, // Precio por hora para DJ
            decoracion: 15, // Precio por día para Decoración Temática
            animadores: 10, // Precio por hora para Animadores
            equipo_audio: 10, // Precio por día para Equipo de Audio
            fotografia_video: 18, // Precio por hora para Fotografía y Video
            catering_postres: 30, // Precio por día para Catering de Postres
            seguridad: 6, // Precio por hora para Seguridad
            florista: 20, // Precio por día para Florista
            mobiliario_extra: 10  // Precio por día para Mobiliario Extra
        }
    };

    // Obtener valores del formulario
    const nombre = document.getElementById('nombre').value;
    const number = document.getElementById('number').value;
    const email = document.getElementById('email').value;
    const fecha = document.getElementById('fecha').value;
    const duracionEvento = parseInt(document.getElementById('duracionEvento').value, 10);
    const horaInicio = document.getElementById('horaInicio').value;
    const horaFin = document.getElementById('horaFin').value;
    const evento = document.getElementById('evento').value;
    const sucursal = document.getElementById('sucursal').value;
    const personas = parseInt(document.getElementById('personas').value, 10);
    const nenes = parseInt(document.getElementById('nenes').value, 10);
    const tipoMenu = document.getElementById('tipoMenu').value;
    const tipoBebidas = document.getElementById('tipoBebidas').value;
    const zona1 = document.getElementById('zona1').checked;
    const zona2 = document.getElementById('zona2').checked;
    const zona3 = document.getElementById('zona3').checked;
    const dj = document.getElementById('dj').checked;
    const decoracion = document.getElementById('decoracion').checked;
    const animadores = document.getElementById('animadores').checked;
    const equipo_audio = document.getElementById('equipo_audio').checked;
    const fotografia_video = document.getElementById('fotografia_video').checked;
    const catering_postres = document.getElementById('catering_postres').checked;
    const seguridad = document.getElementById('seguridad').checked;
    const florista = document.getElementById('florista').checked;
    const mobiliario_extra = document.getElementById('mobiliario_extra').checked;
    const duracionEventoHoras = calcularHorasEntre(horaInicio, horaFin);

    //Validar campos obligatorios
    if (nombre === "") {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El nombre es obligatorio.'
        });
        return;
    }

    const numberPattern = /^\d{8}$/;
    if (!numberPattern.test(number)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese un número de 8 dígitos.'
        });
        return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese un correo electrónico válido.'
        });
        return;
    }

      // Validar que la fecha no esté vacía
      if (fecha === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La fecha es obligatoria.'
        });
        return false;
    }

    // Obtener la fecha actual
    const fechaActual = new Date().toISOString().split('T')[0];

    // Comparar la fecha ingresada con la fecha actual
    if (fecha < fechaActual) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La fecha no puede ser anterior a hoy.'
        });
        return false;
    }

    if (duracionEvento === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La duración del evento debe ser mayor que 0.'
        });
        return false;
    }

    // Validar que la duración del evento no exceda de 3 días
    if (duracionEvento > 3) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La duración del evento no puede exceder los 3 días.'
        });
        return false;
    }

    if (horaInicio === '' || horaFin === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, complete las horas de inicio y fin.'
        });
        return false;
    }

    // Validar que la hora de inicio no sea mayor o igual a la hora de fin
    if (horaInicio >= horaFin) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La hora de inicio no puede ser mayor o igual a la hora de fin.'
        });
        return false;
    }

    if (isNaN(personas) || personas < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese un número válido de invitados'
        });
        return;
    }

    if (isNaN(nenes) || nenes === "") {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese un número válido de menores'
        });
        return;
    }

    if (evento === "") {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El evento es obligatorio.'
        });
        return;
    }

    if (tipoMenu === "") {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El tipo de menú es obligatorio.'
        });
        return;
    }

    if (tipoBebidas === "") {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El tipo de bebidas es obligatorio.'
        });
        return;
    }

    if (!zona1 && !zona2 && !zona3) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debe seleccionar al menos una zona.'
        });
        return;
    }
    

    // Calcular costos
    let total = 0;
    let elementosSeleccionados = [];

    // Calcular costo del menú
    let costoMenu = 0;
    if (tipoMenu === 'buffet') {
        costoMenu = precios.buffet * (personas + nenes) * duracionEvento;
        elementosSeleccionados.push({ item: `Menú Buffet para ${personas + nenes} personas`, costo: costoMenu });
        total += costoMenu
    } else if (tipoMenu === 'a_la_carta') {
        costoMenu = precios.a_la_carta * (personas + nenes) * duracionEvento;
        elementosSeleccionados.push({ item: `Menú A la Carta para ${personas + nenes} personas`, costo: costoMenu });
        total += costoMenu
    }

    // Calcular costo de las bebidas
    let costoBebidas = 0;
    let costoBebidasNenes = 0;
    if (tipoBebidas === 'bebidas_alcoholicas') {
        costoBebidas = (precios.bebidas_alcoholicas * (personas) * duracionEventoHoras * duracionEvento);
        costoBebidasNenes = (precios.bebidas_no_alcoholicas * (nenes) * duracionEventoHoras * duracionEvento);
        elementosSeleccionados.push({ item: `Bebidas Alcohólicas para ${personas} mayores`, costo: costoBebidas });
        elementosSeleccionados.push({ item: `Bebidas No Alcohólicas para ${nenes} menores`, costo: costoBebidasNenes });
        total += (costoBebidas + costoBebidasNenes)
    } else if (tipoBebidas === 'bebidas_no_alcoholicas') {
        costoBebidas = precios.bebidas_no_alcoholicas * (personas + nenes) * duracionEventoHoras * duracionEvento;
        elementosSeleccionados.push({ item: `Bebidas No Alcohólicas para ${personas+nenes} personas`, costo: costoBebidas });
        total += costoBebidas
    }

    // Calcular costo de las zonas seleccionadas
    if (zona1) {
        const costoZona1 = precios.zonas.zona1 * duracionEvento;
        total += costoZona1;
        elementosSeleccionados.push({ item: `Zona: El Jardin de los Sabores`, costo: costoZona1 });
    }
    if (zona2) {
        const costoZona2 = precios.zonas.zona2 * duracionEvento;
        total += costoZona2;
        elementosSeleccionados.push({ item: `Zona: La Cantina del Mariachi`, costo: costoZona2 });
    }
    if (zona3) {
        const costoZona3 = precios.zonas.zona3 * duracionEvento;
        total += costoZona3;
        elementosSeleccionados.push({ item: `Zona: La Hacienda Azul`, costo: costoZona3 });
    }

    // Calcular costo de servicios adicionales seleccionados
    if (dj) {
        const costoDj = precios.serviciosAdicionales.dj * duracionEvento * duracionEventoHoras;
        total += costoDj;
        elementosSeleccionados.push({ item: `Servicio adicional: DJ`, costo: costoDj });
    }
    if (decoracion) {
        const costoDecoracion = precios.serviciosAdicionales.decoracion * duracionEvento;
        total += costoDecoracion;
        elementosSeleccionados.push({ item: `Servicio adicional: Decoración Temática`, costo: costoDecoracion });
    }
    if (animadores) {
        const costoAnimadores = precios.serviciosAdicionales.animadores * duracionEvento * duracionEventoHoras;
        total += costoAnimadores;
        elementosSeleccionados.push({ item: `Servicio adicional: Animadores`, costo: costoAnimadores });
    }
    if (equipo_audio) {
        const costoEquipoAudio = precios.serviciosAdicionales.equipo_audio * duracionEvento;
        total += costoEquipoAudio;
        elementosSeleccionados.push({ item: `Servicio adicional: Equipo de Audio`, costo: costoEquipoAudio });
    }
    if (fotografia_video) {
        const costoFotografiaVideo = precios.serviciosAdicionales.fotografia_video * duracionEvento * duracionEventoHoras;
        total += costoFotografiaVideo;
        elementosSeleccionados.push({ item: `Servicio adicional: Fotografía y Video`, costo: costoFotografiaVideo });
    }
    if (catering_postres) {
        const costoCateringPostres = precios.serviciosAdicionales.catering_postres * duracionEvento;
        total += costoCateringPostres;
        elementosSeleccionados.push({ item: `Servicio adicional: Catering de Postres`, costo: costoCateringPostres });
    }
    if (seguridad) {
        const costoSeguridad = precios.serviciosAdicionales.seguridad * duracionEvento * duracionEventoHoras;
        total += costoSeguridad;
        elementosSeleccionados.push({ item: `Servicio adicional: Seguridad`, costo: costoSeguridad });
    }
    if (florista) {
        const costoFlorista = precios.serviciosAdicionales.florista * duracionEvento;
        total += costoFlorista;
        elementosSeleccionados.push({ item: `Servicio adicional: Florista`, costo: costoFlorista });
    }
    if (mobiliario_extra) {
        const costoMobiliarioExtra = precios.serviciosAdicionales.mobiliario_extra * duracionEvento;
        total += costoMobiliarioExtra;
        elementosSeleccionados.push({ item: `Servicio adicional: Mobiliario Extra`, costo: costoMobiliarioExtra });
    }

    // Mostrar los elementos seleccionados y el costo total en una especie de carrito
    let carritoHtml = '<h3>Carrito de Cotización</h3><ul>';
    elementosSeleccionados.forEach(elemento => {
        carritoHtml += `<li>${elemento.item}: $${elemento.costo.toFixed(2)}</li>`;
    });
    carritoHtml += `<li>Costo por día: $${(total / duracionEvento).toFixed(2)}</li>`;
    carritoHtml += `</ul><h4>Total: $${total.toFixed(2)}</h4>`;
    carritoHtml += '<button class="button" type="submit">Contacte con nosotros ya mismo</button>';
    document.getElementById('cotizaciontotal').innerHTML = carritoHtml;
    Swal.fire({
        title: "Cotización realizada con éxito",
        icon: "succes"
    })
}

// Función auxiliar para calcular horas entre dos tiempos
function calcularHorasEntre(horaInicio, horaFin) {
    const [horaInicioHoras, horaInicioMinutos] = horaInicio.split(':').map(Number);
    const [horaFinHoras, horaFinMinutos] = horaFin.split(':').map(Number);

    let horas = horaFinHoras - horaInicioHoras;
    let minutos = horaFinMinutos - horaInicioMinutos;
    if (minutos < 0) {
        horas--;
        minutos += 60;
    }

    return horas + minutos / 60;
}
