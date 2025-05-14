let countries = [];

// Carga de Países
document.addEventListener("DOMContentLoaded", async () => {
  countries = await fetchData("./sources/countries.json");

  populateCountries();

  const expMonthSelect = document.getElementById("expMonth");
  const expYearSelect = document.getElementById("expYear");

  for (let i = 1; i <= 12; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i.toString().padStart(2, "0");
    expMonthSelect.appendChild(opt);
  }

  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y <= 2035; y++) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    expYearSelect.appendChild(opt);
  }

  const paymentMethodSelect = document.getElementById("paymentMethod");
  const payBtn = document.getElementById("payBtn");

  const forms = {
    credit_card: document.getElementById("creditCardForm"),
    paypal: document.getElementById("paypalForm"),
    pse: document.getElementById("pseForm")
  };

  
});

async function fetchData(path) {
  const response = await fetch(path);
  return await response.json();
}

function populateCountries() {
  const countrySelect = document.getElementById("country");
  const account_countrySelect = document.getElementById("accountCountry");

  countries.forEach(country => {
    const option = document.createElement("option");
    option.value = country.id;
    option.textContent = country.name;
    countrySelect.appendChild(option);
    account_countrySelect.appendChild(option);
  });


  countries.forEach(country => {
    const option = document.createElement("option");
    option.value = country.name;
    option.textContent = country.name;
    countrySelect.appendChild(option);
  });
  
}

// Google Translate
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("translateToggle");
  const translateBox = document.getElementById("google_translate_element");

  toggleBtn.addEventListener("click", () => {
    translateBox.style.display = (translateBox.style.display === "none" || translateBox.style.display === "") 
      ? "block" 
      : "none";
  });
});

// Register

document.getElementById("registerForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const username = document.getElementById("newUsername").value;
  const password = document.getElementById("newPassword").value;

  const userData = {
    username,
    email: document.getElementById("email").value,
    password,
    birthdate: document.getElementById("birthdate").value,
    country: document.getElementById("country").value ,
    city: document.getElementById("city").value,
    address: document.getElementById("address").value, 
    first_name: document.getElementById("first_name").value, 
    last_name: document.getElementById("last_name").value
  };

  const email = document.getElementById("email").value.trim();

  // // Validación de email mejorada
  // if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\.[a-zA-Z]{2,}$/.test(email)) {
  //   const errorMsg = document.getElementById("emailError");
  //   errorMsg.textContent = "Ingresa un correo válido (ejemplo: usuario@dominio.com)";
  //   errorMsg.style.display = 'block';
  //   return;
  // }

  try {
    // Enviar datos de registro
    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (result.success) {
      // Login automático tras registro
      const loginResponse = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });

      const loginData = await loginResponse.json();

      if (loginData.success) {
        location.hash = '';
        document.getElementById('loginItem').style.display = 'none';
        document.getElementById('accountItem').style.display = 'inline-block';
        document.getElementById('logoutItem').style.display = 'inline-block';
        
        alert("Registro e inicio de sesión exitoso.");

      } else {
        alert("Registro exitoso, pero no se pudo iniciar sesión.");
      }

    } else {
      alert("Error en el registro: " + result.message);
    }

  } catch (error) {
    console.error("Error al registrar:", error);
    alert("Error al conectar con el servidor");
  }
});

document.getElementById('newUsername').addEventListener('input', function () {
  const maxLength = 30;
  const msg = document.getElementById('usernameLimitMsg');

  if (this.value.length >= maxLength) {
    msg.style.display = 'inline';
  } else {
    msg.style.display = 'none';
  }
});

const passwordInput = document.getElementById('newPassword');
const strengthBar = document.getElementById('strengthBar');
const passwordError = document.getElementById('passwordError');

passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    let score = 0;

    // Reglas de seguridad
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Actualizar barra
    let width = (score / 5) * 100;
    strengthBar.style.width = width + '%';

    // Cambiar color según puntuación
    if (score <= 2) {
      strengthBar.style.background = 'red';
      passwordError.textContent = 'La contraseña es débil.';
    } else if (score === 3 || score === 4) {
      strengthBar.style.background = 'orange';
      passwordError.textContent = 'La contraseña es moderada.';
    } else {
      strengthBar.style.background = 'green';
      passwordError.textContent = '';
    }

    // Limitar longitud máxima
    if (password.length > 64) {
      passwordError.textContent = 'La contraseña no puede tener más de 64 caracteres.';
      strengthBar.style.background = 'red';
    }
});

document.getElementById('registerForm').addEventListener('submit', function(e) {
    const password = passwordInput.value;

    if (password.length < 8) {
      e.preventDefault(); // Evita que se envíe el formulario
      passwordError.textContent = 'La contraseña debe tener al menos 8 caracteres.';
      strengthBar.style.background = 'red';
      alert("La contraseña debe tener al menos 8 caracteres.");
    }
});

document.getElementById("city").addEventListener("input", function(e) {
  // Elimina caracteres no permitidos en tiempo real
  this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  
  // Muestra error si se intentó escribir algo inválido
  const originalText = e.target.value;
  const cleanedText = originalText.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  
  if (originalText !== cleanedText) {
    document.getElementById("cityError").textContent = "¡Solo se permiten letras y espacios!";
    document.getElementById("cityError").style.display = "block";
    setTimeout(() => {
      document.getElementById("cityError").style.display = "none";
    }, 2000);
  }
});

