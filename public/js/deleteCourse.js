function deleteCourse(event) {
    var id = event.currentTarget.parentElement.id;
    
    if (typeof id == "string") {
        window.location.href = "/deleteCourse?id=" + id;
    }
    
    event.stopPropagation();
}

function editCourse(event) {
    var id = event.currentTarget.parentElement.id;
    
    if (typeof id == "string") {
        window.location.href = "/edit_course/" + id;
    }
    
    event.stopPropagation();
};