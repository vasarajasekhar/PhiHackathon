const functions = require('firebase-functions');
const logger = require('firebase-functions/logger');
const express = require('express');
const cors = require('cors');
const OpenAIApi = require('openai'); // Ensure you import it correctly based on the OpenAI SDK documentation

const app = express();

app.use(cors({ origin: true }));

const openai = new OpenAIApi.OpenAI({baseURL: "http://192.168.0.100:1234/v1", apiKey: "not-needed"})
// Define the POST endpoint for ChatGPT

app.post('/chat', async (req, res) => {
  const prompt = req.body.prompt;

  if (!prompt) {
    res.status(400).send('Prompt is required');
    return;
  }

  try {
    const result = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt}],
      model: "local-model",
    });

    console.log(result);

    res.send({
      response: result
    });
  } catch (error) {
    logger.error('Error with OpenAI API:', error);
    res.status(500).send('Error with the API call');
  }
});

// Export the Express app as a Firebase Function
exports.chatWithGPT = functions.runWith({ timeoutSeconds: 500 }).https.onRequest(app);