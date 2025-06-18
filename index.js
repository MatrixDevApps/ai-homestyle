const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const replicateApiKey = process.env.REPLICATE_API_KEY;
const replicateVersion = "7f604efcd4f442f61281f6161e49bd5b94836b07fc1bb578d64c7b7f4db8a64a"; // adirik/interior-design

app.post("/api/generate", async (req, res) => {
  const { imageUrl, room, theme } = req.body;

  if (!imageUrl || !room || !theme) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // 1️⃣ Start prediction
    const startRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: replicateVersion,
        input: {
          image: imageUrl,
          prompt: `${theme} ${room} interior design`,
          negative_prompt:
            "lowres, watermark, banner, logo, watermark, contactinfo, text, deformed, blurry, blur, out of focus, out of frame, surreal, extra, ugly, upholstered walls, fabric walls, plush walls, mirror, mirrored, functional, realistic",
          num_inference_steps: 50,
          guidance_scale: 15,
          prompt_strength: 0.8,
        },
      }),
    });

    const prediction = await startRes.json();

    if (prediction.error) {
      return res.status(500).json({ error: prediction.error });
    }

    const predictionId = prediction.id;

    // 2️⃣ Poll until status is 'succeeded' or 'failed'
    let result = null;
    for (let i = 0; i < 30; i++) {
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          Authorization: `Token ${replicateApiKey}`,
        },
      });

      const pollData = await pollRes.json();
      if (pollData.status === "succeeded") {
        result = pollData.output;
        break;
      }
      if (pollData.status === "failed") {
        return res.status(500).json({ error: "Generation failed." });
      }

      await new Promise((r) => setTimeout(r, 2000)); // wait 2 seconds
    }

    if (!result) {
      return res.status(504).json({ error: "Timed out waiting for image." });
    }

    res.json({ output: result });

  } catch (error) {
    console.error("Error generating room:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Express server running on http://localhost:${port}`);
});
