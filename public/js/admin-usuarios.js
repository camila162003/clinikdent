// admin-usuarios.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, deleteUser } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDZDyoYOm-P8KJCs-Jukt_eaOiYKIrAoj4",
  authDomain: "clinikdent-f39c3.firebaseapp.com",
  projectId: "clinikdent-f39c3",
  storageBucket: "clinikdent-f39c3.firebasestorage.app",
  messagingSenderId: "543210066190",
  appId: "1:543210066190:web:0cba6a0ada95da1a4e875f",
  measurementId: "G-Q9CXVCY7VR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- PACIENTES ---
async function cargarPacientes() {
  const tbody = document.querySelector('#tabla-pacientes tbody');
  tbody.innerHTML = '';
  const snapshot = await getDocs(collection(db, 'pacientes'));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${data.nombre || ''}</td><td>${data.email || ''}</td><td>${data.telefono || ''}</td><td><button class='btn btn-info btn-xs btn-ver-citas' data-email='${data.email}'>Ver citas</button></td>`;
    tbody.appendChild(tr);
  });
  // Evento para ver citas del paciente
  tbody.addEventListener('click', async function(e) {
    if (e.target.classList.contains('btn-ver-citas')) {
      const emailPaciente = e.target.getAttribute('data-email');
      const citasTbody = document.querySelector('#tabla-citas-paciente-admin tbody');
      citasTbody.innerHTML = '';
      // Buscar citas de este paciente
      const { query, where, getDocs, collection } = await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js');
      const q = query(collection(db, 'citas'), where('pacienteEmail', '==', emailPaciente));
      const snapshotCitas = await getDocs(q);
      snapshotCitas.forEach(docSnap => {
        const data = docSnap.data();
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${data.fecha || ''}</td><td>${data.hora || ''}</td><td>${data.odontologo || ''}</td><td>${data.estado || 'Pendiente'}</td>`;
        citasTbody.appendChild(tr);
      });
      $('#modalCitasPacienteAdmin').modal('show');
    }
  });
}

// --- ODONTOLOGOS ---
async function cargarOdontologos() {
  const tbody = document.querySelector('#tabla-odontologos tbody');
  tbody.innerHTML = '';
  const snapshot = await getDocs(collection(db, 'odontologos'));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const avatar = data.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/6073/6073873.png';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><div class='table-user'><img src='${avatar}' class='user-avatar' alt='avatar'></div></td><td>${data.nombre || ''}</td><td>${data.email || ''}</td><td>${data.telefono || ''}</td><td>
      <button class='btn btn-editar btn-xs btn-editar' data-id='${docSnap.id}'><i class='fa fa-pencil'></i></button>
      <button class='btn btn-eliminar btn-xs btn-eliminar' data-id='${docSnap.id}'><i class='fa fa-trash'></i></button>
    </td>`;
    tbody.appendChild(tr);
  });
}

// --- PERSONAL ---
async function cargarPersonal() {
  const tbody = document.querySelector('#tabla-personal tbody');
  tbody.innerHTML = '';
  const snapshot = await getDocs(collection(db, 'personal'));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const avatar = data.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/6073/6073873.png';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><div class='table-user'><img src='${avatar}' class='user-avatar' alt='avatar'></div></td><td>${data.nombre || ''}</td><td>${data.email || ''}</td><td>${data.telefono || ''}</td><td>
      <button class='btn btn-editar btn-xs btn-editar' data-id='${docSnap.id}'><i class='fa fa-pencil'></i></button>
      <button class='btn btn-eliminar btn-xs btn-eliminar' data-id='${docSnap.id}'><i class='fa fa-trash'></i></button>
    </td>`;
    tbody.appendChild(tr);
  });
}

// --- AGREGAR ODONTOLOGO ---
document.getElementById('formAgregarOdontologo').addEventListener('submit', async function(e) {
  e.preventDefault();
  const nombre = document.getElementById('odontologo-nombre').value;
  const email = document.getElementById('odontologo-email').value;
  const telefono = document.getElementById('odontologo-telefono').value;
  const password = document.getElementById('odontologo-password').value;
  try {
    // Crear usuario en Auth
    await createUserWithEmailAndPassword(auth, email, password);
    // Guardar en Firestore con rol y avatar por defecto
    await addDoc(collection(db, 'odontologos'), {
      nombre,
      email,
      telefono,
      rol: 'odontologo',
      avatarUrl: 'https://cdn-icons-png.flaticon.com/512/6073/6073873.png'
    });
    $('#modalAgregarOdontologo').modal('hide');
    cargarOdontologos();
  } catch (err) {
    alert('Error al agregar odontólogo: ' + err.message);
  }
});

// --- AGREGAR PERSONAL ---
document.getElementById('formAgregarPersonal').addEventListener('submit', async function(e) {
  e.preventDefault();
  const nombre = document.getElementById('personal-nombre').value;
  const email = document.getElementById('personal-email').value;
  const telefono = document.getElementById('personal-telefono').value;
  const password = document.getElementById('personal-password').value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    await addDoc(collection(db, 'personal'), { nombre, email, telefono });
    $('#modalAgregarPersonal').modal('hide');
    cargarPersonal();
  } catch (err) {
    alert('Error al agregar personal: ' + err.message);
  }
});