document.getElementById("address").addEventListener("input", function(e) {
  // Elimina caracteres no permitidos en tiempo real
  const cleanedValue = e.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s#\-.,]/g, '');
  e.target.value = cleanedValue;

  // Muestra error si se intentó escribir algo inválido
  if (e.target.value !== cleanedValue) {
    const errorElement = document.getElementById("addressError");
    errorElement.textContent = "Solo se permiten letras, números, espacios y #-.,";
    errorElement.style.display = "block";
    setTimeout(() => errorElement.style.display = "none", 2000);
  }
});


// Login 
document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include" // importante para que se guarde la sesión
  });

  const data = await response.json();

  if (data.success) {
    location.hash = '';
    document.getElementById('loginItem').style.display = 'none';
    document.getElementById('accountItem').style.display = 'inline-block';
    document.getElementById('logoutItem').style.display = 'inline-block';
    
    if (data.user_type_id === 1) {
      document.getElementById('h3admon').style.display = 'block';
      agregarOpcionesAdmin();
    }

  } else {
    alert(data.message);
  }
});

// My account
// Función reutilizable para cargar datos del usuario
async function loadAccountData() {
  try {
    const response = await fetch("/account", {
      method: "GET",
      credentials: "include"
    });

    const data = await response.json();

    if (data.success) {
      const user = data.user;

      // Llenar el formulario
      document.getElementById("accountUsername").value = user.username || '';
      document.getElementById("accountEmail").value = user.email || '';
      document.getElementById("accountFirst_Name").value = user.first_name || '';
      document.getElementById("accountLast_Name").value = user.last_name || '';
      document.getElementById("accountBirthdate").value = user.birthdate ? user.birthdate.split('T')[0] : '';
      document.getElementById("accountCountry").value = user.country ? user.country.toString() : '';
      document.getElementById("accountCity").value = user.city || '';
      document.getElementById("accountAddress").value = user.address || '';

      // Mostrar el artículo de cuenta (si usas display:none por defecto)
      document.getElementById("account").style.display = "block";
    }
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
}

// Evento para el botón de cuenta (existente)
document.getElementById("accountItem").addEventListener("click", async function(e) {
  e.preventDefault();
  await loadAccountData();
  location.hash = '#account';
});

// Cargar datos automáticamente si el hash es #account
window.addEventListener('DOMContentLoaded', async () => {
  if (window.location.hash === '#account') {
    await loadAccountData();
  }

 

});

// Opcional: Manejar cambios de hash dinámicos
window.addEventListener('hashchange', async () => {
  if (window.location.hash === '#account') {
    await loadAccountData();
  }
});

// Modify Account
document.getElementById('SaveAccountBtn').addEventListener('click', async function () {
  const email = document.getElementById('accountEmail').value;
  const first_name = document.getElementById('accountFirst_Name').value;
  const last_name = document.getElementById('accountLast_Name').value;
  const birthdate = document.getElementById('accountBirthdate').value;
  const country = document.getElementById('accountCountry').value;
  const city = document.getElementById('accountCity').value;
  const address = document.getElementById('accountAddress').value;

  const response = await fetch("/account", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, first_name, last_name, birthdate, country, city, address })
  });

  const result = await response.json();

  if (result.success) {
    alert("Datos actualizados correctamente");
    const fields = document.querySelectorAll("#accountForm input");
    fields.forEach(field => {
    field.disabled = true;

    // Cambiar color de fondo si está habilitado o no
    if (!field.disabled) {
      field.style.backgroundColor = "rgb(119 119 119)"; // fondo blanco editable
    } else {
      field.style.backgroundColor = "transparent"; // fondo gris claro no editable
    }
  });

  document.getElementById("editAccountBtn").style.display = "inline-block";
  document.getElementById("CancelAccountBtn").style.display = "none";
  document.getElementById("SaveAccountBtn").style.display = "none";
    toggleAccountFields(false);
  } else {
    alert("Error al actualizar: " + result.message);
  }
});

function toggleAccountFields(enable) {
  document.querySelectorAll('#accountForm input').forEach(input => {
    if (input.id !== 'accountUsername') {
      input.disabled = !enable;
    }
  });

  const countrySelect = document.getElementById('accountCountry');
  if (countrySelect) {
    countrySelect.disabled = !enable;
    
    // Debug: Verifica en consola
    console.log('Estado del select:', countrySelect.disabled ? 'Deshabilitado' : 'Habilitado');
  } else {
    console.error('No se encontró el select con ID accountCountry');
  }

  document.getElementById('editAccountBtn').style.display = enable ? 'none' : 'inline-block';
  document.getElementById('SaveAccountBtn').style.display = enable ? 'inline-block' : 'none';
  document.getElementById('CancelAccountBtn').style.display = enable ? 'inline-block' : 'none';
}

// Check Session
document.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("/check-session", {
    method: "GET",
    credentials: "include"
  });

  const data = await res.json();

  if (data.success) {
    document.getElementById("loginItem").style.display = "none";
    document.getElementById("accountItem").style.display = "inline-block";
    document.getElementById("logoutItem").style.display = "inline-block";

    if (data.user && data.user.user_type_id === 1) {
      document.getElementById('h3admon').style.display = 'block';
      agregarOpcionesAdmin();

    }
    
  }
});

