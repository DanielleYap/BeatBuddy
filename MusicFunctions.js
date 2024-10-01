//music functions 

//require('dotenv').config(); //Loads enviorment variables from .env file

const axios = require('axios')

const API_KEY ='b86f8a28bbffac1bdeee2e712a177de6'



async function getTrackInfo(artist, songTitle){
    try{
        const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
            params: {
              method: 'track.getInfo',
              api_key: API_KEY,
              artist: artist,
              track: songTitle,
              format: 'json'
            }
          });

          const trackInfo = response.data;
          return trackInfo;
}catch(error){
    console.error("Error fetching data from last.fm", error)
}
}








  //Used to format data for json file

  const formatTrackInformation = (trackInfo) => {
    //Extracts relavent information about track

    const title = trackInfo.track.name; //Title of the song
    const artist = trackInfo.track.artist.name; //Name of the artist
    
    const releaseDate = trackInfo.track.wiki ? trackInfo.track.wiki.published : 'Unknown'; //Song published date, or unknown
  
    const topTags = trackInfo.track.toptags.tag ? trackInfo.track.toptags.tag.map(tag => tag.name) : []; //Tags/genre info
  
    const albumName = trackInfo.track.album ? trackInfo.track.album.title : 'Unknown'; //Name of album
  
    // Return the formatted track information for proper JSON formatting 
    return {
      title: title,
      artist: artist,
      releaseDate: releaseDate,
      topTags: topTags,
      album: albumName
    };
  };
  

  module.exports = {
    getTrackInfo,
    formatTrackInformation 
};