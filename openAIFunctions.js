// openAIFunctions.js

// PLACE openAI api key here
const OPEN_AI_KEY = ''
//-----------------------------------------Imports -------------------------------------------------------

const OpenAI = require('openai'); // To interact with OpenAI
const fs = require('fs'); // To read files 

//Imports  functions from MusicFunctions.js
const {
  getChartTopArtists,
  getChartTopTags,
  getChartTopTracks,
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
  loadData, 
} = require('./MusicFunctions');

//Imports functions from spotifyFunctions.js
const{
  createPlaylist,
} = require('./spotifyFunctions');

//Imports functions from dbFunctions.js
const {
  getTopGenres,
  getTopSongs,
  getSongs
} = require('./dbFunctions');


//------------------------------------Function Defenitions----------------------------------------------
const functionDefinitions = [
  {
    name: 'createPlaylist',
    description: 'Exports / makes a spotify playlist using the playlist data that was created',
    parameters: {
      type: 'object',
      properties: {
        playlistTitle: {
          type: 'string',
          description: 'A creative and unique playlist name based on genres of the songs',
        },
      },
      required: ['playlistTitle'],
    },
  },
  {
    name: 'searchTrack',
    description: 'Searches for tracks based on a song title.',
    parameters: {
      type: 'object',
      properties: {
        songTitle: {
          type: 'string',
          description: 'The title of the song to search for.',
        },
        limit: {
          type: 'integer',
          description: 'The number of tracks to return (default is 5).',
          default: 5,
        },
      },
      required: ['songTitle'],
    },
  },
  {
    name: 'getTrackInfo',
    description: 'Retrieves detailed information about a specific track.',
    parameters: {
      type: 'object',
      properties: {
        artist: {
          type: 'string',
          description: 'The name of the artist.',
        },
        songTitle: {
          type: 'string',
          description: 'The title of the song.',
        },
      },
      required: ['artist', 'songTitle'],
    },
  },
  {
    name: 'getRelatedTracks',
    description: 'Searches for similar tracks, returns ONLY the  name of the song and the artist',
    parameters: {
      type: 'object',
      properties: {
        artist: {
          type: 'string',
          description: 'The name of the artist.',
        },
        songTitle: {
          type: 'string',
          description: 'The title of the song to search for.',
        },
        limit: {
          type: 'integer',
          description: 'The number of tracks to return (default is 5).',
          default: 5,
        },
      },
      required: ['artist', 'songTitle'],
    },
  },
  {
    name: 'getAlbumInfo',
    description: 'Search for information about a particular album by an artist',
    parameters: {
      type: 'object',
      properties: {
        artist: {
          type: 'string',
          description: 'The artist of the album.',
        },
        albumTitle: {
          type: 'string',
          description: 'The title of the album.',
        },
      },
      required: ['artist', 'albumTitle'],
    },
  },
  {
    name: 'searchAlbum',
    description: 'Search for albums of the title provided',
    parameters: {
      type: 'object',
      properties: {
        albumTitle: {
          type: 'string',
          description: 'The title of the album.',
        },
        limit: {
          type: 'integer',
          description: 'The number of tracks to return (default is 5).',
          default: 5,
        },
      },
      required: ['albumTitle'],
    },
  },
  {
    name: 'getTagsTopTracks',
    description: 'Search the top tracks related to a particular mood/genre/tag. return ONLY the name of the song and the arist',
    parameters: {
      type: 'object',
      properties: {
        tag: {
          type: 'string',
          description: 'The tag related to a track.',
        },
        limit: {
          type: 'integer',
          description: 'The number of tracks to return (default is 5).',
          default: 5,
        },
      },
      required: ['tag'],
    },
  },
  {
    name: 'getTagsTopArtists',
    description: 'Search the top artists related to a particular mood/genre/tag',
    parameters: {
      type: 'object',
      properties: {
        tag: {
          type: 'string',
          description: 'The tag related to an artist.',
        },
        limit: {
          type: 'integer',
          description: 'The number of artists to return (default is 5).',
          default: 5,
        },
      },
      required: ['tag'],
    },
  },
  {
    name: 'addToPlaylist',
    description: 'Adds a particular track to the playlist',
    parameters: {
      type: 'object',
      properties: {
        songTitle: {
          type: 'string',
          description: 'The title of the song.',
        },
        artist: {
          type: 'string',
          description: 'The name of the artist.',
        },
      },
      required: ['songTitle', 'artist'],
    },
  },
  {
  name: 'deleteFromPlaylist',
    description: 'delete a particular track to the playlist',
    parameters: {
      type: 'object',
      properties: {
        songTitle: {
          type: 'string',
          description: 'The title of the song to remove.',
        },
        artist: {
          type: 'string',
          description: 'The name of the artist to remove.',
        },
      },
      required: ['songTitle', 'artist'],
    },
  },
  {
    name: 'printPlaylist',
    description: 'Prints ONLY the song title and the artist of a song',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'BuildSuggestedPlaylist',
    description: 'Builds a suggested playlist based on the current playlist and favorite genres or songs.',
    parameters: {
      type: 'object',
      properties: {
        genre: {
          type: 'string',
          description: 'Optional. The genre to base the suggested playlist on.',
        },
        limit: {
          type: 'integer',
          description: 'Optional. The number of songs to include in the suggested playlist (default is 10).',
          default: 10,
        },
      },
      required: [],
    },
  },
  {
    name: 'getChartTopArtists',
    description: 'Search and return the name of the current top charting artists',
    parameters: {
      type: 'object',
      properties: {
      
        limit: {
          type: 'integer',
          description: 'The number of artists to return (default is 5).',
          default: 5,
        },
      },
    },
  },
  {
    name: 'getChartTopTags',
    description: 'Search and return the name of the current top  genres',
    parameters: {
      type: 'object',
      properties: {
      
        limit: {
          type: 'integer',
          description: 'The number of genres to return (default is 5).',
          default: 5,
        },
      },
    },
  },
  {
    name: 'getChartTopTracks',
    description: 'Search and return the name of the current top charting tracks',
    parameters: {
      type: 'object',
      properties: {
      
        limit: {
          type: 'integer',
          description: 'The number of tracks to return (default is 5).',
          default: 5,
        },
      },
    },
  },
];

