/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up standard and larger body limits for image uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please add your key in the Settings > Secrets panel.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// --- API ENDPOINTS ---

// Health check
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({ status: "ok", geminiKeyAvailable: hasKey });
});

// Crop Health Analysis Endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const { image, model, temperature, topP, maxOutputTokens } = req.body; // Can be a base64-encoded string or standard dataUrl

    if (!image) {
      return res.status(400).json({ error: "Please upload or select an image of your crop leaf." });
    }

    // Extract exact base64 data and mimeType from dataURL
    let mimeType = "image/jpeg";
    let base64Data = image;

    if (image.startsWith("data:")) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    const ai = getGeminiClient();

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    // --- AGENT 1: THE GATEKEEPER / ROUTER PROMPT ---
    const gatekeeperPromptText = `
    You are Agent 1 (The Gatekeeper & Router) of the AgriShield expert agricultural AI diagnostic system.
    Evaluate the provided image carefully. Your sole task is to determine whether this image is an agricultural crop, leaf, stem, fruit, vegetable, plant, or field specimen.
    
    If the image is completely blank, a dog, a cat, an animal, a human, a selfie, or random household/non-agricultural items (such as mugs, pens, keyboards, vehicles, consumer electronics), set isPlantOrCropLeaf to false.
    If the image indeed presents a plant, crop leaf, crop stem, infected foliage, or agricultural specimen that can be diagnosed, set isPlantOrCropLeaf to true.
    
    Respond in strict JSON format matching this schema:
    {
      "isPlantOrCropLeaf": boolean,
      "confidenceScore": number,
      "reason": "Clear professional explanation in English about your classification decision",
      "reasonTe": "ఆంధ్రా రైతులకు సులభంగా అర్థమయ్యే తెలుగు వివరణ (Telugu translation of the reason decision)"
    }
    `;

    const gatekeeperResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, { text: gatekeeperPromptText }] },
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isPlantOrCropLeaf: { type: Type.BOOLEAN },
            confidenceScore: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            reasonTe: { type: Type.STRING }
          },
          required: ["isPlantOrCropLeaf", "confidenceScore", "reason", "reasonTe"]
        }
      }
    });

    const gatekeeperText = gatekeeperResponse.text;
    if (!gatekeeperText) {
      throw new Error("Gatekeeper verification returned an empty response.");
    }

    const gateResult = JSON.parse(gatekeeperText.trim());

    // If the image fails the gatekeeper classification:
    if (!gateResult.isPlantOrCropLeaf) {
      return res.json({
        gatekeeperRejected: true,
        reason: gateResult.reason || "Identification Refused: Image does not contain a recognizable agricultural plant or crop leaf. Please capture a clear image of a crop leaf.",
        reasonTe: gateResult.reasonTe || "గుర్తింపు నిరాకరించబడింది: ఈ చిత్రం పంట ఆకు లేదా వ్యవసాయ నమూనాను కలిగి లేదు. దయచేసి స్పష్టమైన పంట ఆకు ఫోటో తీయండి.",
        confidenceScore: gateResult.confidenceScore || 0.95
      });
    }

    // --- AGENT 2: THE EXPERT PATHOLOGIST PROMPT ---
    const promptText = `
    You are Agent 2 (The Expert plant pathologist and agricultural AI assistant) operating in Guntur Agricultural Research Lab.
    Analyze this crop leaf image carefully. Provide a detailed diagnostic report strictly in JSON format matching the schema given.
    Ensure any plant diseases, nutrient deficiencies, or pests details are precise, high quality, and professional.
    Keep the English instructions clear, and translate a friendly, highly practical Telugu summary designed for rural local farmers (using agricultural terminology in Telugu).
    Provide realistic simulated outbreak location coordinates (within the agricultural zones around Guntur / Andhra Pradesh, India) for plotting on our regional containment map.

    Additionally, provide weather conditions telemetry and treatment cost estimations representation:
    - Simulate realistic local weather conditions representing Guntur's crop environment (temperature 24-38°C, humidity 40-95%, wind speed 2-25 km/h, rain probability 0-105%).
    - Formulate spraySafetyIndex: Evaluated as:
      * "Safe — Low wind & mild humidity conditions" (if windSpeed < 12 and rainProbability < 30)
      * "Caution — Moderate Wind Drift Hazard" (if windSpeed is between 12 and 18)
      * "Unsafe — Heavy Rain Imminent & Drifting Wind" (if rainProbability >= 30 or windSpeed > 18)
    - Formulate treatmentCosts:
      * organicPerAcre (number representing organic treatment cost in INR per acre, e.g., 300-900)
      * organicBreakdown (list of 2-3 specific itemized costs, e.g., ["Yellow sticky traps - ₹200", "Neem Seed Kernel spray - ₹250"])
      * chemicalPerAcre (number representing systemic chemical protection cost in INR per acre, e.g., 800-1800)
      * chemicalBreakdown (list of 2-3 specific itemized costs, e.g., ["Systemic Tricyclazole pack - ₹650", "Labor charge: ₹400"])
    `;

    // Apply client-specified parameters or standard defaults
    let activeModel = model || "gemini-3.5-flash";
    if (activeModel === "gemini-2.5-flash" || activeModel === "gemini-1.5-flash") {
      activeModel = "gemini-3.5-flash";
    }
    const activeTemp = typeof temperature === 'number' ? temperature : 0.2;
    const activeTopP = typeof topP === 'number' ? topP : 0.95;
    const activeMaxTokens = typeof maxOutputTokens === 'number' ? maxOutputTokens : 2000;

    const response = await ai.models.generateContent({
      model: activeModel,
      contents: { parts: [imagePart, { text: promptText }] },
      config: {
        temperature: activeTemp,
        topP: activeTopP,
        maxOutputTokens: activeMaxTokens,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cropName: {
              type: Type.STRING,
              description: "The common name of structural crop identified (e.g., Rice, Tomato, Cotton, Mango, Groundnut)."
            },
            diseaseName: {
              type: Type.STRING,
              description: "The identified disease or pest scientific & common name. If healthy, state 'Healthy Plant'."
            },
            severity: {
              type: Type.STRING,
              description: "The severity level: 'Low' (minor symptoms, alert only), 'Medium' (active spreads), or 'High' (severe leaf damage, immediate actions required)."
            },
            technicalExplanation: {
              type: Type.STRING,
              description: "The scientific summary of structural pathogen behavior and reason behind leaf signs."
            },
            treatmentOrganic: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 3-4 chemical-free, organic, and cultural recommendations."
            },
            treatmentChemical: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 2-3 specific chemical crop protection sprays with standard dilution ratio guidelines."
            },
            summaryEnglish: {
              type: Type.STRING,
              description: "A brief, comforting, easy-to-read explanation of the immediate action plan in English."
            },
            summaryTelugu: {
              type: Type.STRING,
              description: "భారతీయ రైతుల కోసం వివరణాత్మకంగా ఉపయోగపడే తెలుగు సారాంశం (A direct conversational, supportive, easy summary in Telugu to help farmers)."
            },
            detectedRegion: {
              type: Type.STRING,
              description: "Simulated region name in Guntur or surrounding AP agricultural zones (e.g., Tenali Farm Lab, Chebrolu Sector, Bapatla Fields, Regional Research Hub, Narasaraopet Zone)."
            },
            gpsLatitude: {
              type: Type.NUMBER,
              description: "Simulated latitude within Guntur/Vijayawada crop belt (e.g. between 15.90 and 16.50)."
            },
            gpsLongitude: {
              type: Type.NUMBER,
              description: "Simulated longitude within Guntur/Vijayawada crop belt (e.g. between 80.10 and 80.70)."
            },
            weatherTelemetry: {
              type: Type.OBJECT,
              description: "Simulated weather conditions around regional zones at current timestamp.",
              properties: {
                temperature: { type: Type.NUMBER, description: "Simulated localized temperature in degrees Celsius (e.g. 24.5 to 38.0)." },
                humidity: { type: Type.NUMBER, description: "Simulated humidity level in percentage (e.g. 40 to 95)." },
                windSpeed: { type: Type.NUMBER, description: "Simulated wind speed in km/h (e.g. 2.5 to 25.0)." },
                rainProbability: { type: Type.NUMBER, description: "Simulated probability of rain in percentage (e.g. 0 to 100)." }
              },
              required: ["temperature", "humidity", "windSpeed", "rainProbability"]
            },
            spraySafetyIndex: {
              type: Type.STRING,
              description: "Dynamic evaluation: Safe, Caution, or Unsafe spraying advisory indicator"
            },
            treatmentCosts: {
              type: Type.OBJECT,
              description: "Interactive treatment cost structures modeled on INR per acre estimations.",
              properties: {
                organicPerAcre: { type: Type.NUMBER, description: "Estimated cost in INR per acre of organic and cultural treatment steps." },
                organicBreakdown: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Itemized organic expenses listing details and costs in INR." },
                chemicalPerAcre: { type: Type.NUMBER, description: "Estimated cost in INR per acre of chemical systemic sprays." },
                chemicalBreakdown: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Itemized chemical expenses details with prices in INR." }
              },
              required: ["organicPerAcre", "organicBreakdown", "chemicalPerAcre", "chemicalBreakdown"]
            }
          },
          required: [
            "cropName",
            "diseaseName",
            "severity",
            "technicalExplanation",
            "treatmentOrganic",
            "treatmentChemical",
            "summaryEnglish",
            "summaryTelugu",
            "detectedRegion",
            "gpsLatitude",
            "gpsLongitude",
            "weatherTelemetry",
            "spraySafetyIndex",
            "treatmentCosts"
          ]
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("No response received from the plant pathologist model.");
    }

    const parsedReport = JSON.parse(outputText.trim());
    return res.json(parsedReport);

  } catch (error: any) {
    console.error("Analysis Error:", error);
    // Return friendly advice if missing API key vs general error
    const isApiKeyError = error?.message?.includes("GEMINI_API_KEY") || error?.status === 403;
    res.status(500).json({
      error: isApiKeyError
        ? "Gemini API Key is missing or invalid. Please check your credentials in the Settings > Secrets tab."
        : error?.message || "An unexpected error occurred while analyzing the crop image."
    });
  }
});

// Text-to-Speech Endpoint for Telugu & English voice readouts
app.post("/api/tts", async (req, res) => {
  try {
    const { text, language } = req.body; // text: string, language: 'te' | 'en'

    if (!text) {
      return res.status(400).json({ error: "Text content is required for speech synthesis." });
    }

    const ai = getGeminiClient();

    // Use Kore for Telugu (softer/warmer local feel) and Zephyr for English
    const voiceName = language === "te" ? "Kore" : "Zephyr";
    const languageLabel = language === "te" ? "Telugu" : "English";

    const promptText = `
    Speak the following ${languageLabel} translation text completely in a warm, caring, friendly, and easy-to-understand reading voice:
    "${text}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("Could not construct the audio stream from text.");
    }

    res.json({ audio: base64Audio });

  } catch (error: any) {
    console.error("speech generation error:", error);
    res.status(500).json({ error: error?.message || "Could not generate speech output." });
  }
});


// Serve Front-end App via Vite/Static Build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AgriShield Server] running at http://localhost:${PORT}`);
  });
}

startServer();
