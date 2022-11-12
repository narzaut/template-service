const withTimeout = (millis, promise) => {
    const timeout = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Timed out')), millis);
    });
    return Promise.race([promise, timeout]);
};
module.exports = withTimeout;
