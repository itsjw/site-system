const async = require("async"),
    navData = require("./navData.js");

const { User, Step, Course } =  require("./class.js");

module.exports = function (app) {
    app.get("/choose_course/:courseId/step/:stepNumber", function (req, res, next) {
        if ( !req.passport.client(next) ) {
            return;
        }
        if ( !req.params.courseId && !req.params.stepNumber ) {
            return next(400);
        }
        
        async.waterfall([
                navData,
                function (courses, callback) {
                    var course = courses.find(function (value) {
                        return ( value._id.toString() ) == req.params.courseId;
                    });
                
                    if ( !course || course.steps.length <= +req.params.stepNumber) {
                        return callback(404);
                    }
                    
                    Step.findById( course.steps[req.params.stepNumber], function (err, step) {
                        callback(err, courses, course, step);
                    });
                },
                function (courses, course, step, callback) {
                    res.render( ((step.type == "video")?"video":"step"), {
                        user: req.user,
                        
                        courses: courses,
                        course : course,
                        step   : step,
                        
                        href   : req.url
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
    app.post("/choose_course/:courseId/step/:stepNumber", function (req, res, next) {
        if ( !req.passport.client(next) ) {
            return;
        }
        if ( !req.params.courseId && !req.params.stepNumber ) {
            return next(400);
        }
        
        var user = req.user;
        
        if (!user.courses || !user.slides) {
            user.slides  = [];
            user.courses = [];
        }
        
        Course.findById(req.params.courseId, function (err, course) {
            if (err || !user) {
                return next(err || new Error("User not found"));    
            }
            
            // next pageurl
            var urls = req.url.split("/"), redirected = false;
            urls[urls.length - 1] = parseInt(urls[urls.length - 1]) + 1;
            const nextPageUrl = urls.join("/");
            
            // step number
            if (req.params.stepNumber == 0) {
                return res.redirect(nextPageUrl);
            }
            if ( +req.params.stepNumber + 1 == course.steps.length) {
                redirected = true;
                res.redirect("/choose_course");
            }
            
            // save progres
            const courseProgres = user.courses.find(function (value) {
                return value.courseId == req.params.courseId;
            });
            
            if (courseProgres) {
                courseProgres[course.steps[req.params.stepNumber]] = "+";
            } else {
                user.courses.push({
                    courseId: req.params.courseId,
                    [course.steps[req.params.stepNumber]]: "+"
                });
            }
            
            
            const data = user.slides.find(function (value) {
                return value.toString() == course.steps[+req.params.stepNumber].toString();
                
            });
            if ( !data ) {
                user.slides.push(course.steps[req.params.stepNumber]);
            }
            
            
            user.markModified('courses');
            user.markModified('slides');
            user.save(function (err) {
                if (err) {
                    console.error(err);
                    return next(err);
                }
                if (!redirected) {
                    res.redirect(nextPageUrl);
                }
            });
        });
    });
    
    app.get("/choose_course", function (req, res, next) {
        if ( !req.passport.client(next) ) {
            return;
        }
        
        async.waterfall([
                navData,
                function (courses, callback) {
                    res.render("choose_course", {
                        user: req.user,
                        
                        
                        courses: courses
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
};