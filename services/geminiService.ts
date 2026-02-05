
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, LineItem } from "../types";

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
      model: 'gemini-3-flash-preview',
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
      model: 'gemini-3-pro-preview',
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
      model: 'gemini-3-pro-preview',
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
      model: 'gemini-3-pro-preview',
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
      model: 'gemini-3-flash-preview',
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
      model: 'gemini-3-flash-preview',
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
      model: 'gemini-3-flash-preview',
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
