
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, LineItem, PrescriptionData } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const analyzeMedicalImage = async (
  base64Data: string, 
  reportType: string,
  mimeType: string = 'image/jpeg'
): Promise<AnalysisResult> => {
  const ai = getAIClient();
  const prompt = `You are a world-class senior medical diagnostic assistant. Analyze this ${reportType} report/document. 
  Provide a detailed clinical summary including:
  1. Key Observations and Data Points
  2. Potential Clinical Implications
  3. Suggested Next Steps or Further Investigations
  Keep it professional, concise, and structured. Disclaimer: This is an AI-generated analysis for educational purposes.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: prompt }
        ]
      }
    });

    return {
      title: `${reportType} Analysis`,
      content: response.text || "Unable to process the document.",
      type: 'image-analysis'
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      title: "Analysis Failed",
      content: "An error occurred while communicating with the AI. Please try again.",
      type: 'error'
    };
  }
};

export const analyzeDermatologyImage = async (
  base64Data: string
): Promise<AnalysisResult> => {
  const ai = getAIClient();
  const prompt = `Act as MEDGEMMA, a specialized AI for Dermatological Pathology. 
  Analyze the attached skin lesion/dermatological image.
  
  Please provide a structured clinical assessment:
  1. Lesion Morphology: (e.g., Macule, Papule, Nodule, Plaque, etc.)
  2. Visual Characteristics: (Color, borders, surface texture)
  3. ABCDE Assessment (if applicable):
     - Asymmetry
     - Border Irregularity
     - Color Variegation
     - Diameter/Evolution
  4. Differential Diagnosis: List 3-4 possible conditions in order of likelihood.
  5. Recommended Clinical Correlates: (e.g., Dermoscopy, Biopsy, Patch Testing)

  IMPORTANT: Maintain a professional, clinical tone. Start with 'MedGemma Assessment Summary'. 
  Disclaimer: For clinical decision support only. Final diagnosis must be by a board-certified dermatologist.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      }
    });

    return {
      title: `MedGemma Dermatology Analysis`,
      content: response.text || "Unable to analyze the skin lesion.",
      type: 'image-analysis'
    };
  } catch (error) {
    console.error("Dermatology Analysis Error:", error);
    return {
      title: "Dermatology AI Error",
      content: "An error occurred during specialized MedGemma processing.",
      type: 'error'
    };
  }
};

export const analyzeRetinaImage = async (
  base64Data: string
): Promise<AnalysisResult> => {
  const ai = getAIClient();
  const prompt = `Act as RETINAAI, a world-class AI Ophthalmologist. 
  Analyze the attached fundus (retina) image for clinical pathologies.
  
  Please provide a detailed report:
  1. Optic Disc Assessment: (Color, margins, cup-to-disc ratio estimate)
  2. Vascular Evaluation: (A/V ratio, presence of nicking, tortuosity)
  3. Macular Findings: (Foveal reflex, presence of edema, drusen, or scars)
  4. Peripheral Retina: (Hemorrhages, microaneurysms, cotton wool spots, exudates)
  5. Clinical Impression & Staging: (e.g., Grading of Diabetic Retinopathy, signs of Hypertensive Retinopathy)
  6. Suggested Management: (e.g., OCT, Fluorescein Angiography, Urgent Referral)

  Disclaimer: This is for clinical decision support. Final diagnosis must be by a qualified ophthalmologist.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      }
    });

    return {
      title: `Retina AI Fundus Report`,
      content: response.text || "Unable to analyze the retina image.",
      type: 'image-analysis'
    };
  } catch (error) {
    console.error("Retina Analysis Error:", error);
    return {
      title: "Retina AI Error",
      content: "An error occurred during specialized ophthalmic processing.",
      type: 'error'
    };
  }
};

export const optimizeBilling = async (items: LineItem[]): Promise<AnalysisResult> => {
  const ai = getAIClient();
  const prompt = `As a Medical Billing & Coding Expert, review the following clinical service items:
  ${items.map(i => `- ${i.description} (Qty: ${i.quantity}, Price: ${i.unitPrice})`).join('\n')}

  Please provide:
  1. Potential CPT/ICD coding suggestions.
  2. Flag any missing standard charges for the described services.
  3. Suggestions for bundling or up-coding (if clinically justified).
  4. Compliance check for excessive charging or double billing.
  
  Maintain a professional and helpful tone for the doctor.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return {
      title: "Billing AI Optimization",
      content: response.text || "No optimization suggestions available.",
      type: 'text'
    };
  } catch (error) {
    return {
      title: "Optimization Error",
      content: "Failed to analyze billing data.",
      type: 'error'
    };
  }
};

