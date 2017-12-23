const mongoose = require("mongoose"),
    User = require("./libs/class.js").User;
    
mongoose.connect("mongodb://127.0.0.1:27017/data", {}, function (err) {
    console.log(err || "Connect!");
    
    var admin = new User({
        name: "Имя",
        surname: "Фамилия",
        Email: "Почта",
        password:"Пароль",
        admin: true
    });
    
    admin.save(function (err) {
        console.log(err || "Created admin");
    });
});