const fs = require('fs');
const axios = require('axios');
const httpStatus = require('http-status');

const ApiError = requireFromRoot('utils/ApiError');
const logger = requireFromRoot('config/logger');

const downloadImageFromUrl = async (url, destinationFilepath, callback) => {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });
        return new Promise((resolve, reject) => {
            response.data
                .pipe(fs.createWriteStream(destinationFilepath))
                .on('error', reject)
                .once('close', () => resolve(destinationFilepath));
        });
    } catch (err) {
        logger.debug(err);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
    }
};
module.exports = downloadImageFromUrl;
