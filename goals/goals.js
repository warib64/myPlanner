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
    loadGoals("short", "active");
    loadGoals("short", "finished");
    loadGoals("long", "active");
    loadGoals("long", "finished");
}

let highestId = 0;
const short = document.getElementById("short");
const long = document.getElementById("long");
const shortDivider = document.getElementById("shortDivider");
const longDivider = document.getElementById("longDivider");

function loadGoals(term, status) {
    const request = window.db.transaction("goals", "readonly").objectStore("goals").index("term_status").getAll([term, status]);

    request.onsuccess = () => {
        const goals = request.result;
        if (goals.length > 0) {
            const highId = goals[goals.length - 1].id;
            if (highId > highestId) highestId = highId;
            goals.forEach((goal) => {
                const li = document.createElement("li");
                li.id = "goal-" + goal.id;
                li.className = "list-group-item text-center";
                li.innerHTML = `
                    <button class="btn btn-link link-offset-3 link-underline-secondary link-underline-opacity-0 link-underline-opacity-75-hover px-0" onclick="buttons()">
                        <span class="text-body text-break">${goal.text}</span>
                    </button>
                `;

                const parent = term === "short" ? short : long;
                if (status === "active") {
                    const divider = term === "short" ? shortDivider : longDivider;
                    parent.insertBefore(li, divider);
                } else {
                    li.querySelector("span").classList.add("text-decoration-line-through");
                    parent.append(li);
                }
            });
        }
    }

    request.onerror = () => {
        alert("Failed to load goals. Please refresh to try again.");
        console.error("IndexedDB read error:", request.error);
    }
}

function buttons() {
    const li = event.currentTarget.parentNode;
    let div = li.querySelector("div");
    if (div) {
        div.remove();
    } else {
        div = document.createElement("div");
        div.className = "justify-content-center";
        const btn1 = document.createElement("button");
        const btn2 = document.createElement("button");
        if (li.querySelector("span").classList.contains("text-decoration-line-through")) {
            btn1.className = "btn btn-sm btn-warning ms-1";
            btn1.innerHTML = "Restore";
            btn1.onclick = restore;
        } else {
            btn1.className = "btn btn-sm btn-success ms-1";
            btn1.innerHTML = "Finish";
            btn1.onclick = finish;
        }
        btn2.className = "btn btn-sm btn-danger ms-1";
        btn2.innerHTML = "Remove";
        btn2.onclick = removeGoal;
        div.append(btn1, btn2);
        li.append(div);
    }
}

function addGoal(term) {
    const input = document.getElementById("input");
    const text = input.value.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (text === "") return;
    if (text.length > 64) {
        alert("Character count exceeds the allowed maximum.");
        return;
    }

    let id;

    if (db) {
        const request = db.transaction("goals", "readwrite").objectStore("goals").add({
            status: "active",
            term,
            text
        });

        request.onsuccess = () => {
            id = ++highestId;
        }

        request.onerror = () => {
            alert("The new goal wasn't saved to the database and will not persist.");
            console.error("Failed to save goal:", request.error);
        }
    }

    const li = document.createElement("li");
    if (id) li.id = "goal-" + id;
    li.className = "list-group-item text-center";
    li.innerHTML = `
        <button class="btn btn-link link-offset-3 link-underline-secondary link-underline-opacity-0 link-underline-opacity-75-hover px-0" onclick="buttons()">
            <span class="text-body text-break">${text}</span>
        </button>
    `;

    input.value = "";
    document.getElementById(term).insertBefore(li, document.getElementById(term + "Divider"));
}

function removeGoal() {
    const li = event.currentTarget.parentNode.parentNode;

    if (confirm('The goal "' + li.querySelector("span").innerHTML + '" will be removed.')) {
        const id = li.id.slice(5);
        if (id != "") {
            const request = db.transaction("goals", "readwrite").objectStore("goals").delete(Number(id));

            request.onerror = () => {
                alert("The goal wasn't removed from the database, try again.");
                console.error("Failed to delete goal:", request.error);
                return;
            }
        }

        li.remove();
    }
}

function finish() {
    const btn = event.currentTarget;
    const li = btn.parentNode.parentNode;
    const id = li.id.slice(5);

    if (id != "") {
        const goalsStore = db.transaction("goals", "readwrite").objectStore("goals");
        const getRequest = goalsStore.get(Number(id));

        getRequest.onsuccess = () => {
            const goal = getRequest.result;
            if (!goal) {
                console.error("Goal not found with ID:", id);
            } else {
                goal.status = "finished";
                const putRequest = goalsStore.put(goal);
                putRequest.onerror = () => {
                    alert("There was an error when marking this goal as finished, try again.");
                    console.error("Failed to update status:", putRequest.error);
                    return;
                }
            }
        }

        getRequest.onerror = () => {
            alert("There was an error when marking this goal as finished, try again.");
            console.error("Failed to fetch goal:", getRequest.error);
            return;
        }
    }

    btn.parentNode.remove();
    li.querySelector("span").classList.add("text-decoration-line-through");
    li.parentNode.append(li);
}

function restore() {
    const btn = event.currentTarget;
    const li = btn.parentNode.parentNode;
    const divider = document.getElementById(li.parentNode.id + "Divider");
    const id = li.id.slice(5);

    if (id != "") {
        const goalsStore = db.transaction("goals", "readwrite").objectStore("goals");
        const getRequest = goalsStore.get(Number(id));

        getRequest.onsuccess = () => {
            const goal = getRequest.result;
            if (!goal) {
                console.error("Goal not found with ID:", id);
            } else {
                goal.status = "active";
                const putRequest = goalsStore.put(goal);
                putRequest.onerror = () => {
                    alert("There was an error when marking this goal as active, try again.");
                    console.error("Failed to update status:", putRequest.error);
                    return;
                }
            }
        }

        getRequest.onerror = () => {
            alert("There was an error when marking this goal as active, try again.");
            console.error("Failed to fetch goal:", getRequest.error);
            return;
        }
    }

    btn.parentNode.remove();
    li.querySelector("span").classList.remove("text-decoration-line-through");
    li.parentNode.insertBefore(li, divider);
}
