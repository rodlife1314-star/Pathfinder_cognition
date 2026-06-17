import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Cognitive Analysis API
app.post("/api/analyze", async (req, res) => {
  try {
    const { inquiry, evidenceDocs } = req.body;
    if (!inquiry) {
      return res.status(400).json({ error: "Inquiry is required" });
    }

    const prompt = `
You are the active intelligence engine of DELTA, a cognitive acquisition instrument focused on the gap between information and understanding.
The Operator has submitted an inquiry reflecting a key uncertainty/problem space they are navigating, and has loaded files from Google Drive as the Evidence Pool.

Operator Inquiry: "${inquiry}"

Evidence Pool Loaded:
${evidenceDocs && evidenceDocs.length > 0
  ? evidenceDocs.map((doc: any, idx: number) => `--- DOCUMENT ${idx+1}: ${doc.name} ---\n${doc.content}\n`).join("\n")
  : "[NO ACTIVE EVIDENCE LOADED. Note: JEMMA validates findings strictly; if there is no evidence, any paths must be heavily labeled as assumed/unsubstantiated unless they rely on logical deductions, which JEMMA must flag as unsupported by physical documents.]"
}

Your task is to analyze this input and generate a highly structured operational navigation map. Delta records observations, verifies evidence, surfaces contradictions, and tracks the transformation of external information into internalized operator knowledge. Your response must align with the ROLES and LAWS of Delta's framework:
- AETHER holds uncertainty: Define the exact core tension or tension-matrix of this inquiry. What are the conflicting forces?
- HERMES retrieved evidence: Evaluate the loaded evidence pool. Summarize what facts/dimensions are covered vs what gaps remain.
- SIMON reveals available paths: Propose exactly 2 to 3 distinct alternative pathways for the Operator, ranging in posture:
  - 'conservative' (risk-averse, preserving options, evidence-heavy)
  - 'standard' (balanced, responsive)
  - 'aggressive' (risk-embracing, high-assertive, high-velocity)
  For each pathway, provide:
  - id (e.g., path-1)
  - name (short, striking, e.g., "Symmetric Hold", "Asymmetrical Reductions")
  - type (conservative | standard | aggressive)
  - description
  - pros (array of striking outcomes)
  - cons (array of critical risks)
  - governingRule (a philosophical law or standard SOP from operational logic, e.g., "Governance 3.1: No high-velocity deployment without direct redundancy")
  - traceableFindings: For each path, formulate direct factual claims (from JEMMA) of whether this path holds. Mark each claim's status as 'evidenced' or 'assumed'.
    If 'evidenced', you MUST provide the precise source document name and the EXACT physical string quote found in the loaded document.
    If 'assumed', state that it is a logical inference with NO document backing. JEMMA will enforce this.
- JEMMA validates findings: (This is embedded in the 'traceableFindings' status).
- OCTAGON governs interaction: Formulate an audit analysis of how the recommendations respect the Operator's ultimate sovereignty ("Operator Sovereignty is Absolute").

Make sure your findings and quotes are strictly accurate. If no documents are loaded, all findings must be labelled 'assumed'.
    `;

    const analysisSchema = {
      type: Type.OBJECT,
      properties: {
        aether: {
          type: Type.OBJECT,
          properties: {
            tensionTitle: { type: Type.STRING },
            tensionSummary: { type: Type.STRING },
            coreConflictingForces: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["tensionTitle", "tensionSummary", "coreConflictingForces"],
        },
        evidenceAnalysis: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            gapsIdentified: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["summary", "gapsIdentified"],
        },
        pathways: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              description: { type: Type.STRING },
              pros: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              cons: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              governingRule: { type: Type.STRING },
              traceableFindings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    statement: { type: Type.STRING },
                    status: { type: Type.STRING },
                    source: { type: Type.STRING },
                    quote: { type: Type.STRING },
                  },
                  required: ["statement", "status"],
                },
              },
            },
            required: ["id", "name", "type", "description", "pros", "cons", "governingRule", "traceableFindings"],
          },
        },
        octagonAudit: {
          type: Type.OBJECT,
          properties: {
            complianceLevel: { type: Type.STRING },
            guidelinesChecked: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            operatorSovereigntyNotes: { type: Type.STRING },
          },
          required: ["complianceLevel", "guidelinesChecked", "operatorSovereigntyNotes"],
        },
      },
      required: ["aether", "evidenceAnalysis", "pathways", "octagonAudit"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are the primary cognitive module of Delta (a governance-first cognitive acquisition instrument focused on the gap between information and understanding) in an operational, precision decision control deck. Your tone is composed, rigorous, literal, and authoritative.",
      },
    });

    const text = response.text || "{}";
    const parsedData = JSON.parse(text);
    return res.json(parsedData);
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    return res.status(500).json({ error: error.message || "Failed during cognitive analysis" });
  }
});

// Vite server integrations
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
    console.log(`DELTA cognitive server running on http://localhost:${PORT}`);
  });
}

startServer();
