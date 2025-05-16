# My Planner
### Video Demo:
[YouTube link](https://youtu.be/RckM0MbYGOg)
### Description:
My Planner is a standalone browser-based application that uses IndexedDB to store and handle data locally, without the need for an internet connection.
It consists of four tools, namely Goals, Matrix, Notes and Timer, as well as its index, which contains three options to manage the stored data.

I originally planned to use a PHP and SQL-based solution to handle data, however, as I implemented the Goals feature,  for testing purposes I made a JSON file with example data and loaded the data from it using JavaScript. This gave me the idea to try making it so that no server would be needed, as I realized that, technically, none of the functionality needed an internet connection to work, and that storing data locally would benefit user privacy.

### HTML Pages:

#### Favicon
All pages use **planner.png** as their tab icon beside the title.

#### Navbar
All pages contain a navigation bar at the top that allows the user to navigate freely between them at all times.

#### index.html
The index page contains three buttons that enable the user to import or export data to and from a JSON file, or clear the database altogether.

#### goals.html
The goals page contains two lists, "Short term" and "Long term", with a separator each, which divides the active goals from the finished goals. The text for finished goals appears with a strikethrough.\
Upon clicking a goal two buttons are generated, one with an option to finish or restore a goal, depending on its current status, and another that prompts the user to confirm the removal of that goal.\
At the bottom there's an input field with two buttons reading Short term and Long term, which add the content of the input field as a goal on their respective lists.

#### matrix.html
The matrix page contains a decision matrix with four quadrants, categorizing the tasks based on their impact and the effort required to complete them.\
Each quadrant contains a list of tasks, as well as an input field with a button that allow the user a new task to that quadrant. The top two quadrants have their title and input positioned at the top, while the bottom two have them positioned at the bottom.\
Hovering over a task shows a strikethrough on its text, and clicking it prompts the user to confirm the removal of that task.

#### notes.html
The notes page contains a grid with all the note cards, collapsed by default, and clicking their title expands it. It also contains a card to add a new note at the start, expanded by default.\
The new note card contains an input field for the title and a text area for the content of the note, as well as a counter for remaining characters that starts at 512 and gets smaller with each character inserted down to -128. Trying to add a note that exceeds the character limit, or with one of the fields empty, displays a corresponding alert.

#### timer.html
The timer page contains an input field for inserting the time in minutes for the timer, as well as a button to set it, and an estimate under the field that converts the number to hours and minutes.\
Clicking the button sets the timer, showing a display with the time, and a button below to start it. Starting the timer makes it tick down and changes the button to one for stopping the timer instead.\
If the timer counts down to zero, it plays an alarm, displays an alert that the timer has ended, and resets the timer.

### Scripts:

#### DB.js
This file contains the implementation of the IndexedDB database, creates it if it is not already present, stores the database reference globally in **window.db**, and dispatches an event called dbReady.\
All the pages except for Timer use this file besides their own specific scripts. The scripts for those pages try to get the database from **window.db**, and if unsuccessful await for the dbReady event to be dispatched to do it instead. This approach was taken to ensure the loading of the database no matter which script gets loaded first.

#### index.js
This file has the functions *importData*, *exportData* and *clearData* to handle interactive button functionality, and the helper functions *handle* and *process*.

*importData* appends an invisible "input" element for a file onto the document if it doesn't exist already, and clicks it. It then removes and adds an event listener that calls *handle*, the removal is to ensure only one listener is active.\
*handle* checks if a JSON file was inputted, reads it and passes the parsed JSON to *process*, which tries to add each element of the arrays from the objects goals, tasks and notes, and displays an alert based on whether the result was successful.

*exportData* tries to fetch all the data in the database, displays an alert if there's an error, and if successful creates a JSON file without the ids, appends an invisible "a" element with the URL to download it onto the document if it doesn't exist already, and then clicks it.

*clearData* prompts the user to confirm that they want all data to be deleted, tries to delete the database, and displays an alert if it fails.

#### goals.js
This file has the functions *loadAll* and *loadGoals* to get the goals from the database, and the functions *buttons*, *finish*, *restore*, *removeGoal* and *addGoal* to handle interactive button functionality.

*loadAll* calls *loadGoals* with the term and status for each section when the database is loaded. *loadGoals* requests all the goals with that term and status, displays an alert if it fails, and adds a list item with a button containing that goal to its respective section if successful.

*buttons* creates two buttons, below the button containing the goal that was clicked, one that calls either *finish* or *restore*, based on the status of the goal, and another that calls *removeGoal*.

*finish* moves the goal to below the divider for its list and adds a strikethrough to its text. If there's an id for the goal it tries to update the status of that goal to finished.\
*restore* does the opposite as *finish*, moving the goal to above the divider, removing the strikethrough and updating the status to active.

*removeGoal* prompts the user to confirm that they want that goal to be removed, tries to delete it from the database if it has an id, displays an alert if that fails, and removes the goal's "li" element from the list.

*addGoal* takes the value from the input, sanitizes it, tries to add it to the database if there's a connection, assigning it an id if successful and displaying an alert if it fails, then inserts a list item with a button containing the goal into the active section for its respective list, depending which button was clicked.

#### matrix.js
This file has the functions *loadAll* and *loadTasks* to get the tasks from the database, and the functions *addTask* and *removeTask* to handle interactive button functionality.

*loadAll* calls *loadTasks* with the term and status for each section when the database is loaded. *loadTasks* requests all the tasks with that impact and effort, displays an alert if it fails, and adds a list item with a button containing that task to its respective section if successful.

*addTask* takes the value from the input, sanitizes it, tries to add it to the database if there's a connection, assigning it an id if successful and displaying an alert if it fails, then inserts a list item with a button containing the task into that quadrant.

*removeTask* prompts the user to confirm that they want that task to be removed, tries to delete it from the database if it has an id, displays an alert if that fails, and removes the task's "li" element from the list.

#### notes.js
This file features an event listener that listens to input events in the "textarea" element, sizes it automatically according to how many lines the text needs in order to be displayed, and reduces the character limit counter. The counter's color is set to red if it is a negative number. When typing or pasting at the end of the textarea, the screen will automatically scroll down instantly.

It also has the functions *loadNotes* to get the notes from the database, *addNote* and *removeNote* to handle interactive button functionality, and the helper function *renderNote*.

*renderNote* creates and appends a new "div" element containing the note to its parent.

*loadNotes* requests all the notes from the database, displays an alert if it fails, and calls *renderNote* for each note.

*addNote* takes the value from the input and textarea, sanitizes them, displays an alert if one field is missing or past the character limit, tries to add them to the database if there's a connection, displaying an alert if it fails. It then calls *renderNote* and resets the new note card.

*removeNote* prompts the user to confirm that they want that note to be removed, tries to delete it from the database if there's a database connection, displays an alert if that fails, and removes the note's parent "div" element from the document if successful or if there's no database connection.

#### timer.js
This file features an event listener that listens to input events in the "input" element, and uses its value to display either a preview in hours and minutes, or a message to input a value within range.

It also has the functions *setTimer*, *startTimer* and *stopTimer* to handle interactive button functionality, and *runTimer* to dinamically change the document.

*setTimer* displays the default structure of the timer, with its value defined by the user's input. It also restores the navbar links' to their default behavior.

*startTimer* changes the timer's border to green, the button under it to a red "Stop timer" button, makes the navbar links open on a new tab, and sets the interval that calls *runTimer* each second.

*stopTimer* changes the timer's border to red, the button under it to a green-outlined "Resume timer" button, and clears the interval that calls *runTimer*.

*runTimer* has logic to decrease the displayed seconds every time it is called, minutes every time the seconds loop back, and hours every time the minutes loop back. Then it clears its interval, shows an alert, plays **alarm.mp3** and calls *setTimer* to reset the timer when the time runs out.
