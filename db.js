const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

module.exports.getSignedUsers = () => {
    const q = `SELECT * FROM users JOIN signatures ON users.id = signatures.user_id LEFT OUTER JOIN user_profiles ON signatures.user_id = user_profiles.user_id`;
    return db.query(q);
};

module.exports.getSignedUsersByCity = (city) => {
    const q = `SELECT * FROM users JOIN signatures ON users.id = signatures.user_id LEFT OUTER JOIN user_profiles ON signatures.user_id = user_profiles.user_id WHERE LOWER(city) = LOWER($1)`;
    const params = [city];
    return db.query(q, params);
};

module.exports.getUser = (userEmail) => {
    // const q = `SELECT * FROM users `;
    return db.query(`SELECT * FROM users WHERE email=$1`, [userEmail]);
};

module.exports.getProfile = (userId) => {
    const q = `SELECT * FROM users LEFT JOIN user_profiles ON users.id = user_profiles.user_id WHERE users.id=$1`;
    const params = [userId];
    return db.query(q, params);
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
    RETURNING id , first
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
    const params = [age || null, city || null, homepage || null, user_id];
    return db.query(q, params);
};

module.exports.updateUsers = (first, last, email, user_id) => {
    const q = `
    UPDATE users
    SET first = $1 , last = $2 , email = $3
    WHERE users.id = $4
    RETURNING id
    `;
    const params = [first, last, email, user_id];
    return db.query(q, params);
};

module.exports.updateUsersPassword = (
    first,
    last,
    email,
    password,
    user_id
) => {
    const q = `
    UPDATE users
    SET first = $1 , last = $2 , email = $3, password = $4
    WHERE users.id = $5
    RETURNING id
    `;
    const params = [first, last, email, password, user_id];
    return db.query(q, params);
};

module.exports.updateUsersProfile = (age, city, homepage, user_id) => {
    const q = `
    INSERT INTO user_profiles (age, city, homepage, user_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id) 
    DO UPDATE SET age = $1, city = $2, homepage = $3, user_id = $4
    RETURNING id
    `;
    const params = [age, city, homepage, user_id];
    return db.query(q, params);
};

module.exports.deleteSig = (user_id) => {
    return db.query(`DELETE FROM signatures WHERE user_id=$1`, [user_id]);
};
