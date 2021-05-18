const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSignatures = () => {
    const q = `
    SELECT * ›
    FROM signatures
`;
    return db.query(q);
};

module.exports.addSignature = (id, first_name, last_name, signature) => {
    const q = `
    INSERT INTO cities (id, first_name, last_name, signature)
    values ($1, $2, $3, $4)  
    RETURNING id;
    `;
    const params = [id, first_name, last_name, signature];
    return db.query(q, params);
};
