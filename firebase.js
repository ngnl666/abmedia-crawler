import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
} from 'firebase/firestore';

const firebaseApp = initializeApp({
  apiKey: 'AIzaSyAExbEXv1nuSvh4j3DVV4dcrfNcEIzPdeY',
  authDomain: 'crypto-dashboard-d29d0.firebaseapp.com',
  projectId: 'crypto-dashboard-d29d0',
});

const db = getFirestore(firebaseApp);

export const insert = async (data, docs) => {
  try {
    const isInCollection = docs.find((doc) => doc.date === data.date);
    let docRef = '';
    if (!isInCollection) docRef = await addDoc(collection(db, 'news'), data);
    console.log(new Date());
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

export const getData = async () => {
  const q = query(collection(db, 'news'));
  const res = await getDocs(q);
  const data = res.docs.map((d) => d.data());
  return data;
};
