const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const { Readable } = require("stream");
const Replicate = require("replicate");

const PORT = 3001;

const app = express();

// CORS CONFIGURATION
app.use(
  cors({
    origin: ["https://app.xrprime.site"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(bodyParser.json());

// API Route for Image Generation
app.post("/api/generateImages", async (req, res) => {
  const { prompt } = req.body;

  try {
    console.log("Request Body:", req.body);
    const prediction = await replicate.run(
      "black-forest-labs/flux-1.1-pro-ultra",
      {
        input: {
          prompt: prompt || "default prompt",
          aspect_ratio: "3:2",
        },
      }
    );

    console.log("Replicate Prediction:", prediction);

    // Handle readable stream (binary response)
    if (prediction instanceof ReadableStream) {
      const reader = prediction.getReader();
      let chunks = [];

      // Read the binary data
      const processStream = async () => {
        const { value, done } = await reader.read();
        if (done) {
          // Combine binary chunks
          const buffer = Buffer.concat(chunks);

          // Save to file or convert to base64
          const base64Image = buffer.toString("base64");
          res.status(200).json({
            imageUrl: `data:image/jpeg;base64,${base64Image}`,
          });
        } else {
          chunks.push(value);
          processStream();
        }
      };

      await processStream();
    } else if (typeof prediction === "string") {
      // Handle direct URL response
      res.status(200).json({ imageUrl: prediction });
    } else if (prediction && prediction.output) {
      // Handle standard response
      res.status(200).json({ imageUrl: prediction.output[0] });
    } else {
      throw new Error("Unexpected response format");
    }
  } catch (error) {
    console.error("Error generating image:", error.message);
    res.status(500).json({ error: "Failed to generate image." });
  }
});

// Serve Vite Build AFTER defining API routes
app.use(express.static(path.join(__dirname, "../dist")));

// Catch-all route (for React/Vite frontend)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`> Server ready on http://localhost:${PORT}`);
});
