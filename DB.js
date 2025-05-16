const request = indexedDB.open("PlannerDB", 1);

request.onupgradeneeded = (event) => {
    const db = event.target.result;

    const goalsStore = db.createObjectStore("goals", {
        keyPath: "id",
        autoIncrement: true
    });
    goalsStore.createIndex("term_status", ["term", "status"], {
        unique: false
    });

    const tasksStore = db.createObjectStore("tasks", {
        keyPath: "id",
        autoIncrement: true
    });
    tasksStore.createIndex("impact_effort", ["impact", "effort"], {
        unique: false
    });

    db.createObjectStore("notes", {
        keyPath: "id",
        autoIncrement: true
    });
};

request.onsuccess = (event) => {
    window.db = event.target.result;
    window.dispatchEvent(new Event("dbReady"));
};

request.onerror = (event) => {
    const error = event.target.error;

    if (error.name === "SecurityError" ||
        error.message.includes("permission") ||
        error.message.includes("blocked")) {
        alert("Data storage denied, any data added will be lost on page refresh.");
    } else {
        alert("Something went wrong initializing the database, please refresh the page to try again.");
        console.error("Database initialization error:", error);
    }
};
