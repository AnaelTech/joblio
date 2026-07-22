import { db } from "@/db/client";
import { contacts } from "@/db/schema/contacts";
import { companies } from "@/db/schema/companies";
import { and, desc, eq, ilike, or } from "drizzle-orm";

export interface ContactRow {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  notes: string | null;
  companyId: string;
  companyName: string;
  createdAt: Date;
}

export async function getContacts(params?: {
  search?: string;
  companyId?: string;
}): Promise<ContactRow[]> {
  try {
    const conditions = [];

    if (params?.search) {
      conditions.push(
        or(
          ilike(contacts.name, `%${params.search}%`),
          ilike(contacts.role, `%${params.search}%`),
          ilike(contacts.email, `%${params.search}%`),
          ilike(companies.name, `%${params.search}%`),
        ),
      );
    }

    if (params?.companyId) {
      conditions.push(eq(contacts.companyId, params.companyId));
    }

    return await db
      .select({
        id: contacts.id,
        name: contacts.name,
        role: contacts.role,
        email: contacts.email,
        phone: contacts.phone,
        linkedin: contacts.linkedin,
        notes: contacts.notes,
        companyId: contacts.companyId,
        companyName: companies.name,
        createdAt: contacts.createdAt,
      })
      .from(contacts)
      .innerJoin(companies, eq(contacts.companyId, companies.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(contacts.createdAt));
  } catch {
    return [];
  }
}

export async function getCompanyOptions(): Promise<
  { id: string; name: string }[]
> {
  try {
    return await db
      .select({ id: companies.id, name: companies.name })
      .from(companies)
      .orderBy(companies.name);
  } catch {
    return [];
  }
}
