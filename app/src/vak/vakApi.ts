const API_BASE = "http://100.87.37.115:8000";

export interface SpeechResult {
  success: boolean;
  filename: string;
  audio_url: string;
  duration_seconds?: number;
  sample_rate?: number;
  voice_id: string;
  voice_name?: string;
}

async function readError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.detail || data.message || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export async function checkVakHealth(): Promise<boolean> {
  const response = await fetch(`${API_BASE}/api/health`);
  if (!response.ok) throw new Error("Samskrita-vāk is unavailable.");
  const data = await response.json();
  return data.status === "online";
}

export async function generateVakSpeech(text: string): Promise<SpeechResult> {
  const response = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voice_id: "male_1"
    })
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const result = await response.json() as SpeechResult;

  if (!result.success || !result.audio_url) {
    throw new Error("The server did not return a valid audio file.");
  }

  return result;
}

export function getVakAudioUrl(audioUrl: string): string {
  return new URL(audioUrl, API_BASE).toString();
}

export function getVakApiBase(): string {
  return API_BASE;
}