// --- ELIMINAR Y EDITAR ODONTOLOGO ---
document.querySelector('#tabla-odontologos').addEventListener('click', async function(e) {
  if (e.target.closest('.btn-eliminar')) {
    const id = e.target.closest('.btn-eliminar').dataset.id;
    if (confirm('¿Eliminar este odontólogo?')) {
      await deleteDoc(doc(db, 'odontologos', id));
      cargarOdontologos();
    }
  }
  if (e.target.closest('.btn-editar')) {
    const id = e.target.closest('.btn-editar').dataset.id;
    editarUsuario('odontologos', id, cargarOdontologos);
  }
});
// --- ELIMINAR Y EDITAR PERSONAL ---
document.querySelector('#tabla-personal').addEventListener('click', async function(e) {
  if (e.target.closest('.btn-eliminar')) {
    const id = e.target.closest('.btn-eliminar').dataset.id;
    if (confirm('¿Eliminar este personal?')) {
      await deleteDoc(doc(db, 'personal', id));
      cargarPersonal();
    }
  }
  if (e.target.closest('.btn-editar')) {
    const id = e.target.closest('.btn-editar').dataset.id;
    editarUsuario('personal', id, cargarPersonal);
  }
});

// --- EDITAR USUARIO (ODONTOLOGO/PERSONAL) ---
async function editarUsuario(tipo, id, recargar) {
  const tr = document.querySelector(`[data-id='${id}']`).closest('tr');
  const tds = tr.querySelectorAll('td');
  const nombre = tds[1].innerText;
  const email = tds[2].innerText;
  const telefono = tds[3].innerText;
  tr.innerHTML = `<td>${tds[0].innerHTML}</td>
    <td><input type='text' class='form-control edit-form-inline' value='${nombre}' id='edit-nombre'></td>
    <td><input type='email' class='form-control edit-form-inline' value='${email}' id='edit-email'></td>
    <td><input type='tel' class='form-control edit-form-inline' value='${telefono}' id='edit-telefono'></td>
    <td>
      <button class='btn btn-success btn-xs btn-guardar'><i class='fa fa-check'></i></button>
      <button class='btn btn-default btn-xs btn-cancelar'><i class='fa fa-times'></i></button>
    </td>`;
  tr.querySelector('.btn-guardar').onclick = async function() {
    const nuevoNombre = tr.querySelector('#edit-nombre').value;
    const nuevoEmail = tr.querySelector('#edit-email').value;
    const nuevoTelefono = tr.querySelector('#edit-telefono').value;
    await updateDoc(doc(db, tipo, id), {
      nombre: nuevoNombre,
      email: nuevoEmail,
      telefono: nuevoTelefono
    });
    recargar();
  };
  tr.querySelector('.btn-cancelar').onclick = function() {
    recargar();
  };
}

// --- ADMINISTRADORES ---
async function cargarAdmins() {
  const tbody = document.querySelector('#tabla-admins tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const snapshot = await getDocs(collection(db, 'administradores'));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const avatar = data.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><div class='table-user'><img src='${avatar}' class='user-avatar' alt='avatar'></div></td><td>${data.nombre || ''}</td><td>${data.email || ''}</td><td>${data.telefono || ''}</td><td>
      <button class='btn btn-editar btn-xs btn-editar' data-id='${docSnap.id}'><i class='fa fa-pencil'></i></button>
      <button class='btn btn-eliminar btn-xs btn-eliminar' data-id='${docSnap.id}'><i class='fa fa-trash'></i></button>
    </td>`;
    tbody.appendChild(tr);
  });
}

// --- AGREGAR ADMINISTRADOR ---
const formAdmin = document.getElementById('formAgregarAdmin');
if (formAdmin) {
  formAdmin.addEventListener('submit', async function(e) {
    e.preventDefault();
    const nombre = document.getElementById('admin-nombre').value;
    const email = document.getElementById('admin-email').value;
    const telefono = document.getElementById('admin-telefono').value;
    const password = document.getElementById('admin-password').value;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await addDoc(collection(db, 'administradores'), {
        nombre,
        email,
        telefono,
        rol: 'admin',
        avatarUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
      });
      $('#modalAgregarAdmin').modal('hide');
      cargarAdmins();
    } catch (err) {
      alert('Error al agregar administrador: ' + err.message);
    }
  });
}

// --- ELIMINAR Y EDITAR ADMINISTRADOR ---
const tablaAdmins = document.querySelector('#tabla-admins');
if (tablaAdmins) {
  tablaAdmins.addEventListener('click', async function(e) {
    if (e.target.closest('.btn-eliminar')) {
      const id = e.target.closest('.btn-eliminar').dataset.id;
      if (confirm('¿Eliminar este administrador?')) {
        await deleteDoc(doc(db, 'administradores', id));
        cargarAdmins();
      }
    }
    if (e.target.closest('.btn-editar')) {
      const id = e.target.closest('.btn-editar').dataset.id;
      editarUsuario('administradores', id, cargarAdmins);
    }
  });
}

// --- INICIALIZAR ---
document.addEventListener('DOMContentLoaded', function() {
  cargarPacientes();
  cargarOdontologos();
  cargarPersonal();
  cargarAdmins();
});
