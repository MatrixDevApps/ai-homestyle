const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/api/generate", async (req, res) => {
  const { imageUrl, room, theme } = req.body;

  if (!imageUrl || !room || !theme) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "6f1cfd3fdb40ac36c919eab9eebd265f81eebae97a2dd28515ed79018660ebf4", // RoomGPT model
        input: {
          image: imageUrl,
          room_type: room,
          theme: theme,
        },
      }),
    });

    const result = await response.json();

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ output: result.urls?.get || "pending", id: result.id });
  } catch (error) {
    console.error("Error generating room:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
