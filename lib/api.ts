const BASE_URL = "https://mizpah-be-eg2w.onrender.com";

export type ScanMode = "active" | "passive";

export type ScanResponse = {
  matched: boolean;
  confidence: number;
  profile: Record<string, unknown> | null;
};

export async function scanFace(base64Image: string, mode: ScanMode) {
  const formData = new URLSearchParams();
  formData.append("image", base64Image);
  formData.append("mode", mode);

  const response = await fetch(`${BASE_URL}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Scan failed: ${errorText}`);
  }

  return response.json() as Promise<ScanResponse>;
}
