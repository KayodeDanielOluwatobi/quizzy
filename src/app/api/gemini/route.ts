import { NextResponse } from "next/server";

// ⚠️ Put your actual API Key here
const API_KEY = "AIzaSyD_9Ph6T70mvlFjaZN_NtFhSCI_1Oj20iU"; 

export async function POST(req: Request) {
  try {
    // 1. INPUT VALIDATION
    const body = await req.json().catch(() => ({}));
    const { name = "Student", question, selectedOption, correctAnswer, isCorrect } = body;

    if (!question || !selectedOption || !correctAnswer) {
      return NextResponse.json(
        { 
          explanation: "Missing quiz data. Please submit a valid question and answer.",
          technicalDetails: "The request body was missing required fields: question, selectedOption, or correctAnswer.",
          errorCode: "400 - Bad Request"
        },
        { status: 400 }
      );
    }

    // 2. THE STRICT PROFESSOR PROMPT
    const systemPrompt = `
      You are a strict, highly intellectual Anatomy Professor. The student's name is ${name}.
      
      CONTEXT:
      - Question: "${question}"
      - Student's Answer: "${selectedOption}"
      - Correct Answer: "${correctAnswer}"
      
      INSTRUCTIONS:
      1. DO NOT use greetings like "Ah ah" "Comrade Hi" "Hi", "Hello", or "Dear". Start immediately with the feedback.
      2. If CORRECT (${isCorrect}): Confirm it is correct. YOU MUST THEN explain further to solidify the concept more for the user.
      3. If WRONG: Say it is incorrect. YOU MUST THEN explain exactly why it is wrong and why "${correctAnswer}" is the correct anatomy.
      4. Tone: Professional and academic.
      5. Length: Exactly 2-3 sentences. Use 2-3 emojis sparingly and wisely.
    `;

    // 3. FETCH REQUEST
    const url = `https://generativelanguage.googleapis.com/v1alpha/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          
        }
      }),
    });

    // 4. ROBUST ERROR UX (YOUR CUSTOM LOGIC)
    if (!response.ok) {
      const errorStatus = response.status;
      
      if (errorStatus === 503) {
        return NextResponse.json(
          {
            explanation: "Comrade, the AI don tire small. Wait small and try again!",
            technicalDetails: "The Google AI server is currently overloaded with requests. This usually resolves in a few minutes.",
            errorCode: "503 - Service Unavailable"
          },
          { status: 503 }
        );
      }

      if (errorStatus === 429) {
        return NextResponse.json(
          {
            explanation: "Omo, you dey ask too many questions! Calm down, try again in a minute.",
            technicalDetails: "You've exceeded the API rate limit. Google restricts how many requests you can make per minute to prevent abuse.",
            errorCode: "429 - Too Many Requests"
          },
          { status: 429 }
        );
      }

      if (errorStatus === 401 || errorStatus === 403) {
        return NextResponse.json(
          {
            explanation: "Ehen! Something wrong with the API key. Contact the developer abeg.",
            technicalDetails: "The API key is either invalid, expired, or doesn't have permission to access the Gemini 3 model.",
            errorCode: `${errorStatus} - Authentication Error`
          },
          { status: errorStatus }
        );
      }

      // Generic Fetch Error
      return NextResponse.json(
        {
          explanation: "Comrade, my brain is tired right now (Network Error). Check your internet and try again.",
          technicalDetails: "An unexpected error occurred while communicating with the Google API.",
          errorCode: `${errorStatus} - API Request Failed`
        },
        { status: errorStatus }
      );
    }

    // 5. SUCCESS RESPONSE
    const data = await response.json();
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
      "The anatomy database is currently processing. Please consult your textbook.";

    return NextResponse.json({ explanation: aiResponse });

  } catch (error: any) {
    // 6. ULTIMATE CATCH-ALL (Internal Server Error)
    console.error("Server Error:", error);
    return NextResponse.json(
      {
        explanation: "Comrade, my brain is tired right now (Network Error). Check your internet and try again.",
        technicalDetails: error?.message || "Internal Node.js server error before reaching the Google API.",
        errorCode: "500 - Internal Server Error"
      },
      { status: 500 }
    );
  }
}