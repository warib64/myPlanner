let timerHours = 0;
let timerMinutes = 20;
document.querySelector("#time").addEventListener("input", function() {
    const value = Math.floor(this.value);
    if (value > 0 && value <= 1440) {
        const m = timerMinutes = value % 60;
        const h = timerHours = (value - m) / 60;
        const hours = (() => {
            if (h < 1) {
                return "";
            } else if (h === 1) {
                return h + " hour";
            } else {
                return h + " hours";
            }
        })();
        const minutes = (() => {
            if (m < 1) {
                return "";
            } else if (m === 1) {
                return h > 0 ? " and " + m + " minute" : m + " minute";
            } else {
                return h > 0 ? " and " + m + " minutes" : m + " minutes";
            }
        })();
        document.querySelector("#preview").innerHTML = hours + minutes;
    } else {
        timerHours = timerMinutes = 0;
        document.querySelector("#preview").innerHTML = "Choose a value from 1 to 1440";
    }
})

const tH = document.querySelector("#timerHours");
const tM = document.querySelector("#timerMinutes");
const tS = document.querySelector("#timerSeconds");
const tElements = document.querySelector("#timerSpan").children;
const links = document.querySelectorAll(".nav-link, .navbar-brand");

let timerInterval;

function setTimer() {
    clearInterval(timerInterval);

    tH.innerHTML = timerHours.toString().padStart(2, '0');
    document.querySelector("#timerColon1").innerHTML = ":";
    tM.innerHTML = timerMinutes.toString().padStart(2, '0');
    document.querySelector("#timerColon2").innerHTML = ":";
    tS.innerHTML = "00";

    for (let child of tElements) {
        child.classList.remove("border-success-subtle");
        child.classList.add("border-primary-subtle");
    }

    const timerButton = document.querySelector("#timerButton");
    if (!timerButton) {
        const tButton = document.createElement("button");
        tButton.id = "timerButton";
        tButton.className = "btn btn-primary";
        tButton.innerHTML = "Start timer";
        tButton.onclick = startTimer;
        const timer = document.querySelector("#timer");
        timer.classList.remove("invisible");
        timer.appendChild(tButton);
    } else {
        for (let child of tElements) {
            child.classList.remove("border-success-subtle", "border-danger");
            child.classList.add("border-primary-subtle");
        }

        timerButton.classList.remove("btn-outline-danger", "btn-success");
        timerButton.classList.add("btn-primary");
        timerButton.innerHTML = "Start timer";
        timerButton.onclick = startTimer;
    }

    links.forEach(link => {
        link.setAttribute("target", "");
        link.setAttribute("rel", "");
    });
}

function startTimer() {
    if (tS.innerHTML == 0 && tM.innerHTML == 0 && tH.innerHTML == 0) return;
    for (let child of tElements) {
        child.classList.remove("border-primary-subtle", "border-danger");
        child.classList.add("border-success-subtle");
    }
    const tButton = document.querySelector("#timerButton");
    tButton.classList.remove("btn-primary", "btn-success");
    tButton.classList.add("btn-outline-danger");
    tButton.innerHTML = "Stop timer";
    tButton.onclick = stopTimer;

    links.forEach(link => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
    });

    timerInterval = setInterval(runTimer, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);

    for (let child of tElements) {
        child.classList.remove("border-success-subtle");
        child.classList.add("border-danger")
    }

    const tButton = document.querySelector("#timerButton");
    tButton.classList.remove("btn-outline-danger");
    tButton.classList.add("btn-success");
    tButton.innerHTML = "Resume timer";
    tButton.onclick = startTimer;
}

const ring = new Audio("alarm.mp3");
ring.preload = "auto";
ring.volume = 0.6;

function runTimer() {
    const s = tS.innerHTML - 1;
    if (s < 0) {
        const m = tM.innerHTML - 1;
        if (m < 0) {
            const h = tH.innerHTML - 1;
            if (h < 10) {
                tH.innerHTML = h.toString().padStart(2, '0');
            } else {
                tH.innerHTML = h;
            }
            tM.innerHTML = 59;
        } else if (m < 10) {
            tM.innerHTML = m.toString().padStart(2, '0');
        } else {
            tM.innerHTML = m;
        }
        tS.innerHTML = 59;
    } else if (s == 0 && tM.innerHTML == 0 && tH.innerHTML == 0) {
        tS.innerHTML = "00";
        clearInterval(timerInterval);
        ring.play();
        alert("The timer has ended.");
        setTimer();
        return;
    } else if (s < 10) {
        tS.innerHTML = s.toString().padStart(2, '0');
    } else {
        tS.innerHTML = s;
    }
}
