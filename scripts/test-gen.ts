
import { generateImage } from '../server/actions/generate';

async function test() {
  console.log('Testing Image Generation...');
  try {
    const result = await generateImage({
      prompt: 'A sleek modern chair in a bright studio',
      aspectRatio: '1:1',
      stylePreset: 'quiet-luxury',
    });
    console.log('Generation Result:', result);
  } catch (error) {
    console.error('Test Failed:', error);
  }
}

test();
