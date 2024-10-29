//MusicFunctions.js: Creates methods to retrieve music information from the Last.fm database, and provide functions to store the data

//Enter your Last.fm API Key here
const API_KEY = '' 

//-----------------------------------------Imports -------------------------------------------------------

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const publicDirectory = path.join(__dirname, 'public');

//------------------------------------Album related methods----------------------------------------------

/**
 * getAlbumInfo: Returns information relating to an album from last.fm
 * @param {string} artist - The artist of the album being searched
 * @param {string} albumTitle - The title of the album to search
 * @returns {Promise<Object>} The formatted album information
 */
async function getAlbumInfo(artist, albumTitle) {
  console.log('getAlbumInfo called');

  // Attempt to get a response from Last.fm with provided parameters
  try {
    const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'album.getInfo',
        api_key: API_KEY,
        artist: artist,
        album: albumTitle,
        autocorrect: 1,
        format: 'json',
      },
    });

    //Saves the response from Last.fm and returns it
    const albumInfo = response.data;
    return formatInformation(albumInfo, 'album');
  } catch (error) {
    console.error('Error fetching data from last.fm', error);
    throw error;
  }
}

/**
 * searchAlbum: Returns a list of albums with the title of albumTitle
 * @param {string} albumTitle - The title of an album to search for
 * @param {number} [limit=5] - The number of albums to search for, default 5
 * @returns {Promise<Object[]>} The formatted list of searched albums
 */
async function searchAlbum(albumTitle, limit = 5) {
  console.log('searchAlbum called');

  // Attempt to get a response from Last.fm with provided parameters
  try {
    const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'album.search',
        api_key: API_KEY,
        album: albumTitle,
        limit: limit,
        format: 'json',
      },
    });

    // Access the array of searched albums safely
    const searchResults = response.data.results?.albummatches?.album || [];
    let formattedAlbums = [];

    // Loop through each searched album and format it
    for (const album of searchResults) {
      const formattedAlbum = formatInformation(album, 'album');
      formattedAlbums.push(formattedAlbum);
    }

    // Returns the formatted list of searched albums
    return formattedAlbums; 

  } catch (error) {
    console.error('Error fetching data from Last.fm', error);
    
    // Rethrow the error so it can be caught in server.js
    throw error; 
  }
}

//------------------------------------Track related methods----------------------------------------------

/**
 * getTrackInfo: Returns track information in JSON formatting
 * @param {string} artist - The name of the artist to use for searching
 * @param {string} songTitle - The name of the song to be searched
 * @returns {Promise<Object>} The formatted track information
 */
async function getTrackInfo(artist, songTitle) {
  console.log('getTrackInfo called');

  // Attempt to get a response from Last.fm with provided parameters
  try {
    const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'track.getInfo',
        api_key: API_KEY,
        artist: artist,
        track: songTitle,
        autocorrect: 1,
        format: 'json',
      },
    });

    // Save the response data and return it formatted
    const trackInfo = response.data;
    return formatInformation(trackInfo, 'track');
  } catch (error) {
    console.error('Error fetching data from last.fm', error);
    throw error;
  }
}

/**
 * getRelatedTracks: Returns related tracks in JSON formatting
 * @param {string} artist - The artist used to search for similar songs
 * @param {string} songTitle - The name of the song used to search for related songs
 * @param {number} [limit=5] - The limit of similar tracks to return
 * @returns {Promise<Object[]>} The formatted list of similar tracks
 */
async function getRelatedTracks(artist, songTitle, limit = 5) {
  console.log('getRelatedTracks called');

  // Attempt to get a response from Last.fm with provided parameters
  try {
    const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'track.getSimilar',
        api_key: API_KEY,
        artist: artist,
        track: songTitle,
        autocorrect: 1,
        limit: limit,
        format: 'json',
      },
    });

    // Access the array of related tracks safely
    const relatedTracks = response.data.similartracks
      ? response.data.similartracks.track
      : [];

    let formattedTracks = [];

    // Loop through each related track and format it
    for (const track of relatedTracks) {
      const formattedTrack = formatInformation(track, 'track');
      formattedTracks.push(formattedTrack);
    }

    // Add to tracks.json
    addToTracks(formattedTracks);

    console.log('tracks.json updated');

    // Returns the formatted list of similar tracks
    return formattedTracks;
  } catch (error) {
    console.error('Error fetching data from Last.fm', error);

    // Rethrow the error so it can be caught in server.js
    throw error;
  }
}

/**
 * searchTrack: Returns a formatted list of tracks with the name of songTitle
 * @param {string} songTitle - The name of the song used in search
 * @param {number} [limit=5] - The limit of tracks to return
 * @returns {Promise<Object[]>} The formatted list of searched tracks
 */
