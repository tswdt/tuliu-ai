
import { z } from 'zod';

// 1. Input Schema (Zod)
const GenerateInputSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty.').max(500, 'Prompt is too long.'),
  imageUrl: z.string().url().optional(),
  aspectRatio: z.enum(['1:1', '3:4', '4:3', '16:9']).default('1:1'),
  stylePreset: z.enum(['quiet-luxury', 'minimalist', 'studio']).optional(),
});

type GenerateInput = z.infer<typeof GenerateInputSchema>;

// Hunyuan API for prompt enhancement
async function hunyuanEnhancePrompt(userPrompt: string): Promise<string> {
  const HUNYUAN_API_KEY = process.env.HUNYUAN_API_KEY;
  // Assuming a placeholder URL for Hunyuan API, replace with actual if available
  const HUNYUAN_API_URL = 'https://api.siliconflow.cn/v1/chat/completions'; 

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
      // Fallback to original prompt on API error
      return userPrompt;
    }

    const data = await response.json();
    // Assuming the response structure for chat completions
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

// 2. The "Strategy Layer" Logic
async function enhancePromptForImageGeneration(input: GenerateInput): Promise<string> {
  let finalPrompt = input.prompt;

  // First, apply Hunyuan semantic analysis if available
  finalPrompt = await hunyuanEnhancePrompt(finalPrompt);

  // Then, apply style preset enhancements
  if (input.stylePreset === 'quiet-luxury') {
    finalPrompt = "High-end commercial photography, soft natural lighting, beige and warm grey tones, minimalist composition, 8k resolution, highly detailed texture. " + finalPrompt;
  }

  // Append negative prompts
  const negativePrompt = " low quality, blurry, distorted, watermark, text, messy background.";
  finalPrompt += negativePrompt;

  return finalPrompt;
}

// 3. The "Execution Layer" (SiliconFlow Adapter)
export async function generateImage(input: GenerateInput) {
  // Validate input
  const validatedInput = GenerateInputSchema.parse(input);

  const SILICONFLOW_KEY = process.env.SILICONFLOW_KEY;
  const SILICONFLOW_BASE_URL = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';

  if (!SILICONFLOW_KEY) {
    throw new Error('SILICONFLOW_KEY is not set in environment variables.');
  }

  const finalPrompt = await enhancePromptForImageGeneration(validatedInput);
  console.log('Final Enhanced Prompt:', finalPrompt);

  const requestBody = {
    model: 'black-forest-labs/FLUX.1-schnell',
    prompt: finalPrompt,
    image_url: validatedInput.imageUrl,
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
    // SiliconFlow returns an 'images' array with 'url' fields
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
