import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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
const db = getFirestore(app);

async function cargarReportes() {
  const snapshot = await getDocs(collection(db, 'citas'));
  const estadoCount = {};
  const odontologoCount = {};
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    // Por estado
    const estado = data.estado || 'Pendiente';
    estadoCount[estado] = (estadoCount[estado] || 0) + 1;
    // Por odontólogo
    const odontologo = data.odontologo || 'Sin asignar';
    odontologoCount[odontologo] = (odontologoCount[odontologo] || 0) + 1;
  });
  // Gráfico de estados
  const ctx1 = document.getElementById('citasPorEstado').getContext('2d');
  new Chart(ctx1, {
    type: 'doughnut',
    data: {
      labels: Object.keys(estadoCount),
      datasets: [{
        data: Object.values(estadoCount),
        backgroundColor: ['#00a3e1', '#ffb300', '#e53935', '#43a047']
      }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });
  // Gráfico de odontólogos
  const ctx2 = document.getElementById('citasPorOdontologo').getContext('2d');
  new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: Object.keys(odontologoCount),
      datasets: [{
        label: 'Citas por odontólogo',
        data: Object.values(odontologoCount),
        backgroundColor: '#00a3e1'
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

document.addEventListener('DOMContentLoaded', cargarReportes);
