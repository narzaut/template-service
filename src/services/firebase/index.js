const admin = require('firebase-admin');
const logger = requireFromRoot('config/logger');
const firebaseCert = requireFromRoot('config/certs/simple-comercio-firebase-admin.json');

const firebaseService = {
  connect: async () => {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseCert),
        databaseURL: 'https://simple-comercio.firebaseio.com'
      });
    } catch (err) {
      logger.debug(
        'There was an error attempting to authenticate firebase service through credentials json'
      );
    }
  },
  setUserClaims: async (uid, data) => {
    try {
      const response = await admin.auth().setCustomUserClaims(uid, data);
      return response;
    } catch (err) {
      logger.debug(err);
      return err;
    }
  },
  verifyToken: async (token) => {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return { decodedToken };
    } catch (err) {
      return { err };
    }
  }
};

module.exports = firebaseService;
