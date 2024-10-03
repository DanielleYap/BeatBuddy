// server.js: hosts the server on local-host to run application

let playlist = []

// Required packages 
const fs = require('fs');
const express = require('express'); // Creates server and handles routing
const cors = require('cors'); // Allows front-end to communicate with back-end 
const bodyParser = require('body-parser'); // Parses incoming request bodies
const path = require("path"); // Works with file and directory paths
const session = require('express-session'); // For session management
const app = express(); // Initializes express
app.use(express.json()); // Allows to parse JSON

// Sets up JSON file reading/writing 
const pathToPlaylist = './playlist.json'; // The path of the JSON file

// Save the playlist to the JSON file
const savePlaylist = (playlist) => {
  fs.writeFileSync(pathToPlaylist, JSON.stringify(playlist)); // Writes the contents to playlistPath
};

// Empty the playlist upon server startup
const initializePlaylist = () => {
  const emptyPlaylist = []; // Empty array for playlist
  savePlaylist(emptyPlaylist); // Overwrite playlist.json with an empty array
};

initializePlaylist(); // Calls initialize function to clear playlist.json

const { getTrackInfo, getRelatedTracks, searchTrack, searchAlbum, getAlbumInfo} = require('./MusicFunctions');


//---------------------------------Testing Functions-----------------------------------------------------
getTrackInfo('Adele', 'hello')
  .then(trackInfo => {
    console.log('Track Info:', trackInfo);
    playlist.push(trackInfo);
    savePlaylist(playlist);
  })
  .catch(error => {
    console.error(error);
  });
getTrackInfo('Pharrell Williams', 'Happy')
  .then(trackInfo => {
    console.log('Track Info:', trackInfo);
    playlist.push(trackInfo);
    savePlaylist(playlist);
  })
  .catch(error => {
    console.error(error);
  });
getRelatedTracks('Adele', 'Hello')
  .then(formattedTracks => {
    
    if (Array.isArray(formattedTracks)) {
      console.log("Related Tracks\n", formattedTracks);
      playlist.push(...formattedTracks); // Use spread operator to add multiple tracks
      savePlaylist(playlist);
    } else {
      console.error('No tracks returned');
    }
  })
  .catch(error => {
    console.error(error);
  });
searchTrack('Hello')
  .then(searchedTracks => {
    if (Array.isArray(searchedTracks)) {
      console.log("Searched Tracks\n", searchedTracks);
      playlist.push(...searchedTracks); // Use spread operator to add multiple tracks
      savePlaylist(playlist);
    } else {
      console.error('No tracks returned');
    }
  })
  .catch(error => {
    console.error(error);
  });

  //ToDo: Make albums json file 
getAlbumInfo('Metallica', 'Master of Puppets')
  .then(albumInfo => {
    console.log('Album Info:', albumInfo);
    playlist.push(albumInfo);
    savePlaylist(playlist);
  })
  .catch(error => {
    console.error(error);
  });
searchAlbum('Ride The Lightning')
  .then(searchedAlbums => {
    if (Array.isArray(searchedAlbums)) {
      console.log("Searched albums\n", searchedAlbums);
      playlist.push(...searchedAlbums); // Use spread operator to add multiple tracks
      savePlaylist(playlist);
    } else {
      console.error('No tracks returned');
    }
  })
  .catch(error => {
    console.error(error);
  });




//---------------------------------Server Functions-----------------------------------------------------



// Initializes the Express app on port 3000
const port = process.env.PORT || 3000;

// Serves the HTML page as the root URL when opened
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is now running on http://localhost:${port}`);
});