async function searchTrack(songTitle, limit = 5) {
  console.log('searchTrack called');

  // Attempt to get a response from Last.fm with provided parameters
  try {
    const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'track.search',
        api_key: API_KEY,
        track: songTitle,
        limit: limit,
        format: 'json',
      },
    });

    // Access the array of searched tracks safely
    const searchResults = response.data.results?.trackmatches?.track || [];

    let formattedTracks = [];

    // Loop through each searched track and format it
    for (const track of searchResults) {
      const formattedTrack = formatInformation(track, 'track');
      formattedTracks.push(formattedTrack);
    }

    // Add to tracks.json
    addToTracks(formattedTracks);
    console.log('tracks.json updated');

    // Returns the formatted list of searched tracks
    return formattedTracks;
  } catch (error) {
    console.error('Error fetching data from Last.fm', error);
    throw error; // Rethrow the error so it can be caught in server.js
  }
}

//------------------------------------Tag related methods----------------------------------------------

/**
 * getTagsTopTracks: Returns top tracks relating to a particular tag
 * @param {string} tag - The genre/tag to search top tracks of
 * @param {number} [limit=5] - The number of tracks to search for, default 5
 * @returns {Promise<Object[]>} The formatted list of top tracks
 */
async function getTagsTopTracks(tag, limit = 5) {
  console.log('getTagsTopTracks called');

  // Attempt to get a response from Last.fm with provided parameters
  try {
    const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'tag.getTopTracks',
        api_key: API_KEY,
        tag: tag,
        limit: limit,
        format: 'json',
      },
    });

    // Correctly access the array of top tracks
    const tagResults = response.data.tracks?.track || [];

    let formattedTracks = [];

    // Loop through each top track and format it
    for (const track of tagResults) {
      const formattedTrack = formatInformation(track, 'track');
      formattedTracks.push(formattedTrack);
    }

    // Append to tracks.json
    addToTracks(formattedTracks);
    console.log('tracks.json updated');

    // Returns the formatted list of top tracks
    return formattedTracks;
  } catch (error) {
    console.error('Error fetching data from Last.fm', error);
    throw error;
  }
}

/**
 * getTagsTopArtists: Returns top artists relating to a particular tag
 * @param {string} tag - The genre/tag to search top artists of
 * @param {number} [limit=5] - The number of artists to search for, default 5
 * @returns {Promise<Object[]>} The formatted list of top artists
 */
async function getTagsTopArtists(tag, limit = 5) {
  console.log('getTagsTopArtists called');

  // Attempt to get a response from Last.fm with provided parameters
  try {
    const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'tag.getTopArtists',
        api_key: API_KEY,
        tag: tag,
        limit: limit,
        format: 'json',
      },
    });

    // Access the array of top artists for a genre
    const tagResults = response.data.topartists?.artist || [];

    let formattedArtists = [];

    // Append the information to the formatted array
    for (const artist of tagResults) {
      const formattedArtist = formatInformation(artist, 'artist');
      formattedArtists.push(formattedArtist);
    }

    // Return the formatted array
    return formattedArtists;
  } catch (error) {
    console.error('Error fetching data from Last.fm', error);
    throw error;
  }
}

//------------------------------------Chart related methods----------------------------------------------

/**
 * getChartTopArtists: Returns the top current charting artists
 * @param {number} [limit=5] - The number of top artists to return
 * @returns {Promise<Object[]>} The formatted list of top charting artists
 */
async function getChartTopArtists(limit = 5) {
  console.log('getChartTopArtists called');

  // Attempt to get a response from Last.fm with provided parameters
  try {
    const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'chart.getTopArtists',
        api_key: API_KEY,
        limit: limit,
        format: 'json',
      },
    });

    // Create an array for the results
    const chartResults = response.data.artists?.artist || [];

    let artists = [];

    // Place the artists in the array
    for (const artist of chartResults) {
      const formattedArtist = formatInformation(artist, 'artist');
      artists.push(formattedArtist);
    }
    return artists;
  } catch (error) {
    console.error('Error fetching data from Last.fm', error);
    throw error;
  }
}

/**
 * getChartTopTags: Returns the top current charting genres
 * @param {number} [limit=5] - The number of top tags to return
 * @returns {Promise<string[]>} The list of top charting genres
 */
async function getChartTopTags(limit = 5) {
  console.log('getChartTopTags called');

  // Attempt to get a response from Last.fm with provided parameters
  try {
    const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'chart.getTopTags',
        api_key: API_KEY,
        limit: limit,
        format: 'json',
      },
    });

    const chartGenreResults = response.data.tags?.tag || [];

    let chartingGenres = [];

    for (const genre of chartGenreResults) {
      // Add the name of the genre to the list
      chartingGenres.push(genre.name);
    }
    // Return the list
    return chartingGenres;
  } catch (error) {
    console.error('Error fetching data from Last.fm', error);
    throw error;
  }
}