function agregarOpcionesAdmin() {
  const nav = document.getElementById("u1form"); // o el ul donde están los <li>

  // Crear elemento Usuarios
  const liUsuarios = document.createElement("li");
  liUsuarios.id = "getUsers"
  liUsuarios.innerHTML = `<a id="getUsers" href="#users">Usuarios</a>`;
  nav.appendChild(liUsuarios);

  // Usuarios

  document.getElementById("getUsers").addEventListener("click", async function () {
    cargarUsuarios();
});

}

async function cargarUsuarios() {
  // Verificar sesión
  const res = await fetch('/check-session', { credentials: 'include' });
  const data = await res.json();
  
  if (!data.success) {
    alert("Acceso denegado. Solo administradores.");
    location.hash = "#login";
    return;
  }

  // Cargar usuarios
  try {
    const response = await fetch('/users', { credentials: 'include' });
    const result = await response.json();
    const usuarios = result.users || [];

    const tbody = document.getElementById("bodyUsuarios");
    tbody.innerHTML = ""; 

    usuarios.forEach(user => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.user_id}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.user_type_id === 1 ? 'Administrador' : 'Usuario'}</td>
        <td>${user.active ? 'Activo' : 'Inactivo'}</td>
        <td>
          <button onclick="cambiarEstadoUsuario(${user.user_id}, ${user.active ? 0 : 1})">
            ${user.active ? 'Bloquear' : 'Desbloquear'}
          </button>
        </td>

      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    alert("Error al obtener la lista de usuarios.");
  }
}

