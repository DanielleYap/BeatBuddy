# Beat Buddy

  

Beat Buddy is a AI Music Recommender that provides a music playlist based on the conversation between the user and chatbot

  

## Prerequisites

  

Make sure you have the following installed on your machine:

  

- [Node.js]

  

### Download Node.js

  

1. Visit the [Node.js download page](https://nodejs.org/en/download/prebuilt-installer).

  

Once Fully Installed, ensure node and npm are installed using the following commands:

    node -v

~~~
npm -v
~~~

  

**Note**: Both commands should return version numbers, confirming that *Node.js* and *npm* are installed successfully.

  

## Instructions to Run the Server

1.  **Clone the repository**
In Terminal run the following command: 
    ```
    git clone https://github.com/WickeyR/BeatBuddy_CS4800.git

2. **Navigate to project directory**
	```
	cd BEATBUDDY

3.  **Install Dependencies**

	Inside project directory run the following command:
    ```
    npm install

4. **Setup API Keys**: 
- In **openAIFunctions.js**: 
	- Place API key in `const  OPEN_AI_KEY  =  ' '` 
- In **MusicFunctions.js**:
	- Place API key in `const  API_KEY = ' '` 
    
5.  **Run the server**:
	Start the server using the following command:
	```
	node server.js
	
6.  **Access the server**:
 Click on link provided in terminal:
 http://localhost:3000

