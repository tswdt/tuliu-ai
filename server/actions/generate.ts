"use server";

import { z } from 'zod';
import FormData from 'form-data';

console.log("Server Action generate.ts loading...");
console.log("process.env.SILICONFLOW_KEY:", process.env.SILICONFLOW_KEY ? "Loaded" : "NOT Loaded");
console.log("process.env.BRIA_API_KEY:", process.env.BRIA_API_KEY ? "Loaded" : "NOT Loaded");
console.log("process.env.HUNYUAN_API_KEY:", process.env.HUNYUAN_API_KEY ? "Loaded" : "NOT Loaded");

// 1. Input Schema (Zod)
const GenerateInputSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty.').max(500, 'Prompt is too long.'),
  base64Image: z.string().optional(), // Base64 image for img2img
  aspectRatio: z.enum(['1:1', '3:4', '4:3', '16:9']).default('1:1'),
});

type GenerateInput = z.infer<typeof GenerateInputSchema>;

// Environment Variables
const SILICONFLOW_KEY = process.env.SILICONFLOW_KEY;
const SILICONFLOW_BASE_URL = process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";
const BRIA_API_KEY = process.env.BRIA_API_KEY;
const HUNYUAN_API_KEY = process.env.HUNYUAN_API_KEY;

// Bria AI Background Removal Function
async function removeBackgroundWithBria(base64Image: string): Promise<string> {
  if (!BRIA_API_KEY) {
    console.warn('BRIA_API_KEY is not set. Skipping Bria background removal.');
    return base64Image; // Fallback to original image if key is missing
  }

  const BRIA_API_URL = 'https://engine.prod.bria-api.com/v1/background/remove';

  const formData = new FormData();
  formData.append('image', base64Image.split(',')[1], { filename: 'image.png', contentType: 'image/png' });

  try {
    const response = await fetch(BRIA_API_URL, {
      method: 'POST',
      headers: {
        'X-API-KEY': BRIA_API_KEY,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Bria API Error: ${response.status} - ${errorText}`);
      // Attempt to parse JSON error if available
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
          throw new Error(`Bria API Error: ${errorJson.message}`);
        }
      } catch (e) {
        // Not a JSON error, throw original text
        throw new Error(`Bria API Error: ${errorText}`);
      }
    }

    const resultBuffer = await response.arrayBuffer();
    const resultBase64 = Buffer.from(resultBuffer).toString('base64');
    return `data:image/png;base64,${resultBase64}`;
  } catch (error) {
    console.error('Error removing background with Bria:', error);
    return base64Image; // Fallback to original image on error
  }
}

// Hunyuan API for prompt enhancement (now integrated into SiliconFlow)
async function hunyuanEnhancePrompt(userPrompt: string): Promise<string> {
  if (!HUNYUAN_API_KEY) {
    console.warn('HUNYUAN_API_KEY is not set. Skipping Hunyuan prompt enhancement.');
    return userPrompt; // Fallback to original prompt
  }

  const HUNYUAN_API_URL = SILICONFLOW_BASE_URL + '/chat/completions'; // Using SiliconFlow as proxy

  try {
    const response = await fetch(HUNYUAN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HUNYUAN_API_KEY}`, // Assuming Hunyuan uses Bearer token
      },
      body: JSON.stringify({
        model: "tencent/Hunyuan-A13B-Instruct", // Specify Hunyuan model
        messages: [
          { role: "system", content: "You are an expert in product photography and marketing. Enhance the user's prompt to create a highly detailed and professional image generation prompt for a product shot. Focus on lighting, composition, texture, and overall aesthetic. Respond only with the enhanced prompt, no conversational text." },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Hunyuan API Error:', errorData);
      // Log the full response for debugging
      console.error('Hunyuan API Full Response:', await response.text());
      return userPrompt; // Fallback to original prompt on error
    }

    const data = await response.json();
    const enhancedPrompt = data.choices?.[0]?.message?.content;
    return enhancedPrompt || userPrompt;
  } catch (error) {
    console.error('Error enhancing prompt with Hunyuan:', error);
    return userPrompt; // Fallback to original prompt on error
  }
}

export async function generateImage(input: GenerateInput) {
  // Validate input
  const validatedInput = GenerateInputSchema.parse(input);

  if (!SILICONFLOW_KEY) {
    throw new Error('SILICONFLOW_KEY is not set in environment variables.');
  }

  let imageForFlux: string | undefined = validatedInput.base64Image;

  // Step A: Background Removal (Bria)
  if (imageForFlux && BRIA_API_KEY) {
    console.log("Attempting Bria background removal...");
    imageForFlux = await removeBackgroundWithBria(imageForFlux);
    console.log("Bria background removal complete.");
  }

  // Step B: Prompt Enhancement (Hunyuan)
  let finalPrompt = validatedInput.prompt;
  if (HUNYUAN_API_KEY) {
    console.log("Attempting Hunyuan prompt enhancement...");
    finalPrompt = await hunyuanEnhancePrompt(validatedInput.prompt);
    console.log("Hunyuan prompt enhancement complete.");
  }

  // Strategy Layer Logic: Enhance the prompt based on stylePreset
  let enhancedPrompt = finalPrompt;
  // For 'quiet-luxury', prepend specific photography instructions
  enhancedPrompt = `High-end commercial photography, soft natural lighting, beige and warm grey tones, minimalist composition, 8k resolution, highly detailed texture. ${enhancedPrompt}`;

  // Append negative prompts
  const negativePrompt = "low quality, blurry, distorted, watermark, text, messy background.";

  // Execution Layer (SiliconFlow Adapter)
  const payload: any = {
    model: "black-forest-labs/FLUX.1-schnell", // Use the more stable Schnell model
    prompt: enhancedPrompt,
    negative_prompt: negativePrompt,
    aspect_ratio: validatedInput.aspectRatio,
    // Other parameters for img2img
    image: imageForFlux, // Input image for img2img
    strength: 0.8, // How much to respect the original image (0.0 to 1.0)
    guidance_scale: 7.5,
    seed: -1,
    num_inference_steps: 25,
  };

  console.log("Sending payload to SiliconFlow:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(SILICONFLOW_BASE_URL + '/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SILICONFLOW_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('SiliconFlow API Error:', errorData);
      // Log the full response for debugging
      console.error('SiliconFlow API Full Response:', await response.text());
      throw new Error(errorData.message || 'SiliconFlow API request failed');
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('Failed to get image URL from SiliconFlow response.');
    }

    return { success: true, url: imageUrl };
  } catch (error) {
    console.error('Error generating image with SiliconFlow:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
