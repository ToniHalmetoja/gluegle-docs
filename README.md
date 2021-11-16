# make-notes-ToniHalmetoja
Welcome to Gluegle Docs!

This is a simple project for school that allows you to create, edit, and save documents in your browser, using a MySQL database.

# To run locally:

Import the database into whatever you feel like running it on, such as MAMP. (you can also create your own database, it should work just fine. Except that you'll have to register new users instead of getting the sample stuff.

# Everything that's not in the "frontend" folder is backend stuff. 

# Sample user: toni@toni.com with password "otter"

1) Change the fetchURL in script.js for the frontend to whatever your database is hosted at.

2) Change the MySQL connection details in both app.js and the notes.js route to whatever your database uses.

3) Install all NPM dependencies.

4) Run server with NPM Start (or nodemon).

5) Open index.html, and have as much fun as you possibly can.

# How it works

The frontend sends a fetch query to the backend for login, document creation, and the like. The backend then fetches the relevant data (username, password, document details) from the database. These results are then sent to the front end. In short, it's a HEADLESS application.
