import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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

let userEmail = null;

onAuthStateChanged(auth, user => {
  if (user) {
    userEmail = user.email;
    cargarCitasPaciente();
    cargarOdontologos();
  } else {
    window.location.replace('index.html');
  }
});

async function cargarCitasPaciente() {
  const tbody = document.querySelector('#tabla-citas-paciente tbody');
  tbody.innerHTML = '';
  if (!userEmail) return;
  const q = query(collection(db, 'citas'), where('pacienteEmail', '==', userEmail));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${data.odontologo || ''}</td><td>${data.fecha || ''}</td><td>${data.hora || ''}</td><td>${data.estado || 'Pendiente'}</td>`;
    tbody.appendChild(tr);
  });
}

async function cargarOdontologos() {
  const select = document.getElementById('cita-odontologo');
  select.innerHTML = '';
  const snapshot = await getDocs(collection(db, 'odontologos'));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const option = document.createElement('option');
    option.value = data.nombre;
    option.textContent = data.nombre;
    select.appendChild(option);
  });
}

document.getElementById('formAgendarCita').addEventListener('submit', async function(e) {
  e.preventDefault();
  const odontologo = document.getElementById('cita-odontologo').value;
  const fecha = document.getElementById('cita-fecha').value;
  const hora = document.getElementById('cita-hora').value;
  if (!userEmail) return;
  // Validar que la fecha no sea anterior a hoy
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  const fechaSeleccionada = new Date(fecha + 'T00:00:00');
  if (fechaSeleccionada < hoy) {
    alert('No puedes agendar una cita en una fecha anterior a la actual.');
    return;
  }
  await addDoc(collection(db, 'citas'), {
    pacienteEmail: userEmail,
    odontologo,
    fecha,
    hora,
    estado: 'Pendiente'
  });
  $('#modalAgendar').modal('hide');
  cargarCitasPaciente();
});
// Al abrir el modal, poner el mínimo de fecha en hoy
$(document).ready(function() {
  $('#modalAgendar').on('show.bs.modal', function() {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;
    document.getElementById('cita-fecha').setAttribute('min', minDate);
  });
});
