const async = require("async");

const { User, Step, Course } =  require("./class.js");

module.exports = function (app) {
    //********************************************************
    //                       Admin                            
    app.get("/edit_course/:id", function (req, res, next) {
        if ( !req.passport.admin(next) ) {
            return;
        }
        
        // if message display message
        if ( req.query.err || req.query.save || req.query.deleted ) {
            // if not this cookie = redirct/not display messge
            if ( !req.cookies.notDeletQuery ) {
                return res.redirect("/edit_course/" + req.params.id);
            }
        }
        
        res.clearCookie("notDeletQuery", {
            path: "/edit_course"
        });
        
        
        async.waterfall([
                Course.findById.bind(Course, req.params.id),
                function (course, callback) {
                    async.concat(course.steps, 
                        function (stepId, callback) {
                            Step.findById(stepId, function (err, step) {
                                callback(null, step);
                                if (err) {
                                    console.error(err);
                                }
                            });
                        },
                        function (err, steps) {
                            callback(err, course, steps);
                        }
                    );
                },
                function (course, steps, callback) {
                    res.render("course-management", {
                        user : req.user,
                        steps: steps,
                        course: course,
                        
                        
                        deleted : req.query.deleted || "",
                        errMessage: req.query.err || "",
                        save : req.query.save || ""
                    }, callback);
                }
            ],
            function (err, result) {
                if (err) {
                    return next(err);
                }
                
                res.send(result);
            }
        );
    });
    
    app.get("/edit_courses", function (req, res, next) {
        if ( !req.passport.admin(next) ) {
            return;
        }
        
        // if message display message
        if ( req.query.err || req.query.save || req.query.deleted ) {
            // if not this cookie = redirct/not display messge
            if ( !req.cookies.notDeletQuery ) {
                return res.redirect("/edit_courses");
            }
        }
        
        res.clearCookie("notDeletQuery", {
            path: "/edit_courses"
        });
        
        async.waterfall([
                Course.find.bind(Course, {}),
                function (courses, callback) {
                    res.render("courses", {
                        user: req.user,
                        courses: courses,
                        
                        deleted : req.query.deleted || "",
                        errMessage: req.query.err || "",
                        save : req.query.save || "",
                    }, callback);
                }
            ],
            function(err, result) {
                if ( err ) {
                    next(err);
                }
                
                res.status(200).send(result);
            }
        );
    });
    
    app.get("/personal", function (req, res, next) {
        if ( !req.passport.admin(next) ) {
            return;
        }
        
        // if message, display message
        if ( req.query.err || req.query.save || req.query.deleted ) {
            // if not this cookie = redirct/not display messge
            if ( !req.cookies.notDeletQuery ) {
                return res.redirect("/personal");
            }
        }
        
        res.clearCookie("notDeletQuery", {
            path: "/personal"
        });
        
        async.waterfall([
                function (callback) {
                    User.find({}, callback);
                },
                function (users, callback) {
                    Course.find({}, function (err, courses) {
                        callback(err, users, courses);
                    });
                },
                function (users, courses, callback) {
                    res.render("personal", {
                        users: users || [],
                        courses: courses,
                        user: req.user || {},
                        
                        
                        deleted : req.query.deleted || "",
                        errMessage: req.query.err || "",
                        save : req.query.save || "",
                    },
                    callback
                );
                }
            ],
            function(err, result) {
                if ( err ) {
                    return next(err);
                }
                
                res.status(200).send(result);
            }
        );
    });
};