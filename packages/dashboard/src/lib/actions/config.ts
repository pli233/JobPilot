"use server";

import fs from "fs/promises";
import path from "path";

const CONFIG_DIR = path.resolve(process.cwd(), "../../config");

export interface PersonalInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  github_url: string;
}

export interface SearchPreferences {
  default_keywords: string[];
  default_location: string;
  remote_preference: string;
  salary_min: number;
  excluded_companies: string[];
  preferred_companies: string[];
}

export interface ApplicationSettings {
  auto_submit: boolean;
  save_screenshots: boolean;
  daily_limit: number;
}

export interface CommonAnswers {
  willing_to_relocate: string;
  work_authorization: string;
  visa_sponsorship_required: string;
  salary_expectation: string;
}

export interface Preferences {
  personal_info: PersonalInfo;
  search_preferences: SearchPreferences;
  application_settings: ApplicationSettings;
  common_answers: CommonAnswers;
}

export async function getPreferences(): Promise<Preferences | null> {
  try {
    const filePath = path.join(CONFIG_DIR, "preferences.json");
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to read preferences:", error);
    return null;
  }
}

export async function savePreferences(prefs: Preferences): Promise<boolean> {
  try {
    const filePath = path.join(CONFIG_DIR, "preferences.json");
    await fs.writeFile(filePath, JSON.stringify(prefs, null, 2));
    return true;
  } catch (error) {
    console.error("Failed to save preferences:", error);
    return false;
  }
}

export async function updatePersonalInfo(info: PersonalInfo): Promise<boolean> {
  try {
    const prefs = await getPreferences();
    if (!prefs) return false;

    prefs.personal_info = info;
    return savePreferences(prefs);
  } catch (error) {
    console.error("Failed to update personal info:", error);
    return false;
  }
}

export async function updateSearchPreferences(
  searchPrefs: SearchPreferences
): Promise<boolean> {
  try {
    const prefs = await getPreferences();
    if (!prefs) return false;

    prefs.search_preferences = searchPrefs;
    return savePreferences(prefs);
  } catch (error) {
    console.error("Failed to update search preferences:", error);
    return false;
  }
}

export async function updateCommonAnswers(
  answers: CommonAnswers
): Promise<boolean> {
  try {
    const prefs = await getPreferences();
    if (!prefs) return false;

    prefs.common_answers = answers;
    return savePreferences(prefs);
  } catch (error) {
    console.error("Failed to update common answers:", error);
    return false;
  }
}

// Q&A Templates
export interface QATemplate {
  id: string;
  category: string;
  question_patterns: string[];
  answer_template: string;
  variables: string[];
}

export async function getQATemplates(): Promise<QATemplate[]> {
  try {
    const filePath = path.join(CONFIG_DIR, "qa_templates.json");
    const content = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    return data.templates || [];
  } catch (error) {
    console.error("Failed to read QA templates:", error);
    return [];
  }
}

export async function matchQATemplate(question: string): Promise<QATemplate | null> {
  try {
    const templates = await getQATemplates();

    for (const template of templates) {
      for (const pattern of template.question_patterns) {
        const regex = new RegExp(pattern, "i");
        if (regex.test(question)) {
          return template;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to match QA template:", error);
    return null;
  }
}
