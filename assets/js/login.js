document.getElementById('registerForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('registerName').value.trim();
    const lastname = document.getElementById('registerLastname').value.trim();
    const phoneNumber = document.getElementById('registerNumber').value.trim();
    const gender = document.getElementById('registerGender').value;
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordRepeat = document.getElementById('registerPasswordRepeat').value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\d{8}$/;

    if (!name || !lastname || !phoneNumber || !gender || !email || !password || !passwordRepeat) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, complete todos los campos.'
        });
        return;
    }

    if (!emailPattern.test(email)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, introduce un correo electrónico válido.'
        });
        return;
    }

    if (!phonePattern.test(phoneNumber)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El número telefónico debe tener 8 dígitos numéricos.'
        });
        return;
    }

    if (password !== passwordRepeat) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Las contraseñas no coinciden.'
        });
        return;
    }

    Swal.fire({
        icon: 'success',
        title: 'Registro Exitoso',
        text: 'Bienvenido a la comunidad de los Calaveritos'
    });

});