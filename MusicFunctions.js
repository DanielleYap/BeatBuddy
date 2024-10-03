require('dotenv').config();  // Load environment variables

const API_KEY = '' //Enter your API Key here

const axios = require('axios')


//------------------------------------Album related methods----------------------------------------------

//param artist: The artist of the album being searched
//param albumTitle: The title of the album to search
//getAlbumInfo: Returns information relating to an album from last.fm
async function getAlbumInfo(artist, albumTitle){
  try{
    const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'album.getInfo',
        api_key: API_KEY,
        artist: artist,
        album: albumTitle,
        autocorrect: 1,
        format: 'json'
      }
    });

    const albumInfo = response.data;
    return formatAlbumInformation(albumInfo);
  } catch(error){
    console.error("Error fetching data from last.fm", error);
    throw error;
  }
}
//param albumTitle: The title of an album to search for
//param limit: The number of albums to search for, default 5
//serachAlbum: Returns a list of albums with the title of albumTitle
async function searchAlbum(albumTitle, limit = 5){
  try{
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

    // Loop through each searched albums and format it
    for (const album of searchResults) {
      const formattedAlbum = formatAlbumInformation(album);
      formattedAlbums.push(formattedAlbum);
    }

    return formattedAlbums; // Returns the formatted list of searched albums

  } catch (error) {
    console.error("Error fetching data from Last.fm", error);
    throw error; // Rethrow the error so it can be caught in server.js
  }
}

//------------------------------------Track related methods----------------------------------------------

//param artist: The name of the artist to use for searching
//param song: The name of the song to be searched
//getTrackInfo: Returns track information in JSON formatting 
async function getTrackInfo(artist, songTitle){
  try{
    const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'track.getInfo',
        api_key: API_KEY,
        artist: artist,
        track: songTitle,
        autocorrect: 1,
        format: 'json'
      }
    });

    const trackInfo = response.data;
    return formatTrackInformation(trackInfo);
  } catch(error){
    console.error("Error fetching data from last.fm", error);
    throw error;
  }
}


//param artist: The artist used to search for similar songs
//param songTitle: The name of the song used to search for related songs
//param limit: The limit of similar tracks to return
//getSimilarTracks: Returns related tracks in JSON formatting
async function getRelatedTracks(artist, songTitle, limit = 5) {
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
    const relatedTracks = response.data.similartracks ? response.data.similartracks.track : [];

    let formattedTracks = [];

    // Loop through each related track and format it
    for (const track of relatedTracks) {
      const formattedTrack = formatTrackInformation(track);
      formattedTracks.push(formattedTrack);
    }

    return formattedTracks; // Returns the formatted list of similar tracks

  } catch (error) {
    console.error("Error fetching data from Last.fm", error);
    throw error; // Rethrow the error so it can be caught in server.js
  }
}



//param songTitle: The name of the song used in serach
//param limit: The limit of  tracks to return
//searchTrack: Returns a formatted list of tracks with the name of songTitle
async function searchTrack(songTitle, limit = 5){
  try{
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
      const formattedTrack = formatTrackInformation(track);
      formattedTracks.push(formattedTrack);
    }

    return formattedTracks; // Returns the formatted list of searched tracks

  } catch (error) {
    console.error("Error fetching data from Last.fm", error);
    throw error; // Rethrow the error so it can be caught in server.js
  }
}

















//------------------------------------Format related methods----------------------------------------------
//param trackInfo: JSON formatted information about a particular song
//formatTrackInformation: Extracts the necessary data from the trackInfo parameter
const formatTrackInformation = (trackInfo) => {
  let title = 'Unknown';
  let artist = 'Unknown';
  let releaseDate = 'Unknown';
  let topTags = [];
  let albumName = 'Unknown';

  if (trackInfo) {
    // Title
    if (trackInfo.name) {
      title = trackInfo.name;
    } else if (trackInfo.track && trackInfo.track.name) {
      title = trackInfo.track.name;
    }

    // Artist
    if (typeof trackInfo.artist === 'string') {
      artist = trackInfo.artist;
    } else if (trackInfo.artist && trackInfo.artist.name) {
      artist = trackInfo.artist.name;
    } else if (trackInfo.track && trackInfo.track.artist && trackInfo.track.artist.name) {
      artist = trackInfo.track.artist.name;
    }

    // Release Date
    if (trackInfo.wiki && trackInfo.wiki.published) {
      releaseDate = trackInfo.wiki.published;
    } else if (trackInfo.track && trackInfo.track.wiki && trackInfo.track.wiki.published) {
      releaseDate = trackInfo.track.wiki.published;
    }

    // Top Tags
    if (trackInfo.toptags && trackInfo.toptags.tag) {
      topTags = trackInfo.toptags.tag.map(tag => tag.name);
    } else if (trackInfo.track && trackInfo.track.toptags && trackInfo.track.toptags.tag) {
      topTags = trackInfo.track.toptags.tag.map(tag => tag.name);
    }

    // Album
    if (trackInfo.album && trackInfo.album.title) {
      albumName = trackInfo.album.title;
    } else if (trackInfo.track && trackInfo.track.album && trackInfo.track.album.title) {
      albumName = trackInfo.track.album.title;
    }
  }

  return {
    title: title,
    artist: artist,
    releaseDate: releaseDate,
    topTags: topTags,
    album: albumName,
  };
};
//param albumInfo: JSON formatted information about a particular albun
//formatAlbumInformation: Extracts the necessary data from the albumInfo parameter
const formatAlbumInformation = (albumInfo) => {
  let title = 'Unknown';
  let artist = 'Unknown';
  let releaseDate = 'Unknown';
  let topTags = [];

  if (albumInfo) {
    let album = albumInfo.album ? albumInfo.album : albumInfo;

    // Title
    if (album.name) {
      title = album.name;
    }

    // Artist
    if (album.artist) {
      artist = album.artist;
    }

    // Release Date
    if (album.wiki && album.wiki.published) {
      releaseDate = album.wiki.published;
    }

    // Top Tags
    if (album.tags && album.tags.tag) {
      topTags = album.tags.tag.map(tag => tag.name);
    }
  }

  return {
    title: title,
    artist: artist,
    releaseDate: releaseDate,
    topTags: topTags,
  };
};

module.exports = {
  getTrackInfo,
  formatTrackInformation,
  getRelatedTracks,
  searchTrack,
  getAlbumInfo,
  searchAlbum,
  formatAlbumInformation,
};