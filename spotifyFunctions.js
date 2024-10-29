//spotifyFunctions.js: Creates a connection to spotify and allows the program to export a playlist to spotify

/**
 * This example is using the Authorization Code flow.
 *
 * In root directory run
 *
 *     npm install express
 *
 * then run with the following command. If you don't have a client_id and client_secret yet,
 * create an application on Create an application here: https://developer.spotify.com/my-applications to get them.
 * Make sure you whitelist the correct redirectUri in line 26.
 *
 *     node access-token-server.js "<Client ID>" "<Client Secret>"
 *
 * and visit <http://localhost:8888/login> in your Browser.
 */

//-----------------------------------------Imports -------------------------------------------------------

const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const fs = require('fs');

// Import database functions
const { updateGenre, updateSong } = require('./dbFunctions');

//-----------------------------------------Spotify Setup -------------------------------------------------------

const scopes = [
  'ugc-image-upload',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
  'user-read-email',
  'user-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-library-modify',
  'user-library-read',
  'user-top-read',
  'user-read-playback-position',
  'user-read-recently-played',
  'user-follow-read',
  'user-follow-modify'
];
const spotifyApi = new SpotifyWebApi({
  redirectUri: 'http://localhost:8888/callback',
  clientId: '',
  clientSecret: ''
});

const app = express();

//-----------------------------------------Authorization Endpoints -------------------------------------------------------

/**
 * Endpoint to initiate Spotify login
 * Redirects user to Spotify authorization page with specified scopes
 */
app.get('/login', (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

/**
 * Callback endpoint after Spotify authorization
 * Handles access and refresh token retrieval and sets up auto-refresh of access token
 */
app.get('/callback', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi.authorizationCodeGrant(code)
    .then(data => {
      accessToken = data.body['access_token'];
      refreshToken = data.body['refresh_token'];
      // Store expiry time in milliseconds
      tokenExpiryTime = Date.now() + (data.body['expires_in'] * 1000); 

      spotifyApi.setAccessToken(accessToken);
      spotifyApi.setRefreshToken(refreshToken);

      console.log('access_token:', accessToken);
      console.log('refresh_token:', refreshToken);

      res.send('Success! You can now close the window.');

      // Automatically refresh token before it expires
      setInterval(async () => {
        if (Date.now() > tokenExpiryTime) {
          try {
            const refreshedData = await spotifyApi.refreshAccessToken();
            accessToken = refreshedData.body['access_token'];
            tokenExpiryTime = Date.now() + (refreshedData.body['expires_in'] * 1000);

            spotifyApi.setAccessToken(accessToken);
            console.log('Access token has been refreshed:', accessToken);
          } catch (err) {
            console.error('Error refreshing access token:', err);
          }
        }
        // Check every 50 minutes to refresh the token
      }, 1000 * 60 * 50); 
    })
    .catch(error => {
      console.error('Error getting Tokens:', error);
      res.send(`Error getting Tokens: ${error}`);
    });
});

app.listen(8888, () =>
  console.log(
    'HTTP Server up. Now go to http://localhost:8888/login in your browser.'
  )
);

//-----------------------------------------Helper Functions -------------------------------------------------------

/**
 * Ensures the access token is valid before making API calls.
 * Refreshes the access token if it has expired.
 */
async function ensureAccessToken() {
  if (Date.now() > tokenExpiryTime) {
    try {
      const refreshedData = await spotifyApi.refreshAccessToken();
      accessToken = refreshedData.body['access_token'];
      tokenExpiryTime = Date.now() + (refreshedData.body['expires_in'] * 1000);
      spotifyApi.setAccessToken(accessToken);
      console.log('Access token has been refreshed:', accessToken);
    } catch (err) {
      console.error('Error refreshing access token:', err);
    }
  }
}

/**
 * Function to create a Spotify playlist and add tracks from playlist.json
 * @param {string} playlistTitle - Title of the new Spotify playlist
 * @returns {Promise<string>} A message indicating success or failure along with the playlist link
 */
async function createPlaylist(playlistTitle) {
  console.log("createPlaylist called");
  try {

    // Ensure the access token is valid
    await ensureAccessToken();

    const data = fs.readFileSync('public/playlist.json', 'utf8');
    const listOfTracks = JSON.parse(data);

    //attempts to create a public playlist  
    const playlistData = await spotifyApi.createPlaylist(playlistTitle, {
      description: 'Playlist Created by BeatBuddy',
      public: true,
    });

    const playlistID = playlistData.body.id;

    //Adds each track from Json file to the playlist
    for (const track of listOfTracks) {

      //Searches for track information from json file on spotify
      try {
        const searchTrackResult = await spotifyApi.searchTracks(
          `track:${track.title} artist:${track.artist}`
        );

        //if the track exists, add it to the playlist
        if (searchTrackResult.body.tracks.items.length > 0) {
          const TRACK_URI = searchTrackResult.body.tracks.items[0].uri;
          await spotifyApi.addTracksToPlaylist(playlistID, [TRACK_URI]);

          // Update genres in the database (only the first 3 tags)
          for (let i = 0; i < Math.min(3, track.topTags.length); i++) {
            const tag = track.topTags[i];
            await updateGenre(tag);
          }

          // Update song in the database
          await updateSong(track.title, track.artist, track.topTags[0]);

        } else {
          console.log(`${track.title} could not be found.`);
        }
      } catch (error) {
        console.error(`Error with track ${track.title}: `, error);
      }
      console.log(`${track.title} added to the playlist.`);
    }

    //Returns the playilst link to the user
    const PLAYLIST_URI = `https://open.spotify.com/playlist/${playlistID}`;
    return `Playlist successfully created at ${PLAYLIST_URI}`;

  } catch (error) {
    console.error('Error occurred when creating playlist', error);
    return 'Error creating playlist';
  }
}

//-----------------------------------------Exports -------------------------------------------------------

module.exports = {
  createPlaylist,
};
