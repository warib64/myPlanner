let db = window.db;

if (!db) {
    window.addEventListener("dbReady", () => {
        db = window.db;
        loadAll();
    }, {
        once: true
    });
} else loadAll();

function loadAll() {
    loadTasks("high", "low");
    loadTasks("high", "high");
    loadTasks("low", "low");
    loadTasks("low", "high");
}

let highestId = 0;

function loadTasks(impact, effort) {
    const request = window.db.transaction("tasks", "readonly").objectStore("tasks").index("impact_effort").getAll([impact, effort]);

    request.onsuccess = () => {
        const tasks = request.result;
        if (tasks.length > 0) {
            const highId = tasks[tasks.length - 1].id;
            if (highId > highestId) highestId = highId;
            tasks.forEach((task) => {
                const li = document.createElement("li");
                li.id = "task-" + task.id;
                li.className = "list-group-item";
                li.innerHTML = `
                    <button class="btn btn-link link-offset-3 link-underline-dark link-underline-opacity-0 link-underline-opacity-100-hover text-decoration-line-through" onclick="removeTask()">
                        <span class="text-body text-break">${task.text}</span>
                    </button>
                `;

                const ie = impact + "-" + effort;
                const parent = document.querySelector("#" + ie);
                if (impact === "low") {
                    const inputLi = parent.querySelector("#input-" + ie).parentNode;
                    parent.insertBefore(li, inputLi);
                } else {
                    parent.append(li);
                }
            });
        }
    }

    request.onerror = () => {
        alert("Failed to load tasks. Please refresh to try again.");
        console.error("IndexedDB read error:", request.error);
    }
}

function addTask(before = false) {
    const buttonLi = event.currentTarget.parentNode;
    const input = buttonLi.querySelector("input");
    const text = input.value.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (text === "") return;
    if (text.length > 64) {
        alert("Character count exceeds the allowed maximum.");
        return;
    }

    const parent = buttonLi.parentNode;
    const [impact, effort] = parent.id.split("-");
    let id;

    if (db) {
        const request = db.transaction("tasks", "readwrite").objectStore("tasks").add({
            impact,
            effort,
            text
        });

        request.onsuccess = () => {
            id = ++highestId;
        }

        request.onerror = () => {
            alert("The new task wasn't saved to the database and will not persist.");
            console.error("Failed to save task:", request.error);
        }
    }

    const li = document.createElement("li");
    if (id) li.id = "task-" + id;
    li.className = "list-group-item";
    li.innerHTML = `
        <button class="btn btn-link link-offset-3 link-underline-dark link-underline-opacity-0 link-underline-opacity-100-hover text-decoration-line-through" onclick="removeTask()">
            <span class="text-body text-break">${text}</span>
        </button>
    `;

    input.value = "";
    impact === "low" ? parent.insertBefore(li, buttonLi) : parent.append(li);
}

function removeTask() {
    const li = event.currentTarget.parentNode;
    if (confirm('The task "' + li.querySelector("span").innerHTML + '" will be removed.')) {
        const id = li.id.slice(5);
        if (id != "") {
            const request = db.transaction("tasks", "readwrite").objectStore("tasks").delete(Number(id));

            request.onerror = () => {
                alert("The task wasn't removed from the database, try again.");
                console.error("Failed to delete task:", request.error);
                return;
            }
        }

        li.remove();
    }
}