//------------------------------------ OpenAI Setup ------------------------------------------------------

const openai = new OpenAI({
  apiKey: OPEN_AI_KEY,
});

/**
 * Sanitizes messages before passing them to OpenAI API
 * @param {Array} messages - Array of messages to be sanitized
 * @returns {Array} Array of sanitized messages
 */
function sanitizeMessages(messages) {
  return messages.map((msg) => {
    let sanitizedMsg = { role: msg.role };

    if (msg.content !== undefined && msg.content !== null) {
      sanitizedMsg.content = msg.content;
    }

    if (msg.name) {
      sanitizedMsg.name = msg.name;
    }

    if (msg.function_call) {
      sanitizedMsg.function_call = msg.function_call;
    }

    return sanitizedMsg;
  });
}

//------------------------------------ OpenAI Messaging ------------------------------------------------------

/**
 * Sends a message to OpenAI and retrieves the assistant's response
 * @param {string} userInput - The input message from the user
 * @param {Array} conversationHistory - The conversation history between OpenAI and the user
 * @returns {Promise<Object>} The response and updated conversation history
 */
const messageGPT = async (userInput, conversationHistory = []) => {
  // Add user input to conversation history
  if (userInput) {
    conversationHistory.push({ role: 'user', content: userInput });
  }

  try {

    // Fetch top genres and songs for system prompt summary
    const topGenres = await getTopGenres(5); // Limit to top 5 for brevity    
    const topSongs = await getTopSongs(5);

    // Format the data as a string
    const topGenresList = topGenres.map((genre) => genre.genre_name).join(', ');
    const topSongsList = topSongs.map((song) => `"${song.song_title}" by ${song.artist}`).join('; ');

    // Include a brief summary in the system prompt
    const systemPrompt = `
    You are Beat Buddy, a music recommender. Guide the user and make playlists based on their inputs and suggestions.
  
    `;

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...conversationHistory,
    ];

    // Sanitize messages before sending
    const sanitizedMessages = sanitizeMessages(messages);

    // Call the OpenAI API with function definitions
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: sanitizedMessages,
      functions: functionDefinitions,
      function_call: 'auto', 
      max_tokens: 250,
      temperature: 0.2,
    });

    // Get the assistant's response
    const responseMessage = completion.choices[0].message;

    // Check if the assistant wants to call a function
    if (responseMessage.function_call) {
      const functionName = responseMessage.function_call.name;
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);

      // Execute the corresponding function from MusicFunctions.js and spotifyFunctions.js
      let functionResult;
      switch (functionName) {
        // Last.Fm related functions
        case 'searchTrack':
          functionResult = await searchTrack(
            functionArgs.songTitle,
            functionArgs.limit || 5
          );
          break;
        case 'getTrackInfo':
          functionResult = await getTrackInfo(
            functionArgs.artist,
            functionArgs.songTitle
          );
          break;
        case 'getAlbumInfo':
          functionResult = await getAlbumInfo(
            functionArgs.artist,
            functionArgs.albumTitle
          );
          break;
        case 'getRelatedTracks':
          functionResult = await getRelatedTracks(
            functionArgs.artist,
            functionArgs.songTitle,
            functionArgs.limit || 5
          );
          break;
        case 'searchAlbum':
          functionResult = await searchAlbum(
            functionArgs.albumTitle,
            functionArgs.limit || 5
          );
          break;
        case 'getTagsTopTracks':
          functionResult = await getTagsTopTracks(
            functionArgs.tag,
            functionArgs.limit || 5
          );
          break;
        case 'getTagsTopArtists':
          functionResult = await getTagsTopArtists(
            functionArgs.tag,
            functionArgs.limit || 5
          );
          break;
        
        case 'getChartTopArtists':
          functionResult = await getChartTopArtists(
            functionArgs.limit || 5
          );
          break;
        case 'getChartTopTags':
          functionResult = await getChartTopTags(
          functionArgs.limit || 5
            );
          break;

        case 'getChartTopTracks':
          functionResult = await getChartTopTracks(
          functionArgs.limit || 5
            );
          break;
        case 'addToPlaylist':
          functionResult = await addToPlaylist(
            functionArgs.songTitle,
            functionArgs.artist
          );
          break;
        case 'deleteFromPlaylist':
          functionResult = await deleteFromPlaylist(
            functionArgs.songTitle,
            functionArgs.artist
          );
          break;
        case 'printPlaylist':
          functionResult = await printPlaylist();
          break;

        // Spotify related functions
        case 'createPlaylist':
          functionResult = await createPlaylist(functionArgs.playlistTitle);
          break;
        case 'BuildSuggestedPlaylist':
          functionResult = await BuildSuggestedPlaylist(
            functionArgs.genre || null,
            functionArgs.limit || 10
          );
          break;
        default:
          throw new Error(`Function ${functionName} is not implemented.`);
      }

      // Prepare the assistant's message
      let assistantMessage = {
        role: responseMessage.role,
      };

      if (responseMessage.content) {
        assistantMessage.content = responseMessage.content;
      }

      if (responseMessage.function_call) {
        assistantMessage.function_call = responseMessage.function_call;
      }

      conversationHistory.push(assistantMessage);

      // Add the function's result to the conversation history
      conversationHistory.push({
        role: 'function',
        name: functionName,
        content: JSON.stringify(functionResult),
      });

      // Sanitize conversation history before sending
      const sanitizedConversationHistory = sanitizeMessages(conversationHistory);

      // Call the model again to get the assistant's final response
      const completion2 = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: sanitizedConversationHistory,
        max_tokens: 250,
        temperature: 0.2,
      });

      const finalResponseMessage = completion2.choices[0].message;

      // Add the final response to the conversation history
      conversationHistory.push({
        role: finalResponseMessage.role,
        content: finalResponseMessage.content,
      });

      // Return the assistant's final response
      return {
        response: finalResponseMessage.content,
        conversationHistory,
      };
    } else {
      // No function call; proceed as usual
      let assistantMessage = {
        role: responseMessage.role,
        content: responseMessage.content,
      };
      conversationHistory.push(assistantMessage);

      return {
        response: responseMessage.content,
        conversationHistory,
      };
    }
  } catch (error) {
    console.error(
      'Error communicating with OpenAI:',
      error.response ? error.response.data : error.message
    );
    throw new Error('Failed to communicate with OpenAI.');
  }
};

