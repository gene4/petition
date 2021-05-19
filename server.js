/////////////////////////////////
/// IMPORTS/////////////// /////
///////////////////////////////

const express = require("express");
const app = express();
const db = require("./db");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const hb = require("express-handlebars");
const { hash, compare } = require("./bcrypt");

/////////////////////////////////
/// HANDLEBARS BOILERPLATE /////
///////////////////////////////

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

///////////////////////////
//////// MIDDLEWARE //////
/////////////////////////

app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});

app.use(
    cookieSession({
        secret: `I'm the cookie monster!`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: "strict",
    })
);

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(csurf());

app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(express.static("public"));

///////////////////////
////////ROUTES////////
/////////////////////

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main",
    });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

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

app.post("/register", (req, res) => {
    hash(req.body.password)
        .then((hashedPw) => {
            console.log("hashedPwd in /register", hashedPw);
            db.addUser(req.body.first, req.body.last, req.body.email, hashedPw)
                .then((result) => {
                    req.session.userId = result.rows[0].id;
                    console.log(req.session);
                    res.redirect("/petition");
                })
                .catch((e) => {
                    console.log(e);
                    res.render("register", {
                        layout: "main",
                        error: true,
                    });
                });
        })
        .catch((err) => console.log("err in hash:", err));
});

app.post("/login", (req, res) => {
    db.getUserPassword(req.body.email)
        .then((result) => {
            let hashFromDb = result.rows[0].password;
            compare(req.body.password, hashFromDb)
                .then((match) => {
                    if (match) {
                        req.session.userId = result.rows[0].userId;
                        console.log("is the password correct?", match);
                        db.getUserSignature(req.session.userId)
                            .then((result) => {
                                if (result.rows.length == 0) {
                                    res.redirect("/petition");
                                } else {
                                    console.log(
                                        "rows should be full",
                                        result.rows
                                    );
                                    req.session.signatureId = result.rows[0].id;
                                    res.redirect("/thanks");
                                }
                            })
                            .catch((e) => {
                                console.log(e);
                            });
                    } else {
                        res.render("login", {
                            layout: "main",
                            error: true,
                        });
                    }
                })
                .catch((err) => {
                    console.log("err in compare", err);
                });
        })
        .catch((err) => {
            console.log("err in finding email", err);
            res.render("login", {
                layout: "main",
                email: true,
            });
        });
});

app.post("/petition", (req, res) => {
    db.addSignature(req.body.sig)

        .then((result) => {
            req.session.signatureId = result.rows[0].id;
            // console.log(req.session);
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
        db.getUserSignature(req.session.signatureId)
            .then((result) => {
                // console.log(result.rows[0].signature);
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
        db.getUsers()
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

app.listen(8080, () => console.log("petition up and running"));
