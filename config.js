import firebase from 'firebase';
require('@firebase/firestore')

var firebaseConfig = {
  apiKey: "AIzaSyC1m0W6V10Z9aTmwHJrc6JC4mZS11C2hpg",
  authDomain: "foodsanta-c8c55.firebaseapp.com",
  databaseURL: "https://foodsanta-c8c55.firebaseio.com",
  projectId: "foodsanta-c8c55",
  storageBucket: "foodsanta-c8c55.appspot.com",
  messagingSenderId: "71122412802",
  appId: "1:71122412802:web:77f38b60d9a2aa49dace1b"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase.firestore();
