import { FirebaseOptions } from 'firebase/app';

export const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAhVVMbCV48UjiH7iZQSnDTcLNOlprfDmA",
  authDomain: "studio-436674938-83dfd.firebaseapp.com",
  projectId: "studio-436674938-83dfd",
  storageBucket: "studio-436674938-83dfd.firebasestorage.app",
  messagingSenderId: "525691068941",
  appId: "1:525691068941:web:0cd68bd1d3766cb5046b44"
};

export function hasFirebaseConfig(): boolean {
    return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
}
