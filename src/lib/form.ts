import type { ZodSchema, ZodError } from "zod";

export interface FormErrors {
  [key: string]: string;
}

export interface FormResult<T> {
  success: boolean;
  values: Partial<T>;
  errors: FormErrors;
  globalError: string;
  redirect?: string;
}

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  return fallback;
}

export async function handleForm<T>(
  request: Request,
  schema: ZodSchema<T>,
  action: (data: T) => Promise<
    { success: true; id?: string } | { success: false; error: string }
  >,
  defaults: Record<string, string>,
): Promise<FormResult<T>> {
  const errors: FormErrors = {};
  let globalError = "";
  const values: Record<string, string> = { ...defaults };
  const raw: Record<string, string | undefined> = {};

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value !== "") raw[key] = value;
    }
  } else {
    const text = await request.text();
    const params = new URLSearchParams(text);
    for (const [key, value] of params.entries()) {
      if (value !== "") raw[key] = value;
    }
  }

  Object.assign(values, raw);

  const parsed = schema.safeParse(raw);

  if (parsed.success) {
    const result = await action(parsed.data);

    if (result.success) {
      return {
        success: true,
        values: values as Partial<T>,
        errors: {},
        globalError: "",
        redirect: "back",
      };
    }

    globalError = result.error;
  } else {
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (!errors[path]) {
        errors[path] = issue.message;
      }
    }
  }

  return {
    success: false,
    values: values as Partial<T>,
    errors,
    globalError,
  };
}

export async function wrapAction<T extends Record<string, unknown>>(
  fn: () => Promise<T>,
  fallback: string,
): Promise<{ success: true } & T | { success: false; error: string }> {
  try {
    const data = await fn();
    return { success: true, ...data };
  } catch (e) {
    return { success: false, error: getErrorMessage(e, fallback) };
  }
}
