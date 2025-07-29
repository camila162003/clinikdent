import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, updateDoc, doc, addDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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
let pacienteDocId = null;
let preferenciasDocId = null;

onAuthStateChanged(auth, async user => {
  if (user) {
    userEmail = user.email;
    await cargarPerfilPaciente();
    await cargarPreferencias();
  } else {
    window.location.replace('index.html');
  }
});

async function cargarPerfilPaciente() {
  if (!userEmail) return;
  const q = query(collection(db, 'pacientes'), where('email', '==', userEmail));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    pacienteDocId = docSnap.id;
    const data = docSnap.data();
    document.getElementById('perfil-nombre').value = data.nombre || '';
    document.getElementById('perfil-apellidos').value = data.apellidos || '';
    document.getElementById('perfil-tipo-doc').value = data.tipoDocumento || '';
    document.getElementById('perfil-num-doc').value = data.numeroDocumento || '';
    document.getElementById('perfil-email').value = data.email || '';
    document.getElementById('perfil-telefono').value = data.telefono || '';
    document.getElementById('perfil-direccion').value = data.direccion || '';
  }
}

document.getElementById('formPerfilPaciente').addEventListener('submit', async function(e) {
  e.preventDefault();
  if (!pacienteDocId) return;
  const nombre = document.getElementById('perfil-nombre').value;
  const apellidos = document.getElementById('perfil-apellidos').value;
  const telefono = document.getElementById('perfil-telefono').value;
  const direccion = document.getElementById('perfil-direccion').value;
  // Validación extra: que no exista otro paciente con el mismo email o número de documento
  // (por si en el futuro se habilita la edición de estos campos)
  const email = document.getElementById('perfil-email').value;
  const numDoc = document.getElementById('perfil-num-doc').value;
  // Buscar por email y número de documento, excluyendo el propio documento
  const qEmail = query(collection(db, 'pacientes'), where('email', '==', email));
  const qDoc = query(collection(db, 'pacientes'), where('numeroDocumento', '==', numDoc));
  const [snapEmail, snapDoc] = await Promise.all([
    getDocs(qEmail),
    getDocs(qDoc)
  ]);
  let emailDuplicado = false;
  let docDuplicado = false;
  snapEmail.forEach(docu => { if (docu.id !== pacienteDocId) emailDuplicado = true; });
  snapDoc.forEach(docu => { if (docu.id !== pacienteDocId) docDuplicado = true; });
  if (emailDuplicado) {
    alert('Ya existe otro paciente registrado con este correo electrónico.');
    return;
  }
  if (docDuplicado) {
    alert('Ya existe otro paciente registrado con este número de documento.');
    return;
  }
  await updateDoc(doc(db, 'pacientes', pacienteDocId), {
    nombre,
    apellidos,
    telefono,
    direccion
  });
  alert('Datos actualizados correctamente');
});

// --- Preferencias ---
async function cargarPreferencias() {
  if (!userEmail) return;
  const q = query(collection(db, 'preferencias'), where('email', '==', userEmail));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    preferenciasDocId = docSnap.id;
    const data = docSnap.data();
    document.getElementById('preferencia-sms').checked = !!data.sms;
    document.getElementById('preferencia-whatsapp').checked = !!data.whatsapp;
  }
}
document.getElementById('formPreferenciasPaciente').addEventListener('submit', async function(e) {
  e.preventDefault();
  if (!userEmail) return;
  const sms = document.getElementById('preferencia-sms').checked;
  const whatsapp = document.getElementById('preferencia-whatsapp').checked;
  if (preferenciasDocId) {
    await updateDoc(doc(db, 'preferencias', preferenciasDocId), { sms, whatsapp });
  } else {
    await addDoc(collection(db, 'preferencias'), { email: userEmail, sms, whatsapp });
  }
  alert('Preferencias guardadas');
});

// --- Cambiar contraseña ---
document.getElementById('formCambiarContrasena').addEventListener('submit', async function(e) {
  e.preventDefault();
  const nueva = document.getElementById('perfil-nueva-contrasena').value;
  const confirmar = document.getElementById('perfil-confirmar-contrasena').value;
  if (nueva !== confirmar) {
    alert('Las contraseñas no coinciden');
    return;
  }
  const user = auth.currentUser;
  if (user) {
    await user.updatePassword(nueva);
    alert('Contraseña actualizada');
    document.getElementById('perfil-nueva-contrasena').value = '';
    document.getElementById('perfil-confirmar-contrasena').value = '';
  }
});
