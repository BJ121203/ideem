//Funcion para mostrar los formulario
window.onload = function() {
var radios = document.getElementsByName('option');

for (var i = 0; i < radios.length; i++) {
   radios[i].addEventListener('change', function() {
      var value = this.value;
      var form = document.getElementById(value);

       // Muestra el formulario correspondiente al radio button seleccionado
      form.style.display = 'block';

       // Oculta los demás formularios
      for (var j = 0; j < radios.length; j++) {
         if (radios[j] !== this) {
         var otherForm = document.getElementById(radios[j].value);
         otherForm.style.display = 'none';
         }
      }
   });
}
};

 //Valores reglas
const nameRule = /^[A-Za-z]+$/;
const phoneRule = /^[0-9]+$/;
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rucRule  = /^\d{14}$/;

//Valores del formulario de clientes naturales
var formN = document.getElementById('formN');
var btnN = document.getElementById('btnN');
var nameN = document.getElementById('nameN');
var lastname = document.getElementById('lastname');
var deptN = document.getElementById('deptN');
var birthdate = document.getElementById('birthdate');
var gender = document.getElementById('gender');
var phoneN = document.getElementById('phoneN');
var munMNN = document.getElementById('municipioManagua');
var munMSN =  document.getElementById('municipioMasaya');
var barrioN = document.getElementById('barrioN');
var pRN = document.getElementById('puntoRN');

//Variables de clientes legales
var btnL = document.getElementById('btnL');
var nameL = document.getElementById('nameL');
var ruc = document.getElementById('ruc');
var rs = document.getElementById('rs');
var fc = document.getElementById('fc');
var phoneL = document.getElementById('phoneL');
var email = document.getElementById('email');
var deptL = document.getElementById('deptL');
var munMNL = document.getElementById('municipioManaguaL');
var munMSL =  document.getElementById('municipioMasayaL');
var barrioL = document.getElementById('barrioL');
var pRL = document.getElementById('puntoRL');

//Mostrar las municipios del dept en clientes naturales
// deptN.addEventListener("change", function() {

//       if (this.value === "NI-MN") {
//          munMNN.style.display = "block";
//          munMSN.style.display = "none";
//       } else if (this.value === "NI-MS") {
//          munMNN.style.display = "none";
//          munMSN.style.display = "block";
//       } else {
//          munMNN.style.display = "none";
//          munMSN.style.display = "none";
//       }
// });

//Mostrar las municipios del dept en clientes legales
// deptL.addEventListener("change", function() {

//    if (this.value === "NI-MN") {
//       munMNL.style.display = "block";
//       munMSL.style.display = "none";
//    } else if (this.value === "NI-MS") {
//       munMNL.style.display = "none";
//       munMSL.style.display = "block";
//    } else {
//       munMNL.style.display = "none";
//       munMSL.style.display = "none";
//    }
// });

//Validacion del formulario clientes naturales
btnN.addEventListener('click', function(n) {
n.preventDefault();

   if (nameN.value === '' || !nameN.value.match(nameRule)) {
      Swal.fire({
         title: 'Error!',
         text: 'Nombre no válido',
         icon: 'error',
      });
      return;
   }

   if (lastname.value === '' || !lastname.value.match(nameRule)) {
      Swal.fire({
         title: 'Error!',
         text: 'Apellido no válido',
         icon: 'error',
      });
      return;
      return;
   }

   // if (deptN.value === '0') {
   //    alert('Departamento no válido');
   //    return;
   // }

   // if (deptN.value === 'NI-MN' && munMNN.value === '0'){
   //    alert('Municipio no válido');
   //    return;
   // }

   // if(deptN.value === 'NI-MS' && munMSN.value === '0'){
   //    alert('Municipio no válido');
   //    return;
   // }

   // if (barrioN.value === ''){
   //    alert('Barrio no válido');
   //    return;
   // }

   // if (pRN.value === ''){
   //    alert('Punto de referencia no válido');
   //    return;
   // }

   if (birthdate.value === ''){
      alert('Fecha de nacimiento no válida');
      return;
   }

   if (gender.value === '0'){
      alert('Género no válido');
      return;
   }

   if (phoneN.value === '' || !phoneN.value.match(phoneRule)){
      alert('Teléfono no válido');
      return;
   }

   alert('Registro exitoso');
});

//Validacion del formulario clientes legales
btnL.addEventListener('click', function(l) {

   l.preventDefault();

   if (nameL.value === '') {
      alert('Nombre no válido');
      return;
   }

   if (ruc.value === '' || !ruc.value.match(rucRule) ) {
   alert('Número RUC no válido');
   return;
   }

   if (rs.value === '') {
      alert('Rázon Social no válida');
      return;
      }

   if (deptL.value === '0') {
   alert('Departamento no válido');
   return;
   }

   if (deptL.value === 'NI-MN' && munMNL.value === '0'){
      alert('Municipio no válido');
      return;
   }

   if(deptL.value === 'NI-MS' && munMSL.value === '0'){
      alert('Municipio no válido');
      return;
   }

   if (barrioL.value === ''){
      alert('Barrio no válido');
      return;
   }

   if (pRL.value === ''){
      alert('Punto de referencia no válido');
      return;
   }

   if (fc.value === ''){
      alert('Fecha constitucional no válida');
      return;
   }

   if (email.value === ''){
      alert('Email no escrito');
      return;
   }

   if(!regexEmail.test(email.value)){
      alert('Email no válido');
      return;
   }

   if (phoneN.value === '' || !phoneN.value.match(phoneRule)){
      alert('Teléfono no válido');
      return;
   }
})
;
