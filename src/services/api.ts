import { AnalysisResponse } from "../types";

export const executeCognitiveAnalysis = async (
  inquiry: string,
  evidenceDocs: { id: string; name: string; content: string }[]
): Promise<AnalysisResponse> => {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inquiry,
      evidenceDocs,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody?.error || `Operational server error: ${response.status}`);
  }

  return response.json();
};
