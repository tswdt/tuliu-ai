
import { z } from 'zod';
import FormData from 'form-data';

// 1. Input Schema (Zod)
const GenerateInputSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty.').max(500, 'Prompt is too long.'),
  base64Image: z.string().optional(), // Base64 image for img2img
  aspectRatio: z.enum(['1:1', '3:4', '4:3', '16:9']).default('1:1'),
  // stylePreset is now handled by prompt enhancement directly
});

type GenerateInput = z.infer<typeof GenerateInputSchema>;

// Bria AI Background Removal Function
async function removeBackgroundWithBria(base64Image: string): Promise<string> {
  const BRIA_API_KEY = process.env.BRIA_API_KEY;
  const BRIA_API_URL = 'https://engine.prod.bria-api.com/v1/background/remove';

  if (!BRIA_API_KEY) {
    console.warn('BRIA_API_KEY is not set. Skipping Bria background removal.');
    return base64Image; // Fallback to original if key is missing
  }

  try {
    const formData = new FormData();
    // Bria expects a file, so we need to convert base64 to a Buffer and append as a file
    const imageBuffer = Buffer.from(base64Image.split(',')[1], 'base64');
    formData.append('image', imageBuffer, { filename: 'input.png', contentType: 'image/png' });

    const response = await fetch(BRIA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BRIA_API_KEY}`,
        ...formData.getHeaders(), // Important for multipart/form-data
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Bria API Error:', response.status, errorData);
      return base64Image; // Fallback to original on API error
    }

    const data = await response.json();
    if (data && data.image_url) {
      console.log('Bria background removal successful, URL:', data.image_url);
      return data.image_url; // URL of the transparent PNG
    } else {
      console.warn('Bria API did not return an image_url. Using original image.');
      return base64Image;
    }
  } catch (error) {
    console.error('Error during Bria background removal:', error);
    return base64Image; // Fallback on network or other errors
  }
}

// Hunyuan API for prompt enhancement (now integrated into SiliconFlow)
async function hunyuanEnhancePrompt(userPrompt: string): Promise<string> {
  const HUNYUAN_API_KEY = process.env.HUNYUAN_API_KEY;
  const HUNYUAN_API_URL = process.env.SILICONFLOW_BASE_URL + '/chat/completions'; 

  if (!HUNYUAN_API_KEY) {
    console.warn('HUNYUAN_API_KEY is not set. Skipping Hunyuan prompt enhancement.');
    return userPrompt; // Return original prompt if API key is missing
  }

  try {
    const response = await fetch(HUNYUAN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HUNYUAN_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'tencent/Hunyuan-A13B-Instruct', 
        messages: [
          { role: 'system', content: 'You are an AI assistant that refines user prompts for image generation. Enhance the given prompt to be more descriptive and suitable for high-quality image synthesis, focusing on visual details, lighting, and composition. Do not add negative prompts.' },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Hunyuan API Error:', response.status, errorData);
      return userPrompt; // Fallback to original prompt on API error
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
      return data.choices[0].message.content.trim();
    } else {
      console.warn('Hunyuan API did not return a valid enhanced prompt. Using original prompt.');
      return userPrompt;
    }
  } catch (error) {
    console.error('Error during Hunyuan prompt enhancement:', error);
    return userPrompt; // Fallback on network or other errors
  }
}

// The "Strategy Layer" Logic
async function enhancePromptForImageGeneration(input: GenerateInput): Promise<string> {
  let finalPrompt = input.prompt;

  // First, apply Hunyuan semantic analysis if available
  finalPrompt = await hunyuanEnhancePrompt(finalPrompt);

  // Append English suffix for Flux
  finalPrompt += ", (quiet luxury style), product photography, soft lighting, 8k";

  // Append negative prompts
  const negativePrompt = " low quality, blurry, distorted, watermark, text, messy background.";
  finalPrompt += negativePrompt;

  return finalPrompt;
}

// The "Execution Layer" (SiliconFlow Adapter)
export async function generateImage(input: GenerateInput) {
  // Validate input
  const validatedInput = GenerateInputSchema.parse(input);

  const SILICONFLOW_KEY = process.env.SILICONFLOW_KEY;
  const SILICONFLOW_BASE_URL = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';

  if (!SILICONFLOW_KEY) {
    throw new Error('SILICONFLOW_KEY is not set in environment variables.');
  }

  let imageForFlux: string | undefined = validatedInput.base64Image;

  // Step A: Background Removal (Bria)
  if (validatedInput.base64Image) {
    imageForFlux = await removeBackgroundWithBria(validatedInput.base64Image);
  }

  // Step B: Scene Generation (Flux)
  const finalPrompt = await enhancePromptForImageGeneration(validatedInput);
  console.log('Final Enhanced Prompt for Flux:', finalPrompt);

  const requestBody = {
    model: 'black-forest-labs/FLUX.1-schnell',
    prompt: finalPrompt,
    image_url: imageForFlux, // Use Bria result or original base64 for img2img
    aspect_ratio: validatedInput.aspectRatio,
    // Add other parameters as needed by SiliconFlow API
  };

  try {
    const response = await fetch(`${SILICONFLOW_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SILICONFLOW_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('SiliconFlow API Error:', errorData);
      throw new Error(`Image generation failed: ${response.statusText} - ${errorData.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    if (data && data.images && data.images.length > 0 && data.images[0].url) {
      return { success: true, url: data.images[0].url };
    } else {
      console.error('SiliconFlow API did not return a valid image URL:', data);
      throw new Error('Image generation successful, but no URL returned.');
    }
  } catch (error) {
    console.error('Error during image generation:', error);
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : String(error)}`);
  }
}
