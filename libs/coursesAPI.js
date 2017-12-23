const async = require("async"),
    fs = require("fs"),
    textErr = require("../errorText.json").errorText;

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
                console.error(err);
                return res.redirect("/edit_courses?err=" + textErr.CreateError );
            }
            console.log("Add course name:%s id:" + course._id, req.body.name);
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
                console.error(err);
                return res.redirect("/edit_courses?err=" + textErr.FindError );
            }
            
            const steps = course.steps();
            course.remove(function (err) {
                if (err) {
                    console.error(err);
                    return res.redirect("/edit_courses?err=" + textErr.DeletedError);
                }
                
                console.log("Deleted course id:%s", course._id);
                
                for ( var i = 0; i < steps.length; i++ ) {
                    Step.findById(steps[i], function (err, step) {
                        if ( err ) {
                            console.error(err);
                            return console.error(err);
                        }
                        
                        if ( step.type == "video") {
                            fs.unlink("./public/" + step.video, function(err) {
                                if ( err ) {
                                    console.error(err);
                                }
                            });
                        }
                        
                        step.remove(function (err) {
                            if (err) {
                                console.error(err);
                            }
                            console.log("deleted course id:" + course._id + " ;  step id:%s", step._id);
                        });
                    });
                }
                
                res.redirect("/edit_courses?deleted=Ok");
            });
        });
    });
    app.post("/renameCourse", function (req, res, next) {
        if ( !req.passport.admin(next) ) {
            return;
        }
        res.cookie("notDeletQuery", "On", {
            maxAge: 60 * 60 * 1000,
            path: "/edit_courses"
        });
        
        Course.findById(req.body._id, function (err, course) {
            if ( err ) {
                console.error(err);
                return res.redirect("/edit_courses?err=" + textErr.FindError);
            }
            
            course.name = req.body.name;
            
            course.save(function (err) {
                if (err) {
                    console.error(err);
                    return res.redirect("/edit_course?err=" + textErr.SavingError);
                }
                res.redirect("/edit_courses?save=Ok");
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
                return res.redirect("/edit_course/" + req.params.courseId + "?err=" + textErr.FindError);
            }
            
            var step = new Step({
                name: req.body.name,
                type: "step",
                step: req.body.html
            });
            
            step.save(function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/edit_course/" + req.params.courseId + "?err=" + textErr.SavingError);
                }
                
                course.steps.push(step._id);
                
                course.save(function (err) {
                    if (err) {
                        console.error(err);
                        
                        step.remove(function (err) {
                            if (err) {
                                return console.error(err);
                            }
                            console.log("Deleted step id:%s  >> dont save course id:" + course._id, step._id);
                        });
                        
                        return res.redirect("/edit_course/" + req.params.courseId + "?err=" + textErr.SavingError);
                    }
                    console.log("Add step(id:" + step._id + ") in course id:%s", course._id);
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
            "./public/video/" + req.file.filename + "." + req.file.mimetype.split("/")[1], 
        function (err) {
            fs.unlink( "./" + req.file.path, function (err) {
                if (err) {
                    console.error(err);
                }
            });
            
            if (err) {
                console.error(err);
                return res.redirect("/edit_course/" + req.params.courseId + "?err=" + textErr.CopyFileError);
            }
            
            
            Course.findById( req.params.courseId, function (err, course) {
                if ( err || !course ) {
                    console.error(err);
                    return res.redirect("/edit_course/" + req.params.courseId + "?err=" + textErr.FindError);
                }
                
                var step = new Step({
                    name: req.body.name,
                    type: "video",
                    video: "video/" + req.file.filename + "." + req.file.mimetype.split("/")[1]
                });
                
                step.save(function (err) {
                    if ( err ) {
                        console.error(err);
                        
                        fs.unlink("./public/" + step.video, function(err) {
                            if ( err ) {
                                console.error(err);
                            }
                        });
                        
                        return res.redirect("/edit_course/" + req.params.courseId + "?err=" + textErr.SavingError);
                    }
                    
                    /// if type === video 
                    Step.findById(course.steps[0], function (err, stepN1) {
                        if ( err ) {
                            console.error(err);
                        }
                        
                        if ( stepN1 && stepN1.type == "video") {
                            course.steps[0] = step._id;
                        } else {
                            course.steps.splice(0, 0, step);
                        }
                        
                        course.save(function (err) {
                            if (err) {
                                console.error(err);
                                return res.redirect("/edit_course/" + req.params.courseId + "?err=" + textErr.SavingError);
                            }
                            console.log("Add step(video) id%s in course id:" + course._id, step._id);
                            return res.redirect("/edit_course/" + req.params.courseId + "?save=Ok");
                        });
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
                console.error(err);
                return res.redirect("/edit_course/" + req.params.courseId + "?err=" + textErr.FindError);
            }
            Step.findById(req.body._id, function (err, step) {
                var index = course.steps.findIndex(function (value) {
                    return req.body._id == value;
                });
                if (err) {
                    console.error(err);
                    course.steps.splice(index, 1);
                    course.steps.splice( ((+req.body.position > 0)?+req.body.position : 1 ) || index, 0, req.body._id);
                    return res.redirect("/edit_course/" + req.body.courseId + "?err=Could not rename");
                } 
                
                console.log("\n");
                console.log("Start update course id:%s", course._id);
                console.log("Now steps:" + JSON.stringify(course.steps));
                console.log(req.body);
                console.log("\n");
                
                step.name = req.body.name;
                course.steps.splice(index, 1);
                
                if ( step.type != "video" ) {
                    step.step = req.body._html;
                    course.steps.splice( ((+req.body.position > 0)?+req.body.position : 1 ) || index, 0, req.body._id);
                } else {
                    course.steps.splice(0, 0, step);
                }
                
                step.save(function (err) {
                    if (err) {
                        console.error(err);
                        return res.redirect("/edit_course/" + req.body.courseId + "?err=" + textErr.SavingError);
                    }
                    course.save(function (err) {
                        if (err) {
                            console.error(err);
                            return res.redirect("/edit_course/" + req.body.courseId + "?err=" + textErr.SavingError);
                        }
                        
                        console.log("\n");
                        console.log("End update course id:%s", course._id);
                        console.log("Now steps:" + JSON.stringify(course.steps));
                        console.log("\n");
                        
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
                return res.redirect("/edit_course/" + req.query.courseId + "?err=" + textErr.FindError);
            }
            
            Step.findById(req.query.stepId, function(err, step) {
                if ( err ) {
                    console.error(err);
                    return res.redirect("/edit_course/" + req.query.courseId + "?err=" + textErr.FindError);
                }
                
                var index = course.steps.findIndex(function (value) {
                    return value == req.query.stepId;
                });
                
                course.steps.splice(index, 1);
                
                if ( step.type == "video" ) {
                    fs.unlink("./public/" + step.video, function(err) {
                        if ( err ) {
                            console.error(err);
                        }
                    });
                }
                
                course.save(function (err) {
                    if (err) {
                        console.error(err);
                        return res.redirect("/edit_course/" + req.query.courseId + "?err=" + textErr.SavingError);
                    }
                    step.remove(function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    
                    console.log("Deleted step id:%s in course id:" + course._id, step._id);
                    
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