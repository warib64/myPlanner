let db = window.db;

if (!db) {
    window.addEventListener("dbReady", () => {
        db = window.db;
    }, {
        once: true
    });
}

function importData() {
    let input = document.querySelector("input");
    if (!input) {
        input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.multiple = false;
        input.style.display = "none";
        document.body.appendChild(input);
    }

    input.click();

    input.removeEventListener("change", handle);
    input.addEventListener("change", handle);
}

function handle(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== "application/json") {
        alert("Provide a JSON file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            process(JSON.parse(e.target.result));
        } catch (error) {
            alert("The file provided could not be imported.");
            console.error("Invalid JSON:", error);
        }
    };
    reader.readAsText(file);
}

function process(data) {
    if (!db) {
        alert("The database has not been loaded yet, try again.");
        return;
    }

    const transaction = window.db.transaction(["goals", "tasks", "notes"], "readwrite");

    data.goals.forEach(goal => transaction.objectStore("goals").add(goal));
    data.tasks.forEach(task => transaction.objectStore("tasks").add(task));
    data.notes.forEach(note => transaction.objectStore("notes").add(note));

    transaction.oncomplete = () => {
        alert("The data was imported successfully.");
    }

    transaction.onerror = () => {
        alert("The data couldn't be stored, try again.");
        console.error("Failed to store data:", transaction.error);
        return;
    }
}

function exportData() {
    if (!db) {
        alert("The database has not been loaded yet, try again.");
        return;
    }

    const transaction = window.db.transaction(["goals", "tasks", "notes"], "readonly");

    const data = {};
    const goalsRequest = transaction.objectStore("goals").getAll();
    const tasksRequest = transaction.objectStore("tasks").getAll();
    const notesRequest = transaction.objectStore("notes").getAll();

    goalsRequest.onsuccess = () => data.goals = goalsRequest.result;
    tasksRequest.onsuccess = () => data.tasks = tasksRequest.result;
    notesRequest.onsuccess = () => data.notes = notesRequest.result;

    goalsRequest.onerror = () => console.error("Failed to fetch goals:", goalsRequest.error);
    tasksRequest.onerror = () => console.error("Failed to fetch tasks:", tasksRequest.error);
    notesRequest.onerror = () => console.error("Failed to fetch notes:", notesRequest.error);

    transaction.oncomplete = () => {
        const blob = new Blob([JSON.stringify(data, (key, value) => {
            if (key === "id") return undefined;
            return value;
        }, 2)], {
            type: "application/json"
        });

        let a = document.querySelector("#download");
        if (!a) {
            a = document.createElement("a");
            a.id = "download";
            a.download = "data.json";
            a.href = URL.createObjectURL(blob);
            document.body.appendChild(a);
        }

        a.click();
    }

    transaction.onerror = () => {
        alert("Something went wrong exporting the data, try again.");
        console.error("Failed to export data:", transaction.error);
        return;
    }
}

function clearData() {
    if (confirm("All data will be deleted.")) {
        const request = indexedDB.deleteDatabase("PlannerDB");

        request.onerror = () => {
            alert("The database wasn't deleted, try again.");
            console.error("Failed to delete database:", request.error);
        };
    }
}
