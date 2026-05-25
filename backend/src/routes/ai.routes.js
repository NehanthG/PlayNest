import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import AICache from "../models/AICache.js"; // ✅ import cache model

dotenv.config();
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "your_gemini_api_key");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// helper to safely parse JSON
function safeJsonParse(text) {
  try {
    const jsonStr = text.match(/{[\s\S]*}/)?.[0];
    return jsonStr ? JSON.parse(jsonStr) : {};
  } catch {
    return {};
  }
}

// ✅ Helper: check cache first
async function getCachedResult(type, title, description) {
  return await AICache.findOne({ type, title, description });
}

// ✅ Helper: store new result
async function saveCache(type, title, description, result) {
  const entry = new AICache({ type, title, description, result });
  await entry.save();
}

// 🧠 Route 1: Suggest Tags & Genres
router.post("/suggest", async (req, res) => {
  const { title, description } = req.body;

  try {
    // 🔍 Check if cached
    const cached = await getCachedResult("suggest", title, description);
    if (cached) {
      console.log("✅ Using cached AI tags & genres");
      return res.json(cached.result);
    }

    // 🧠 Generate new
    const prompt = `
You are a helpful AI that analyzes video game descriptions.
Based on the title and description, suggest 4–7 relevant tags and 1–3 genres.

Respond ONLY in JSON format:
{
  "tags": ["tag1", "tag2", ...],
  "genres": ["genre1", "genre2", ...]
}

Title: ${title}
Description: ${description}
`;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    const data = safeJsonParse(text);

    // 💾 Save to cache
    await saveCache("suggest", title, description, data);

    res.json(data);
  } catch (error) {
    console.error("Error generating tags:", error);
    res.status(500).json({ error: "Failed to generate tags and genres using Gemini" });
  }
});

// ✨ Route 2: Enhance Description
router.post("/enhance", async (req, res) => {
  const { title, description } = req.body;

  try {
    // 🔍 Check if cached
    const cached = await getCachedResult("enhance", title, description);
    if (cached) {
      console.log("✅ Using cached AI enhanced description");
      return res.json(cached.result);
    }

    const prompt = `
You are an expert video game copywriter.
Rewrite the following game description to make it sound more engaging, vivid, and professional,
while keeping it under 120 words.

Return JSON in this format:
{
  "enhancedDescription": "..."
}

Title: ${title}
Original Description: ${description}
`;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    const data = safeJsonParse(text);

    // 💾 Save to cache
    await saveCache("enhance", title, description, data);

    res.json(data);
  } catch (error) {
    console.error("Error enhancing description:", error);
    res.status(500).json({ error: "Failed to enhance description using Gemini" });
  }
});

export default router;