/**
 * getChartTopTracks: Returns the top current charting tracks
 * @param {number} [limit=5] - The number of top tracks to return
 * @returns {Promise<Object[]>} The formatted list of top charting tracks
 */
async function getChartTopTracks(limit = 5) {
  console.log('getChartTopTracks called');

  // Attempt to get a response from Last.fm with provided parameters
  try {
    const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'chart.getTopTracks',
        api_key: API_KEY,
        limit: limit,
        format: 'json',
      },
    });

    const chartTrackResults = response.data.tracks?.track || [];

    let chartingTracks = [];

    for (const track of chartTrackResults) {
      // Add the track to the list
      const formattedChartTrack = formatInformation(track, 'track');
      chartingTracks.push(formattedChartTrack);
    }

    // Return the list
    return chartingTracks;
  } catch (error) {
    console.error('Error fetching data from Last.fm', error);
    throw error;
  }
}

//------------------------------------Format related methods----------------------------------------------

/**
 * formatInformation: Extracts the necessary data from the data parameter
 * @param {Object} data - JSON formatted information about a particular dataset
 * @param {string} dataType - The type of data, "album", "artist", etc.
 * @returns {Object} The formatted data
 */
const formatInformation = (data, dataType) => {
  // Defines a dictionary to properly store information about a particular data response from Last.fm
  let formattedData = {
    type: dataType,
    title: 'Unknown',
    artist: 'Unknown',
    releaseDate: 'Unknown',
    topTags: [],
    album: 'Unknown',
    listeners: 'Unknown',
    playcount: 'Unknown',
    url: 'Unknown',
    imageURL: 'No image available',
  };

  // Formatting for tracks
  if (data) {
    if (dataType === 'track') {
      // Title formatting for tracks
      formattedData.title =
        data.name || data.track?.name || formattedData.title;

      // Artist formatting for tracks
      if (typeof data.artist === 'string') {
        formattedData.artist = data.artist;
      } else if (data.artist && data.artist.name) {
        formattedData.artist = data.artist.name;
      } else if (data.track && data.track.artist && data.track.artist.name) {
        formattedData.artist = data.track.artist.name;
      }

      // Release Date formatting for tracks
      formattedData.releaseDate =
        data.wiki?.published ||
        data.track?.wiki?.published ||
        formattedData.releaseDate;

      // Top Tags formatting for tracks
      if (data.toptags && data.toptags.tag) {
        formattedData.topTags = data.toptags.tag.map((tag) => tag.name);
      } else if (
        data.track &&
        data.track.toptags &&
        data.track.toptags.tag
      ) {
        formattedData.topTags = data.track.toptags.tag.map((tag) => tag.name);
      }

      // Album formatting
      formattedData.album =
        data.album?.title ||
        data.track?.album?.title ||
        formattedData.album;

      // Image formatting
      if (data.album && data.album.image) {
        formattedData.images = data.album.image.map((img) => ({
          size: img.size,
          url: img['#text'],
        }));
      } else if (data.track && data.track.album && data.track.album.image) {
        formattedData.images = data.track.album.image.map((img) => ({
          size: img.size,
          url: img['#text'],
        }));
      } else if (data.image) {
        formattedData.images = data.image.map((img) => ({
          size: img.size,
          url: img['#text'],
        }));
      }

      // Extract the large image URL
      const largeImage = formattedData.images.find(
        (img) => img.size === 'extralarge' || img.size === 'large'
      );
      formattedData.largeImageURL = largeImage
        ? largeImage.url
        : formattedData.largeImageURL;

      // Formatting for albums
    } else if (dataType === 'album') {
      // Title formatting for albums
      formattedData.title = data.name || formattedData.title;

      // Artist formatting for albums
      formattedData.artist = data.artist || formattedData.artist;

      // Release Date formatting for albums
      formattedData.releaseDate =
        data.wiki?.published || formattedData.releaseDate;

      // Top Tags formatting for albums
      if (data.tags && data.tags.tag) {
        formattedData.topTags = data.tags.tag.map((tag) => tag.name);
      }

      // Formatting for artists
    } else if (dataType === 'artist') {
      // Name formatting for artists
      formattedData.title = data.name || formattedData.title;

      // Listeners formatting for artists
      formattedData.listeners = data.listeners || formattedData.listeners;

      // Playcount formatting for artists
      formattedData.playcount = data.playcount || formattedData.playcount;

      // URL formatting for artist
      formattedData.url = data.url || formattedData.url;

      // Image formatting for artists
      if (data.image) {
        formattedData.images = data.image.map((img) => ({
          size: img.size,
          url: img['#text'],
        }));
      }
    }
  }
  // Return the formatted data once complete
  return formattedData;
};

//------------------------------------JSON related methods----------------------------------------------

