export const QUIZ_SIZE = 5;

export type QuizQuestionClient = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  difficulty: number;
};

export type QuizAnswerInput = { questionId: string; selectedOptionId: string };
