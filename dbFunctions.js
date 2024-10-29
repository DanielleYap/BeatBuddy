// dbFunctions.js: Defines functions to communicate with the SQL database and manipulate values 

//-----------------------------------------Imports -------------------------------------------------------

const mysql = require('mysql2/promise');

// SQL Connection setup
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'rootroot',
  database: 'beatbuddy'
});

//-----------------------------------------SQL methods -------------------------------------------------------

/**
 * updateGenre: Updates the number of times a particular genre has been appended
 * @param {string} genre - The genre to update 
 * @returns {Promise<Object>} The results of the update operation
 */
async function updateGenre(genre) {

  // Attempt to make a query to database
  try {
    const [results] = await connection.query(
      // Append the genre to the database, or increment its occurrence by 1 
      'INSERT INTO genres (genre_name, times_in_playlist) VALUES (?, 1) ON DUPLICATE KEY UPDATE times_in_playlist = times_in_playlist + 1',
      [genre]
    );

    // If successful, print result
    console.log('Genre updated:', results);

    return results;
  } catch (err) {
    console.error('Error updating genre:', err);
    throw err;
  }
}

/**
 * updateSong: Update information about a song or add it to the database 
 * @param {string} songTitle - The title of a song
 * @param {string} artist - The artist of the song
 * @param {string} genreName - The genre related to the song
 * @returns {Promise<Object>} The results of the update operation
 */
async function updateSong(songTitle, artist, genreName) {

  // Attempt to make a query to database
  try {
    const [results] = await connection.query(
      // Insert the song with its information in the database, or increment its occurrence by 1
      'INSERT INTO songs (song_title, artist, genre_name, times_in_playlist) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE times_in_playlist = times_in_playlist + 1',
      [songTitle, artist, genreName]
    );

    // If successful, print result
    console.log('Song updated:', results);

    return results;
  } catch (err) {
    console.error('Error updating song:', err);
    throw err;
  }
}

/**
 * getTopGenres: Returns a user's top genres in a database
 * @param {number} [limit=5] - The number of genres to return from the database
 * @returns {Promise<Object[]>} The list of top genres and their counts
 */
async function getTopGenres(limit = 5) {

  // Attempt to make a query to database
  try {
    const [rows] = await connection.query(
      // Selects the genres that occur the most in the database
      'SELECT genre_name, times_in_playlist FROM genres ORDER BY times_in_playlist DESC LIMIT ?',
      [limit]
    );

    // If successful, return result
    return rows;

  } catch (err) {
    console.error('Error fetching top genres:', err);
    throw err;
  }
}

/**
 * getTopSongs: Returns a user's top songs in a database
 * @param {number} [limit=5] - The number of songs to return from the database
 * @returns {Promise<Object[]>} The list of top songs and their counts
 */
async function getTopSongs(limit = 5) {

  // Attempt to make a query to database
  try {
    const [rows] = await connection.query(
      // Selects song information of the songs that occur the most in the database
      'SELECT song_title, artist, times_in_playlist FROM songs ORDER BY times_in_playlist DESC LIMIT ?',
      [limit]
    );

    // If successful, return results
    return rows;

  } catch (err) {
    console.error('Error fetching top songs:', err);
    throw err;
  }
}

/**
 * getSongs: Returns songs in the database of a genre
 * @param {string|null} genre - The genre of the song to return 
 * @returns {Promise<Object[]>} The list of songs matching the genre or all songs if no genre is specified
 */
async function getSongs(genre = null) {

  // Attempt to make a query to database
  try {
    let query;
    let params = [];

    if (genre === null) {
      // Get all songs
      query = 'SELECT song_title, artist FROM songs';
    } else {
      // Get songs matching the genre
      query = 'SELECT song_title, artist FROM songs WHERE genre_name = ?';
      params.push(genre);
    }

    const [rows] = await connection.query(query, params);

    //Return the result if successful
    return rows;
    
  } catch (err) {
    console.error('Error fetching songs:', err);
    throw err;
  }
}

// Allows other files to use dbFunctions' methods
module.exports = {
  updateGenre,
  updateSong,
  getTopGenres,
  getTopSongs,
  getSongs
};