export const generateGrowthStrategy = async (
  category: 'CONTENT' | 'BRANDING' | 'MARKETING' | 'SALES',
  context: string
): Promise<AnalysisResult> => {
  const ai = getAIClient();
  const prompts = {
    CONTENT: `Generate 5 engaging social media content ideas (Instagram Reels, Blog posts, or patient education newsletters) for a medical professional. Focus: ${context}. Include hooks and key talking points.`,
    BRANDING: `Brainstorm clinic names, slogans, and visual identity concepts for a new medical practice. Focus: ${context}. Suggest a professional color palette and tone of voice.`,
    MARKETING: `Create a patient outreach/marketing campaign plan for ${context}. Include target audience, channels (WhatsApp, Email, Facebook), and a draft message template.`,
    SALES: `Provide 5 strategies to improve patient retention and appointment conversion rates for: ${context}. Focus on ethical patient journey optimization.`
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompts[category],
    });

    return {
      title: `Growth AI: ${category}`,
      content: response.text || "Unable to generate growth ideas.",
      type: 'text'
    };
  } catch (error) {
    return {
      title: "Growth AI Error",
      content: "Failed to connect to the growth engine. Please try again.",
      type: 'error'
    };
  }
};

export const searchMedicalQueries = async (query: string): Promise<AnalysisResult> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return {
      title: "AI Medical Search",
      content: response.text || "No results found.",
      type: 'text',
      sources: sources as any
    };
  } catch (error) {
    return {
      title: "Search Error",
      content: "Could not fetch medical data. Check your connection.",
      type: 'error'
    };
  }
};

export const searchDrugInfo = async (drugName: string): Promise<AnalysisResult> => {
  const ai = getAIClient();
  const prompt = `Search for the drug "${drugName}" in the context of the Indian Pharmaceutical Market. 
  Provide a list of popular brands available in India, their manufacturers, and their approximate retail prices (MRP in INR). 
  Crucially, list the brands in order of price, with the most economical (cheapest) brands at the very top.
  Include information on:
  - Brand Name
  - Manufacturer
  - Strength/Formulation
  - Price per strip/unit
  - Common therapeutic uses
  Format the output clearly for a clinician to review.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return {
      title: `Drug Info: ${drugName}`,
      content: response.text || "No drug information found.",
      type: 'text',
      sources: sources as any
    };
  } catch (error) {
    return {
      title: "Search Error",
      content: "Failed to fetch pharmacy data.",
      type: 'error'
    };
  }
};

export const auditMedicalBill = async (base64Data: string): Promise<AnalysisResult> => {
  const ai = getAIClient();
  const prompt = `Review this medical bill/invoice. 
  1. Identify the services charged.
  2. Check for potential excessive charges or common billing errors.
  3. Suggest if prices seem fair based on general medical standards.
  4. Look for hidden charges or duplicate entries.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      }
    });

    return {
      title: "Bill Audit Result",
      content: response.text || "Unable to audit the bill.",
      type: 'image-analysis'
    };
  } catch (error) {
    return {
      title: "Audit Error",
      content: "Failed to process the bill. Please try again.",
      type: 'error'
    };
  }
};

export const analyzePrescriptionImage = async (
  base64Data: string,
  mimeType: string = 'image/jpeg'
): Promise<Partial<PrescriptionData>> => {
  const ai = getAIClient();
  const prompt = `You are a medical scribe. Analyze the attached medical document (it could be a hand-written prescription or a lab report). 
  Extract all relevant information and return it in a structured JSON format.
  Identify:
  - Patient Name
  - Age
  - Gender
  - Symptoms/Complaints
  - Vitals (BP, Heart Rate, Temperature, Weight)
  - Diagnosis
  - Treatment/Medications (including dosage and duration)
  - Investigations/Lab Values
  - Follow-up Date
  
  If a field is not found, leave it empty.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            patientName: { type: Type.STRING },
            age: { type: Type.STRING },
            gender: { type: Type.STRING },
            symptoms: { type: Type.STRING },
            vitals: {
              type: Type.OBJECT,
              properties: {
                bp: { type: Type.STRING },
                hr: { type: Type.STRING },
                temp: { type: Type.STRING },
                weight: { type: Type.STRING }
              }
            },
            diagnosis: { type: Type.STRING },
            treatment: { type: Type.STRING },
            medications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  frequency: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  route: { type: Type.STRING }
                }
              }
            },
            investigations: { type: Type.STRING },
            labReport: { type: Type.STRING },
            followUpDate: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return {};
  } catch (error) {
    console.error("Prescription Analysis Error:", error);
    throw error;
  }
};

export const summarizePrescription = async (data: PrescriptionData): Promise<string> => {
  const ai = getAIClient();
  const prompt = `As a medical assistant, provide a concise, professional summary of this prescription for the patient. 
  Focus on the diagnosis, key medications (from the structured list and general treatment section), and important instructions.
  
  Prescription Data:
  ${JSON.stringify(data, null, 2)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    return response.text || "Unable to generate summary.";
  } catch (error) {
    console.error("Summary Error:", error);
    return "Error generating summary.";
  }
};

