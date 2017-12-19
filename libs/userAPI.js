const fs = require("fs"),
    async = require("async");

const User =require("./class.js").User;

module.exports = function (app, upload) {
    //******************************************************************************
    //                             API
    app.post("/addPerson", function ( req, res, next) {
        if ( !req.passport.admin(next) ) {
            return;
        }
        
        res.cookie("notDeletQuery", "On", {
            maxAge: 60 * 60 * 1000,
            path: "/personal"
        });
        
        if ( req.body.password1 == req.body.password2 && req.body.password2 ) {
            req.body.password = req.body.password1;
            var user = new User(req.body);
            user.save(function (err) {
                if ( err ) {
                    return res.redirect("/personal?err=Error while creating");
                }
                
                res.redirect("/personal?save=Ok");
            });
        } else {
            res.redirect("/personal?err=Passwords do not match");
        }
    });
    
    app.post("/editUser", function (req, res, next) {
        if ( !req.passport.admin(next) ) {
            return;
        }
        
        res.cookie("notDeletQuery", "On", {
            maxAge: 60 * 60 * 1000,
            path: "/personal"
        });
        
        User.findById(req.body._id, function (err, user) {
            if ( err ) {
                console.error(err);
                return res.redirect("/personal?err=Error connect to DB<br>Origin:" + err.toString());
            }
            if ( !user ) {
                return res.redirect("/personal?err=Error finding user");
            }
            if ( req.body.password1 != req.body.password2 ) {
                return res.redirect("/personal?err=Passwords do not match");
            }
            
            var data = {};
            
            for (var key in req.body) {
                if ( req.body[key] ) {
                    data[key] = req.body[key];
                }
            }
            
            if ( req.body.password1 ) {
                data.password = req.body.password1;
            }
            
            user.set(data);
            user.save( function (err) {
                res.redirect( (err)?"/personal?err=Error saving":"/personal?save=Ok" );
            } );
        });
    });
    app.get("/deleteUser", function(req, res, next) {
        if ( !req.passport.admin(next) ) {
            return;
        }
        
        if ( !req.query.id ) {
            return res.redirect("/personal");
        }
        
        res.cookie("notDeletQuery", "On", {
            maxAge: 60 * 60 * 1000,
            path: "/personal"
        });
        
        User.findById(req.query.id, function (err, user) {
            if ( err ) {
                return res.redirect("/personal?err=Error connect to DB<br>Origin:" + err.toString());
            }
            if ( !user ) {
                return res.redirect("/personal?err=Error finding user");
            }
            
            user.remove(function (err) {
                if ( err ) {
                    return res.redirect("/personal?err=Error while delete");
                }
                
                res.redirect("/personal?deleted=Ok");
            });
            
        });
    });
    app.post("/import", upload.single("users"), function(req, res, next) {
        if ( !req.passport.admin(next) ) {
            return;
        }
        res.cookie("notDeletQuery", "On", {
            maxAge: 60 * 60 * 1000,
            path: "/personal"
        });
        
        fs.readFile(req.file.path, "utf-8", function(err, data) {
            if ( err ) {
                return res.redirect("/personal?err=Error in file read");
            }
            
            
            const usersLine = data.split("||"),
                order = ["name", "surname", "Email", "password"];
            
            var notSaveUserCount = 0;
            
            async.concat(usersLine, parseAndSaveUser, function () {
                if ( notSaveUserCount ) {
                    return res.redirect("/personal?err=" + notSaveUserCount + " user not save!");
                }
                return res.redirect("/personal?save=Ok");
            });
            
            function parseAndSaveUser(userLine, callback) {
                var dataArray = userLine.split(",");
                if ( dataArray.length != order.length ) {
                    notSaveUserCount++;
                    return callback();
                }
                
                var objectUser = {};
                for ( var i = 0; i < order.length; i++ ) {
                    objectUser[order[i]] = dataArray[i];
                }
                
                var user = new User(objectUser);
                
                user.save( function (err) {
                    if (err) {
                        console.error(err);
                        notSaveUserCount++;
                    }
                    
                    return callback();
                });
            }
            
            fs.unlink(req.file.path, function (err) {
                if (err) {
                    console.error(err);
                }
            });
            
        });
    });
};