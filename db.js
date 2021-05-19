const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getUsers = () => {
    const q = `SELECT * FROM users`;
    return db.query(q);
};

module.exports.getUserPassword = (userEmail) => {
    return db.query(`SELECT password FROM users WHERE email=$1`, [userEmail]);
};

module.exports.getUserSignature = (userId) => {
    return db.query(`SELECT signature FROM signatures WHERE id=$1`, [userId]);
};

module.exports.addSignature = (signature) => {
    const q = `
    INSERT INTO signatures (signature)
    values ($1)  
    RETURNING id
    `;
    const params = [signature];
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
