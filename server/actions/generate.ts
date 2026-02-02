
import { z } from 'zod';

// 1. Input Schema (Zod)
const GenerateInputSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty.').max(500, 'Prompt is too long.'),
  imageUrl: z.string().url().optional(),
  aspectRatio: z.enum(['1:1', '3:4', '4:3', '16:9']).default('1:1'),
  stylePreset: z.enum(['quiet-luxury', 'minimalist', 'studio']).optional(),
});

type GenerateInput = z.infer<typeof GenerateInputSchema>;

// 2. The "Strategy Layer" Logic
function enhancePrompt(input: GenerateInput): string {
  let enhancedPrompt = input.prompt;

  if (input.stylePreset === 'quiet-luxury') {
    enhancedPrompt = "High-end commercial photography, soft natural lighting, beige and warm grey tones, minimalist composition, 8k resolution, highly detailed texture. " + enhancedPrompt;
  }

  // Append negative prompts
  const negativePrompt = " low quality, blurry, distorted, watermark, text, messy background.";
  enhancedPrompt += negativePrompt;

  return enhancedPrompt;
}

// 3. The "Execution Layer" (SiliconFlow Adapter)
export async function generateImage(input: GenerateInput) {
  // Validate input
  const validatedInput = GenerateInputSchema.parse(input);

  const SILICONFLOW_KEY = process.env.SILICONFLOW_KEY;
  if (!SILICONFLOW_KEY) {
    throw new Error('SILICONFLOW_KEY is not set in environment variables.');
  }

  const enhancedPrompt = enhancePrompt(validatedInput);

  const requestBody = {
    model: 'flux-pro/v1',
    prompt: enhancedPrompt,
    image_url: validatedInput.imageUrl,
    aspect_ratio: validatedInput.aspectRatio,
    // Add other parameters as needed by SiliconFlow API
  };

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
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
    // Assuming the API returns a 'url' field for the generated image
    if (data && data.url) {
      return { success: true, url: data.url };
    } else {
      console.error('SiliconFlow API did not return a URL:', data);
      throw new Error('Image generation successful, but no URL returned.');
    }
  } catch (error) {
    console.error('Error during image generation:', error);
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : String(error)}`);
  }
}
