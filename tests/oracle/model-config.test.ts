import { describe, expect, it } from "vitest";
import { DEFAULT_MODEL, MODEL_CONFIGS, PRO_MODELS } from "../../src/oracle/config.js";
import type { KnownModelName } from "../../src/oracle/types.js";

describe("Model Configuration", () => {
	describe("All models have valid configuration", () => {
		const allModels = Object.keys(MODEL_CONFIGS) as KnownModelName[];

		it.each(allModels)("%s has required fields", (model) => {
			const config = MODEL_CONFIGS[model];
			expect(config).toBeDefined();
			expect(config.model).toBe(model);
			expect(config.provider).toBeDefined();
			expect(["openai", "anthropic", "google", "xai", "openrouter"]).toContain(config.provider);
			expect(config.tokenizer).toBeInstanceOf(Function);
			expect(config.inputLimit).toBeGreaterThan(0);
			expect(config.pricing).toBeDefined();
			expect(config.pricing?.inputPerToken).toBeGreaterThanOrEqual(0);
			expect(config.pricing?.outputPerToken).toBeGreaterThanOrEqual(0);
		});

		it.each(allModels)("%s has valid reasoning configuration", (model) => {
			const config = MODEL_CONFIGS[model];
			if (config.reasoning !== null) {
				expect(config.reasoning.effort).toBeDefined();
				expect(["low", "medium", "high", "xhigh"]).toContain(config.reasoning.effort);
			}
		});

		it.each(allModels)("%s has reasonable token limits", (model) => {
			const config = MODEL_CONFIGS[model];
			expect(config.inputLimit).toBeGreaterThanOrEqual(1000);
			expect(config.inputLimit).toBeLessThanOrEqual(10_000_000);
		});
	});

	describe("Pro models", () => {
		it("has correct PRO_MODELS set", () => {
			const expectedProModels = [
				"gpt-5.1-pro",
				"gpt-5-pro",
				"gpt-5.2-pro",
				"gpt-5.3-pro",
				"claude-4.5-sonnet",
				"claude-4.6-sonnet",
				"claude-4.1-opus",
				"claude-4.6-opus",
			];
			for (const model of expectedProModels) {
				expect(PRO_MODELS.has(model as any)).toBe(true);
			}
		});

		it("all PRO models have higher pricing", () => {
			PRO_MODELS.forEach((model) => {
				const config = MODEL_CONFIGS[model as KnownModelName];
				const inputPrice = (config.pricing?.inputPerToken ?? 0) * 1_000_000;
				expect(inputPrice).toBeGreaterThanOrEqual(1); // At least $1/M tokens
			});
		});
	});

	describe("GPT models", () => {
		const gptModels = [
			"gpt-5.1-pro",
			"gpt-5-pro",
			"gpt-5.1",
			"gpt-5.1-codex",
			"gpt-5.2",
			"gpt-5.2-instant",
			"gpt-5.2-pro",
			"gpt-5.3",
			"gpt-5.3-pro",
		];

		it.each(gptModels)("%s uses openai provider", (model) => {
			const config = MODEL_CONFIGS[model as KnownModelName];
			expect(config.provider).toBe("openai");
		});

		it.each(gptModels)("%s has consistent input limit", (model) => {
			const config = MODEL_CONFIGS[model as KnownModelName];
			expect(config.inputLimit).toBe(196000);
		});

		it("has proper apiModel overrides where needed", () => {
			expect(MODEL_CONFIGS["gpt-5.1-pro"].apiModel).toBe("gpt-5.2-pro");
			expect(MODEL_CONFIGS["gpt-5.2-instant"].apiModel).toBe("gpt-5.2-chat-latest");
		});

		it("has correct pricing for gpt-5.3 series", () => {
			const gpt53 = MODEL_CONFIGS["gpt-5.3"];
			expect(gpt53.pricing?.inputPerToken).toBe(2 / 1_000_000);
			expect(gpt53.pricing?.outputPerToken).toBe(16 / 1_000_000);

			const gpt53Pro = MODEL_CONFIGS["gpt-5.3-pro"];
			expect(gpt53Pro.pricing?.inputPerToken).toBe(25 / 1_000_000);
			expect(gpt53Pro.pricing?.outputPerToken).toBe(200 / 1_000_000);
		});
	});

	describe("Claude models", () => {
		const claudeModels = [
			"claude-4.5-sonnet",
			"claude-4.6-sonnet",
			"claude-4.1-opus",
			"claude-4.6-opus",
		];

		it.each(claudeModels)("%s uses anthropic provider", (model) => {
			const config = MODEL_CONFIGS[model as KnownModelName];
			expect(config.provider).toBe("anthropic");
		});

		it.each(claudeModels)("%s has 200k input limit", (model) => {
			const config = MODEL_CONFIGS[model as KnownModelName];
			expect(config.inputLimit).toBe(200000);
		});

		it.each(claudeModels)("%s does not support background", (model) => {
			const config = MODEL_CONFIGS[model as KnownModelName];
			expect(config.supportsBackground).toBe(false);
		});

		it.each(claudeModels)("%s does not support search", (model) => {
			const config = MODEL_CONFIGS[model as KnownModelName];
			expect(config.supportsSearch).toBe(false);
		});

		it("has correct apiModel mappings", () => {
			expect(MODEL_CONFIGS["claude-4.5-sonnet"].apiModel).toBe("claude-sonnet-4-5");
			expect(MODEL_CONFIGS["claude-4.6-sonnet"].apiModel).toBe("claude-sonnet-4-6");
			expect(MODEL_CONFIGS["claude-4.1-opus"].apiModel).toBe("claude-opus-4-1");
			expect(MODEL_CONFIGS["claude-4.6-opus"].apiModel).toBe("claude-opus-4-6");
		});

		it("Opus models have higher pricing than Sonnet", () => {
			const opus41 = MODEL_CONFIGS["claude-4.1-opus"];
			const sonnet45 = MODEL_CONFIGS["claude-4.5-sonnet"];

			expect(opus41.pricing?.inputPerToken).toBeGreaterThan(sonnet45.pricing?.inputPerToken ?? 0);
			expect(opus41.pricing?.outputPerToken).toBeGreaterThan(sonnet45.pricing?.outputPerToken ?? 0);
		});
	});

	describe("Gemini models", () => {
		const geminiModels = ["gemini-3-pro", "gemini-3.5-pro"];

		it.each(geminiModels)("%s uses google provider", (model) => {
			const config = MODEL_CONFIGS[model as KnownModelName];
			expect(config.provider).toBe("google");
		});

		it.each(geminiModels)("%s has 200k input limit", (model) => {
			const config = MODEL_CONFIGS[model as KnownModelName];
			expect(config.inputLimit).toBe(200000);
		});

		it.each(geminiModels)("%s supports search", (model) => {
			const config = MODEL_CONFIGS[model as KnownModelName];
			expect(config.supportsSearch).toBe(true);
		});

		it.each(geminiModels)("%s does not support background", (model) => {
			const config = MODEL_CONFIGS[model as KnownModelName];
			expect(config.supportsBackground).toBe(false);
		});

		it("gemini-3.5-pro has higher pricing than gemini-3-pro", () => {
			const gemini3 = MODEL_CONFIGS["gemini-3-pro"];
			const gemini35 = MODEL_CONFIGS["gemini-3.5-pro"];

			expect(gemini35.pricing?.inputPerToken).toBeGreaterThan(gemini3.pricing?.inputPerToken ?? 0);
			expect(gemini35.pricing?.outputPerToken).toBeGreaterThan(
				gemini3.pricing?.outputPerToken ?? 0,
			);
		});
	});

	describe("Grok models", () => {
		const grokModels = ["grok-4.1", "grok-4.2"];

		it.each(grokModels)("%s uses xai provider", (model) => {
			const config = MODEL_CONFIGS[model as KnownModelName];
			expect(config.provider).toBe("xai");
		});

		it.each(grokModels)("%s has 2M input limit", (model) => {
			const config = MODEL_CONFIGS[model as KnownModelName];
			expect(config.inputLimit).toBe(2_000_000);
		});

		it.each(grokModels)("%s supports search", (model) => {
			const config = MODEL_CONFIGS[model as KnownModelName];
			expect(config.supportsSearch).toBe(true);
			expect(config.searchToolType).toBe("web_search");
		});

		it.each(grokModels)("%s does not support background", (model) => {
			const config = MODEL_CONFIGS[model as KnownModelName];
			expect(config.supportsBackground).toBe(false);
		});

		it("has correct apiModel mappings", () => {
			expect(MODEL_CONFIGS["grok-4.1"].apiModel).toBe("grok-4-1-fast-reasoning");
			expect(MODEL_CONFIGS["grok-4.2"].apiModel).toBe("grok-4-2");
		});

		it("grok-4.2 has higher pricing than grok-4.1", () => {
			const grok41 = MODEL_CONFIGS["grok-4.1"];
			const grok42 = MODEL_CONFIGS["grok-4.2"];

			expect(grok42.pricing?.inputPerToken).toBeGreaterThan(grok41.pricing?.inputPerToken ?? 0);
			expect(grok42.pricing?.outputPerToken).toBeGreaterThan(grok41.pricing?.outputPerToken ?? 0);
		});

		it("both grok models have very low pricing", () => {
			const grok41 = MODEL_CONFIGS["grok-4.1"];
			expect(grok41.pricing?.inputPerToken).toBe(0.2 / 1_000_000);
			expect(grok41.pricing?.outputPerToken).toBe(0.5 / 1_000_000);

			const grok42 = MODEL_CONFIGS["grok-4.2"];
			expect(grok42.pricing?.inputPerToken).toBe(0.3 / 1_000_000);
			expect(grok42.pricing?.outputPerToken).toBe(1.0 / 1_000_000);
		});
	});

	describe("Default model", () => {
		it("DEFAULT_MODEL is valid", () => {
			expect(DEFAULT_MODEL).toBeDefined();
			expect(MODEL_CONFIGS[DEFAULT_MODEL as KnownModelName]).toBeDefined();
		});

		it("default model has reasonable pricing", () => {
			const config = MODEL_CONFIGS[DEFAULT_MODEL as KnownModelName];
			expect(config.pricing?.inputPerToken).toBeGreaterThan(0);
			expect(config.pricing?.outputPerToken).toBeGreaterThan(0);
		});
	});
});
