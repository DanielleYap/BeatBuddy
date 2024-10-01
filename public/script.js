// script.js


let conversationHistory = []; // Used to save conversation information to ensure context


// Select DOM elements once
const inputField = document.getElementById('inputTOGP');
const outputDiv = document.getElementById('output');
const submitButton = document.getElementById('submitButton');


submitButton.addEventListener('click', async () => {
 const userInput = inputField.value.trim(); // Get the latest user input

 // Optional: Prevent empty submissions
 if (!userInput) {
   alert('Please enter a question before submitting.');
   return;
 }

 console.log(userInput) // Shows user input in terminal

 outputDiv.textContent = "Loading..."; // Clears the outputDiv before displaying new response


 try {
   const response = await fetch('/generate', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({ input: userInput, conversationHistory }),
   });


   const data = await response.json();


   if (response.ok) {
     // Update conversation history with the latest interaction
     conversationHistory = data.conversationHistory;
    
     // Display the AI's response
     outputDiv.textContent = 'AI: ' + data.output;
   } else {
     // Display error message from the server
     outputDiv.textContent = 'Error: ' + data.error;
   }
 } catch (error) {
   console.error('Error:', error);
   outputDiv.textContent = 'An error occurred while processing your request.';
 }
});
