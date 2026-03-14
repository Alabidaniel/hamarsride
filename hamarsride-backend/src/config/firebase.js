const admin = require("firebase-admin");

let app;

function initFirebase() {
  if (app) return app;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return app;
  }

  // Falls back to GOOGLE_APPLICATION_CREDENTIALS
  app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
  return app;
}

function getAuth() {
  if (!app) initFirebase();
  return admin.auth();
}

module.exports = { initFirebase, getAuth };