export const analyzePrescriptionWithMedGemma = async (data: PrescriptionData): Promise<string> => {
  const ai = getAIClient();
  const prompt = `Act as MEDGEMMA, a world-class clinical decision support AI. 
  Analyze this prescription (including the structured medications list) for clinical accuracy, potential drug-drug interactions, contraindications, and adherence to standard guidelines.
  
  Provide:
  1. Clinical Rationale Review
  2. Potential Safety Flags (Interactions/Allergies/Contraindications)
  3. Evidence-Based Suggestions
  4. Patient Education Points
  
  Prescription Data:
  ${JSON.stringify(data, null, 2)}
  
  Disclaimer: For clinical decision support only. Final decision must be by a board-certified physician.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
    });
    return response.text || "Unable to analyze prescription.";
  } catch (error) {
    console.error("MedGemma Analysis Error:", error);
    return "Error during MedGemma analysis.";
  }
};

export const suggestTreatment = async (data: Partial<PrescriptionData>): Promise<Partial<PrescriptionData>> => {
  const ai = getAIClient();
  const prompt = `Based on the patient's symptoms and diagnosis, suggest a treatment plan including medications (name, dosage, frequency, duration, route) and general instructions.
  Symptoms: ${data.symptoms}
  Diagnosis: ${data.diagnosis}
  Vitals: ${JSON.stringify(data.vitals)}
  
  Return the suggestions in a structured JSON format.
  If you suggest medications, provide them in the 'medications' array.
  General instructions should be in the 'treatment' field.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            treatment: { type: Type.STRING },
            medications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  frequency: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  route: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return {};
  } catch (error) {
    console.error("Treatment Suggestion Error:", error);
    throw error;
  }
};

