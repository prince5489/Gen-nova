// import { GoogleGenAI } from "@google/genai";

// export async function main(prompt) {
//   try {
//     const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

//     if (!apiKey) {
//       throw new Error("API key not found. Please check your .env file.");
//     }

//     const ai = new GoogleGenAI({ apiKey });

//     const response = await ai.models.generateContent({
//       // model: "gemini-3.1-pro-preview", // stable model (important)
//       contents: [
//         {
//           role: "user",
//           parts: [{ text: prompt }],
//         },
//       ],
//     });

//     return response.text;
//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     return `Error: ${error.message}`;
//   }
// }

// export default main;


export async function main(prompt) {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("API key not found. Check your .env file.");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:5173", // optional but recommended
        "X-Title": "My App", // optional
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324", // fast + cheap
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("OpenRouter API Response:", data); // Debug log

    if (!response.ok) {
      throw new Error(data.error?.message || "API Error");
    }

    return data.choices[0].message.content;
    

  } catch (error) {
    console.error("OpenRouter API Error:", error);
    return `Error: ${error.message}`;
  }
}

export default main;