async function cambiarEstadoUsuario(id, nuevoEstado) {
  const accion = nuevoEstado === 1 ? "Bloquear" : "Desbloquear";
  const confirmar = confirm(`¿Estás seguro de que deseas ${accion} este Usuario?`);

  if (!confirmar) return;

  try {
    const response = await fetch(`/users/active/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: nuevoEstado })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Error al actualizar');

    alert(`✅ Usuario actualizado exitosamente!`);
    cargarUsuarios();

  } catch (error) {
    console.error(`Error al ${accion} Usuario:`, error);
    alert("❌ Error al conectar con el servidor.");
  }
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", async function(e) {
  e.preventDefault();

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.textContent = "Cerrando sesión...";

  const response = await fetch("/logout", {
    method: "GET",
    credentials: "include"
  });

  const data = await response.json();

  if (data.success) {
    document.getElementById("loginItem").style.display = "inline-block";
    document.getElementById("accountItem").style.display = "none";
    document.getElementById("logoutItem").style.display = "none";
    document.getElementById('h3admon').style.display = 'none';
    logoutBtn.textContent = "Cerrar sesión";
  } else {
    alert("Error al cerrar sesión");
    logoutBtn.textContent = "Cerrar sesión";
  }
});

// Edit Account
document.getElementById("editAccountBtn").addEventListener("click", () => {
  const fields = document.querySelectorAll("#accountForm input");
  fields.forEach(field => {
    field.disabled = !field.disabled;

    // Cambiar color de fondo si está habilitado o no
    if (!field.disabled) {
      field.style.backgroundColor = "rgb(119 119 119)"; // fondo blanco editable
    } else {
      field.style.backgroundColor = "transparent"; // fondo gris claro no editable
    }
  });

  const countrySelect = document.getElementById('accountCountry');
  if (countrySelect) {
    countrySelect.disabled = !countrySelect.disabled;
    if (!countrySelect.disabled) {
      countrySelect.style.backgroundColor = "rgb(119 119 119)"; // fondo blanco editable
    } else {
      countrySelect.style.backgroundColor = "transparent"; // fondo gris claro no editable
    }
    
    // Debug: Verifica en consola
    console.log('Estado del select:', countrySelect.disabled ? 'Deshabilitado' : 'Habilitado');
  } else {
    console.error('No se encontró el select con ID accountCountry');
  }

  const birthdateInput = document.getElementById('accountBirthdate');
  const today = new Date();
  const sixYearsAgo = new Date(today.getFullYear() - 6, today.getMonth(), today.getDate());

  birthdateInput.max = sixYearsAgo.toISOString().split('T')[0];

  document.getElementById("editAccountBtn").style.display = "none";
  document.getElementById("CancelAccountBtn").style.display = "inline-block";
  document.getElementById("SaveAccountBtn").style.display = "inline-block";

});

// Cancel Edit
document.getElementById("CancelAccountBtn").addEventListener("click", () => {
  const fields = document.querySelectorAll("#accountForm input");
  fields.forEach(field => {
    field.disabled = !field.disabled;

    // Cambiar color de fondo si está habilitado o no
    if (!field.disabled) {
      field.style.backgroundColor = "rgb(119 119 119)"; // fondo blanco editable
    } else {
      field.style.backgroundColor = "transparent"; // fondo gris claro no editable
    }

    const countrySelect = document.getElementById('accountCountry');
    if (countrySelect) {
      countrySelect.disabled = !countrySelect.disabled;
      if (!countrySelect.disabled) {
        countrySelect.style.backgroundColor = "rgb(119 119 119)"; // fondo blanco editable
      } else {
        countrySelect.style.backgroundColor = "transparent"; // fondo gris claro no editable
      }
    }
    
  });

  document.getElementById("editAccountBtn").style.display = "inline-block";
  document.getElementById("CancelAccountBtn").style.display = "none";
  document.getElementById("SaveAccountBtn").style.display = "none";

});

window.addEventListener('DOMContentLoaded', () => {
  const birthdateInput = document.getElementById('birthdate');
  const today = new Date();
  const sixYearsAgo = new Date(today.getFullYear() - 6, today.getMonth(), today.getDate());

  birthdateInput.max = sixYearsAgo.toISOString().split('T')[0];
});

// Torneos

document.getElementById("getTournaments").addEventListener("click", async function () {
  try {
    const response = await fetch("/tournaments", {
      method: "GET",
      credentials: "include"
    });

    const data = await response.json();

    if (data.success) {
      const sessionResponse = await fetch("/check-session", {
        credentials: "include"
      });

      const sessionData = await sessionResponse.json();
      const isAdmin = sessionData?.user?.user_type_id === 1;
      console.log(isAdmin);

      // Renderizar torneos con o sin funciones admin
      renderTorneos(data.tournaments, isAdmin);
      document.getElementById("createTournamentBtn").style.display = 'block';

    } else {
      alert("No se pudieron los torneos.");
    }
  } catch (error) {
    console.error("Error al obtener torneos:", error);
    alert("Error al cargar torneos.");
  }
});

async function renderTorneos() {
  const response = await fetch('/tournaments');
  const data = await response.json();
  const torneos = data.success ? data.tournaments : [];

  window.listaDeTorneos = data.tournaments;

  let inscritos = [];
  const sessionRes = await fetch("/check-session", { credentials: "include" });
  const sessionData = await sessionRes.json();

  const isLoggedIn = sessionData.success;
  const user = sessionData.user;
  const isAdmin = user && user.user_type_id === 1;

  if (isLoggedIn) {
    const regRes = await fetch("/user-registrations", { credentials: "include" });
    const regData = await regRes.json();
    if (regData.success) {
      inscritos = regData.inscritos;
    }
  }

  if (isAdmin) {
    document.getElementById('createTournamentBtn').style.display = 'block';
  }

  const tbody = document.querySelector(".tournament-table tbody");
  tbody.innerHTML = "";

  torneos.forEach(torneo => {
    console.log(torneo);
    const fila = document.createElement("tr");
    const isFull = torneo.max_participants && torneo.current_participants >= torneo.max_participants;
    const isRegistered = inscritos.includes(torneo.tournament_id);

    // Mostrar participantes (actual/máximo)
    const participantsText = torneo.max_participants 
      ? `${torneo.current_participants}/${torneo.max_participants}`
      : `${torneo.current_participants} (sin límite)`;

    console.log(participantsText);

    fila.innerHTML = `
      <td>${torneo.name}</td>
      <td>${participantsText}</td>
      <td>$${torneo.registration_fee} USD</td>
    `;

     // Si el torneo está finalizado, mostramos el ganador
     if (torneo.status === 2) {
      fila.innerHTML += `
        <td><span class="corona-icon">👑</span> Ganador: ${torneo.winner_username}</td>
      `;
    } else {
       // Lógica de botón de inscripción
      if (isRegistered) {
        fila.innerHTML += `<td><button class="btn-register" disabled>Inscrito</button></td>`;
      } else if (isFull) {
        fila.innerHTML += `<td><button class="btn-register" disabled>Sin cupo</button></td>`;
      } else {
        fila.innerHTML += `<td><button class="btn-register" onclick="inscribirTorneo(${torneo.tournament_id}, this)">Inscribirse</button></td>`;
      }
    }

    // Botones de admin
    if (isAdmin) {
      let statusButtonHtml = '';
      let botonGanador = '';

      if (torneo.status === 1 /* activo */) {
        botonGanador = `
          <td>
            <button onclick="gestionarGanador(${torneo.tournament_id})">
              <i class="fas fa-trophy" style="font-size: 20px; color:gold; cursor: pointer;"></i>
            </button>
          </td>
        `;
      }
    
      if (torneo.status === 1) {
        // Mostrar botón para INHABILITAR
        statusButtonHtml = `
          <td>
            <button onclick="cambiarEstadoTorneo(${torneo.tournament_id}, 0)">
              <i class="fas fa-pause" style="font-size: 20px; color:rgb(206, 226, 94); cursor: pointer;"></i>
            </button>
          </td>
        `;
      } else {
        // Mostrar botón para HABILITAR
        statusButtonHtml = `
          <td>
            <button onclick="cambiarEstadoTorneo(${torneo.tournament_id}, 1)"">
              <i class="fas fa-play" style="font-size: 20px; color:green; cursor: pointer;"></i>
            </button>
          </td>
        `;
      }
    
      fila.innerHTML += `
        <td>
          <button onclick="modificarTorneo(${torneo.tournament_id})">
            <i class="fas fa-edit" style="font-size: 20px; color:rgb(248, 188, 225); cursor: pointer;"></i>
          </button>
        </td>
        <td>
          <button onclick="eliminarTorneo(${torneo.tournament_id})">
            <i class="fas fa-trash" style="font-size: 20px; color: #f44336; cursor: pointer;"></i>
          </button>
        </td>
        ${statusButtonHtml}
        ${botonGanador}
      `;
    }

      tbody.appendChild(fila);    

  });
}

async function eliminarTorneo(id) {
  const confirmar = confirm("¿Estás seguro de que deseas eliminar este torneo? Esta acción no se puede deshacer.");

  if (!confirmar) return;

  try {
    const res = await fetch(`/tournaments/${id}`, {
      method: 'DELETE'
    });

    const result = await res.json();

    if (!res.ok) {
      alert(`❌ Error al eliminar torneo: ${result.message || 'Error desconocido'}`);
      return;
    }

    alert('✅ Torneo eliminado correctamente.');
    renderTorneos();


  } catch (error) {
    console.error("Error al eliminar torneo:", error);
    alert("❌ Error al conectar con el servidor.");
  }
}

async function cambiarEstadoTorneo(id, nuevoEstado) {
  const accion = nuevoEstado === 1 ? "habilitar" : "inhabilitar";
  const confirmar = confirm(`¿Estás seguro de que deseas ${accion} este torneo?`);

  if (!confirmar) return;

  try {
    const response = await fetch(`/tournaments/status/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: nuevoEstado })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Error al actualizar');

    alert(`✅ Torneo actualizado exitosamente!`);
    renderTorneos(); // Actualiza la tabla

  } catch (error) {
    console.error(`Error al ${accion} torneo:`, error);
    alert("❌ Error al conectar con el servidor.");
  }
}


