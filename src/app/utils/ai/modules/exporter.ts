import { logger } from '@/app/utils/logger';
import { LayoutOutput, LayoutPage, LayoutBlock } from './layout-composer';

export interface ExportInput {
  layout: LayoutOutput;
  format: 'png' | 'jpg' | 'long-image';
  quality?: number;
  scale?: number;
}

export interface ExportOutput {
  format: string;
  pages: ExportedPage[];
  longImageUrl?: string;
  totalSize: number;
}

export interface ExportedPage {
  pageId: string;
  label: string;
  width: number;
  height: number;
  dataUrl: string;
  size: number;
}

export async function exportLayout(input: ExportInput): Promise<ExportOutput> {
  logger.info('[模块7-导出] 开始导出', { format: input.format, totalPages: input.layout.pages.length });

  const { layout, format, quality = 0.92, scale = 2 } = input;
  const pages: ExportedPage[] = [];
  let totalSize = 0;

  for (const page of layout.pages) {
    const dataUrl = renderPageToDataUrl(page, format === 'jpg' ? 'image/jpeg' : 'image/png', quality, scale);
    const size = Math.round(dataUrl.length * 0.75);
    totalSize += size;

    pages.push({
      pageId: page.id,
      label: page.label,
      width: page.width * scale,
      height: page.height * scale,
      dataUrl,
      size,
    });
  }

  let longImageUrl: string | undefined;
  if (format === 'long-image') {
    longImageUrl = renderLongImage(layout, quality, scale);
    totalSize += Math.round(longImageUrl.length * 0.75);
  }

  const output: ExportOutput = {
    format,
    pages,
    longImageUrl,
    totalSize,
  };

  logger.info('[模块7-导出] 导出完成', { pageCount: pages.length, totalSize });
  return output;
}

function renderPageToDataUrl(page: LayoutPage, mimeType: string, quality: number, scale: number): string {
  const canvasWidth = page.width * scale;
  const canvasHeight = page.height * scale;

  const canvas = createCanvasContext(canvasWidth, canvasHeight, scale);

  for (const block of page.blocks) {
    renderBlock(canvas, block, scale);
  }

  return canvas.toDataUrl(mimeType, quality);
}

function renderLongImage(layout: LayoutOutput, quality: number, scale: number): string {
  const totalHeight = layout.pages.reduce((sum, page) => sum + page.height + 20, 0);
  const canvasWidth = layout.canvasWidth * scale;
  const canvasHeight = totalHeight * scale;

  const canvas = createCanvasContext(canvasWidth, canvasHeight, scale);

  let currentY = 0;
  for (const page of layout.pages) {
    for (const block of page.blocks) {
      renderBlock(canvas, { ...block, y: block.y + currentY }, scale);
    }
    currentY += page.height + 20;
  }

  return canvas.toDataUrl('image/png', quality);
}

interface CanvasContext {
  width: number;
  height: number;
  scale: number;
  blocks: Array<{ block: LayoutBlock; scale: number }>;
  toDataUrl(mimeType: string, quality: number): string;
}

function createCanvasContext(width: number, height: number, scale: number): CanvasContext {
  return {
    width,
    height,
    scale,
    blocks: [],
    toDataUrl(mimeType: string, quality: number): string {
      const svgWidth = this.width;
      const svgHeight = this.height;
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">`;
      svg += `<rect width="100%" height="100%" fill="white"/>`;

      for (const { block, scale: s } of this.blocks) {
        const x = block.x * s;
        const y = block.y * s;
        const w = block.width * s;
        const h = block.height * s;

        svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${block.style.backgroundColor}" rx="4"/>`;

        if (block.content.imageUrl) {
          svg += `<image x="${x + block.style.padding * s}" y="${y + block.style.padding * s}" width="${w - block.style.padding * s * 2}" height="${h - block.style.padding * s * 2}" href="${block.content.imageUrl}" preserveAspectRatio="xMidYMid meet"/>`;
        }

        if (block.content.text) {
          const fontSize = block.style.fontSize * s;
          const textX = x + w / 2;
          const textY = y + h / 2;
          svg += `<text x="${textX}" y="${textY}" font-size="${fontSize}" fill="${block.style.textColor}" text-anchor="middle" dominant-baseline="middle" font-weight="${block.style.fontWeight}">${escapeXml(block.content.text)}</text>`;
        }

        if (block.content.subtitle) {
          const fontSize = (block.style.fontSize - 6) * s;
          const textX = x + w / 2;
          const textY = y + h / 2 + block.style.fontSize * s;
          svg += `<text x="${textX}" y="${textY}" font-size="${fontSize}" fill="rgba(255,255,255,0.85)" text-anchor="middle" dominant-baseline="middle">${escapeXml(block.content.subtitle)}</text>`;
        }

        if (block.content.specs) {
          const fontSize = 22 * s;
          const startX = x + block.style.padding * s;
          let specY = y + block.style.padding * s + fontSize;
          for (const spec of block.content.specs) {
            svg += `<text x="${startX}" y="${specY}" font-size="${fontSize}" fill="${block.style.textColor}">${escapeXml(spec.label)}：${escapeXml(spec.value)}</text>`;
            specY += 50 * s;
          }
        }
      }

      svg += `</svg>`;
      const base64 = Buffer.from(svg).toString('base64');
      return `data:image/svg+xml;base64,${base64}`;
    },
  };
}

function renderBlock(canvas: CanvasContext, block: LayoutBlock, scale: number): void {
  canvas.blocks.push({ block, scale });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function getExportConfig(platformId: string): {
  defaultFormat: 'png' | 'jpg' | 'long-image';
  supportedFormats: Array<'png' | 'jpg' | 'long-image'>;
  defaultScale: number;
  maxWidth: number;
} {
  return {
    defaultFormat: 'long-image',
    supportedFormats: ['png', 'jpg', 'long-image'],
    defaultScale: 2,
    maxWidth: platformId === 'DOUYIN' ? 1080 : 750,
  };
}
