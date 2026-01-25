import { FirebaseOptions } from 'firebase/app';

// NOTE: Configuration is hardcoded as a fallback.
// It is recommended to use environment variables for security.
export const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAhVVMbCV48UjiH7iZQSnDTcLNOlprfDmA",
  authDomain: "studio-436674938-83dfd.firebaseapp.com",
  projectId: "studio-436674938-83dfd",
  storageBucket: "studio-436674938-83dfd.appspot.com",
  messagingSenderId: "525691068941",
  appId: "1:525691068941:web:0cd68bd1d3766cb5046b44"
};

export function hasFirebaseConfig(): boolean {
    return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
}
