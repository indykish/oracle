import { describe, expect, it } from "vitest";
import { extractTextOutput, runOracle } from "../../src/oracle.js";

const live = process.env.ORACLE_LIVE_TEST === "1";
const hasKey = Boolean(process.env.GEMINI_API_KEY);

(live ? describe : describe.skip)("Gemini live smoke", () => {
	if (!hasKey) {
		it.skip("requires GEMINI_API_KEY", () => {});
		return;
	}

	it("gemini-3-pro returns a short answer", async () => {
		const result = await runOracle(
			{
				prompt: "Give one short sentence about photosynthesis.",
				model: "gemini-3-pro",
				search: false,
			},
			{
				log: () => {},
				write: () => true,
			},
		);
		if (result.mode !== "live") {
			throw new Error(`Expected live result, received ${result.mode ?? "unknown"}`);
		}
		const text = extractTextOutput(result.response);
		expect(text?.length ?? 0).toBeGreaterThan(10);
	}, 120_000);

	it("gemini-3.5-pro returns a short answer", async () => {
		try {
			const result = await runOracle(
				{
					prompt: "Give one short sentence about quantum computing.",
					model: "gemini-3.5-pro",
					search: false,
				},
				{
					log: () => {},
					write: () => true,
				},
			);
			if (result.mode !== "live") {
				throw new Error(`Expected live result, received ${result.mode ?? "unknown"}`);
			}
			const text = extractTextOutput(result.response);
			expect(text?.length ?? 0).toBeGreaterThan(10);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			if (/model .*does not exist|not .*access|permission|404/i.test(message)) {
				// Skip if model not available
				return;
			}
			throw error;
		}
	}, 120_000);

	it("gemini-3-pro supports search", async () => {
		const result = await runOracle(
			{
				prompt: "What is the current weather in New York? Search the web.",
				model: "gemini-3-pro",
				search: true,
				maxOutput: 256,
			},
			{
				log: () => {},
				write: () => true,
			},
		);
		if (result.mode !== "live") {
			throw new Error(`Expected live result, received ${result.mode ?? "unknown"}`);
		}
		const text = extractTextOutput(result.response);
		expect(text?.length ?? 0).toBeGreaterThan(10);
	}, 120_000);

	it("gemini-3.5-pro supports search", async () => {
		try {
			const result = await runOracle(
				{
					prompt: "What are the latest AI developments? Search the web.",
					model: "gemini-3.5-pro",
					search: true,
					maxOutput: 256,
				},
				{
					log: () => {},
					write: () => true,
				},
			);
			if (result.mode !== "live") {
				throw new Error(`Expected live result, received ${result.mode ?? "unknown"}`);
			}
			const text = extractTextOutput(result.response);
			expect(text?.length ?? 0).toBeGreaterThan(10);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			if (/model .*does not exist|not .*access|permission|404/i.test(message)) {
				// Skip if model not available
				return;
			}
			throw error;
		}
	}, 120_000);
});
