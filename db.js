const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSignatures = () => {
    const q = `
    SELECT * ›
    FROM signatures
`;
    return db.query(q);
};

module.exports.addSignature = (first_name, last_name, signature) => {
    const q = `
    INSERT INTO signatures (first_name, last_name, signature)
    values ($1, $2, $3)  
    RETURNING id
    `;
    const params = [first_name, last_name, signature];
    return db.query(q, params);
};
