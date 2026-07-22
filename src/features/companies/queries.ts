import { db } from "@/db/client";
import { companies } from "@/db/schema/companies";
import { and, desc, eq, ilike, or } from "drizzle-orm";

export interface CompanyRow {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  createdAt: Date;
}

export async function getCompanies(userId?: string, search?: string): Promise<CompanyRow[]> {
  try {
    const conditions = [];

    if (userId) {
      conditions.push(eq(companies.userId, userId));
    }

    if (search) {
      conditions.push(
        or(
          ilike(companies.name, `%${search}%`),
          ilike(companies.industry, `%${search}%`),
          ilike(companies.location, `%${search}%`),
        ),
      );
    }

    return await db
      .select()
      .from(companies)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(companies.createdAt));
  } catch {
    return [];
  }
}
