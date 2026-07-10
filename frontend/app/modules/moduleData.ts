import type { LearningModule } from "@/app/data/home";
import { learningModules } from "@/app/data/home";
import { createClient } from "@/app/utils/supabase/server";

export const MODULES_TABLE = "modules";

type ModuleRecord = Record<string, unknown>;

function textValue(row: ModuleRecord, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return fallback;
}

function dateValue(row: ModuleRecord) {
  const value = textValue(row, [
    "date",
    "published_at",
    "created_at",
    "updated_at",
  ]);

  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function publicR2Url(key: string) {
  const baseUrl = process.env.R2_PUBLIC_URL;

  if (!baseUrl) {
    return "";
  }

  const encodedKey = key
    .replace(/^\//, "")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${baseUrl.replace(/\/$/, "")}/${encodedKey}`;
}

function moduleFileUrl(key: string) {
  return `/api/modules/file?key=${encodeURIComponent(key)}`;
}

function resolveR2Asset(row: ModuleRecord, urlKeys: string[], keyKeys: string[]) {
  const url = textValue(row, urlKeys);

  if (url) {
    return url;
  }

  const key = textValue(row, keyKeys);

  if (!key) {
    return "";
  }

  const publicUrl = publicR2Url(key);

  if (publicUrl) {
    return moduleFileUrl(key);
  }

  return moduleFileUrl(key);
}

async function toLearningModule(row: ModuleRecord): Promise<LearningModule> {
  const title = textValue(row, ["title", "name", "module_title"], "Untitled module");

  return {
    code: textValue(row, ["code", "module_code", "slug", "id"], title),
    title,
    description: textValue(row, ["description", "summary", "overview"]),
    image:
      resolveR2Asset(
        row,
        ["image_url", "image", "thumbnail_url", "cover_url"],
        ["r2_image_key", "image_key", "thumbnail_key", "cover_key"],
      ) || "/assets/module-networking.png",
    category: textValue(
      row,
      ["classification", "category", "topic", "type"],
      "Field Studies",
    ),
    date: dateValue(row),
    pdfHref:
      resolveR2Asset(
        row,
        ["pdf_url", "pdf_href", "document_url", "file_url"],
        ["r2_file_key", "pdf_key", "document_key", "file_key"],
      ) || "#",
  };
}

export async function getLearningModules(): Promise<LearningModule[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from(MODULES_TABLE).select("*");

    if (error) {
      console.error("Unable to load learning modules:", error.message);
      return learningModules;
    }

    if (!data?.length) {
      return learningModules;
    }

    return Promise.all(data.map((row) => toLearningModule(row)));
  } catch (error) {
    console.error("Unable to load learning modules:", error);
    return learningModules;
  }
}
