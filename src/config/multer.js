const ApiError = requireFromRoot('utils/ApiError');

const whitelist = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const maxFileSizeMB = 5;

const uploadConfig = {
    dest(req, file, cd) {
        if (file.fieldname === 'profileImage') {
            cd(null, `${__dirname}/../public/profiles/images`);
        } else if (file.fieldname === 'backgroundImage') {
            cd(null, `${__dirname}/../public/background/images`);
        }
    },
    limits: {
        files: 2,
        fileSize: maxFileSizeMB * 300000
    },
    fileFilter: (req, file, cb) => {
        if (!whitelist.includes(file.mimetype)) {
            return cb(
                new ApiError(
                    400,
                    `${file.mimetype} file mimetype is not allowed`
                )
            );
        }
        cb(null, true);
    }
};

const profileImageConfig = {
    dest: `${__dirname}/../public/profiles/images/`,
    limits: {
        files: 1,
        fileSize: maxFileSizeMB * 300000
    },
    fileFilter: (req, file, cb) => {
        if (!whitelist.includes(file.mimetype)) {
            return cb(
                new ApiError(
                    400,
                    `${file.mimetype} file mimetype is not allowed`
                )
            );
        }
        cb(null, true);
    }
};

module.exports = {
    profileImageConfig,
    uploadConfig
};
