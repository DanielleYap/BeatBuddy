// server.js: hosts the server on localhost to run the application

require('dotenv').config();  // Load environment variables

const API_KEY = 'YOUR_API_KEY'; // Enter your API Key here

const axios = require('axios');

// Required packages
const fs = require('fs');
const express = require('express'); // Creates server and handles routing
const cors = require('cors'); // Allows front-end to communicate with back-end
const bodyParser = require('body-parser'); // Parses incoming request bodies
const path = require('path'); // Works with file and directory paths
const session = require('express-session'); // For session management
const app = express(); // Initializes express
app.use(express.json()); // Allows parsing JSON

// Sets up JSON file reading/writing
const saveData = (data, filename) => {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2)); // Writes the contents to the specified file
};

// Initialize data arrays
let trackPlaylist = [];
let albumPlaylist = [];
let artistList = [];

// Clear JSON files upon server startup
const initializeDataFiles = () => {
  saveData([], 'playlist.json'); // Clear playlist.json for tracks
  saveData([], 'albums.json');
  saveData([], 'artists.json');
};

initializeDataFiles(); // Calls initialize function to clear data files

const {
  getTrackInfo,
  getRelatedTracks,
  searchTrack,
  getAlbumInfo,
  searchAlbum,
  getTagsTopTracks,
  getTagsTopArtists,
} = require('./MusicFunctions');


//-------------------------------T ester Functions -------------------------------------------------------
(async () => {
  try {
    // Get Track Info
    const trackInfo = await getTrackInfo('Adele', 'Hello');
    console.log('Track Info:', trackInfo);
    trackPlaylist.push(trackInfo);
    saveData(trackPlaylist, 'playlist.json'); // Save to playlist.json

    // Get Related Tracks
    const relatedTracks = await getRelatedTracks('Adele', 'Hello');
    if (Array.isArray(relatedTracks) && relatedTracks.length > 0) {
      console.log('Related Tracks:', relatedTracks);
      trackPlaylist.push(...relatedTracks);
      saveData(trackPlaylist, 'playlist.json'); // Save to playlist.json
    } else {
      console.error('No related tracks returned.');
    }

    // Search Track
    const searchedTracks = await searchTrack('Hello');
    if (Array.isArray(searchedTracks) && searchedTracks.length > 0) {
      console.log('Searched Tracks:', searchedTracks);
      trackPlaylist.push(...searchedTracks);
      saveData(trackPlaylist, 'playlist.json'); // Save to playlist.json
    } else {
      console.error('No tracks returned from search.');
    }

    // Get Album Info
    const albumInfo = await getAlbumInfo('Metallica', 'Master of Puppets');
    console.log('Album Info:', albumInfo);
    albumPlaylist.push(albumInfo);
    saveData(albumPlaylist, 'albums.json');

    // Search Album
    const searchedAlbums = await searchAlbum('Ride The Lightning');
    if (Array.isArray(searchedAlbums) && searchedAlbums.length > 0) {
      console.log('Searched Albums:', searchedAlbums);
      albumPlaylist.push(...searchedAlbums);
      saveData(albumPlaylist, 'albums.json');
    } else {
      console.error('No albums returned from search.');
    }

    // Get Tags Top Tracks
    const topPopTracks = await getTagsTopTracks('pop', 5);
    if (Array.isArray(topPopTracks) && topPopTracks.length > 0) {
      console.log('Top Tracks for Tag "pop":', topPopTracks);
      trackPlaylist.push(...topPopTracks);
      saveData(trackPlaylist, 'playlist.json'); // Save to playlist.json
    } else {
      console.error('No top tracks returned for tag "pop".');
    }

    // Get Tags Top Artists
    const topPopArtists = await getTagsTopArtists('pop', 5);
    if (Array.isArray(topPopArtists) && topPopArtists.length > 0) {
      console.log('Top Artists for Tag "pop":', topPopArtists);
      artistList.push(...topPopArtists);
      saveData(artistList, 'artists.json');
    } else {
      console.error('No top artists returned for tag "pop".');
    }

  } catch (error) {
    console.error('Error in async operations:', error);
  }
})();


// ----------------------------------- Server Section -----------------------------------------------
// Initializes the Express app on port 3000
const port = process.env.PORT || 3000;

// Serves the HTML page as the root URL when opened
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is now running on http://localhost:${port}`);
});
