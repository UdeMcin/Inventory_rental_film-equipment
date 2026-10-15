import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '25mb' }));

// Shared Gemini SDK client instance
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// AI Equipment & Damage Photo Recognition route
app.post('/api/ai/recognize-equipment', async (req, res) => {
  try {
    const { imageBase64, catalogItems } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 parameter is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: `You are an expert film studio and university cinema equipment depot technician with deep knowledge of cinema cameras (ARRI, RED, Sony, Canon, Blackmagic), cine prime/zoom lenses (Cooke, Zeiss, Angenieux, Canon), lighting (Aputure, Astera, ARRI, Nanlite), audio recorders & mics (Sound Devices, Sennheiser, Rycote), monitoring (SmallHD, Teradek, Atomos), and grip (DJI, Easyrig, Sachtler).

Analyze this image and identify the equipment. Also evaluate physical condition and any visible defects, dust, scratches, or wear.
Here is the depot equipment catalog to match against:
${JSON.stringify((catalogItems || []).map((c: any) => ({ id: c.id, name: c.name, brand: c.brand, category: c.category, barcode: c.barcode, location: c.location })))}

Respond ONLY with valid JSON strictly matching this schema:
{
  "identifiedEquipmentName": string,
  "confidenceScore": number (between 0.0 and 1.0),
  "matchedCatalogId": string or null (exact matching catalog id if found, e.g. "EQ-ARRI-35-01"),
  "detectedCategory": "camera" | "lens" | "lighting" | "audio" | "monitoring" | "grip" | "accessory" | "unknown",
  "conditionAssessment": "pristine" | "good" | "fair" | "damaged",
  "visibleDefects": string[],
  "opticalCleanlinessNotes": string,
  "accessoriesDetected": string[],
  "summaryNotes": string,
  "recommendedAction": "checkout" | "return_checkin" | "file_maintenance" | "clean_optics"
}`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini photo recognition error:', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze equipment photo' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
