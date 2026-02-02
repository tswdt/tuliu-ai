"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { ImageComparison } from "@/components/ImageComparison";
import { generateImage } from "@/server/actions/generate";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect fill='%23f5f5f5' width='600' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EProduct Image%3C/text%3E%3C/svg%3E";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a product description");
      return;
    }

    setLoading(true);
    try {
      const result = await generateImage({
        prompt: prompt.trim(),
        stylePreset: "quiet-luxury",
        aspectRatio: "1:1",
      });

      if (result.success && result.url) {
        setGeneratedImageUrl(result.url);
        toast.success("Generation complete! ✨");
      } else {
        toast.error("Failed to generate image");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(
        error instanceof Error ? error.message : "An error occurred during generation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-light tracking-tight">
            Tuliu AI <span className="text-zinc-500">/ Quiet Luxury</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            Transform your product descriptions into stunning visuals
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Control */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              {/* Style Badge */}
              <div className="mb-6 flex items-center gap-2 px-3 py-2 bg-zinc-800/50 rounded-lg w-fit">
                <Lock className="w-4 h-4 text-zinc-500" />
                <span className="text-sm text-zinc-400">Preset: Quiet Luxury</span>
              </div>

              {/* Prompt Input */}
              <div className="space-y-3 mb-6">
                <Label htmlFor="prompt" className="text-zinc-300">
                  Product Description
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe your product... e.g., 'A minimalist ceramic vase with soft matte finish, placed on a light wooden surface'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 resize-none h-32"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold py-2 h-10"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate"
                )}
              </Button>

              {/* Status Info */}
              {loading && (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full bg-zinc-800" />
                  <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                </div>
              )}
            </Card>

            {/* Info Card */}
            <Card className="bg-zinc-900 border-zinc-800 p-4">
              <p className="text-sm text-zinc-400">
                <span className="font-semibold text-zinc-300">Tip:</span> Be descriptive about lighting, materials, and composition for best results.
              </p>
            </Card>
          </div>

          {/* Right Panel - Visual */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h2 className="text-lg font-semibold mb-4 text-zinc-100">
                Before & After
              </h2>

              {generatedImageUrl ? (
                <ImageComparison
                  beforeSrc={PLACEHOLDER_IMAGE}
                  afterSrc={generatedImageUrl}
                  width={500}
                  height={500}
                  className="w-full"
                />
              ) : (
                <div className="w-full bg-zinc-800 rounded-lg aspect-square flex items-center justify-center border border-zinc-700">
                  <div className="text-center">
                    <p className="text-zinc-500 text-sm">
                      {loading ? "Generating your image..." : "Your generated image will appear here"}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
