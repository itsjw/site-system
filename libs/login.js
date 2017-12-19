const hash = require("password-hash"),
    fs = require("fs");

const User = require("./class.js").User;

module.exports = function (app) {
    app.use("/", function (req, res, next) {
        
        req.passport = {};
        req.passport.admin = (function (req, res, next) {
            if ( req.user ) {
                if ( req.user.admin ) {
                    return true;
                }
            }
            next(403);
            return false;
        }).bind( this, req, res);
        req.passport.client = (function (req, res, next) {
            return true;
        }).bind( this, req, res);
        
        
        if ( req.cookies.password && req.cookies.login ) {
            User.find({ Email: req.cookies.login }, function ( err, data ) {
                if (err) {
                    return next(err);
                }
                
                req.user = false;
                for ( var i = 0; i < data.length; i++ ) {
                    if ( hash.verify( req.cookies.password, data[i].password ) ) {
                        req.user = data[i];
                        break;
                    }
                }
                
                if ( !req.user ) {
                    res.clearCookie("login");
                    res.clearCookie("password");
                    
                    res.redirect("/login");
                }
                next();
                
            });
            
        } else {
            next();
        }
    });
    
    //login
    app.use("/login", function (req, res, next) {
        if ( req.user ) {
            return res.redirect("/startPage");
        }
        
        if ( req.body.login && req.body.password ) {
            res.cookie( "login", req.body.login, {
                maxAge: 12 * 30 * 24 * 60 * 60 * 1000,
            });
            res.cookie( "password", req.body.password, {
                maxAge: 12 * 30 * 24 * 60 * 60 * 1000,
            });
            
            return res.redirect("/startPage");
        }
        
        fs.readFile("views/login.html", "utf-8", function (err, data) {
            if ( err ) {
                next(err);
            }
            
            res.status(200).send(data);
        });
    });
    
    app.get("/exit", function (req, res, next) {
        res.clearCookie("login");
        res.clearCookie("password");
        
        res.redirect("/login");
    });
    
    app.get("/startPage", function (req, res, next) {
        if ( req.user ) {
            res.redirect( ( req.user.admin )?"/personal":"/choose_course" );
        }
    });
};