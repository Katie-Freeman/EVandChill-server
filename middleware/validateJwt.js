const jwt = require("jsonwebtoken");

const validateJwt = (req, res, next) => {
    const { authorization } = req.headers;
    try {
        if (!authorization) throw new Error();
        const token = authorization.split(" ")[1];
        jwt.verify(token, process.env.JWT, (err, decoded) => {
            if (err) throw new Error();
            req.userId = decoded.id;
            next();
        });
    } catch {
        res.status(403).json({
            notAuthorized: "Not authorized for this request",
        });
    }
};

module.exports = validateJwt;
