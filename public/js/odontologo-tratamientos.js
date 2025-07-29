import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.replace('index.html');
    return;
  }
  const tbody = document.querySelector('#tabla-tratamientos-odontologo tbody');
  tbody.innerHTML = '';
  const q = query(collection(db, 'tratamientos'), where('odontologo', '==', user.displayName || user.email));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const estado = data.estado || 'Pendiente';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${data.pacienteEmail || ''}</td><td><input type='text' class='form-control tratamiento-input' data-id='${docSnap.id}' value='${data.tratamiento || ''}'></td><td>${data.fecha || ''}</td><td>
      <select class='form-control estado-tratamiento' data-id='${docSnap.id}'>
        <option value='Pendiente' ${estado==='Pendiente'?'selected':''}>Pendiente</option>
        <option value='En gestión' ${estado==='En gestión'?'selected':''}>En gestión</option>
        <option value='Finalizado' ${estado==='Finalizado'?'selected':''}>Finalizado</option>
      </select>
    </td>`;
    tbody.appendChild(tr);
  });
});

document.addEventListener('change', async function(e) {
  if (e.target.classList.contains('estado-tratamiento')) {
    const id = e.target.getAttribute('data-id');
    const nuevoEstado = e.target.value;
    await updateDoc(doc(db, 'tratamientos', id), { estado: nuevoEstado });
  }
  if (e.target.classList.contains('tratamiento-input')) {
    const id = e.target.getAttribute('data-id');
    const nuevoTratamiento = e.target.value;
    await updateDoc(doc(db, 'tratamientos', id), { tratamiento: nuevoTratamiento });
  }
});
