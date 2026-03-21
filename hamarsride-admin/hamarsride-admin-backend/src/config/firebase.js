const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let app;

function initFirebase() {
  if (app) return app;

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credentialsPath) {
    const absolutePath = path.isAbsolute(credentialsPath)
      ? credentialsPath
      : path.resolve(process.cwd(), credentialsPath);

    if (fs.existsSync(absolutePath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      return app;
    }
  }

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
