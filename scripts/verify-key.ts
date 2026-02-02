import 'dotenv/config';

function verify() {
  const key = process.env.SILICONFLOW_KEY;
  console.log("------------------------------------");
  console.log("Key loaded:", key ? "YES" : "NO");
  if (key) {
    console.log("Key prefix:", key.substring(0, 7) + "...");
    console.log("Key length:", key.length);
  }
  console.log("Base URL:", process.env.SILICONFLOW_BASE_URL);
  console.log("------------------------------------");
}

verify();
