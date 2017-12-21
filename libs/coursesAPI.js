const async = require("async"),
    fs = require("fs");

const { Course, Step } = require("./class.js");

module.exports = function (app, upload, dirname) {
    app.post("/addCourse", function (req, res, next) {
        if ( !req.passport.admin(next) ) {
            return;
        }
        
        res.cookie("notDeletQuery", "On", {
            maxAge: 60 * 60 * 1000,
            path: "/edit_courses"
        });
        
        
        var course = new Course({
            name: req.body.name
        });
        
        course.save(function (err) {
            if (err) {
                return res.redirect("/edit_courses?err=Error saving <br> Origin:" + err.toString());
            }
            
            res.redirect("/edit_courses?save=Ok");
        });
    });
    app.get("/deleteCourse", function(req, res, next) {
        if ( !req.passport.admin(next) ) {
            return;
        }
        
        if ( !req.query.id ) {
            return;
        }
        
        res.cookie("notDeletQuery", "On", {
            maxAge: 60 * 60 * 1000,
            path: "/edit_courses"
        });
        
        Course.findById(req.query.id, function (err, course) {
            if ( err || !course ) {
                return res.redirect("/edit_courses?err=Error finder");
            }
            
            course.remove(function (err) {
                if (err) {
                    return res.redirect("/edit_courses?err=Error deleting");
                }
                res.redirect("/edit_courses?deleted=Ok");
            });
        });
    });
        
    
    
      
    app.get("/addStepInCourseId/:courseId/editId/", function(req, res, next) {
        if ( !req.passport.admin(next) ) {
            return;
        }
        
        res.render("edit-step", {
            user: req.user
        }, function (err, data) {
            if (err) {
                next(err);
            }
            
            res.send(data);
        });
    });
    app.post("/addStepInCourseId/:courseId/editId/", function (req, res, next) {
        if ( !req.passport.admin(next) ) {
            return;
        }
        if ( !req.params.courseId ) {
            return next(400);
        }
        if ( !req.body.name || !req.body.html ) {
            return next(500);
        }
        
        res.cookie("notDeletQuery", "On", {
            maxAge: 60 * 60 * 1000,
            path: "/edit_course"
        });
        
        Course.findById(req.params.courseId, function (err, course) {
            if ( err || !course ) {
                return res.redirect("/edit_course/" + req.params.courseId + "?err=Error connect to database");
            }
            
            var step = new Step({
                name: req.body.name,
                type: "step",
                step: req.body.html
            });
            
            step.save(function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/edit_course/" + req.params.courseId + "?err=Step saving error");
                }
                
                course.steps.push(step._id);
                
                course.save(function (err) {
                    console.log(course.steps);
                    if (err) {
                        return res.redirect("/edit_course/" + req.params.courseId + "?err=Step saving error");
                    }
                    return res.redirect("/edit_course/" + req.params.courseId + "?save=Ok");
                });
            });
        });
    });
    
    
    
    app.get("/addVidioInCourseId/:courseId/editId/", function(req, res, next) {
        if ( !req.passport.admin(next) ) {
            return;
        }
        if ( !req.params.courseId ) {
            return next(400);
        }
        
        async.waterfall([
                function (callback) {
                    res.render("edit-video", {
                        user: req.user,
                        url : req.originalUrl,
                        
                        
                    }, callback);
                }
            ],
            function(err, result) {
                if (err) {
                    return next(err);
                }
                
                res.send(result);
            }
        );
    });
    app.post("/addVidioInCourseId/:courseId/editId/", upload.single("video"), function (req, res, next) {
        if ( !req.passport.admin(next) ) {
            return;
        }
        if ( !req.params.courseId ) {
            return next(400);
        }
        if ( !req.body.name || !req.file ) {
            return next(500);
        }
        
        res.cookie("notDeletQuery", "On", {
            maxAge: 60 * 60 * 1000,
            path: "/edit_course"
        });
        
        copyFile( req.file.path, 
            __dirname + "public/video/" + req.file.filename + "." + req.file.mimetype.split("/")[1], 
        function (err) {
            fs.unlink(__dirname + req.file.path, function (err) {
                if (err) {
                    console.error(err);
                }
            });
            
            if (err) {
                return res.redirect("/edit_course/" + req.params.courseId + "?err=Error copying file ");
            }
            
            
            Course.findById( req.params.courseId, function (err, course) {
                if ( err || !course ) {
                    return res.redirect("/edit_course/" + req.params.courseId + "?err=Error connect to database");
                }
                
                var step = new Step({
                    name: req.body.name,
                    type: "video",
                    video: "video/" + req.file.filename + "." + req.file.mimetype.split("/")[1]
                });
                
                step.save(function (err) {
                    if ( err ) {
                        return res.redirect("/edit_course/" + req.params.courseId + "?err=Step saving error");
                    }
                    
                    
                    course.steps.push(step._id);
                    
                    course.save(function (err) {
                        if (err) {
                            return res.redirect("/edit_course/" + req.params.courseId + "?err=Step saving error");
                        }
                        return res.redirect("/edit_course/" + req.params.courseId + "?save=Ok");
                    });
                    
                });
                
            });
        });
    });
    
    app.post("/updateCuorse", function(req, res, next) {
        if ( !req.passport.admin(next) ) {
            return;
        }
        
        res.cookie("notDeletQuery", "On", {
            maxAge: 60 * 60 * 1000,
            path: "/edit_course"
        });
        
        Course.findById(req.body.courseId, function (err, course) {
            if (err) {
                return res.redirect("/edit_course/" + req.params.courseId + "?err=Error connect to database");
            }
            Step.findById(req.body._id, function (err, step) {
                var index = course.steps.findIndex(function (value) {
                    return req.body._id == value;
                });
                if (err) {
                    course.steps.splice(index, 1);
                    course.steps.splice(+req.body.position || index, 0, req.body._id);
                    return res.redirect("/edit_course/" + req.body.courseId + "?err=Could not rename");
                } 
                step.name = req.body.name;
                console.log(course.steps);
                course.steps.splice(index, 1);
                console.log(course.steps);
                course.steps.splice(+req.body.position || index, 0, req.body._id);
                console.log(course.steps);
                
                step.save(function (err) {
                    course.save(function (err2) {
                        if (err || err2) {
                            return res.redirect("/edit_course/" + req.body.courseId + "?err=Failed to save");
                        }
                        return res.redirect("/edit_course/" + req.body.courseId + "?save=Ok");
                    });
                });
            });
        });
    });
    
    app.get("/deleteStep", function(req, res, next) {
        if ( !req.passport.admin(next) ) {
            return;
        }
        
        res.cookie("notDeletQuery", "On", {
            maxAge: 60 * 60 * 1000,
            path: "/edit_course"
        });
        
        if ( !req.query.courseId || !req.query.stepId ) {
            next(400);
        }
        
        Course.findById(req.query.courseId, function (err, course) {
            if ( err ) {
                console.log(err);
                return res.redirect("/edit_course/" + req.query.courseId + "?err=Error connect to database");
            }
            Step.findById(req.query.stepId, function(err, step) {
                if ( err ) {
                    return res.redirect("/edit_course/" + req.query.courseId + "?err=Finder error");
                }
                
                var index = course.steps.findIndex(function (value) {
                    return value == req.query.stepId;
                });
                
                course.steps.splice(index, 1);
                
                if ( step.type == "video" ) {
                    fs.unlink("public/" + step.video, function(err) {
                        if ( err ) {
                            console.error(err);
                        }
                    });
                }
                
                course.save(function (err) {
                    if (err) {
                        return res.redirect("/edit_course/" + req.query.courseId + "?err=Saving error");
                    }
                    step.remove(function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    return res.redirect("/edit_course/" + req.query.courseId + "?deleted=Ok");
                });
            });
        });
    });
};


function copyFile(source, target, cb) {
    var cbCalled = false;
    
    var rd = fs.createReadStream(source);
    rd.on("error", function(err) {
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function(err) {
        done(err);
    });
    wr.on("close", function(ex) {
        done();
    });
    rd.pipe(wr);
    
    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}