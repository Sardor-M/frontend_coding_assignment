const express = require("express");
const router = express.Router();
const ollamaService = require("../services/ollama");

router.get("/", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  try {
    for await (const chunk of ollamaService.streamResponse(query)) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    res.write("event: done\ndata: Stream complete\n\n");
  } catch (error) {
    res.write(`data: ${JSON.stringify("Error generating response")}\n\n`);
  } finally {
    res.end();
  }

  req.on("close", () => {
    res.end();
  });
});

router.post("/", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  try {
    for await (const chunk of ollamaService.streamResponse(query)) {
      res.write(`data: ${chunk}\n\n`);
    }

    res.write("event: done\ndata: Stream complete\n\n");
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(`data: Error: ${error.message}\n\n`);
  } finally {
    res.end();
  }
});

module.exports = router;
