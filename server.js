/////////////////////////////////
/// IMPORTS/////////////// /////
///////////////////////////////

const express = require("express");
const app = express();
const db = require("./db");
const cookieSession = require("cookie-session");

const hb = require("express-handlebars");
const { hash, compare } = require("./bcrypt");
const csurf = require("csurf");

/////////////////////////////////
/// HANDLEBARS BOILERPLATE /////
///////////////////////////////

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

///////////////////////////
//////// MIDDLEWARE //////
/////////////////////////

if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

const secret =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;

app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");

    next();
});

app.use(
    cookieSession({
        secret,
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
    res.redirect("/login");
});

app.get("/petition", (req, res) => {
    if ("signatureId" in req.session) {
        res.redirect("/thanks");
    }
    res.render("petition", {
        layout: "main",
    });
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main",
    });
});

app.post("/profile", (req, res) => {
    let checkedHompage = "";
    if (
        req.body.homepage.startsWith("http://") ||
        req.body.homepage.startsWith("https://")
    ) {
        checkedHompage = req.body.homepage;
    } else {
        checkedHompage = "https://" + req.body.homepage;
    }
    db.addProfile(
        req.body.age,
        req.body.city,
        checkedHompage,
        req.session.userId
    )
        .then((result) => {
            res.redirect("/petition");
        })
        .catch((e) => {
            console.log(e);
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
                    res.redirect("/profile");
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
    db.getUser(req.body.email)
        .then((result) => {
            let hashFromDb = result.rows[0].password;
            compare(req.body.password, hashFromDb)
                .then((match) => {
                    if (match) {
                        req.session.userId = result.rows[0].id;
                        console.log("match password", req.session);
                        db.checkSigned(req.session.userId)
                            .then((result) => {
                                console.log("result after checkSigned", result);
                                if (result.rows[0]) {
                                    req.session.signatureId = result.rows[0].id;
                                    res.redirect("/thanks");
                                } else {
                                    res.redirect("/petition");
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
                .catch((e) => {
                    console.log("cant find password", e);
                });
        })
        .catch((e) => {
            console.log("cant find email", e);
            res.render("login", {
                layout: "main",
                email: true,
            });
        });
});

app.post("/petition", (req, res) => {
    db.addSignature(req.body.sig, req.session.userId)
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
    if (req.session.signatureId) {
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

app.post("/thanks", (req, res) => {
    db.deleteSig(req.session.userId)
        .then((result) => {
            req.session.signatureId = null;
            res.redirect("/petition");
        })
        .catch((e) => {
            console.log(e);
        });
});

app.get("/signers", (req, res) => {
    if ("signatureId" in req.session) {
        db.getSignedUsers()
            .then(({ rows }) => {
                // console.log(rows);
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

app.get("/signers/:city", (req, res) => {
    // console.log(req.params.city);
    db.getSignedUsersByCity(req.params.city)
        .then(({ rows }) => {
            // console.log(rows);
            res.render("signers-city", {
                layout: "main",
                rows,
                city: req.params.city,
            });
        })
        .catch((e) => {
            console.log(e);
        });
});
app.get("/profile/edit", (req, res) => {
    db.getProfile(req.session.userId)
        .then(({ rows }) => {
            res.render("edit-profile", {
                layout: "main",
                rows,
            });
        })
        .catch((e) => {
            console.log(e);
        });
});

app.post("/profile/edit", (req, res) => {
    if (!req.body.password) {
        db.updateUsers(
            req.body.first,
            req.body.last,
            req.body.email,
            req.session.userId
        )
            .then((result) => {
                db.updateUsersProfile(
                    req.body.age,
                    req.body.city,
                    req.body.homepage,
                    req.session.userId
                )
                    .then((result) => {
                        res.render("profile-changed", {
                            layout: "main",
                        });
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            })
            .catch((e) => {
                console.log(e);
            });
    } else {
        hash(req.body.password).then((hashedPw) => {
            db.updateUsersPassword(
                req.body.first,
                req.body.last,
                req.body.email,
                hashedPw,
                req.session.userId
            )
                .then((result) => {
                    db.updateUsersProfile(
                        req.body.age,
                        req.body.city,
                        req.body.homepage,
                        req.session.userId
                    )
                        .then((result) => {
                            res.render("profile-changed", {
                                layout: "main",
                            });
                        })
                        .catch((e) => {
                            console.log(e);
                        });
                })
                .catch((e) => {
                    console.log(e);
                });
        });
    }
});

app.listen(process.env.PORT || 8080, () =>
    console.log("petition up and running")
);
