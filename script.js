function toggle(element) {

    const children = element.nextElementSibling;
    const icon = element.querySelector(".icon");

    if (children.classList.contains("hidden")) {

        children.classList.remove("hidden");
        icon.textContent = "−";

    } else {

        children.classList.add("hidden");
        icon.textContent = "+";

    }
}


function expandAll() {

    const children = document.querySelectorAll(".children");

    children.forEach(function(item) {
        item.classList.remove("hidden");
    });

    const icons = document.querySelectorAll(".icon");

    icons.forEach(function(icon) {
        icon.textContent = "−";
    });
}


function collapseAll() {

    const children = document.querySelectorAll(".children");

    children.forEach(function(item) {
        item.classList.add("hidden");
    });

    const icons = document.querySelectorAll(".icon");

    icons.forEach(function(icon) {
        icon.textContent = "+";
    });
}


function searchTask() {

    const search =
        document
        .getElementById("searchBox")
        .value
        .toLowerCase();

    const tasks =
        document.querySelectorAll(".task");

    tasks.forEach(function(task) {

        const text =
            task.textContent.toLowerCase();

        if (text.includes(search)) {

            task.style.display = "";

        } else {

            task.style.display = "none";

        }

    });

}
