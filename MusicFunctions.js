require('dotenv').config();  // Load environment variables

const API_KEY = ''  //Enter your API Key here

const axios = require('axios');
const fs = require('fs');



//------------------------------------Album related methods----------------------------------------------

//param artist: The artist of the album being searched
//param albumTitle: The title of the album to search
//getAlbumInfo: Returns information relating to an album from last.fm
async function getAlbumInfo(artist, albumTitle){
  console.log('getAlbumInfo called');

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
  console.log('searchAlbum called');

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
  console.log('getTrackInfo called');

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
  console.log('getRelatedTracks called');

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

    //add to tracks.json
    addToTracks(formattedTracks);
    console.log('tracks.json updated')


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
  console.log('searchTrack called');

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

    //add to tracks.json
    addToTracks(formattedTracks);
    console.log('tracks.json updated')

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
  console.log('getTagsTopTracks called');

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

    //append to tracks.json
    addToTracks(formattedTracks);
    console.log('tracks.json updated')


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
  console.log('getTagsTopArtists called');
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


async function addToTracks(formattedTracks){
  //Grab current tracks.json contents
  let trackData = loadData('tracks.json');

  //append formattedTracks to tracks.json, unique songs only
  for(let track of formattedTracks){
    const exists = trackData.some(
      // True if track in formatted track already exists in the fileData
      (t) => t.title === track.title && t.artist === track.artist
    );

    //Pushes track if it does not already exist 
    if(!exists){
      trackData.push(track); 
    }
  }


  //save complete data back to tracks.json
  saveData(trackData, 'tracks.json')
  return "track successfuly added to playlist";
}

//param songTitle: The name of the song to add to the playlist
//param artist: The artist of the song, default none
//addToPlaylist: Adds a particular song to the users playlist
async function addToPlaylist(songTitle, artist = null){
  console.log("addToPlaylist called");
  //laod the current tracklist
  let trackData = loadData('tracks.json');
  //loads current playlist
  let playlistData = loadData('playlist.json');
  //if already in tracklist add that song to playlist
  // Check if the song is already in the playlist
  let songInPlaylist = playlistData.some(
    (t) => t.title.toLowerCase() === songTitle.toLowerCase() && (artist ? t.artist.toLowerCase() === artist.toLowerCase() : true)
  );
  if (songInPlaylist) {
    console.log("Song is already in the playlist.");
    return { status: "Song is already in the playlist." };
  }


  //if not in playlist, call searchTrack, and append to playlist.json
   // Find the song in tracks.json
   let songInTracks = trackData.find(
    (t) => t.title.toLowerCase() === songTitle.toLowerCase() && (artist ? t.artist.toLowerCase() === artist.toLowerCase() : true)
  );

  if (songInTracks) {
    // Add the song to the playlist
    playlistData.push(songInTracks);
    //updates the playlist with new song
    saveData(playlistData, 'playlist.json'); 
    console.log("Song added to playlist from tracks.json.");
    return { status: "Song added to playlist from tracks.json." };
  } else {
    // Song not in tracks.json, search for it
    let searchResults = await searchTrack(songTitle);
    
    let song;
    //Used to add artist parameter if passed through to function
    if (artist) {
      // Find the song with the specified artist
      song = searchResults.find((t) => t.artist.toLowerCase() === artist.toLowerCase());
    }

    if (!song && searchResults.length > 0) {
      // If artist not specified or not found, take the first result
      song = searchResults[0];
    }

    if (song) {
      // Add song to tracks.json
      trackData.push(song);
      saveData(trackData, 'tracks.json');
      
      // Add song to playlist.json
      playlistData.push(song);
      saveData(playlistData, 'playlist.json');
      console.log("Song found via searchTrack and added to tracks.json and playlist.json.");
      return { status: "Song found and added to playlist." };
    } else {
      console.log("Song not found via searchTrack.");
      return { status: "Song not found.", error: true };
    }
  }
}

//saves the data  to a particular json file
const saveData = (data, filename) => {
  //Write the data to the file 
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
};


//Load up the data from the provided fileename
const loadData = (filename) => {
  //Ensure the file exists
  if (fs.existsSync(filename)) {
    //Read the data in utf8 formatting
    const data = fs.readFileSync(filename, 'utf8');
    return JSON.parse(data);
  } else {
    return [];
  }
};



async function deleteFromPlaylist(songTitle, artist = null){
  console.log("deleteFromPlaylist called ");

  //Load current playlist 
  let playlistData = loadData('playlist.json');

  //if already in tracklist add that song to playlist
  // Check if the song is already in the playlist
  let songInPlaylist = playlistData.some(
    (t) => t.title.toLowerCase() === songTitle.toLowerCase() && 
    (artist ? t.artist.toLowerCase() === artist.toLowerCase() : true)
  );

  //Return none 
  if (!songInPlaylist) {
    console.log("Song is not in playlist.");
    return { status: "Song is not in playlist.", error: true }; 
   }
  //If there is remove it 
  playlistData = playlistData.filter(
    (t) =>
      !(
        t.title.toLowerCase() == songTitle.toLowerCase() &&
        (artist ? t.artist.toLowerCase() === artist.toLowerCase(): true)
      )
  );
  //update the playlist 
  saveData(playlistData, 'playlist.json');
  console.log("Song removed from playlist.");
  return { status: "Song removed from playlist." };
}

async function printPlaylist(){
  console.log("printPlaylist called");

  //load playlist and return it 
  return loadData("playlist.json");

}


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
  printPlaylist,

};