// Abrir modal con datos del torneo
async function modificarTorneo(id) {
  try {
    // Obtener los datos del torneo desde el backend
    const res = await fetch(`/tournaments/${id}`);
    if (!res.ok) {
      alert("Error al obtener datos del torneo.");
      return;
    }

    const torneo = await res.json();

    // Mostrar formulario
    const form = document.getElementById('tournamentForm');
    form.style.display = 'block'; 

    // Ocultar botón de creación, mostrar botón de edición
    document.getElementById('saveCreateBtn').style.display = 'none';
    document.getElementById('editBtn').style.display = 'inline';
    document.getElementById('tournamentId').style.display = 'inline';
    document.getElementById('tournamentId').value = id;
    
    // Guardar ID del torneo en un input oculto o atributo del formulario
    form.dataset.editingId = id;

    // Rellenar campos
    form.name.value = torneo.name;
    form.description.value = torneo.description;
    form.start_date.value = torneo.start_date.slice(0, 16); // recorta a formato yyyy-MM-ddTHH:mm
    form.end_date.value = torneo.end_date ? torneo.end_date.slice(0, 16) : '';
    form.registration_fee.value = torneo.registration_fee;
    form.max_participants.value = torneo.max_participants;

    updateCharCount(form.description); // Actualiza contador si usas uno

  } catch (error) {
    console.error("Error al cargar torneo:", error);
    alert("Error al cargar los datos del torneo.");
  }
}


