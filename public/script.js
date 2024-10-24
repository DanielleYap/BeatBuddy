let conversationHistory = [];


document.addEventListener('DOMContentLoaded', function () {
  const inputField = document.getElementById('inputTOGPT');
  const outputDiv = document.getElementById('output');
  const submitButton = document.getElementById('submitButton');

  submitButton.addEventListener('click', async () => {
    const userInput = inputField.value.trim(); // Get the latest user input

    //Prevents empty submissions
    if (!userInput) {
      alert('Please enter a question before submitting.');
      return;
    }

    console.log("Submit button clicked! Input: " + userInput);

    outputDiv.textContent = "Loading..."; // Show "Loading..." while waiting for response

    try {
      // Directly make the POST request to the server's /generate endpoint
      const response = await fetch('/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: userInput, conversationHistory }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("User: " + userInput + ", AI: " + data.output);
        outputDiv.textContent = 'AI: ' + data.output;  // Display AI's response
        conversationHistory = data.conversationHistory; //Updates conversation history 
      } else {
        outputDiv.textContent = 'Error: ' + data.error;
      }
    } catch (error) {
      console.error('Error:', error);
      outputDiv.textContent = 'An error occurred while processing your request.';
    }
  });
});




// When the user presses the button to print the playist