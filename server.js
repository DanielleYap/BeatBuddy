// server.js: hosts the server on local-host to run application


//Required packages 
const express = require('express'); // Creates server and handles routing
const cors = require('cors'); // Allows front-end to communicate with back-end 
const bodyParser = require('body-parser'); // Parses incoming request bodies
const path = require("path"); // Works with file and directory paths
const session = require('express-session'); //For session managment

//Initializes the Express app on port 3000
const app = express();
const port = process.env.PORT || 3000;



///Serves the HTML page as the root URL when opened
app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is now running on http://localhost:${port}`);
});
