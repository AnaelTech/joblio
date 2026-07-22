import { db } from "@/db/client";
import { interviews } from "@/db/schema/interviews";
import { applications } from "@/db/schema/applications";
import { companies } from "@/db/schema/companies";
import { and, desc, eq, ilike, or } from "drizzle-orm";

export interface InterviewRow {
  id: string;
  type: string;
  scheduledAt: Date | null;
  duration: number | null;
  result: string;
  interviewer: string | null;
  notes: string | null;
  applicationId: string;
  applicationTitle: string;
  companyName: string;
  createdAt: Date;
}

export async function getInterviews(params?: {
  search?: string;
  result?: string;
}): Promise<InterviewRow[]> {
  try {
    const conditions = [];

    if (params?.search) {
      conditions.push(
        or(
          ilike(applications.title, `%${params.search}%`),
          ilike(companies.name, `%${params.search}%`),
          ilike(interviews.interviewer, `%${params.search}%`),
        ),
      );
    }

    if (params?.result) {
      conditions.push(eq(interviews.result, params.result));
    }

    return await db
      .select({
        id: interviews.id,
        type: interviews.type,
        scheduledAt: interviews.scheduledAt,
        duration: interviews.duration,
        result: interviews.result,
        interviewer: interviews.interviewer,
        notes: interviews.notes,
        applicationId: interviews.applicationId,
        applicationTitle: applications.title,
        companyName: companies.name,
        createdAt: interviews.createdAt,
      })
      .from(interviews)
      .innerJoin(applications, eq(interviews.applicationId, applications.id))
      .innerJoin(companies, eq(applications.companyId, companies.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(interviews.scheduledAt));
  } catch {
    return [];
  }
}

export async function getApplicationOptions(): Promise<
  { id: string; label: string }[]
> {
  try {
    const rows = await db
      .select({
        id: applications.id,
        title: applications.title,
        companyName: companies.name,
      })
      .from(applications)
      .innerJoin(companies, eq(applications.companyId, companies.id))
      .orderBy(applications.title);

    return rows.map((r) => ({
      id: r.id,
      label: `${r.title} @ ${r.companyName}`,
    }));
  } catch {
    return [];
  }
}
