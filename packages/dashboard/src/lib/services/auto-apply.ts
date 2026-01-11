// Auto-Apply Service - Browser automation for job applications
// This service provides instructions and data for the chrome-devtools MCP

import { getPreferences, matchQATemplate } from "@/lib/actions/config";
import { getDefaultResume } from "@/lib/actions/resumes";

export interface ApplyFormData {
  // Personal info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;

  // Common answers
  willingToRelocate: string;
  workAuthorization: string;
  visaSponsorshipRequired: string;
  salaryExpectation: string;

  // Resume
  resumePath: string | null;
}

export interface ApplyInstructions {
  jobUrl: string;
  formData: ApplyFormData;
  steps: string[];
  screenshotPath: string;
}

export async function prepareAutoApply(jobUrl: string): Promise<ApplyInstructions | null> {
  try {
    const preferences = await getPreferences();
    const defaultResume = await getDefaultResume();

    if (!preferences) {
      console.error("No preferences found");
      return null;
    }

    const formData: ApplyFormData = {
      firstName: preferences.personal_info.first_name,
      lastName: preferences.personal_info.last_name,
      email: preferences.personal_info.email,
      phone: preferences.personal_info.phone,
      linkedinUrl: preferences.personal_info.linkedin_url,
      githubUrl: preferences.personal_info.github_url,
      willingToRelocate: preferences.common_answers.willing_to_relocate,
      workAuthorization: preferences.common_answers.work_authorization,
      visaSponsorshipRequired: preferences.common_answers.visa_sponsorship_required,
      salaryExpectation: preferences.common_answers.salary_expectation,
      resumePath: defaultResume?.filePath || null,
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const screenshotPath = `./data/screenshots/apply-${timestamp}.png`;

    const steps = [
      `1. Navigate to: ${jobUrl}`,
      "2. Take a snapshot to identify form elements",
      "3. Fill form fields using the formData provided",
      "4. Upload resume if file input is found",
      "5. Take screenshot before submission",
      "6. Click submit button",
      "7. Take screenshot after submission",
    ];

    return {
      jobUrl,
      formData,
      steps,
      screenshotPath,
    };
  } catch (error) {
    console.error("Failed to prepare auto-apply:", error);
    return null;
  }
}

// Field mapping for common job application forms
export const FIELD_MAPPINGS = {
  firstName: [
    "first_name",
    "firstname",
    "fname",
    "given_name",
    "givenname",
    "name_first",
  ],
  lastName: [
    "last_name",
    "lastname",
    "lname",
    "family_name",
    "familyname",
    "surname",
    "name_last",
  ],
  email: ["email", "e-mail", "emailaddress", "email_address"],
  phone: ["phone", "telephone", "tel", "mobile", "phone_number", "phonenumber"],
  linkedin: ["linkedin", "linkedin_url", "linkedinurl", "linkedin_profile"],
  github: ["github", "github_url", "githuburl", "github_profile"],
  resume: ["resume", "cv", "attachment", "file", "upload"],
};

// Match form label to our data fields
export function matchFieldToData(
  label: string,
  formData: ApplyFormData
): string | null {
  const lower = label.toLowerCase().replace(/[^a-z]/g, "");

  // Check each field mapping
  for (const [field, patterns] of Object.entries(FIELD_MAPPINGS)) {
    for (const pattern of patterns) {
      if (lower.includes(pattern.replace(/_/g, ""))) {
        switch (field) {
          case "firstName":
            return formData.firstName;
          case "lastName":
            return formData.lastName;
          case "email":
            return formData.email;
          case "phone":
            return formData.phone;
          case "linkedin":
            return formData.linkedinUrl;
          case "github":
            return formData.githubUrl;
        }
      }
    }
  }

  // Check for common questions
  if (lower.includes("relocat")) {
    return formData.willingToRelocate;
  }
  if (lower.includes("authorization") || lower.includes("authoriz")) {
    return formData.workAuthorization;
  }
  if (lower.includes("visa") || lower.includes("sponsor")) {
    return formData.visaSponsorshipRequired;
  }
  if (lower.includes("salary") || lower.includes("compensation") || lower.includes("expectat")) {
    return formData.salaryExpectation;
  }

  return null;
}

// Generate fill_form elements from snapshot
export function generateFillFormElements(
  snapshotElements: Array<{ uid: string; label?: string; name?: string; placeholder?: string }>,
  formData: ApplyFormData
): Array<{ uid: string; value: string }> {
  const elements: Array<{ uid: string; value: string }> = [];

  for (const el of snapshotElements) {
    const label = el.label || el.name || el.placeholder || "";
    const value = matchFieldToData(label, formData);

    if (value) {
      elements.push({ uid: el.uid, value });
    }
  }

  return elements;
}
