/**
 * This example is using the Authorization Code flow.
 *
 * In root directory run
 *
 *     npm install express
 *
 * then run with the followinng command. If you don't have a client_id and client_secret yet,
 * create an application on Create an application here: https://developer.spotify.com/my-applications to get them.
 * Make sure you whitelist the correct redirectUri in line 26.
 *
 *     node access-token-server.js "<Client ID>" "<Client Secret>"
 *
 *  and visit <http://localhost:8888/login> in your Browser.
 */
const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const fs = require('fs');


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

});

const app = express();

app.get('/login', (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

let accessToken;
let refreshToken;
let tokenExpiryTime;

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
      tokenExpiryTime = Date.now() + (data.body['expires_in'] * 1000); // Store expiry time in milliseconds

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
      }, 1000 * 60 * 50); // Check every 50 minutes to refresh the token
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



//Function to add tracks from playlist.json into a spotify playlist
//@param listOftracks: JSON file that holds trackTitle and artistName
//returns: A link that leads the user to a playlist
async function createPlaylist(playlistTitle) {
  console.log("createPlaylist called");
  try {
    // Read the JSON file containing the tracks
    const data = fs.readFileSync('playlist.json', 'utf8');
    // Parse the JSON data into an object
    const listOfTracks = JSON.parse(data);

    // Create a playlist
    const playlistData = await spotifyApi.createPlaylist(playlistTitle, { 'description': 'Playist Created by BeatBuddy', 'public': true });
    const playlistID = playlistData.body.id;
    console.log(playlistTitle + " created successfully!");

    // Loop through each track and add it to the playlist
    for (const track of listOfTracks) {


      // SQL portion: increment song frequency and genres 




      try {
        // Search for the track
        const searchTrackResult = await spotifyApi.searchTracks('track:' + track.title + ' artist:' + track.artist);
        console.log(track.title + " retrieved from Spotify");

        // If track was found
        if (searchTrackResult.body.tracks.items.length > 0) {
          const TRACK_URI = searchTrackResult.body.tracks.items[0].uri;

          // Add track to playlist
          await spotifyApi.addTracksToPlaylist(playlistID, [TRACK_URI]);
          console.log(track.title + " successfully added to " + playlistTitle + "!");
        } else {
          // If track was not found
          console.log(track.title + " could not be found.");
        }
      } catch (error) {
        console.error("Error occurred when attempting to add " + track.title + ": ", error);
      }
    }

    // Generate clickable link to user
    const PLAYLIST_URI = `https://open.spotify.com/playlist/${playlistID}`;
    console.log('Playlist can be found at: ', PLAYLIST_URI);
    return "Playlist successfully created at " + PLAYLIST_URI;
  } catch (error) {
    console.error("Error occurred when creating playlist", error);
    return "Error creating playlist";
  }
}
// After obtaining the access token
spotifyApi.setAccessToken(accessToken);




module.exports = {
  createPlaylist,
}