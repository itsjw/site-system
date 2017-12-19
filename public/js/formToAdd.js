function loadToForm (event) {
    const user = event.currentTarget.parentElement,
        form = document.getElementById("formEditUser");
    
    if ( !( form && user ) ) {
        return console.error(new Error("No user or form#formEditUser.modal-10"));
    }
    
    form.reset();
    
    for ( var i = 0; i < user.childNodes.length; i++ ) {
        if ( user.childNodes[i].nodeName != "#text" ) {
            var name = user.childNodes[i].getAttribute("name");
            
            if ( name && form[name] ) {
                form[name].value = user.childNodes[i].innerHTML;
            }
        }
    }
}

function deleteUser(event) {
    const tds = event.currentTarget.parentElement.getElementsByTagName("td");
    
    for ( var i = 0; i < tds.length; i++ ) {
        if ( tds[i].getAttribute("name") == "_id" ) {
            window.location.href = "/deleteUser?id=" + tds[i].innerHTML;
        }
    }
}