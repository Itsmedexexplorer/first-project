// OpenAI API Integration Service
// To use: Replace 'YOUR_API_KEY_HERE' with your actual OpenAI API key

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

class OpenAIService {
  private apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'YOUR_API_KEY_HERE';
  private baseURL = 'https://api.openai.com/v1';

  async generateTherapyResponse(userMessage: string, context: string[] = []): Promise<string> {
    if (this.apiKey === 'YOUR_API_KEY_HERE') {
      // Return mock response if no API key is set
      return this.getMockTherapyResponse(userMessage);
    }

    try {
      const messages: OpenAIMessage[] = [
        {
          role: 'system',
          content: `You are a compassionate AI mental health companion. Provide empathetic, supportive responses that:
          - Show understanding and validation
          - Ask thoughtful follow-up questions
          - Suggest healthy coping strategies when appropriate
          - Encourage professional help for serious concerns
          - Keep responses concise but meaningful (2-3 sentences)
          - Use a warm, non-judgmental tone
          
          Important: If the user expresses thoughts of self-harm or suicide, immediately encourage them to contact emergency services or a crisis hotline.`
        },
        ...context.map(msg => ({ role: 'user' as const, content: msg })),
        { role: 'user', content: userMessage }
      ];

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'I understand. Could you tell me more about how you\'re feeling?';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return this.getMockTherapyResponse(userMessage);
    }
  }

  async analyzeMoodFromText(text: string): Promise<{
    mood: 'excellent' | 'good' | 'okay' | 'low' | 'terrible';
    intensity: number;
    insights: string[];
  }> {
    if (this.apiKey === 'YOUR_API_KEY_HERE') {
      return this.getMockMoodAnalysis(text);
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Analyze the emotional tone of the user's text and respond with a JSON object containing:
              - mood: one of "excellent", "good", "okay", "low", "terrible"
              - intensity: number from 1-10
              - insights: array of 1-2 brief supportive observations about their emotional state
              
              Example: {"mood": "low", "intensity": 3, "insights": ["You seem to be going through a difficult time", "It's brave of you to express these feelings"]}`
            },
            { role: 'user', content: text }
          ],
          max_tokens: 100,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      const result = JSON.parse(data.choices[0]?.message?.content || '{}');
      
      return {
        mood: result.mood || 'okay',
        intensity: result.intensity || 5,
        insights: result.insights || ['Thank you for sharing your thoughts with me.']
      };
    } catch (error) {
      console.error('OpenAI Mood Analysis Error:', error);
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
    insights: string[];
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
    
    const insights = [
      "I can see you're expressing some deep feelings here.",
      "Thank you for being open about your emotional state.",
      "Your self-awareness is a strength in your wellness journey."
    ];
    
    return {
      mood,
      intensity,
      insights: [insights[Math.floor(Math.random() * insights.length)]]
    };
  }
}

export const openAIService = new OpenAIService();