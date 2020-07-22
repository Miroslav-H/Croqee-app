const jwt = require("jsonwebtoken");
const User = require("mongoose").model("User");
const config = require("../config");
/**
 *  The Auth Checker middleware function.
 */
module.exports = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).end();
    }
    // get the last part from a authorization header string like "bearer token-value"
    const token = req.headers.authorization.split(" ")[1];
    // decode the token using a secret key-phrase
    return jwt.verify(token, config.jwtSecret, (err, decoded) => {
        // the 401 code is for unauthorized status
        if (err) {
            return res.status(401).end();
        }
        let userId = "";
        if (typeof decoded.sub === "string") {
            userId = decoded.sub;
        }
        else {
            userId = decoded;
        }
        // check if a user exists
        return User.findById(userId, (userErr, user) => {
            if (userErr || !user) {
                return res.status(401).end();
            }
            // pass user details onto next route
            req.user = user;
            return next();
        });
    });
};
//# sourceMappingURL=auth-check.js.map