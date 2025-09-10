export interface PsychometricQuestion {
  id: string;
  question_text: string;
  question_type: 'NUMBER_SLIDER' | 'MCQ';
  hint?: string;
  slider_range?: {
    min: number;
    max: number;
    step?: number;
  };
  options?: {
    value: string;
    text: string;
  }[];
}

export interface PsychometricResponse {
  questionId: string;
  value: number | string;
  timestamp: Date;
}

export interface PsychometricResults {
  userId: string;
  responses: PsychometricResponse[];
  completedAt: Date;
  analysisProfile?: {
    socialConnectivity: 'low' | 'moderate' | 'high';
    stressLevel: 'low' | 'moderate' | 'high';
    wellnessHabits: 'poor' | 'fair' | 'good' | 'excellent';
    emotionalState: 'positive' | 'neutral' | 'negative';
    supportSystem: 'strong' | 'moderate' | 'weak';
  };
}

export const PSYCHOMETRIC_QUESTIONS: PsychometricQuestion[] = [
  {
    id: "q1_age",
    question_text: "What is your current age?",
    question_type: "NUMBER_SLIDER",
    hint: "Please be accurate for the best results.",
    slider_range: { min: 13, max: 99 }
  },
  {
    id: "q2_friends",
    question_text: "How many close friends would you say you have?",
    question_type: "NUMBER_SLIDER",
    hint: "These are people you can truly confide in.",
    slider_range: { min: 0, max: 20 }
  },
  {
    id: "q3_interaction",
    question_text: "On an average day, how many people do you interact with (in person or online)?",
    question_type: "NUMBER_SLIDER",
    hint: "Consider colleagues, classmates, service workers, etc.",
    slider_range: { min: 0, max: 50, step: 1 }
  },
  {
    id: "q4_parental_communication",
    question_text: "How often do you communicate with your parents or guardians?",
    question_type: "MCQ",
    options: [
      { value: "daily", text: "Daily" },
      { value: "several_times_a_week", text: "Several times a week" },
      { value: "weekly", text: "Weekly" },
      { value: "monthly", text: "Monthly" },
      { value: "less_than_monthly", text: "Less than monthly" }
    ]
  },
  {
    id: "q5_parental_sharing",
    question_text: "Do you feel comfortable sharing your thoughts and feelings with your parents or guardians?",
    question_type: "MCQ",
    options: [
      { value: "always", text: "Always" },
      { value: "sometimes", text: "Sometimes" },
      { value: "rarely", text: "Rarely" },
      { value: "never", text: "Never" }
    ]
  },
  {
    id: "q6_stress_level",
    question_text: "On a scale of 1-10, what is your current stress level?",
    question_type: "NUMBER_SLIDER",
    hint: "1 = No stress, 10 = Maximum stress",
    slider_range: { min: 1, max: 10, step: 1 }
  },
  {
    id: "q7_sleep_quality",
    question_text: "How would you rate your sleep quality over the last week?",
    question_type: "MCQ",
    options: [
      { value: "excellent", text: "Excellent" },
      { value: "good", text: "Good" },
      { value: "fair", text: "Fair" },
      { value: "poor", text: "Poor" }
    ]
  },
  {
    id: "q8_self_care",
    question_text: "How many days in the last week did you make time for a self-care activity?",
    question_type: "NUMBER_SLIDER",
    hint: "This includes hobbies, exercise, or relaxation.",
    slider_range: { min: 0, max: 7, step: 1 }
  },
  {
    id: "q9_daily_mood",
    question_text: "How would you describe your overall mood on an average day?",
    question_type: "MCQ",
    options: [
      { value: "mostly_positive", text: "Mostly positive" },
      { value: "neutral_or_fluctuating", text: "Neutral or fluctuating" },
      { value: "mostly_negative", text: "Mostly negative" }
    ]
  },
  {
    id: "q10_future_outlook",
    question_text: "How do you feel about your future?",
    question_type: "MCQ",
    options: [
      { value: "optimistic", text: "Optimistic and hopeful" },
      { value: "cautiously_optimistic", text: "Cautiously optimistic" },
      { value: "uncertain", text: "Uncertain" },
      { value: "pessimistic", text: "Pessimistic and worried" }
    ]
  }
];