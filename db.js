const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

module.exports.getSignedUsers = () => {
    const q = `SELECT * FROM users JOIN signatures ON users.id = signatures.user_id LEFT OUTER JOIN user_profiles ON signatures.user_id = user_profiles.user_id`;
    return db.query(q);
};

module.exports.getUser = (userEmail) => {
    // const q = `SELECT * FROM users `;
    return db.query(`SELECT * FROM users WHERE email=$1`, [userEmail]);
};

module.exports.getUserSignature = (signatureId) => {
    const q = `SELECT signature FROM signatures WHERE id=$1`;
    const params = [signatureId];
    return db.query(q, params);
};

module.exports.checkSigned = (userId) => {
    return db.query(`SELECT *  FROM signatures WHERE user_id=$1`, [userId]);
};

module.exports.addSignature = (signature, user_id) => {
    const q = `
    INSERT INTO signatures (signature, user_id)
    values ($1, $2)  
    RETURNING id
    `;
    const params = [signature, user_id];
    return db.query(q, params);
};

module.exports.addUser = (first, last, email, password) => {
    const q = `
    INSERT INTO users (first, last, email, password)
    values ($1, $2, $3, $4)  
    RETURNING id
    `;
    const params = [first, last, email, password];
    return db.query(q, params);
};

module.exports.addProfile = (age, city, homepage, user_id) => {
    const q = `
    INSERT INTO user_profiles (age, city, homepage, user_id)
    values ($1, $2, $3, $4)  
    RETURNING id
    `;
    const params = [age, city, homepage, user_id];
    return db.query(q, params);
};
