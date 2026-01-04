import { createPartFromUri, Type, type ContentListUnion } from "@google/genai";
import { ai } from ".";

export const getBrandKit = async (image: File | Blob) => {
  const uploaded = await ai.files.upload({
    file: image,
    config: { displayName: "website_screenshot.png" },
  });

  let processed = await ai.files.get({ name: uploaded.name! });
  while (processed.state === "PROCESSING") {
    await new Promise((r) => setTimeout(r, 2000));
    processed = await ai.files.get({ name: uploaded.name! });
  }
  if (processed.state === "FAILED") {
    throw new Error("File processing failed");
  }
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `
Extract a brand kit from this website screenshot.
Return ONLY valid JSON with:
primaryColors, secondaryColors, fontStyles, designTone, brandPersonality, uiStyle
          `,
        },
        createPartFromUri(processed.uri!, processed.mimeType!),
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model: "models/gemini-3-pro-preview",
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["colors", "designTone", "uiStyle"],
        properties: {
          colors: {
            type: Type.OBJECT,
            required: ["primaryColor", "secondaryColor", "otherColor"],
            properties: {
              primaryColor: {
                type: Type.STRING,
              },
              secondaryColor: {
                type: Type.STRING,
              },
              otherColor: {
                type: Type.STRING,
              },
            },
          },

          designTone: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },

          uiStyle: {
            type: Type.STRING,
          },
        },
      },
    },
  });

  return response.text!;
};
