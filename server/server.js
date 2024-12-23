import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Together from "together-ai";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Route for Image Generation
app.post("/api/generateImages", async (req, res) => {
    const { prompt } = req.body;

    const TOGETHER_API_KEY =
        "eb07311cc78163ddb516b1c5fae237340f5b0823a54ce9132dd0f868a5c5a610";

    const client = new Together({
        apiKey: TOGETHER_API_KEY, // Add your Together API key
    });

    try {
        console.log("Request Body:", req.body);

        const response = await client.images.create({
            prompt: prompt || "default prompt",
            model: "black-forest-labs/FLUX.1-schnell", // Specify the model
            width: 1024,
            height: 768,
            seed: 123, // Optional: Specify a seed for reproducibility
            steps: 3,
            response_format: "base64",
        });

        console.log("Together API Response Data:", response.data[0]);
        res.status(200).json(response.data[0]); // Send the base64 JSON response
    } catch (error) {
        console.error("Error generating image:", error.message);
        res.status(500).json({ error: "Failed to generate image." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
