DROP TABLE IF EXIST signatures;
-- This is how you comment here 🌠

CREATE TABLE signatures (
id SERIAL PRIMARY KEY,
first_name VARCHAR NOT NULL CHECK (first_name != ''),
last_name VARCHAR NOT NULL CHECK (last_name != ''),
signature VARCHAR NOT NULL CHECK (signature != ''),
timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);