/**
 * addToTracks: Adds formatted tracks to tracks.json
 * @param {Object[]} formattedTracks - The tracks to add to tracks.json
 * @returns {string} Confirmation message
 */
async function addToTracks(formattedTracks) {
  // Grab current tracks.json contents
  let trackData = loadData('tracks.json');

  // Append formattedTracks to tracks.json, unique songs only
  for (let track of formattedTracks) {
    const exists = trackData.some(
      // True if track in formattedTracks already exists in the fileData
      (t) => t.title === track.title && t.artist === track.artist
    );

    // Pushes track if it does not already exist
    if (!exists) {
      trackData.push(track);
    }
  }

  // Save complete data back to tracks.json
  saveData(trackData, 'tracks.json');

  return 'Track successfully added to playlist';
}

/**
 * addToPlaylist: Adds a particular song to the user's playlist
 * @param {string} songTitle - The name of the song to add to the playlist
 * @param {string} [artist=null] - The artist of the song, default none
 * @returns {Promise<Object>} The status of the operation
 */
async function addToPlaylist(songTitle, artist = null) {
  console.log('addToPlaylist called');

  // Load the current playlist
  let playlistData = loadData('playlist.json');

  // Check if the song is already in the playlist
  let songInPlaylist = playlistData.some(
    (t) =>
      t.title.toLowerCase() === songTitle.toLowerCase() &&
      (artist ? t.artist.toLowerCase() === artist.toLowerCase() : true)
  );

  if (songInPlaylist) {
    console.log('Song is already in the playlist.');
    return { status: 'Song is already in the playlist.' };
  }

  // Fetch detailed track info using getTrackInfo
  let trackInfo;
  try {
    trackInfo = await getTrackInfo(artist, songTitle);
  } catch (error) {
    console.error('Error fetching track info:', error);
    return { status: 'Song not found.', error: true };
  }

  // Add song to tracks.json if not already present
  let trackData = loadData('tracks.json');
  let songInTracks = trackData.find(
    (t) =>
      t.title.toLowerCase() === songTitle.toLowerCase() &&
      (artist ? t.artist.toLowerCase() === artist.toLowerCase() : true)
  );

  if (!songInTracks) {
    // Add song to tracks.json
    trackData.push(trackInfo);
    saveData(trackData, 'tracks.json');
  }

  // Add song to playlist.json
  playlistData.push(trackInfo);
  saveData(playlistData, 'playlist.json');

  console.log('Song added to playlist with detailed info.');
  return { status: 'Song added to playlist with detailed info.' };
}

/**
 * saveData: Saves data to the filename
 * @param {Object|Object[]} data - The data to append to filename
 * @param {string} filename - The JSON file to add data to
 */
const saveData = (data, filename) => {
  const filePath = path.join(publicDirectory, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

/**
 * loadData: Load up the data from the provided filename
 * @param {string} filename - The file to load data from
 * @returns {Object|Object[]} The loaded data
 */
const loadData = (filename) => {
  const filePath = path.join(publicDirectory, filename);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } else {
    return [];
  }
};

/**
 * deleteFromPlaylist: Removes a track from playlist.json
 * @param {string} songTitle - The name of the song to remove
 * @param {string} [artist=null] - The artist of the song that is being removed
 * @returns {Promise<Object>} The status of the operation
 */
async function deleteFromPlaylist(songTitle, artist = null) {
  console.log('deleteFromPlaylist called ');

  // Load current playlist
  let playlistData = loadData('playlist.json');

  // Check if the song is already in the playlist
  let songInPlaylist = playlistData.some(
    (t) =>
      t.title.toLowerCase() === songTitle.toLowerCase() &&
      (artist ? t.artist.toLowerCase() === artist.toLowerCase() : true)
  );

  // Return none
  if (!songInPlaylist) {
    console.log('Song is not in playlist.');
    return { status: 'Song is not in playlist.', error: true };
  }

  // Removes track from playlist if it exists in the playlist
  playlistData = playlistData.filter(
    (t) =>
      !(
        t.title.toLowerCase() === songTitle.toLowerCase() &&
        (artist ? t.artist.toLowerCase() === artist.toLowerCase() : true)
      )
  );

  // Update the playlist which will now not contain 'songTitle'
  saveData(playlistData, 'playlist.json');
  console.log('Song removed from playlist.');
  return { status: 'Song removed from playlist.' };
}

// Exports MusicFunctions to be used in other files.
module.exports = {
  getTrackInfo,
  getRelatedTracks,
  searchTrack,
  getAlbumInfo,
  searchAlbum,
  getTagsTopTracks,
  getTagsTopArtists,
  addToPlaylist,
  deleteFromPlaylist,
  loadData,
  getChartTopArtists,
  getChartTopTags,
  getChartTopTracks,
};