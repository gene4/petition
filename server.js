const express = require("express");
const app = express();
const db = require("./db");
const cookieSession = require("cookie-session");
// const cookieParser = require("cookie-parser");
const hb = require("express-handlebars");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(express.static("public"));

app.use(
    express.urlencoded({
        extended: false,
    })
);

// app.use(cookieParser());

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.post("/petition", (req, res) => {
    db.addSignature(r);
});

// app.get("/cities", (req, res) => {
//     console.log("made in to cities route");
//     db.getCities()
//         .then((result) => {
//             console.log("result: ", result);
//         })
//         .catch((e) => console.log(e));
// });

app.get("/add-city", (req, res) => {
    console.log("made it add city");
    db.addCity("lima", 10002020, "peru")
        .then((result) => {
            console.log(result);
        })
        .catch((e) => console.log(e));
});

app.listen(8080, () => console.log("petition up and running"));
