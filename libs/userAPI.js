const fs = require("fs"),
    async = require("async"),
    textErr = require("../errorText.json").errorText;

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
                    console.error(err);
                    return res.redirect("/personal?err=" + textErr.CreateError );
                }
                console.log("Add person");
                console.log(user);
                
                res.redirect("/personal?save=Ok");
            });
        } else {
            res.redirect("/personal?err=" + textErr.PasswordsError);
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
                return res.redirect("/personal?err=" + textErr.FindError);
            }
            if ( !user ) {
                return res.redirect("/personal?err=" + textErr.FindError);
            }
            if ( req.body.password1 != req.body.password2 ) {
                return res.redirect("/personal?err=" + textErr.PasswordsError);
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
            
            console.log("Edit user");
            console.log(user);
            console.log(req.body);
            
            user.set(data);
            user.save( function (err) {
                if (err) {
                    console.error(err);
                }
                res.redirect( (err)?"/personal?err=" + textErr.SavingError : "/personal?save=Ok" );
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
                console.error(err);
                return res.redirect("/personal?err=" + textErr.FindError);
            }
            if ( !user ) {
                return res.redirect("/personal?err=" + textErr.FindError);
            }
            
            user.remove(function (err) {
                if ( err ) {
                    console.error(err);
                    return res.redirect("/personal?err=" + textErr.DeletedError);
                }
                
                console.log("Deleted user id:%s", user._id);
                
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
        
        fs.readFile("./" + req.file.path, "utf-8", function(err, data) {
            if ( err ) {
                console.error(err);
                return res.redirect("/personal?err=" + textErr.NotValidFileError);
            }
            
            
            const usersLine = data.split("||"),
                order = ["name", "surname", "Email", "password"];
            
            console.log("Import users:");
            console.log(usersLine);
            
            var notSaveUserCount = 0;
            
            async.concat(usersLine, parseAndSaveUser, function () {
                if ( notSaveUserCount ) {
                    return res.redirect("/personal?err=User №" + notSaveUserCount + " not save");
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
                    
                    console.log("Import user save id:%s", user._id);
                    
                    return callback();
                });
            }
            
            fs.unlink("./" + req.file.path, function (err) {
                if (err) {
                    console.error(err);
                }
            });
            
        });
    });
};