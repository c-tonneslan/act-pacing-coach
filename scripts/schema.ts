import { z } from "zod";

export const QuestionSchema = z.object({
  prompt: z.string().min(5),
  choices: z.array(z.string().min(1)).length(5),
  correctIndex: z.number().int().min(0).max(4),
  difficulty: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  topic: z.enum([
    "pre-algebra",
    "elementary-algebra",
    "intermediate-algebra",
    "coordinate-geometry",
    "plane-geometry",
    "trigonometry",
  ]),
  targetSeconds: z.number().int().positive(),
  explanation: z.string().min(5),
});

export const GenerationSchema = z.object({
  questions: z.array(QuestionSchema),
});

export type GeneratedQuestion = z.infer<typeof QuestionSchema>;
