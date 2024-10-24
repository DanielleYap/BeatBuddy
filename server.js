// Required packages
const fs = require('fs');
const express = require('express'); // Creates server and handles routing
const cors = require('cors'); // Allows front-end to communicate with back-end
const bodyParser = require('body-parser'); // Parses incoming request bodies
const path = require('path'); // Works with file and directory paths
const mysql = require('mysql'); // MySQL package for database connection
const app = express(); // Initializes express

app.use(bodyParser.json()); // Ensure body parsing
app.use(express.json()); // Allows parsing JSON
app.use(cors()); // Enable CORS

// Sets up MYSQL connection
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root', 
  password: 'root', 
  database: 'beatbuddy' // Replace with your database name
});

// Connect to MySQL and handle connection errors
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// Sets up JSON file reading/writing
const saveData = (data, filename) => {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2)); // Writes the contents to the specified file
};

// Clear JSON files upon server startup
const initializeDataFiles = () => {
  saveData([], 'playlist.json');
  saveData([], 'albums.json');
  saveData([], 'artists.json');
  saveData([], 'tracks.json');
};

initializeDataFiles(); // Calls initialize function to clear data files

// Imports message function to communicate with chatGPT
const { messageGPT } = require('./openAIFunctions');

// Used to handle OpenAI on server side
app.post('/generate', async (req, res) => {
  const { input, conversationHistory } = req.body;

  try {
    const { response: aiResponse, conversationHistory: updatedHistory } = await messageGPT(input, conversationHistory);
    res.json({ output: aiResponse, conversationHistory: updatedHistory });
  } catch (error) {
    console.error('Error in /generate route:', error);
    res.status(500).json({ error: 'Failed to generate response from OpenAI.' });
  }
});

// ----------------------------------- MySQL Routes -----------------------------------------------

// Example route to get the top 5 most frequent songs from the database
app.get('/top-songs', (req, res) => {
  const query = `
    SELECT song, genre, COUNT(*) AS frequency 
    FROM UserPreferences 
    GROUP BY song, genre 
    ORDER BY frequency DESC 
    LIMIT 5
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching top songs:', err);
      return res.status(500).json({ error: 'Failed to fetch top songs' });
    }
    res.json({ songs: results });
  });
});

// Example route to add a new song preference for a user
app.post('/add-song', (req, res) => {
  const { userID, song, genre } = req.body;
  const query = 'INSERT INTO UserPreferences (userID, song, genre) VALUES (?, ?, ?)';

  db.query(query, [userID, song, genre], (err, result) => {
    if (err) {
      console.error('Error adding song preference:', err);
      return res.status(500).json({ error: 'Failed to add song preference' });
    }
    res.json({ status: 'success', data: result });
  });
});

// ----------------------------------- Server Section -----------------------------------------------
// Initializes the Express app on port 3000
const port = process.env.PORT || 3000;

// Serves the HTML page as the root URL when opened
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use(express.static(path.join(__dirname, 'public')));

// Provides link to run chatbot
app.listen(port, () => {
  console.log(`Server is now running on http://localhost:${port}`);
});
