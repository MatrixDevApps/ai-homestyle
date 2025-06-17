const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const replicateApiKey = process.env.REPLICATE_API_KEY;
const replicateVersion = "6f1cfd3fdb40ac36c919eab9eebd265f81eebae97a2dd28515ed79018660ebf4"; // RoomGPT

app.post("/api/generate", async (req, res) => {
  const { imageUrl, room, theme } = req.body;

  if (!imageUrl || !room || !theme) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // 1. Start prediction
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
          room_type: room,
          theme: theme,
        },
      }),
    });

    const prediction = await startRes.json();

    if (prediction.error) {
      return res.status(500).json({ error: prediction.error });
    }

    const predictionId = prediction.id;

    // 2. Poll until status is 'succeeded' or 'failed'
    let result = null;
    for (let i = 0; i < 20; i++) {
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
