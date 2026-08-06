import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseAdminApp() {
    if (getApps().length)
        return getApps()[0];

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!projectId || !clientEmail || !privateKey)
        throw new Error("Firebase Admin is not configured. Add the Firebase Admin environment variables.");

    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export async function verifyFirebaseIdToken(idToken) {
    return getAuth(getFirebaseAdminApp()).verifyIdToken(idToken, true);
}
