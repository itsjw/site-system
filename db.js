const mongoose = require("mongoose"),
    User = require("./libs/class.js").User;
    
mongoose.connect("mongodb://127.0.0.1:27017/data", {}, function (err) {
    console.log(err || "Connect!");
    
    var admin = new User({
        name: "Name",
        surname: "Surname",
        Email: "admin@knomary.com",
        password:"admin@knomary.com",
        admin: true
    });
    
    admin.save(function (err) {
        console.log(err || "Created admin");
    });
});