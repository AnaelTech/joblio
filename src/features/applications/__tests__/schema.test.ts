import { describe, expect, it } from "vitest";
import {
	createApplicationSchema,
	PRIORITY_LABELS,
	REMOTE_LABELS,
	SOURCE_LABELS,
	STATUS_LABELS,
	updateApplicationSchema,
} from "../schema";

describe("createApplicationSchema", () => {
	it("accepts valid input", () => {
		const result = createApplicationSchema.safeParse({
			companyName: "Test Corp",
			title: "Développeur",
			source: "linkedin",
		});
		expect(result.success).toBe(true);
	});

	it("rejects missing companyName", () => {
		const result = createApplicationSchema.safeParse({
			title: "Développeur",
			source: "linkedin",
		});
		expect(result.success).toBe(false);
	});

	it("rejects missing title", () => {
		const result = createApplicationSchema.safeParse({
			companyName: "Test Corp",
			source: "linkedin",
		});
		expect(result.success).toBe(false);
	});

	it("rejects invalid source", () => {
		const result = createApplicationSchema.safeParse({
			companyName: "Test Corp",
			title: "Développeur",
			source: "invalid_source",
		});
		expect(result.success).toBe(false);
	});

	it("applies default status", () => {
		const result = createApplicationSchema.parse({
			companyName: "Test Corp",
			title: "Développeur",
			source: "linkedin",
		});
		expect(result.status).toBe("applied");
	});

	it("applies default priority", () => {
		const result = createApplicationSchema.parse({
			companyName: "Test Corp",
			title: "Développeur",
			source: "linkedin",
		});
		expect(result.priority).toBe("medium");
	});

	it("accepts optional fields", () => {
		const result = createApplicationSchema.safeParse({
			companyName: "Test Corp",
			title: "Développeur",
			source: "linkedin",
			location: "Paris",
			remoteType: "hybrid",
			notes: "Une note",
		});
		expect(result.success).toBe(true);
	});

	it("rejects invalid remoteType", () => {
		const result = createApplicationSchema.safeParse({
			companyName: "Test Corp",
			title: "Développeur",
			source: "linkedin",
			remoteType: "unknown",
		});
		expect(result.success).toBe(false);
	});
});

describe("updateApplicationSchema", () => {
	it("accepts empty object (no updates)", () => {
		const result = updateApplicationSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it("accepts partial status update", () => {
		const result = updateApplicationSchema.safeParse({ status: "in_progress" });
		expect(result.success).toBe(true);
	});

	it("accepts followUpDate", () => {
		const result = updateApplicationSchema.safeParse({
			followUpDate: "2026-07-30",
		});
		expect(result.success).toBe(true);
	});

	it("accepts null followUpDate", () => {
		const result = updateApplicationSchema.safeParse({
			followUpDate: null,
		});
		expect(result.success).toBe(true);
	});

	it("rejects invalid status", () => {
		const result = updateApplicationSchema.safeParse({
			status: "nonexistent",
		});
		expect(result.success).toBe(false);
	});

	it("accepts full update", () => {
		const result = updateApplicationSchema.safeParse({
			status: "offer",
			priority: "high",
			notes: "Mise à jour",
			location: "Lyon",
			remoteType: "remote",
			followUpDate: "2026-08-01",
		});
		expect(result.success).toBe(true);
	});
});

describe("STATUS_LABELS", () => {
	it("contains all expected statuses", () => {
		const expected = [
			"draft",
			"saved",
			"applied",
			"in_progress",
			"offer",
			"accepted",
			"rejected",
			"withdrawn",
			"ghosted",
			"archived",
		];
		for (const status of expected) {
			expect(STATUS_LABELS).toHaveProperty(status);
		}
	});

	it("has French labels", () => {
		expect(STATUS_LABELS.applied).toBe("Candidaté");
		expect(STATUS_LABELS.archived).toBe("Archivée");
	});
});

describe("PRIORITY_LABELS", () => {
	it("contains all expected priorities", () => {
		expect(PRIORITY_LABELS).toHaveProperty("low");
		expect(PRIORITY_LABELS).toHaveProperty("medium");
		expect(PRIORITY_LABELS).toHaveProperty("high");
	});
});

describe("SOURCE_LABELS", () => {
	it("contains all expected sources", () => {
		expect(SOURCE_LABELS).toHaveProperty("linkedin");
		expect(SOURCE_LABELS).toHaveProperty("indeed");
		expect(SOURCE_LABELS).toHaveProperty("other");
	});
});

describe("REMOTE_LABELS", () => {
	it("contains all expected types", () => {
		expect(REMOTE_LABELS).toHaveProperty("onsite");
		expect(REMOTE_LABELS).toHaveProperty("hybrid");
		expect(REMOTE_LABELS).toHaveProperty("remote");
	});
});
