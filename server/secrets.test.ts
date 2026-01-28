import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("Secrets Validation", () => {
  it("should have SiliconFlow API key configured", () => {
    expect(ENV.siliconflowApiKey).toBeDefined();
    expect(ENV.siliconflowApiKey).toMatch(/^sk-/);
  });

  it("should have SiliconFlow base URL configured", () => {
    expect(ENV.siliconflowBaseUrl).toBeDefined();
    expect(ENV.siliconflowBaseUrl).toContain("api.siliconflow.cn");
  });

  it("should have email configuration", () => {
    expect(ENV.emailUser).toBeDefined();
    expect(ENV.emailUser).toContain("@");
    expect(ENV.emailPass).toBeDefined();
    expect(ENV.emailHost).toBeDefined();
    expect(ENV.emailPort).toBeDefined();
  });

  it("should validate email host is SMTP server", () => {
    expect(ENV.emailHost).toMatch(/smtp\./);
  });
});
