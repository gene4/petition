const express = require("express");
const app = express();
const db = require("./db");
const cookieSession = require("cookie-session");
// const cookieParser = require("cookie-parser");
const hb = require("express-handlebars");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(
    cookieSession({
        secret: `I'm the cookie monster!`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    if ("signatureId" in req.session) {
        res.redirect("/thanks");
    }
    res.render("petition", {
        layout: "main",
    });
});

app.post("/petition", (req, res) => {
    db.addSignature(req.body.first, req.body.last, req.body.sig)

        .then((result) => {
            req.session.signatureId = result.rows[0].id;
            console.log(req.session);
            res.redirect("/thanks");
        })
        .catch((e) => {
            console.log(e);
            res.render("petition", {
                layout: "main",
                error: true,
            });
        });
});

app.get("/thanks", (req, res) => {
    if ("signatureId" in req.session) {
        console.log(req.session.signatureId);
        db.getUserSignature(req.session.signatureId)
            .then((result) => {
                console.log(result.rows[0].signature);
                res.render("thanks", {
                    layout: "main",
                    signature: result.rows[0].signature,
                });
            })
            .catch((e) => {
                console.log(e);
            });
    } else {
        res.redirect("/petition");
    }
});

app.get("/signers", (req, res) => {
    if ("signatureId" in req.session) {
        db.getSignatures()
            .then(({ rows }) => {
                console.log(rows);
                res.render("signers", {
                    layout: "main",
                    rows,
                });
            })
            .catch((e) => {
                console.log(e);
            });
    } else {
        res.redirect("/petition");
    }
});

// app.get("/cities", (req, res) => {
//     console.log("made in to cities route");
//     db.getCities()
//         .then((result) => {
//             console.log("result: ", result);
//         })
//         .catch((e) => console.log(e));
// });

// app.get("/add-city", (req, res) => {
//     console.log("made it add city");
//     db.addCity("lima", 10002020, "peru")
//         .then((result) => {
//             console.log(result);
//         })
//         .catch((e) => console.log(e));
// });

app.listen(8080, () => console.log("petition up and running"));
