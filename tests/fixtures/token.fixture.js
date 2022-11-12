const supertest = require('supertest');

const firebaseLogin = supertest('https://identitytoolkit.googleapis.com');
const getFirebaseUser = async (email, password) => {
    const response = await firebaseLogin
        .post(
            '/v1/accounts:signInWithPassword?key=AIzaSyAjtCE7r4GEAJgVHFIqNHlSnw2tddo3tEc'
        )
        .send({ returnSecureToken: true, email, password });
    return { token: response.body.idToken, uid: response.body.localId };
};

module.exports = {
    getFirebaseUser
};
