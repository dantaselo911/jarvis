import admin from 'firebase-admin';
import firebaseConfig from '../../firebase-applet-config.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // This works in Cloud Run
    projectId: firebaseConfig.projectId,
  });
}

// We need to use the specific databaseId from the config
export const db = admin.firestore(firebaseConfig.firestoreDatabaseId);
export default admin;
