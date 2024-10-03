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
    return formatInformation(albumInfo, 'album');
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
      const formattedAlbum = formatInformation(album, 'album');
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
    return formatInformation(trackInfo, 'track');
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
      const formattedTrack = formatInformation(track, 'track');
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
      const formattedTrack = formatInformation(track, 'track');      
      formattedTracks.push(formattedTrack);
    }

    return formattedTracks; // Returns the formatted list of searched tracks

  } catch (error) {
    console.error("Error fetching data from Last.fm", error);
    throw error; // Rethrow the error so it can be caught in server.js
  }
}

//------------------------------------Tag related methods----------------------------------------------

//param tag: The genre/tag to search top tacks of
//param limit: The number of tracks to search for, default 5
//getTagTopTracks: Returns top tracks relating to particular tag
async function getTagsTopTracks(tag, limit = 5) {
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

    return formattedTracks; // Returns the formatted list of top tracks

  } catch (error) {
    console.error("Error fetching data from Last.fm", error);
    throw error;
  }
}


//param tag: The genre/tag to search top artists of
//param limit: The number of artists to search for, default 5
//getTagsTopArtist: Returns top artists relating to particular tag
async function getTagsTopArtists(tag, limit = 5) {
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

    const tagResults = response.data.topartists?.artist || [];

    let formattedArtists = [];

    for (const artist of tagResults) {
      const formattedArtist = formatInformation(artist, 'artist');
      formattedArtists.push(formattedArtist);
    }

    return formattedArtists;
  } catch (error) {
    console.error("Error fetching data from Last.fm", error);
    throw error;
  }
}


//------------------------------------Format related methods----------------------------------------------
//param data: JSON formatted information about a particular dataset
//param dataType: The type of data, "album", "artist" ...
//formatInformation: Extracts the necessary data from the data parameter
const formatInformation = (data, dataType) => {
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
    images: [],
  };

  if (data) {
    if (dataType === 'track') {
      // Title
      formattedData.title = data.name || data.track?.name || formattedData.title;

      // Artist
      if (typeof data.artist === 'string') {
        formattedData.artist = data.artist;
      } else if (data.artist && data.artist.name) {
        formattedData.artist = data.artist.name;
      } else if (data.track && data.track.artist && data.track.artist.name) {
        formattedData.artist = data.track.artist.name;
      }

      // Release Date
      formattedData.releaseDate = data.wiki?.published || data.track?.wiki?.published || formattedData.releaseDate;

      // Top Tags
      if (data.toptags && data.toptags.tag) {
        formattedData.topTags = data.toptags.tag.map(tag => tag.name);
      } else if (data.track && data.track.toptags && data.track.toptags.tag) {
        formattedData.topTags = data.track.toptags.tag.map(tag => tag.name);
      }

      // Album
      formattedData.album = data.album?.title || data.track?.album?.title || formattedData.album;

    } else if (dataType === 'album') {
      // Title
      formattedData.title = data.name || formattedData.title;

      // Artist
      formattedData.artist = data.artist || formattedData.artist;

      // Release Date
      formattedData.releaseDate = data.wiki?.published || formattedData.releaseDate;

      // Top Tags
      if (data.tags && data.tags.tag) {
        formattedData.topTags = data.tags.tag.map(tag => tag.name);
      }

      // Albums don't have the 'album' field, so we can set it to 'N/A' or leave as 'Unknown'

    } else if (dataType === 'artist') {
      // Name
      formattedData.title = data.name || formattedData.title; // Using 'title' to keep consistency

      // Listeners
      formattedData.listeners = data.listeners || formattedData.listeners;

      // Playcount
      formattedData.playcount = data.playcount || formattedData.playcount;

      // URL
      formattedData.url = data.url || formattedData.url;

      // Images
      if (data.image) {
        formattedData.images = data.image.map(img => ({
          size: img.size,
          url: img['#text'],
        }));
      }

      // Artists don't have 'artist', 'album', 'releaseDate', or 'topTags' in this context
    }
  }

  return formattedData;
};


module.exports = {
  getTrackInfo,
  getRelatedTracks,
  searchTrack,
  getAlbumInfo,
  searchAlbum,
  getTagsTopTracks,
  getTagsTopArtists 
};