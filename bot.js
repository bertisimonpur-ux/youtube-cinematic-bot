import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY
});

const prompt = `
A cinematic Hollywood-style short film scene.

A 10-year-old boy wearing a dark blue jacket walks through a mysterious futuristic city at night after heavy rain. Neon lights reflect on the wet streets. He notices a strange glowing blue light at the end of the street.

The boy stops and looks toward the light with curiosity and fear. Wind moves his hair and jacket. Light fog drifts between tall futuristic buildings.

The camera begins with a wide establishing shot, then slowly pushes toward the boy and smoothly tracks behind him as he walks toward the mysterious light.

Photorealistic cinematic visuals, realistic human movement, dramatic lighting, volumetric fog, realistic rain reflections, cinematic depth of field, 35mm film look, suspenseful atmosphere, high detail, natural motion.

Duration: 15 seconds.
`;

async function generateVideo() {
  console.log("🎬 Creating cinematic video...");

  const result = await fal.subscribe("fal-ai/wan-v3.0/text-to-video", {
    input: {
      prompt: prompt,
      duration: "15"
    },
    logs: true
  });

  console.log("✅ Video created!");
  console.log(result.data);
}

generateVideo().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
