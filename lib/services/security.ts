import { env } from '@/lib/env';

export async function validateTurnstile(token: string): Promise<boolean> {
  // If no secret key is provided, skip validation (for development)
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.warn('CLOUDFLARE_TURNSTILE_SECRET_KEY not set, skipping validation');
    return true;
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Turnstile validation error:', error);
    return false;
  }
}
