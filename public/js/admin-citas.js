import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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

async function cargarCitas() {
  const tbody = document.querySelector('#tabla-citas tbody');
  tbody.innerHTML = '';
  const snapshot = await getDocs(collection(db, 'citas'));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${data.paciente || ''}</td><td>${data.odontologo || ''}</td><td>${data.fecha || ''}</td><td>${data.hora || ''}</td><td>${data.estado || 'Pendiente'}</td><td>
      <button class='btn btn-success btn-xs btn-estado' data-id='${docSnap.id}'>Marcar atendida</button>
      <button class='btn btn-danger btn-xs btn-eliminar' data-id='${docSnap.id}'><i class='fa fa-trash'></i></button>
    </td>`;
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', cargarCitas);

document.querySelector('#tabla-citas').addEventListener('click', async function(e) {
  if (e.target.classList.contains('btn-eliminar')) {
    const id = e.target.dataset.id;
    if (confirm('¿Eliminar esta cita?')) {
      await deleteDoc(doc(db, 'citas', id));
      cargarCitas();
    }
  }
  if (e.target.classList.contains('btn-estado')) {
    const id = e.target.dataset.id;
    await updateDoc(doc(db, 'citas', id), { estado: 'Atendida' });
    cargarCitas();
  }
});
