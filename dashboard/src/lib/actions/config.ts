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

export interface Education {
  school: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  gpa: string;
  location: string;
  achievements: string[];
  coursework: string[];
}

export interface WorkExperience {
  company: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  achievements: string[];
}

export interface Project {
  name: string;
  description: string;
  url: string;
  technologies: string[];
  start_date: string;
  end_date: string;
}

export interface LanguageSkill {
  language: string;
  proficiency: string;
}

export interface Skills {
  technical: string[];
  programming_languages: string[];
  frameworks: string[];
  tools: string[];
  soft_skills: string[];
  languages: LanguageSkill[];
}

export interface Preferences {
  personal_info: PersonalInfo;
  search_preferences: SearchPreferences;
  application_settings: ApplicationSettings;
  common_answers: CommonAnswers;
  education: Education[];
  work_experience: WorkExperience[];
  skills: Skills;
  projects: Project[];
}

const PROFILE_PATH = path.join(CONFIG_DIR, "profile.json");
const PREFERENCES_PATH = path.join(CONFIG_DIR, "preferences.json");

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error);
    return null;
  }
}

async function writeJson<T>(filePath: string, data: T): Promise<boolean> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Failed to write ${filePath}:`, error);
    return false;
  }
}

export async function getPreferences(): Promise<Preferences | null> {
  try {
    const [profileData, preferencesData] = await Promise.all([
      readJson<any>(PROFILE_PATH),
      readJson<any>(PREFERENCES_PATH),
    ]);

    if (!profileData || !preferencesData) return null;

    // Map legacy structure to Dashboard interface
    return {
      personal_info: profileData.personal_info || {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        linkedin_url: "",
        github_url: "",
      },
      search_preferences: {
        default_keywords: preferencesData.job_search?.keywords || [],
        default_location: preferencesData.job_search?.locations?.[0] || "",
        remote_preference: preferencesData.job_search?.remote_preference || "remote",
        salary_min: preferencesData.salary?.minimum || 0,
        excluded_companies: preferencesData.companies?.excluded || [],
        preferred_companies: preferencesData.companies?.preferred || [],
      },
      application_settings: preferencesData.application || {
        auto_submit: false,
        save_screenshots: true,
        daily_limit: 20,
      },
      common_answers: preferencesData.common_answers || {
        willing_to_relocate: "Yes",
        work_authorization: "Authorized to work in the US",
        visa_sponsorship_required: "No",
        salary_expectation: "Open to discussion",
      },
      education: profileData.education || [],
      work_experience: profileData.work_experience || [],
      skills: profileData.skills || {
        technical: [],
        programming_languages: [],
        frameworks: [],
        tools: [],
        soft_skills: [],
        languages: [],
      },
      projects: profileData.projects || [],
    };
  } catch (error) {
    console.error("Failed to aggregate preferences:", error);
    return null;
  }
}

export async function updateEducation(education: Education[]): Promise<boolean> {
  try {
    const profileData = await readJson<any>(PROFILE_PATH);
    if (!profileData) return false;

    profileData.education = education;
    return writeJson(PROFILE_PATH, profileData);
  } catch (error) {
    console.error("Failed to update education:", error);
    return false;
  }
}

export async function updateWorkExperience(experience: WorkExperience[]): Promise<boolean> {
  try {
    const profileData = await readJson<any>(PROFILE_PATH);
    if (!profileData) return false;

    profileData.work_experience = experience;
    return writeJson(PROFILE_PATH, profileData);
  } catch (error) {
    console.error("Failed to update work experience:", error);
    return false;
  }
}

export async function updateSkills(skills: Skills): Promise<boolean> {
  try {
    const profileData = await readJson<any>(PROFILE_PATH);
    if (!profileData) return false;

    profileData.skills = skills;
    return writeJson(PROFILE_PATH, profileData);
  } catch (error) {
    console.error("Failed to update skills:", error);
    return false;
  }
}

export async function updateProjects(projects: Project[]): Promise<boolean> {
  try {
    const profileData = await readJson<any>(PROFILE_PATH);
    if (!profileData) return false;

    profileData.projects = projects;
    return writeJson(PROFILE_PATH, profileData);
  } catch (error) {
    console.error("Failed to update projects:", error);
    return false;
  }
}

export async function updatePersonalInfo(info: PersonalInfo): Promise<boolean> {
  try {
    const profileData = await readJson<any>(PROFILE_PATH);
    if (!profileData) return false;

    // Update only the personal_info section
    // We need to preserve other fields in personal_info that might be in the file but not in the interface
    // assuming the interface matches mostly. 
    // Actually, let's merge strictly what we have.
    profileData.personal_info = {
      ...profileData.personal_info,
      ...info,
    };

    // Also update online_presence links if they map
    if (info.linkedin_url) {
      if (!profileData.online_presence) profileData.online_presence = {};
      profileData.online_presence.linkedin_url = info.linkedin_url;
    }
    if (info.github_url) {
      if (!profileData.online_presence) profileData.online_presence = {};
      profileData.online_presence.github_url = info.github_url;
    }

    return writeJson(PROFILE_PATH, profileData);
  } catch (error) {
    console.error("Failed to update personal info:", error);
    return false;
  }
}

export async function updateSearchPreferences(
  searchPrefs: SearchPreferences
): Promise<boolean> {
  try {
    const preferencesData = await readJson<any>(PREFERENCES_PATH);
    if (!preferencesData) return false;

    // Map Dashboard interface back to Legacy JSON structure
    if (!preferencesData.job_search) preferencesData.job_search = {};
    preferencesData.job_search.keywords = searchPrefs.default_keywords;

    // Handle location as array (legacy) vs string (dashboard)
    // We'll prepend the default location or ensure it's in the list
    const location = searchPrefs.default_location;
    if (location) {
      preferencesData.job_search.locations = [location]; // Simplified: just overwrite for primary
    }

    preferencesData.job_search.remote_preference = searchPrefs.remote_preference;

    if (!preferencesData.salary) preferencesData.salary = {};
    preferencesData.salary.minimum = searchPrefs.salary_min;

    if (!preferencesData.companies) preferencesData.companies = {};
    preferencesData.companies.excluded = searchPrefs.excluded_companies;
    preferencesData.companies.preferred = searchPrefs.preferred_companies;

    return writeJson(PREFERENCES_PATH, preferencesData);
  } catch (error) {
    console.error("Failed to update search preferences:", error);
    return false;
  }
}

export async function updateCommonAnswers(
  answers: CommonAnswers
): Promise<boolean> {
  try {
    const preferencesData = await readJson<any>(PREFERENCES_PATH);
    if (!preferencesData) return false;

    preferencesData.common_answers = answers;
    return writeJson(PREFERENCES_PATH, preferencesData);
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