// Actualizar Torneo
document.getElementById('editBtn').addEventListener('click', async () => {
  const tournamentId = document.getElementById('tournamentId').value;
  console.log(tournamentId);
  
  const formData = {
    name: document.getElementById('tournamentName').value,
    description: document.getElementById('tournamentDescription').value,
    start_date: document.getElementById('startDate').value,
    end_date: document.getElementById('endDate').value,
    registration_fee: parseFloat(document.getElementById('registrationFee').value),
    max_participants: parseInt(document.getElementById('maxParticipants').value) || 0
  };
  
  try {
    const btn = document.getElementById('editBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    
    const response = await fetch(`/tournaments/${tournamentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.message || 'Error al actualizar');
    
    alert('Torneo actualizado exitosamente!');
    renderTorneos(); // Refrescar tabla
    
  } catch (error) {
    console.error('Error:', error);
    alert(error.message || 'Error al actualizar torneo');
  } finally {
    const btn = document.getElementById('editBtn');
    btn.disabled = false;
    btn.innerHTML = 'Editar Torneo';
    document.getElementById('tournamentForm').style.display = 'none';
    document.getElementById("createTournamentBtn").style.display = 'block';
  }
});

function updateCharCount(textarea) {
  const currentLength = textarea.value.length;
  const maxLength = textarea.maxLength;
  const charCount = document.getElementById('charCount');
  
  // Actualizar contador
  charCount.textContent = `${currentLength}/${maxLength}`;
  
  // Cambiar color si se acerca al límite
  if (currentLength > maxLength * 0.9) {
    charCount.style.color = '#ff4444';
  } else {
    charCount.style.color = '';
  }
  
  // Limitar manualmente por si el navegador no soporta maxlength
  if (currentLength > maxLength) {
    textarea.value = textarea.value.substring(0, maxLength);
  }
}

// Habilita y configura el campo de fecha fin
function enableEndDate(startDateInput) {
  const endDateInput = document.getElementById('endDate');
  const startDate = new Date(startDateInput.value);
  
  if (!startDateInput.value) {
    endDateInput.disabled = true;
    return;
  }

  // Habilitar campo
  endDateInput.disabled = false;
  
  // Establecer fecha mínima (startDate + 1 minuto)
  const minEndDate = new Date(startDate.getTime() + 60000);
  const timezoneOffset = minEndDate.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(minEndDate - timezoneOffset)).toISOString().slice(0, 16);
  
  endDateInput.min = localISOTime;
  endDateInput.value = ''; // Resetear valor anterior
}

// Valida que la fecha fin sea válida
function validateEndDate(endDateInput) {
  const startDate = new Date(document.getElementById('startDate').value);
  const endDate = new Date(endDateInput.value);
  const errorElement = document.getElementById('endDateError');

  if (endDate <= startDate) {
    endDateInput.setCustomValidity('La fecha de fin debe ser posterior');
    errorElement.style.display = 'block';
    endDateInput.style.borderColor = '#ff4444';
  } else {
    endDateInput.setCustomValidity('');
    errorElement.style.display = 'none';
    endDateInput.style.borderColor = '';
  }
}

// Crear Torneo
document.getElementById('saveCreateBtn').addEventListener('click', async function (e) {
  e.preventDefault(); // Evita que el formulario se envíe de forma tradicional

  const form = document.getElementById('tournamentForm');

  const data = {
    name: form.name.value.trim(),
    description: form.description.value.trim(),
    start_date: form.start_date.value,
    end_date: form.end_date.value,
    registration_fee: parseFloat(form.registration_fee.value),
    max_participants: parseInt(form.max_participants.value)
  };

  try {
    const response = await fetch('/tournaments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      alert(`Error al crear el torneo: ${error.message || 'Error desconocido'}`);
      return;
    }

    const result = await response.json();
    alert('Torneo creado exitosamente.');

    form.reset(); // Limpia el formulario
    document.getElementById("tournamentForm").style.display = "none";
    document.getElementById("createTournamentBtn").style.display = "block";

    try {
      const response = await fetch("/tournaments", {
        method: "GET",
        credentials: "include"
      });
  
      const data = await response.json();
  
      if (data.success) {
        const sessionResponse = await fetch("/check-session", {
          credentials: "include"
        });
  
        const sessionData = await sessionResponse.json();
        const isAdmin = sessionData?.user?.user_type_id === 1;
        console.log(isAdmin);
  
        // Renderizar torneos con o sin funciones admin
        renderTorneos(data.tournaments, isAdmin);
  
      } else {
        alert("No se pudieron los torneos.");
      }
    } catch (error) {
      console.error("Error al obtener torneos:", error);
      alert("Error al cargar torneos.");
    }
    

  } catch (err) {
    console.error('Error al enviar el formulario:', err);
    alert('Ocurrió un error de red al crear el torneo.');
  }
});

// Establecer min/max al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  const startDateInput = document.getElementById('startDate');
  const now = new Date();
  
  // Formatear a YYYY-MM-DDThh:mm (formato compatible con datetime-local)
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(now - timezoneOffset)).toISOString().slice(0, 16);
  
  startDateInput.min = localISOTime;
  startDateInput.value = localISOTime; // Opcional: establecer fecha actual como default
});

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  const textarea = document.getElementById('tournamentDescription');
  updateCharCount(textarea);
});

async function inscribirTorneo(torneoId) {
  // Verificar sesión
  const res = await fetch("/check-session", {
    method: "GET",
    credentials: "include"
  });
  const data = await res.json();

  if (!data.success) {
    location.hash = "#login";
    return;
  }

  // Obtener detalles del torneo para mostrar
  const torneo = window.listaDeTorneos.find(t => t.tournament_id === torneoId);
  if (!torneo) return;

  // Guardar torneo actual en variable global
  window.torneoSeleccionado = torneo;

  // Mostrar artículo de pago y ocultar el de torneos
  document.getElementById("Payment").style.display = "block";
  document.getElementById("torneos").style.display = "none";

  // Rellenar la información del torneo en los campos correspondientes
  document.getElementById("paymentTournamentName").textContent = torneo.name;
  document.getElementById("paymentTournamentDescription").textContent = torneo.description;
  document.getElementById("paymentTournamentFee").textContent = torneo.registration_fee;

  // Navegar al hash del formulario de pago
  location.hash = "#Payment";
}

function mostrarMensaje(mensaje) {
  const mensajeDiv = document.createElement("div");
  mensajeDiv.textContent = mensaje;
  mensajeDiv.style.backgroundColor = "#4caf50";
  mensajeDiv.style.color = "white";
  mensajeDiv.style.padding = "10px";
  mensajeDiv.style.margin = "10px 0";
  mensajeDiv.style.borderRadius = "5px";
  document.getElementById("torneos").prepend(mensajeDiv);

  setTimeout(() => mensajeDiv.remove(), 5000);
}

document.getElementById('createTournamentBtn').addEventListener('click', () => {
  document.getElementById('tournamentForm').style.display = 'block';
  document.getElementById('createTournamentBtn').style.display = 'none';
  document.getElementById('editBtn').style.display = 'none';
  document.getElementById('saveCreateBtn').style.display = 'block';
});

document.getElementById('cancelCreateBtn').addEventListener('click', () => {
  document.getElementById('tournamentForm').style.display = 'none';
  document.getElementById("createTournamentBtn").style.display = 'block';
});

async function gestionarGanador(torneoId) {

    // Verificar sesión
    const res = await fetch("/check-session", {
      method: "GET",
      credentials: "include"
    });
    const data = await res.json();
  
    if (!data.success) {
      location.hash = "#login";
      return;
    }
  
    // Obtener detalles del torneo para mostrar
    const torneo = window.listaDeTorneos.find(t => t.tournament_id === torneoId);
    if (!torneo) return;
  
    // Guardar torneo actual en variable global
    window.torneoSeleccionado = torneo;
  
    // Mostrar artículo de pago y ocultar el de torneos
    document.getElementById("gestionGanadorArticle").style.display = "block";
    document.getElementById("torneos").style.display = "none";
  
    // Navegar al hash del formulario de pago
    location.hash = "#gestionGanadorArticle";

    try {
      const torneoRes = await fetch(`/tournaments/${torneoId}`);
      const torneo = await torneoRes.json();
  
      document.getElementById('infoTorneoGanador').innerHTML = `
        <p><strong>${torneo.name}</strong></p>
        <p>${torneo.description}</p>
        <p>Inicio: ${new Date(torneo.start_date).toLocaleString()}</p>
        <p>Fin: ${new Date(torneo.end_date).toLocaleString()}</p>
      `;
  
      const partRes = await fetch(`/tournaments/${torneoId}/participants`);
      participantesGlobal = await partRes.json();
  
      llenarComboParticipantes(participantesGlobal);
  
      document.getElementById('escogerGanadorBtn').onclick = () => {
        const ganadorId = document.getElementById('selectGanador').value;
        if (!ganadorId) return alert("Selecciona un participante");
        escogerGanador(torneoId, ganadorId);
      };
  
      document.getElementById('searchUsuario').addEventListener('input', () => {
        const filtro = document.getElementById('searchUsuario').value.toLowerCase();
        const filtrados = participantesGlobal.filter(p =>
          p.username.toLowerCase().includes(filtro)
        );
        llenarComboParticipantes(filtrados);
      });
  
    } catch (error) {
      console.error("Error al cargar gestión de ganador:", error);
      alert("❌ Error al cargar participantes o torneo.");
    }
}

function llenarComboParticipantes(participantes) {
  const select = document.getElementById('selectGanador');
  select.innerHTML = '<option value="">-- Selecciona un participante --</option>';
  participantes.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.user_id;
    opt.textContent = p.username;
    select.appendChild(opt);
  });
}

function cerrarGestionGanador() {
  document.getElementById('gestionGanadorArticle').hidden = true;
  document.getElementById('selectGanador').innerHTML = '';
  document.getElementById('searchUsuario').value = '';
}

async function escogerGanador(torneoId, userId) {
  try {
    const res = await fetch(`/tournaments/${torneoId}/winner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Error al asignar ganador');

    alert("🏆 ¡Ganador asignado correctamente!");
    cerrarGestionGanador();
    renderTorneos(); // Refresca si quieres
  } catch (error) {
    console.error("Error al asignar ganador:", error);
    alert("❌ Error al asignar el ganador.");
  }
}

// PAYMENT

const exchangeRates = {
  USD: 1,
  COP: 4000,        // Peso Colombiano
  EUR: 0.92,        // Euro
  JPY: 155.5,       // Yen Japonés
  CNY: 7.2,         // Yuan Chino
  KRW: 1370,        // Won Surcoreano
  INR: 83.3,        // Rupia India
  THB: 36.5,        // Baht Tailandés
  VND: 24500        // Dong Vietnamita
};


document.getElementById("changeCurrencyBtn").addEventListener("click", () => {
  document.getElementById("currencySelector").style.display = "block";
});

// Escuchar cambios de divisa
document.getElementById("currency").addEventListener("change", () => {
  const selectedCurrency = document.getElementById("currency").value;
  const feeUSD = window.torneoSeleccionado.registration_fee;
  const converted = (feeUSD * exchangeRates[selectedCurrency]).toFixed(2);

  document.getElementById("paymentTournamentFee").textContent = converted;
  document.getElementById("currencyLabel").textContent = selectedCurrency;
});

function validarTarjetaLuhn(numero) {
  let suma = 0;
  let alternar = false;

  for (let i = numero.length - 1; i >= 0; i--) {
    let n = parseInt(numero[i], 10);

    if (alternar) {
      n *= 2;
      if (n > 9) n -= 9;
    }

    suma += n;
    alternar = !alternar;
  }

  return suma % 10 === 0;
}

document.getElementById('cardNumber').addEventListener('input', function () {
  const cardInput = this.value.replace(/\s+/g, '');
  const esValida = /^[0-9]{13,19}$/.test(cardInput) && validarTarjetaLuhn(cardInput);

  document.getElementById('cardError').style.display = esValida ? 'none' : 'inline';
});

document.addEventListener("DOMContentLoaded", () => {
  const monthSelect = document.getElementById("expMonth");
  const yearSelect = document.getElementById("expYear");

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Cargar años (desde este año hasta 10 años más)
  for (let y = currentYear; y <= currentYear + 10; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    yearSelect.appendChild(option);
  }

  // Función para cargar meses según el año seleccionado
  function cargarMeses() {
    const selectedYear = parseInt(yearSelect.value);
    monthSelect.innerHTML = '<option value="">Mes</option>';

    for (let m = 1; m <= 12; m++) {
      // Si el año es el actual y el mes ya pasó, no incluirlo
      if (selectedYear === currentYear && m < currentMonth) continue;

      const option = document.createElement("option");
      option.value = m.toString().padStart(2, '0');
      option.textContent = m.toString().padStart(2, '0');
      monthSelect.appendChild(option);
    }
  }

  // Cargar meses al seleccionar año
  yearSelect.addEventListener("change", cargarMeses);
});

document.getElementById("cvv").addEventListener("input", function (e) {
  this.value = this.value.replace(/\D/g, "").slice(0, 3); // Solo dígitos, máximo 3
});

document.getElementById("paymentMethod").addEventListener("change", function() {
  const paymentMethod = this.value;

  // Ocultar todas las secciones de pago
  document.getElementById("creditCardForm").style.display = "none";
  document.getElementById("paypalForm").style.display = "none";
  document.getElementById("pseForm").style.display = "none";

  // Mostrar solo la sección correspondiente
  if (paymentMethod === "creditCard") {
    document.getElementById("creditCardForm").style.display = "block";
  } else if (paymentMethod === "paypal") {
    document.getElementById("paypalForm").style.display = "block";
  } else if (paymentMethod === "pse") {
    document.getElementById("pseForm").style.display = "block";
  }
});


document.getElementById("PaymentForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const paypalSection = document.getElementById("paypalForm");
  const cardSection = document.getElementById("creditCardForm");

  // Validar según el método visible
  if (paypalSection.style.display !== "none") {
    const paypalEmail = paypalSection.querySelector("input[name='paypal_email']");
    if (!paypalEmail || paypalEmail.value.trim() === "") {
      alert("Por favor ingresa tu correo de PayPal.");
      return;
    }
  } else if (cardSection.style.display !== "none") {
      const cardNumber = cardSection.querySelector("input[name='cardNumber']");
      const cardName = cardSection.querySelector("input[name='cardName']");
      const expMonth = cardSection.querySelector("select[name='expMonth']");
      const expYear = cardSection.querySelector("select[name='expYear']");
      const cvv = cardSection.querySelector("input[name='cvv']");

      if (
        !cardNumber.value.trim() ||
        !cardName.value.trim() ||
        !expMonth.value.trim() ||
        !expYear.value.trim() ||
        !cvv.value.trim()
      ) {
        alert("Por favor completa todos los campos de la tarjeta.");
        return;
      }

      // Validación extra si lo deseas:
      const cardPattern = /^\d{13,19}$/;
      const cvvPattern = /^\d{3}$/;

      if (!cardPattern.test(cardNumber.value)) {
        alert("Número de tarjeta inválido.");
        return;
      }

      if (!cvvPattern.test(cvv.value)) {
        alert("CVV inválido.");
        return;
      }
  } else {
    alert("No se ha seleccionado un método de pago.");
    return;
  }

  const payBtn = document.getElementById("payBtn");
  const loadingPopup = document.getElementById("loadingPopup");
  const paymentResult = document.getElementById("paymentResult");

  // Mostrar popup de carga
  loadingPopup.style.display = "flex";

  await new Promise(resolve => setTimeout(resolve, 5000)); // Simulación

  const pagoExitoso = Math.random() < 0.5;
  loadingPopup.style.display = "none";

  if (!pagoExitoso) {
    alert("❌ Pago fallido. Inténtalo nuevamente.");
    return;
  }

  const torneoId = window.torneoSeleccionado?.tournament_id;
  if (!torneoId) {
    alert("Error: torneo no encontrado.");
    return;
  }

  const res = await fetch("/inscribirse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ tournament_id: torneoId })
  });

  const data = await res.json();

  if (data.success) {
    document.getElementById("Payment").style.display = "none";
    paymentResult.style.display = "block";
    location.hash = "#paymentResult";
  } else {
    alert("Error al inscribirse: " + data.message);
  }
});



function updateRequiredFields() {
  document.querySelectorAll('.payment-form').forEach(form => {
    const isVisible = form.offsetParent !== null;
    form.querySelectorAll('input, select').forEach(input => {
      if (isVisible) {
        input.setAttribute('required', 'required');
      } else {
        input.removeAttribute('required');
      }
    });
  });
}

document.getElementById("paymentMethod").addEventListener("change", () => {
  const method = document.getElementById("paymentMethod").value;

  // Ocultar todos los formularios
  document.querySelectorAll(".payment-form").forEach(f => f.style.display = "none");

  // Mostrar el seleccionado
  if (method) {
    document.getElementById(`${method}Form`).style.display = "block";
  }

  updateRequiredFields(); // Actualiza `required` según visibilidad
});


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("PaymentForm");
  const payBtn = document.getElementById("payBtn");
  const paymentMethod = document.getElementById("paymentMethod");

  const validateForm = () => {
    const method = paymentMethod.value;
    let valid = true;

    // Validar que se haya seleccionado un método
    if (!method) return false;

    // Validar campos dependiendo del método
    if (method === "credit_card") {
      const cardNumber = document.getElementById("cardNumber").value.trim();
      const cardName = form.cardName.value.trim();
      const expMonth = form.expMonth.value;
      const expYear = form.expYear.value;
      const cvv = document.getElementById("cvv").value.trim();

      if (!/^\d{13,19}$/.test(cardNumber)) valid = false;
      if (!cardName) valid = false;
      if (!expMonth || !expYear) valid = false;
      if (!/^\d{3}$/.test(cvv)) valid = false;

    } else if (method === "paypal") {
      const email = form.paypalEmail.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) valid = false;

    } else if (method === "pse") {
      const bank = form.bank.value.trim();
      const docType = form.docType.value.trim();
      const docNumber = form.docNumber.value.trim();

      if (!bank || !docType || !docNumber) valid = false;
    }

    // Habilitar o deshabilitar el botón
    payBtn.disabled = !valid;
  };

  // Validar cuando se cambie el método de pago
  paymentMethod.addEventListener("change", () => {
    validateForm();
  });

  // Validar cuando cambie cualquier campo del formulario
  form.addEventListener("input", () => {
    validateForm();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const cardInput = document.getElementById("cardNumber");

  // Previene espacios mientras escribe
  cardInput.addEventListener("keypress", (e) => {
    if (e.key === " ") {
      e.preventDefault(); // Bloquea espacios
    }
  });

  // Elimina espacios si se pegan o ya están escritos
  cardInput.addEventListener("input", () => {
    cardInput.value = cardInput.value.replace(/\s+/g, '');
  });
});
