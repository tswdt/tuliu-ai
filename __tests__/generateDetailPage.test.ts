import { describe, it, expect, beforeEach } from "@jest/globals";
import { 
  generateDetailPageSchema,
  ProductCategory,
  GenerationStyle,
  Resolution,
  Platform,
} from "@/types/generate";
import {
  validateImageFormat,
  validateImageSize,
  buildCopyGenerationPrompt,
  buildImageGenerationPrompt,
  calculateOverallProgress,
  PLATFORM_DIMENSIONS,
  IMAGE_GENERATION_PLAN,
  TOTAL_IMAGES_TO_GENERATE,
} from "@/lib/generateUtils";
import { WorkflowStage, ImageType } from "@/types/generate";

describe("AI详情页生成模块测试", () => {
  // ==================== 参数校验测试 ====================
  describe("参数校验", () => {
    it("应该通过有效的参数校验", () => {
      const validParams = {
        productName: "测试商品",
        category: ProductCategory.CLOTHING,
        coreSellingPoints: ["高品质", "时尚设计"],
        platform: Platform.TAOBAO,
        style: GenerationStyle.SIMPLE,
        resolution: Resolution.FOUR_K,
      };

      const result = generateDetailPageSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it("应该拒绝缺少商品名称的参数", () => {
      const invalidParams = {
        category: ProductCategory.CLOTHING,
        coreSellingPoints: ["高品质"],
        platform: Platform.TAOBAO,
        style: GenerationStyle.SIMPLE,
        resolution: Resolution.FOUR_K,
      };

      const result = generateDetailPageSchema.safeParse(invalidParams as any);
      expect(result.success).toBe(false);
    });

    it("应该拒绝空的核心卖点", () => {
      const invalidParams = {
        productName: "测试商品",
        category: ProductCategory.CLOTHING,
        coreSellingPoints: [],
        platform: Platform.TAOBAO,
        style: GenerationStyle.SIMPLE,
        resolution: Resolution.FOUR_K,
      };

      const result = generateDetailPageSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });
  });

  // ==================== 图片格式验证测试 ====================
  describe("图片格式验证", () => {
    it("应该接受JPG格式", () => {
      expect(validateImageFormat("product.jpg")).toBe(true);
      expect(validateImageFormat("product.jpeg")).toBe(true);
    });

    it("应该接受PNG格式", () => {
      expect(validateImageFormat("product.png")).toBe(true);
    });

    it("应该接受WebP格式", () => {
      expect(validateImageFormat("product.webp")).toBe(true);
    });

    it("应该拒绝不支持的格式", () => {
      expect(validateImageFormat("product.gif")).toBe(false);
      expect(validateImageFormat("product.bmp")).toBe(false);
      expect(validateImageFormat("product.pdf")).toBe(false);
    });

    it("应该忽略大小写", () => {
      expect(validateImageFormat("PRODUCT.JPG")).toBe(true);
      expect(validateImageFormat("product.PNG")).toBe(true);
    });
  });

  // ==================== 图片大小验证测试 ====================
  describe("图片大小验证", () => {
    const TEN_MB = 10 * 1024 * 1024;

    it("应该接受小于10MB的图片", () => {
      expect(validateImageSize(1024)).toBe(true); // 1KB
      expect(validateImageSize(5 * 1024 * 1024)).toBe(true); // 5MB
      expect(validateImageSize(TEN_MB)).toBe(true); // 正好10MB
    });

    it("应该拒绝大于10MB的图片", () => {
      expect(validateImageSize(TEN_MB + 1)).toBe(false);
      expect(validateImageSize(15 * 1024 * 1024)).toBe(false);
    });

    it("应该支持自定义大小限制", () => {
      const FIVE_MB = 5 * 1024 * 1024;
      expect(validateImageSize(6 * 1024 * 1024, FIVE_MB)).toBe(false);
    });
  });

  // ==================== 平台尺寸配置测试 ====================
  describe("平台尺寸配置", () => {
    it("应该有所有平台的尺寸配置", () => {
      expect(PLATFORM_DIMENSIONS[Platform.TAOBAO]).toBeDefined();
      expect(PLATFORM_DIMENSIONS[Platform.TMALL]).toBeDefined();
      expect(PLATFORM_DIMENSIONS[Platform.JD]).toBeDefined();
      expect(PLATFORM_DIMENSIONS[Platform.DOUYIN]).toBeDefined();
      expect(PLATFORM_DIMENSIONS[Platform.XIAOHONGSHU]).toBeDefined();
      expect(PLATFORM_DIMENSIONS[Platform.AMAZON]).toBeDefined();
    });

    it("淘宝/天猫应该是800x800", () => {
      expect(PLATFORM_DIMENSIONS[Platform.TAOBAO].width).toBe(800);
      expect(PLATFORM_DIMENSIONS[Platform.TAOBAO].height).toBe(800);
      expect(PLATFORM_DIMENSIONS[Platform.TMALL].width).toBe(800);
      expect(PLATFORM_DIMENSIONS[Platform.TMALL].height).toBe(800);
    });

    it("抖音应该是1080x1920", () => {
      expect(PLATFORM_DIMENSIONS[Platform.DOUYIN].width).toBe(1080);
      expect(PLATFORM_DIMENSIONS[Platform.DOUYIN].height).toBe(1920);
    });
  });

  // ==================== 图片生成计划测试 ====================
  describe("图片生成计划", () => {
    it("应该包含正确的图片类型和数量", () => {
      expect(IMAGE_GENERATION_PLAN).toHaveLength(4);
      
      const mainImagePlan = IMAGE_GENERATION_PLAN.find(p => p.type === ImageType.MAIN_IMAGE);
      expect(mainImagePlan?.count).toBe(1);
      
      const sceneImagePlan = IMAGE_GENERATION_PLAN.find(p => p.type === ImageType.SCENE_IMAGE);
      expect(sceneImagePlan?.count).toBe(3);
      
      const detailImagePlan = IMAGE_GENERATION_PLAN.find(p => p.type === ImageType.DETAIL_IMAGE);
      expect(detailImagePlan?.count).toBe(2);
      
      const sellingPointPlan = IMAGE_GENERATION_PLAN.find(p => p.type === ImageType.SELLING_POINT_IMAGE);
      expect(sellingPointPlan?.count).toBe(3);
    });

    it("总图片数量应该正确", () => {
      expect(TOTAL_IMAGES_TO_GENERATE).toBe(1 + 3 + 2 + 3);
      expect(TOTAL_IMAGES_TO_GENERATE).toBe(9);
    });
  });

  // ==================== 进度计算测试 ====================
  describe("进度计算", () => {
    it("预处理阶段应该返回合理的进度", () => {
      const progress = calculateOverallProgress(WorkflowStage.PREPROCESSING);
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(20);
    });

    it("文案生成阶段应该返回合理的进度", () => {
      const progress = calculateOverallProgress(WorkflowStage.COPY_GENERATION);
      expect(progress).toBeGreaterThan(15);
      expect(progress).toBeLessThan(40);
    });

    it("完成阶段应该返回100%", () => {
      const progress = calculateOverallProgress(WorkflowStage.COMPLETED);
      expect(progress).toBe(100);
    });

    it("图片生成阶段应该根据图片进度计算", () => {
      const progress = calculateOverallProgress(WorkflowStage.IMAGE_GENERATION, {
        current: 4,
        total: 9,
      });
      expect(progress).toBeGreaterThan(30);
      expect(progress).toBeLessThan(80);
    });
  });

  // ==================== 提示词生成测试 ====================
  describe("提示词生成", () => {
    const mockProductFeatures = {
      productSubject: "测试商品",
      material: "纯棉",
      color: "蓝色",
      size: "M",
      style: "时尚",
      defectPositions: [],
    };

    it("应该生成有效的文案提示词", () => {
      const prompt = buildCopyGenerationPrompt(
        ProductCategory.CLOTHING,
        Platform.TAOBAO,
        "测试连衣裙",
        ["高品质", "时尚设计"],
        mockProductFeatures
      );

      expect(prompt).toContain("测试连衣裙");
      expect(prompt).toContain("服饰");
      expect(prompt).toContain("淘宝");
      expect(prompt).toContain("高品质");
    });

    it("应该生成有效的图片提示词", () => {
      const prompt = buildImageGenerationPrompt(
        ProductCategory.CLOTHING,
        "测试连衣裙",
        GenerationStyle.SIMPLE,
        "纯棉",
        "蓝色",
        ["高品质", "时尚设计"],
        Platform.TAOBAO,
        ImageType.MAIN_IMAGE
      );

      expect(prompt).toContain("测试连衣裙");
      expect(prompt).toContain("简约");
      expect(prompt).toContain("纯棉");
      expect(prompt).toContain("蓝色");
      expect(prompt).toContain("白色背景");
    });
  });

  // ==================== 集成测试 ====================
  describe("集成测试", () => {
    it("完整的参数校验流程应该正常工作", () => {
      const params = {
        productName: "测试商品",
        category: ProductCategory.ELECTRONICS,
        coreSellingPoints: ["高性能", "便携"],
        platform: Platform.JD,
        style: GenerationStyle.TECH,
        resolution: Resolution.FOUR_K,
      };

      const validationResult = generateDetailPageSchema.safeParse(params);
      expect(validationResult.success).toBe(true);

      if (validationResult.success) {
        const prompt = buildCopyGenerationPrompt(
          validationResult.data.category,
          validationResult.data.platform,
          validationResult.data.productName,
          validationResult.data.coreSellingPoints,
          mockProductFeatures
        );
        expect(prompt).toBeDefined();
      }
    });

    it("图片验证流程应该正常工作", () => {
      const validFile = { name: "test.jpg", size: 1024 * 1024 };
      expect(validateImageFormat(validFile.name)).toBe(true);
      expect(validateImageSize(validFile.size)).toBe(true);

      const invalidFormatFile = { name: "test.gif", size: 1024 * 1024 };
      expect(validateImageFormat(invalidFormatFile.name)).toBe(false);

      const invalidSizeFile = { name: "test.jpg", size: 15 * 1024 * 1024 };
      expect(validateImageSize(invalidSizeFile.size)).toBe(false);
    });
  });
});

// 模拟数据
const mockProductFeatures = {
  productSubject: "测试商品",
  material: "纯棉",
  color: "蓝色",
  size: "M",
  style: "时尚",
  defectPositions: [],
};
