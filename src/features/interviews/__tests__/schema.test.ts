import { describe, expect, it } from "vitest";
import {
	createInterviewSchema,
	INTERVIEW_RESULT_LABELS,
	INTERVIEW_TYPE_LABELS,
	updateInterviewSchema,
} from "../schema";

describe("createInterviewSchema", () => {
	it("accepts valid input", () => {
		const result = createInterviewSchema.safeParse({
			applicationId: "550e8400-e29b-41d4-a716-446655440000",
			type: "technical",
		});
		expect(result.success).toBe(true);
	});

	it("rejects missing applicationId", () => {
		const result = createInterviewSchema.safeParse({
			type: "technical",
		});
		expect(result.success).toBe(false);
	});

	it("rejects invalid applicationId", () => {
		const result = createInterviewSchema.safeParse({
			applicationId: "not-a-uuid",
			type: "technical",
		});
		expect(result.success).toBe(false);
	});

	it("rejects invalid type", () => {
		const result = createInterviewSchema.safeParse({
			applicationId: "550e8400-e29b-41d4-a716-446655440000",
			type: "invalid_type",
		});
		expect(result.success).toBe(false);
	});

	it("accepts optional scheduledAt with valid date", () => {
		const result = createInterviewSchema.safeParse({
			applicationId: "550e8400-e29b-41d4-a716-446655440000",
			type: "hr",
			scheduledAt: "2026-08-15T14:00:00Z",
		});
		expect(result.success).toBe(true);
	});

	it("rejects invalid scheduledAt", () => {
		const result = createInterviewSchema.safeParse({
			applicationId: "550e8400-e29b-41d4-a716-446655440000",
			type: "hr",
			scheduledAt: "not-a-date",
		});
		expect(result.success).toBe(false);
	});

	it("accepts duration as string number (coerce)", () => {
		const result = createInterviewSchema.safeParse({
			applicationId: "550e8400-e29b-41d4-a716-446655440000",
			type: "technical",
			duration: "60",
		});
		expect(result.success).toBe(true);
	});

	it("rejects non-positive duration", () => {
		const result = createInterviewSchema.safeParse({
			applicationId: "550e8400-e29b-41d4-a716-446655440000",
			type: "technical",
			duration: 0,
		});
		expect(result.success).toBe(false);
	});

	it("accepts optional fields", () => {
		const result = createInterviewSchema.safeParse({
			applicationId: "550e8400-e29b-41d4-a716-446655440000",
			type: "manager",
			interviewer: "Jean Dupont",
			notes: "Préparer les questions techniques",
		});
		expect(result.success).toBe(true);
	});
});

describe("updateInterviewSchema", () => {
	it("accepts empty object", () => {
		const result = updateInterviewSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it("accepts partial update", () => {
		const result = updateInterviewSchema.safeParse({
			result: "passed",
		});
		expect(result.success).toBe(true);
	});

	it("accepts null scheduledAt (clear date)", () => {
		const result = updateInterviewSchema.safeParse({
			scheduledAt: null,
		});
		expect(result.success).toBe(true);
	});
});

describe("INTERVIEW_TYPE_LABELS", () => {
	it("contains all expected types", () => {
		const expected = [
			"phone_screen",
			"hr",
			"technical",
			"manager",
			"final",
			"other",
		];
		for (const type of expected) {
			expect(INTERVIEW_TYPE_LABELS).toHaveProperty(type);
		}
	});
});

describe("INTERVIEW_RESULT_LABELS", () => {
	it("contains all expected results", () => {
		const expected = ["pending", "passed", "failed", "cancelled"];
		for (const result of expected) {
			expect(INTERVIEW_RESULT_LABELS).toHaveProperty(result);
		}
	});
});
