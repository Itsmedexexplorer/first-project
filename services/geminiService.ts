interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

class GeminiService {
  private apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta';

  async generateTherapyResponse(userMessage: string, context: string[] = []): Promise<string> {
    try {
      const systemPrompt = `You are a compassionate AI mental health companion. Provide empathetic, supportive responses that:
      - Show understanding and validation
      - Ask thoughtful follow-up questions
      - Suggest healthy coping strategies when appropriate
      - Encourage professional help for serious concerns
      - Keep responses concise but meaningful (2-3 sentences)
      - Use a warm, non-judgmental tone
      
      Important: If the user expresses thoughts of self-harm or suicide, immediately encourage them to contact emergency services or a crisis hotline.`;

      const contextString = context.length > 0 ? `Previous context: ${context.join(' ')}` : '';
      const fullPrompt = `${systemPrompt}\n\n${contextString}\n\nUser: ${userMessage}\n\nResponse:`;

      const response = await fetch(`${this.baseURL}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I understand. Could you tell me more about how you\'re feeling?';
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.getMockTherapyResponse(userMessage);
    }
  }

  async analyzeMoodFromText(text: string): Promise<{
    mood: 'excellent' | 'good' | 'okay' | 'low' | 'terrible';
    intensity: number;
    tags: string[];
  }> {
    try {
      const prompt = `Analyze the emotional tone of this text and respond with ONLY a JSON object:
      "${text}"
      
      Respond with this exact format:
      {"mood": "excellent|good|okay|low|terrible", "intensity": 1-10, "tags": ["brief supportive observation"]}`;

      const response = await fetch(`${this.baseURL}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 100,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const result = JSON.parse(resultText);
      
      return {
        mood: result.mood || 'okay',
        intensity: result.intensity || 5,
        tags: result.tags || ['Thank you for sharing your thoughts with me.']
      };
    } catch (error) {
      console.error('Gemini Mood Analysis Error:', error);
      return this.getMockMoodAnalysis(text);
    }
  }

  private getMockTherapyResponse(userMessage: string): string {
    const responses = [
      "I hear you, and I want you to know that your feelings are completely valid. What's been weighing on your mind lately?",
      "Thank you for sharing that with me. It takes courage to open up about difficult emotions. How are you taking care of yourself today?",
      "I can sense that you're going through something challenging right now. Remember, it's okay to take things one step at a time.",
      "Your willingness to reach out shows real strength. What kind of support feels most helpful to you right now?",
      "I understand this is hard for you. Sometimes just expressing our thoughts can help us process them. What would help you feel a bit better today?",
      "That sounds really difficult. You're not alone in feeling this way. What are some things that usually help you cope when you're feeling like this?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getMockMoodAnalysis(text: string): {
    mood: 'excellent' | 'good' | 'okay' | 'low' | 'terrible';
    intensity: number;
    tags: string[];
  } {
    const positiveWords = ['happy', 'great', 'awesome', 'good', 'wonderful', 'amazing', 'excited', 'grateful'];
    const negativeWords = ['sad', 'terrible', 'awful', 'bad', 'horrible', 'depressed', 'anxious', 'worried'];
    
    const words = text.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    const score = positiveCount - negativeCount;
    
    let mood: 'excellent' | 'good' | 'okay' | 'low' | 'terrible';
    let intensity: number;
    
    if (score >= 2) {
      mood = 'excellent';
      intensity = Math.min(10, 8 + score);
    } else if (score >= 1) {
      mood = 'good';
      intensity = 6 + score;
    } else if (score >= -1) {
      mood = 'okay';
      intensity = 5;
    } else if (score >= -2) {
      mood = 'low';
      intensity = 4 + score;
    } else {
      mood = 'terrible';
      intensity = Math.max(1, 3 + score);
    }
    
    const tags = [
      "I can see you're expressing some deep feelings here.",
      "Thank you for being open about your emotional state.",
      "Your self-awareness is a strength in your wellness journey."
    ];
    
    return {
      mood,
      intensity,
      tags: [tags[Math.floor(Math.random() * tags.length)]]
    };
  }
}

export const geminiService = new GeminiService();