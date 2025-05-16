let db = window.db;

if (!db) {
    window.addEventListener("dbReady", () => {
        db = window.db;
        loadNotes();
    }, {
        once: true
    });
} else loadNotes();

const newNote = document.querySelector("#newNote");
const chars = document.querySelector("#characters");

let previousHeight = 0;
newNote.addEventListener("input", function() {
    const count = chars.innerHTML = 512 - this.value.trim().length;
    count < 0 ? chars.classList.add("text-danger") : chars.classList.remove("text-danger");

    if (this.scrollHeight !== previousHeight) {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + "px";
        previousHeight = this.scrollHeight;

        if (this.selectionStart === this.value.length) {
            chars.scrollIntoView({
                behavior: "instant",
                block: "center"
            });
        }
    }
});

let highestId = 0;

function loadNotes() {
    const request = db.transaction("notes", "readonly").objectStore("notes").getAll();

    request.onsuccess = () => {
        const notes = request.result;
        if (notes.length > 0) {
            highestId = notes[notes.length - 1].id;
            notes.forEach(note => {
                renderNote(note.title, note.text, note.id);
            });
        }
    };

    request.onerror = (error) => {
        alert("Failed to load notes. Please refresh to try again.");
        console.error("IndexedDB read error:", request.error);
    };
}

function renderNote(title, text, id) {

    const col = document.createElement("div");
    col.className = "col-lg-3 col-md-6 col-sm-12 mb-4";
    col.innerHTML = `
        <div class="card">
            <div class="card-header">
                <button class="btn btn-link text-body link-offset-3 link-underline-secondary link-underline-opacity-0 link-underline-opacity-75-hover text-break" data-bs-toggle="collapse" data-bs-target="#note-${id}" aria-expanded="false" aria-controls="note-${id}">
                    <h4 class="card-title mb-0">${title}</h4>
                </button>
            </div>
            <div id="note-${id}" class="collapse card-body py-1">
                <p class="mt-2">${text}</p>
                <button class="btn btn-danger mb-2" onclick="removeNote()">Remove</button>
            </div>
        </div>
    `;
    document.querySelector(".row").append(col);
}

function addNote() {
    const titleElement = newNote.parentNode.querySelector("#newTitle");
    const title = titleElement.value.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const text = newNote.value.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (title.length === 0 || text.length === 0) {
        alert("Type in both the title and the content of the new note before adding.");
        return;
    }
    if (title.length > 64 || text.length > 512) {
        alert("Character count exceeds the allowed maximum.");
        return;
    }

    if (db) {
        const request = db.transaction("notes", "readwrite").objectStore("notes").add({
            title,
            text
        });

        request.onerror = () => {
            alert("The new note wasn't saved to the database and will not persist.");
            console.error("Failed to save note:", request.error);
        };
    }

    renderNote(title, text, ++highestId);

    titleElement.value = newNote.value = "";
    newNote.style.height = "auto";
    chars.innerHTML = "512";
}

function removeNote() {
    const card = event.target.parentNode.parentNode;
    if (confirm('The note "' + card.querySelector(".card-title").innerHTML + '" will be removed.')) {
        if (db) {
            const id = Number(card.querySelector(".card-body").id.slice(5));
            const request = db.transaction("notes", "readwrite").objectStore("notes").delete(id);

            request.onsuccess = () => {
                card.parentNode.remove();
            };

            request.onerror = () => {
                alert("The note couldn't be removed from the database, please try again.");
                console.error("Failed to save note:", request.error);
            };
        } else card.parentNode.remove();
    }
}