export const predictOutbreaks = async (
  location: string,
  stats: {
    covidCases: number[];
    influenzaCases: number[];
    diarrhoeaCases: number[];
    tbCases: number[];
    typhoidCases: number[];
    dengueCases: number[];
    malariaCases: number[];
    diabetesCases?: number[];
    hypertensionCases?: number[];
    copdCases?: number[];
    cadCases?: number[];
  },
  recentDiagnoses: string[],
  healthAuthorityWarning: string
): Promise<string> => {
  const ai = getAIClient();
  const prompt = `You are a world-class epidemiologist and public health surveillance AI assistant specializing in both infectious diseases (IDSP, NTEP, NVBDCP) and non-communicable diseases (NPCDCS / NP-NCD) under the Government of India's health guidelines.
  Analyze the following public health and chronic disease surveillance data for the location: "${location}".

  Weekly case numbers for the last 4 weeks:
  - COVID-19 cases: ${stats.covidCases.join(" -> ")}
  - Influenza cases: ${stats.influenzaCases.join(" -> ")}
  - Diarrheal disease cases: ${stats.diarrhoeaCases.join(" -> ")}
  - Tuberculosis (TB) cases (NTEP surveillance): ${stats.tbCases.join(" -> ")}
  - Typhoid (Enteric fever) cases: ${stats.typhoidCases.join(" -> ")}
  - Dengue cases (NVBDCP vector surveillance): ${stats.dengueCases.join(" -> ")}
  - Malaria cases (NVBDCP vector surveillance): ${stats.malariaCases.join(" -> ")}
  - Diabetes Mellitus (NCD register): ${(stats.diabetesCases || []).join(" -> ")}
  - Hypertension / Cardiovascular (NCD register): ${(stats.hypertensionCases || []).join(" -> ")}
  - COPD / Respiratory NCDs: ${(stats.copdCases || []).join(" -> ")}
  - Coronary Artery Disease (CAD / Ischemic Heart): ${(stats.cadCases || []).join(" -> ")}

  Clinician's recently logged local patient diagnoses in this clinic:
  ${recentDiagnoses.length > 0 ? recentDiagnoses.map(d => `- ${d}`).join("\n") : "None logged recently."}

  Current warning from Local Healthcare Authority (MoHFW, WHO, or ICMR):
  "${healthAuthorityWarning}"

  Please provide a detailed Epidemiological & NCD Burden Report and Outbreak/Complication Prediction for the Indian subcontinent:
  1. **Regional Assessment**: Assess the current trend of both monitored infectious diseases (Rising, Stable, Falling) and the burden of non-communicable disease (NCD) metrics like diabetes control, cardiovascular strain, and COPD exacerbation risks under Delhi NCR.
  2. **Risk & Trend Prediction**: Predict the likelihood of outbreaks or NCD complications (e.g., seasonal respiratory crises for COPD, cardiovascular stress during extreme heat/pollution, etc.) over the next 14-30 days with a percentage estimate and clinical rationale.
  3. **Prescription Feed Correlate**: Correlate the clinician's recent patient diagnoses with the regional trends (are we seeing early sentinel cases of an outbreak, or a rising burden of chronic diabetic/hypertensive patients in this clinic?).
  4. **Clinical Action Plan**: Actionable recommendations for healthcare providers (preventive immunization, diagnostic testing protocols, DOTS enforcement for TB, lifestyle coaching and routine screening for NCDs, rational prescribing, and proper clinical transfers).

  Keep the response highly professional, clinical, well-structured, and easy to read. Return clean markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    return response.text || "Unable to generate outbreak prediction report.";
  } catch (error) {
    console.error("Outbreak Prediction Error:", error);
    return "Error connecting to AI Epidemic Model. Please try again.";
  }
};

export const analyzePatientHealth = async (data: {
  symptoms: string;
  medications: string;
  labs: string;
  radiology: string;
  wearables: string;
  visitNotes: string;
  customDetails?: string;
  hasUploadedRecords?: boolean;
}): Promise<string> => {
  const ai = getAIClient();
  const prompt = `You are MECHANA, a compassionate, brilliant, world-class personal AI health optimizer and clinical guide. 
  Your task is to analyze the patient's comprehensive health data alongside the world's medical knowledge to help them understand what is happening in their body.
  
  PATIENT DATA PROVIDED:
  - **Symptom Profile & Duration**: ${data.symptoms || "None reported."}
  - **Medications & Supplements**: ${data.medications || "None listed."}
  - **Lab Results (Blood, Urine, etc.)**: ${data.labs || "None uploaded / entered."}
  - **Radiology Findings (X-Rays, MRIs, Ultrasounds, etc.)**: ${data.radiology || "None uploaded / entered."}
  - **Wearable & Device Metrics (Heart rate, sleep logs, blood pressure, steps, etc.)**: ${data.wearables || "None linked."}
  - **Recent Visit Notes & Clinician Summaries**: ${data.visitNotes || "None documented."}
  - **Additional Patient Context**: ${data.customDetails || "None provided."}

  Please generate a highly polished, detailed, and compassionate "MEGANA HEALTH ANALYSIS & OPTIMIZATION REPORT".
  Ensure your tone is professional, empathetic, clear, and reassuring, avoiding alarmism while maintaining strict medical accuracy. 

  Structure the analysis exactly under these Markdown headings:
  
  ### 🌟 1. Compassionate Clinical Summary
  (Provide a high-level overview explaining what might be happening, drawing from world-class medical knowledge, in language a patient can easily grasp.)
  
  ### 📜 2. Symptom Timeline & Sequence of Events
  (Break the patient's active health complaints down chronologically. Create a sequential timeline/flow of events that explains how symptom A relates to symptom B, showing cause-and-effect paths.)
  
  ### 🧪 3. Lab Report Analysis
  (Review and explain any uploaded/entered lab metrics. Decrypt what normal/abnormal ranges signify, how they correlate with symptoms, and what physiological processes are involved.)
  
  ### 📷 4. Radiology Decryption
  (Translate any imaging or scan findings into highly visual, simple terms. Explain precisely what the radiologist's notes mean for the patient's structural or functional health.)
  
  ### 💊 5. Current Treatment & Medication Review
  (Analyze their list of current medications and treatment protocols. Discuss what each medication is targeting, how they interact, and general compliance best practices.)
  
  ### 📈 6. Continuous Optimization Plan (Between Visits)
  (Provide concrete, actionable, day-to-day strategies for nutrition, hydration, physical activity, sleep hygiene, and symptom tracking to help the patient optimize their health continually prior to their next clinician consult.)
  
  ### ⚠️ Important Patient Safety Notice
  (A clear reminder that this is educational support, and they must always confirm health updates or changes with their professional clinician.)`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview', // Pro preview has excellent medical reasoning
      contents: prompt,
    });
    return response.text || "Megana is currently digesting your logs, please retry in a moment.";
  } catch (error) {
    console.error("Megana Health Analysis Error:", error);
    try {
      // Fallback to flash if pro has issues or transient errors
      const responseFallback = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });
      return responseFallback.text || "Failed to finalize analysis.";
    } catch (fallbackError) {
      console.error("Megana Fallback Error:", fallbackError);
      return "Megana AI is temporarily offline, please check your network connection and try again.";
    }
  }
};


