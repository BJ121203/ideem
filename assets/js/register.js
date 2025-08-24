//norma para el email
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//Valores login
var btnl = document.getElementById('btnLogin');
var user = document.getElementById('user');
var password = document.getElementById('password');

//Valores del registro
var btnr = document.getElementById('btnRegister');
var userr = document.getElementById('userr');
var passwordr = document.getElementById('passwordr');
var passwordr2 = document.getElementById('passwordr2');

//Validacion del login

btnl.addEventListener('click', function(l) {

  r.preventDefault();

  if (user.value === "" || password.value === '') {
    alert('Por favor, completa todos los campos');
    return;
  }

  if(!regexEmail.test(user)){
    alert('El email no es válido');
    return;
  }

  else{
    alert('Inicio de sesión exitoso');
  }

});

//Validacion del register
btnr.addEventListener('click', function(r) {

  r.preventDefault();

  if (userr.value === '' || passwordr.value === '' || passwordr2.value === '') {
    alert("Por favor, completa todos los campos");
    return;
  }

  if(!regexEmail.test(userr.value)){
    alert('El email no es válido');
    return;
  }

  if(passwordr.length < 8){
    alert('La contraseña debe tener al menos 8 caracteres');
    return;
  }

  if(passwordr.value != passwordr2.value){
    alert('La contraseñas no coinciden');
    return;
  }

  else{
    alert('Registro de la cuenta existoso');
    window.open('clientes.html', '_self');
  }
});

