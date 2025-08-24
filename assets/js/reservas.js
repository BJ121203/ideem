
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("reservasForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Previene el envío del formulario

        // Obtén los valores de los campos del formulario
        const sucursal = document.getElementById("sucursal").value;
        const personas = document.getElementById("personas").value;
        const fecha = document.getElementById("fecha").value;
        const hora = document.getElementById("hora").value;

        // Verifica si los campos requeridos están llenos
        if (!sucursal || !personas || !fecha || !hora) {
            Swal.fire({
                title: "Por favor completar todos los campos",
                icon: "warning"
            });
        } else {
            const hoy = new Date();
            const fechaReserva = new Date(fecha);

            // Verifica que la fecha sea después de hoy
            if (fechaReserva <= hoy) {
                Swal.fire({
                    title: "La fecha debe ser posterior a la fecha de hoy",
                    icon: "warning"
                });
            } else {
                // Verifica que la hora esté entre las 10 AM y las 9 PM
                const horaReserva = parseInt(hora.split(':')[0]);
                const minutosReserva = parseInt(hora.split(':')[1]);

                if (horaReserva < 10 || horaReserva > 21 || (horaReserva === 21 && minutosReserva > 0)) {
                    Swal.fire({
                        title: "La hora debe estar entre las 10:00 y las 21:00",
                        icon: "warning"
                    });
                } else {
                    // Verifica que el número de personas sea mayor a cero
                    if (parseInt(personas) <= 0) {
                        Swal.fire({
                            title: "El número de personas debe ser mayor a cero",
                            icon: "warning"
                        });
                    } else {
                        // Muestra el mensaje y redirecciona después de un retraso
                        Swal.fire({
                            title: "Buscando mesas disponibles",
                            icon: "info",
                            showConfirmButton: false,
                            timer: 2000 // Mostrar el mensaje durante 2 segundos
                        }).then(() => {
                            const url = `reservas2.html`;
                            window.location.href = url;
                        });
                    }
                }
            }
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById('tableBody');
    const form = document.getElementById('reservaForm2');
    let mesasSeleccionadas = 0;

    // Manejar la selección de mesas
    tableBody.addEventListener('click', function (event) {
        if (event.target.tagName === 'BUTTON') {
            const button = event.target;
            const row = button.closest('tr');

            if (row.classList.contains('selected')) {
                // Deseleccionar la mesa
                row.classList.remove('selected');
                button.textContent = 'Seleccionar';
                mesasSeleccionadas--;
            } else {
                // Seleccionar la mesa solo si no se han seleccionado ya dos mesas
                if (mesasSeleccionadas < 2) {
                    row.classList.add('selected');
                    button.textContent = 'Seleccionado';
                    mesasSeleccionadas++;
                } else {
                    Swal.fire({
                        title: "No se pueden seleccionar más mesas",
                        icon: "warning"
                    });
                }
            }
        }
    });

    // Validar el formulario antes de enviarlo
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const selectedRows = tableBody.querySelectorAll('.selected');
        const nombre = document.getElementById('nombre').value.trim();
        const telefono = document.getElementById('telefono').value.trim();

        if (selectedRows.length === 0) {
            Swal.fire({
                title: "Seleccionar al menos alguna mesa",
                icon: "warning"
            });
        } else if (nombre === '') {
            Swal.fire({
                title: "Complete todos los datos del formulario",
                icon: "warning"
            });
        } else if (!/^\d{8}$/.test(telefono)) {
            Swal.fire({
                title: "El número de teléfono no es válido",
                icon: "warning"
            });
        } else {
            Swal.fire({
                title: "Reserva realizada con éxito",
                text: "¡Lo esperamos!",
                icon: "success"
            }).then((result) => {
                if (result.isConfirmed || result.isDismissed) {
                    // Restablecer los valores de los campos del formulario
                    document.getElementById('nombre').value = '';
                    document.getElementById('telefono').value = '';

                    // Deseleccionar las mesas seleccionadas
                    selectedRows.forEach(row => {
                        row.classList.remove('selected');
                        row.querySelector('button').textContent = 'Seleccionar';
                    });

                    // Reiniciar contador de mesas seleccionadas
                    mesasSeleccionadas = 0;
                }
            });
        }
    });
});









