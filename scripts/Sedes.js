
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll(".sede-card").forEach(card => {
    card.addEventListener("click", function() {
      const nombre = this.dataset.nombre;
      const mapa = this.dataset.mapa;
      const telefono = this.dataset.telefono;
      const whatsapp = this.dataset.whatsapp;
      const email = this.dataset.email;
      const direccion = this.dataset.direccion;

      // Colocar datos en el modal
      document.getElementById("modalSedeTitulo").textContent = nombre;
      document.getElementById("modalSedeMapa").src = mapa;
      document.getElementById("modalSedeContacto").innerHTML = `
        <h5 class="fw-bold text-primary mb-4">Contáctenos</h5>
        <p><i class="bi bi-telephone-fill text-info me-2"></i>
           <strong>Teléfono:</strong> <a href="tel:${telefono}">${telefono}</a></p>
        <p><i class="bi bi-whatsapp text-success me-2"></i>
           <strong>Whatsapp:</strong> <a href="https://wa.me/${telefono.replace(/[^0-9]/g,'')}" target="_blank">${whatsapp}</a></p>
        <p><i class="bi bi-envelope-fill text-warning me-2"></i>
           <strong>Correo electrónico:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><i class="bi bi-geo-alt-fill text-danger me-2"></i>
           <strong>Dirección:</strong> ${direccion}</p>
      `;

      // Mostrar modal
      const modal = new bootstrap.Modal(document.getElementById("modalSede"));
      modal.show();
    });
  });
});
