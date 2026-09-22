import { fal } from "@fal-ai/client";
import fs from "fs";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

fal.config({
  credentials: process.env.FAL_KEY
});

const scenes = [
  `A cinematic Hollywood adventure film. A 10-year-old boy wearing a dark blue jacket walks through a mysterious futuristic city at night after heavy rain. Neon lights reflect on wet streets. Tall futuristic buildings surround him. Light fog moves between the buildings. Wide establishing shot, then a slow cinematic camera push toward the boy. Photorealistic, realistic human movement, dramatic lighting, volumetric fog, realistic rain reflections, 35mm film look.`,

  `The same 10-year-old boy in the dark blue jacket continues walking through the futuristic city. He notices a strange glowing blue light coming from a narrow street ahead. He stops and looks toward it with curiosity and fear. The camera slowly moves around him toward a cinematic close-up. Wind moves his hair and jacket. Fog drifts through the street. Photorealistic Hollywood movie, realistic facial expression, dramatic lighting, natural motion, shallow depth of field.`,

  `The same boy cautiously enters the mysterious street. The glowing blue light becomes brighter as he walks toward it. Strange futuristic symbols appear on the walls. Small particles of blue light float through the air around him. The camera follows behind the boy and then moves beside him. Photorealistic cinematic adventure film, detailed futuristic environment, volumetric lighting, atmospheric fog, smooth camera movement, 35mm film look.`,

  `The boy reaches the end of the mysterious street and discovers a massive glowing futuristic portal. The portal slowly opens and blue light spreads across the wet pavement. The boy stands several feet away, amazed and frightened. The camera starts behind the boy and slowly circles around him, revealing the enormous portal. Epic Hollywood cinematic scene, photorealistic visuals, dramatic atmosphere, realistic reflections, smooth natural camera movement.`,

  `The boy takes a few steps toward the enormous glowing portal. A powerful wind suddenly moves through the street. His jacket and hair move naturally. Blue particles swirl around him as the portal becomes brighter. The boy looks directly into the portal with determination. The camera slowly pushes toward the boy and the glowing portal. Photorealistic cinematic adventure movie, epic lighting, realistic physics, volumetric fog, dramatic atmosphere, 35mm film look.`
];

async function generateScene(prompt, index) {
  console.log(`🎬 Generating scene ${index + 1} of ${scenes.length}...`);

  const result = await fal.subscribe(
    "alibaba/wan-3.0/text-to-video",
    {
      input: {
        prompt: prompt,
        resolution: "720p",
        aspect_ratio: "16:9",
        duration: 15,
        audio: true
      },
      logs: true
    }
  );

  const videoUrl = result.data.video.url;

  console.log(`✅ Scene ${index + 1} created`);

  const response = await fetch(videoUrl);

  if (!response.ok) {
    throw new Error(`Could not download scene ${index + 1}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const filename = `scene_${index + 1}.mp4`;

  fs.writeFileSync(filename, buffer);

  console.log(`💾 Saved ${filename}`);

  return filename;
}

async function combineVideos(files) {
  console.log("🎞️ Combining all scenes...");

  const list = files
    .map(file => `file '${file}'`)
    .join("\n");

  fs.writeFileSync("videos.txt", list);

  await execFileAsync("ffmpeg", [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    "videos.txt",
    "-c:v",
    "libx264",
    "-c:a",
    "aac",
    "-movflags",
    "+faststart",
    "final_video.mp4"
  ]);

  console.log("🎬 FINAL VIDEO CREATED!");
  console.log("📁 final_video.mp4");
}

async function main() {
  console.log("🚀 YouTube Cinematic Bot started");
  console.log(`🎥 Creating ${scenes.length} cinematic scenes...`);

  const files = [];

  for (let i = 0; i < scenes.length; i++) {
    const file = await generateScene(scenes[i], i);
    files.push(file);
  }

  await combineVideos(files);

  console.log("🎉 DONE!");
}

main().catch(error => {
  console.error("❌ ERROR:", error);
  process.exit(1);
});