//------------------------------------Open AI Functions -------------------------------------------------

/**
 * Builds a suggested playlist based on the current playlist and favorite genres or songs
 * @param {string} [genre=null] - Optional. The genre to base the suggested playlist on
 * @param {number} [limit=10] - Optional. The number of songs to include in the suggested playlist
 * @returns {Promise<string|Array>} A message or an array of added songs
 */
async function BuildSuggestedPlaylist(genre = null, limit = 10) {
  console.log("BuildSuggestedPlaylist called");
  let suggestedSongs = 0;
  let songsAdded = [];
  let playlistSongs = 0;
  let databaseSongs = 0;

  //If genre is added, dedicate half of the built playlist to songs of the genre
  if (genre){
    let genreSongsAdded = 0
    while (genreSongsAdded < (limit / 2)){
      //gets a random track from getTagsTopTracks and a similar track
      const genreTracks = await getTagsTopArtists(genre);
      const randomIndex = Math.floor(Math.random() * genreTracks.length); //Grabs a random index

      //grabs a simliar track 
      const simliarGenreTrack = await getRelatedTracks(genreTracks[randomIndex].artist, genreTracks[randomIndex].artist);

      //Attempts to add both tracks to playlist
      //For each track sucessfully added, increment suggestedSongs by 1
      //Check impplementation 




      //Checks if similar song is not already in playlist
      if (!songsAdded.contains(simliarGenreTrack[randomIndex].songTitle)){
        //Add to the playlist if so
        songsAdded.push({
          source: 'playlist',
          title: simliarGenreTrack[randomIndex].title,
          artist: simliarGenreTrack[randomIndex].artist
        });
        //Increment songs by 1
        suggestedSongs +=1
      }

      //Do the same process for the genre track
      if (!songsAdded.contains(genreTracks[randomIndex].songTitle)){
        //Add to the playlist if so
        songsAdded.push({
          source: 'playlist',
          title: genreTracks[randomIndex].title,
          artist: genreTracks[randomIndex].artist
        });
        //Increment songs by 1
        suggestedSongs +=1
      }

    }

  }

  try {
    const data = await fs.promises.readFile('public/playlist.json', 'utf8');
    const listOfTracks = JSON.parse(data);

    const playlistRelatedLimit = Math.floor(limit / 2);

    // First half: Build from existing playlist tracks
    if (listOfTracks.length > 0) {
      for (const track of listOfTracks) {
        if (genre === null || (track.topTags && track.topTags.includes(genre))) {
          const relatedTracks = await getRelatedTracks(track.artist, track.title, 5);

          if (relatedTracks && relatedTracks.length > 0) {
            const randomIndex = Math.floor(Math.random() * relatedTracks.length);
            const similarTrack = relatedTracks[randomIndex];

            // Add to playlist
            await addToPlaylist(similarTrack.title, similarTrack.artist);

            // Add to songsAdded array
            songsAdded.push({
              source: 'playlist',
              title: similarTrack.title,
              artist: similarTrack.artist
            });

            suggestedSongs += 1;
            playlistSongs += 1;

            if (suggestedSongs >= playlistRelatedLimit) {
              break;
            }
          }
        }
      }
    }

    // Second half: Fetch from database
    if (suggestedSongs < limit) {
      const remainingLimit = limit - suggestedSongs;
      let songsFromDB = [];

      if (genre) {
        // Fetch songs matching the genre
        songsFromDB = await getSongs(genre);
      } else {
        // Fetch top songs based on times_in_playlist
        songsFromDB = await getTopSongs();
      }

      for (const song of songsFromDB) {
        const relatedTracks = await getRelatedTracks(song.artist, song.song_title, 5);

        if (relatedTracks && relatedTracks.length > 0) {
          const randomIndex = Math.floor(Math.random() * relatedTracks.length);
          const similarTrack = relatedTracks[randomIndex];

          await addToPlaylist(similarTrack.title, similarTrack.artist);

          // Add to songsAdded array
          songsAdded.push({
            source: 'database',
            title: similarTrack.title,
            artist: similarTrack.artist
          });

          suggestedSongs += 1;
          databaseSongs += 1;

          if (suggestedSongs >= limit) {
            break;
          }
        }
      }
    }

    if (suggestedSongs === 0) {
      console.log("No tracks were added to the playlist.");
      return "No tracks were added to the playlist.";
    } else {
      console.log(`Total Suggested Songs: ${suggestedSongs}`);
      console.log(`Songs added from playlist: ${playlistSongs}`);
      console.log(`Songs added from database: ${databaseSongs}`);
      return songsAdded;
    }
  } catch (error) {
    console.error('Error building suggested playlist:', error);
    return "An error has occurred.";
  }
}

// Allows other JavaScript files to use messageGPT
module.exports = {
  messageGPT,
};

