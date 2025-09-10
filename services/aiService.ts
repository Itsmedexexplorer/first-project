import { MoodType, VoiceAnalysis, AIMessage } from '@/types';
import { geminiService } from './geminiService';

class AIService {
  // Enhanced mood analysis using Gemini
  async analyzeMoodFromText(text: string): Promise<{ mood: MoodType; intensity: number; tags: string[] }> {
    try {
      const analysis = await geminiService.analyzeMoodFromText(text);
                  return {
        mood: analysis.mood,
        intensity: analysis.intensity,
        tags: analysis.tags || ['Thank you for sharing']
      };
    } catch (error) {
      console.error('Error in mood analysis:', error);
      return this.fallbackMoodAnalysis(text);
    }
  }

  // Enhanced AI conversation using Gemini
  async generateResponse(userMessage: string, context: AIMessage[]): Promise<string> {
    try {
      const contextMessages = context
        .filter(msg => msg.isUser)
        .slice(-3) // Last 3 user messages for context
        .map(msg => msg.content);
      
      return await geminiService.generateTherapyResponse(userMessage, contextMessages);
    } catch (error) {
      console.error('Error generating AI response:', error);
      return this.fallbackResponse(userMessage);
    }
  }

  // Fallback mood analysis (original mock implementation)
  private fallbackMoodAnalysis(text: string): { mood: MoodType; intensity: number; tags: string[] } {
    const positiveWords = ['happy', 'great', 'awesome', 'good', 'wonderful', 'amazing'];
    const negativeWords = ['sad', 'terrible', 'awful', 'bad', 'horrible', 'depressed'];
    const anxietyWords = ['worried', 'anxious', 'stressed', 'nervous', 'overwhelmed'];
    
    const words = text.toLowerCase().split(' ');
    let positiveScore = 0;
    let negativeScore = 0;
    let anxietyScore = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
      if (anxietyWords.includes(word)) anxietyScore++;
    });
    
    const totalScore = positiveScore - negativeScore - anxietyScore;
    const tags = [];
    
    if (anxietyScore > 0) tags.push('anxiety');
    if (negativeScore > positiveScore) tags.push('support-needed');
    if (positiveScore > 0) tags.push('positive');
    
    let mood: MoodType;
    let intensity: number;
    
    if (totalScore >= 2) {
      mood = 'excellent';
      intensity = Math.min(10, 7 + totalScore);
    } else if (totalScore >= 1) {
      mood = 'good';
      intensity = 6 + totalScore;
    } else if (totalScore >= -1) {
      mood = 'okay';
      intensity = 5;
    } else if (totalScore >= -2) {
      mood = 'low';
      intensity = 4 + totalScore;
    } else {
      mood = 'terrible';
      intensity = Math.max(1, 3 + totalScore);
    }
    
    return { mood, intensity, tags };
  }

  // Fallback response (original mock implementation)
  private fallbackResponse(userMessage: string): string {
    const responses = [
      "I understand how you're feeling. Would you like to talk more about what's on your mind?",
      "Thank you for sharing that with me. Your feelings are completely valid.",
      "It sounds like you're going through a challenging time. Remember, it's okay to take things one step at a time.",
      "I hear you. Sometimes just expressing our thoughts can help us process them better.",
      "That's a great insight. How do you think you might approach this situation?",
      "Your strength in reaching out shows real courage. What support do you feel you need right now?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Mock voice analysis (unchanged)
  async analyzeVoice(): Promise<VoiceAnalysis> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const tones: Array<'calm' | 'stressed' | 'happy' | 'sad' | 'anxious'> = ['calm', 'happy', 'stressed', 'sad'];
    
    return {
      tone: tones[Math.floor(Math.random() * tones.length)],
      energy: Math.floor(Math.random() * 10) + 1,
      clarity: Math.floor(Math.random() * 10) + 1
    };
  }

  // Crisis detection (enhanced)
  detectCrisis(text: string): boolean {
    const crisisKeywords = [
      'hurt myself', 'end it all', 'no point', 'suicide', 'kill myself',
      'want to die', 'better off dead', 'end my life', 'not worth living'
    ];
    const lowercaseText = text.toLowerCase();
    return crisisKeywords.some(keyword => lowercaseText.includes(keyword));
  }
}

export const aiService = new AIService();