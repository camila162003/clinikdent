import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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
    cargarTratamientosPaciente();
  } else {
    window.location.replace('index.html');
  }
});

async function cargarTratamientosPaciente() {
  const tbody = document.querySelector('#tabla-tratamientos-paciente tbody');
  tbody.innerHTML = '';
  if (!userEmail) return;
  const q = query(collection(db, 'tratamientos'), where('pacienteEmail', '==', userEmail));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${data.nombre || ''}</td><td>${data.estado || ''}</td><td>${data.odontologo || ''}</td><td>${data.fechaInicio || ''}</td><td>${data.fechaFin || ''}</td>`;
    tbody.appendChild(tr);
  });
}
