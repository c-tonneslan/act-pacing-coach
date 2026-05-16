export type Topic =
  | "pre-algebra"
  | "elementary-algebra"
  | "intermediate-algebra"
  | "coordinate-geometry"
  | "plane-geometry"
  | "trigonometry";

export interface Question {
  id: number;
  prompt: string;
  choices: string[];
  correctIndex: number;
  // 1 = easiest, 6 = hardest. The ACT math ramps from ~1 to ~6 across 60q.
  difficulty: 1 | 2 | 3 | 4 | 5 | 6;
  topic: Topic;
  // Pace target in seconds. Easier questions should be faster.
  targetSeconds: number;
  explanation: string;
}

// 20-question half-session. Roughly mirrors the ACT math difficulty ramp.
// Targets: D1=30s, D2=40s, D3=50s, D4=70s, D5=90s, D6=120s.
export const questions: Question[] = [
  {
    id: 1,
    prompt: "If x = 4, what is the value of 3x + 7?",
    choices: ["12", "15", "19", "21", "24"],
    correctIndex: 2,
    difficulty: 1,
    topic: "pre-algebra",
    targetSeconds: 30,
    explanation: "3(4) + 7 = 12 + 7 = 19.",
  },
  {
    id: 2,
    prompt: "What is 25% of 80?",
    choices: ["15", "18", "20", "22", "25"],
    correctIndex: 2,
    difficulty: 1,
    topic: "pre-algebra",
    targetSeconds: 30,
    explanation: "25% = 1/4, and 80/4 = 20.",
  },
  {
    id: 3,
    prompt:
      "A jacket originally costs $60. It is on sale for 30% off. What is the sale price?",
    choices: ["$30", "$36", "$42", "$45", "$48"],
    correctIndex: 2,
    difficulty: 1,
    topic: "pre-algebra",
    targetSeconds: 35,
    explanation: "30% of $60 is $18. $60 - $18 = $42.",
  },
  {
    id: 4,
    prompt: "Solve for x: 2x - 5 = 11.",
    choices: ["3", "5", "6", "8", "11"],
    correctIndex: 3,
    difficulty: 2,
    topic: "elementary-algebra",
    targetSeconds: 40,
    explanation: "2x = 16, so x = 8.",
  },
  {
    id: 5,
    prompt:
      "The average of 4 numbers is 12. If three of the numbers are 8, 10, and 14, what is the fourth number?",
    choices: ["12", "14", "16", "18", "20"],
    correctIndex: 2,
    difficulty: 2,
    topic: "pre-algebra",
    targetSeconds: 45,
    explanation:
      "The sum of all four numbers is 4 × 12 = 48. The three given sum to 32, so the fourth is 48 - 32 = 16.",
  },
  {
    id: 6,
    prompt: "If 3(x + 2) = 21, what is x?",
    choices: ["3", "5", "6", "7", "9"],
    correctIndex: 1,
    difficulty: 2,
    topic: "elementary-algebra",
    targetSeconds: 40,
    explanation: "Divide both sides by 3: x + 2 = 7, so x = 5.",
  },
  {
    id: 7,
    prompt:
      "The line y = 2x - 3 passes through which of the following points?",
    choices: ["(0, 3)", "(1, -1)", "(2, 1)", "(3, 4)", "(4, 6)"],
    correctIndex: 2,
    difficulty: 3,
    topic: "coordinate-geometry",
    targetSeconds: 50,
    explanation: "At x = 2: y = 2(2) - 3 = 1. The point (2, 1) is on the line.",
  },
  {
    id: 8,
    prompt:
      "A right triangle has legs of length 6 and 8. What is the length of the hypotenuse?",
    choices: ["10", "12", "14", "√48", "√100"],
    correctIndex: 0,
    difficulty: 3,
    topic: "plane-geometry",
    targetSeconds: 45,
    explanation: "6-8-10 Pythagorean triple. √(36 + 64) = √100 = 10.",
  },
  {
    id: 9,
    prompt:
      "If f(x) = x² - 2x + 1, what is f(3)?",
    choices: ["2", "4", "6", "8", "10"],
    correctIndex: 1,
    difficulty: 3,
    topic: "elementary-algebra",
    targetSeconds: 50,
    explanation: "f(3) = 9 - 6 + 1 = 4.",
  },
  {
    id: 10,
    prompt:
      "Factor the expression x² - 9.",
    choices: [
      "(x - 3)(x - 3)",
      "(x + 3)(x + 3)",
      "(x - 3)(x + 3)",
      "(x - 9)(x + 1)",
      "(x - 9)(x + 9)",
    ],
    correctIndex: 2,
    difficulty: 4,
    topic: "intermediate-algebra",
    targetSeconds: 60,
    explanation: "Difference of squares: x² - 9 = (x - 3)(x + 3).",
  },
  {
    id: 11,
    prompt:
      "The slope of the line passing through (2, 5) and (6, 13) is:",
    choices: ["1/2", "1", "2", "3", "4"],
    correctIndex: 2,
    difficulty: 4,
    topic: "coordinate-geometry",
    targetSeconds: 60,
    explanation: "(13 - 5) / (6 - 2) = 8 / 4 = 2.",
  },
  {
    id: 12,
    prompt:
      "What is the area of a circle with a radius of 5? (Use π ≈ 3.14.)",
    choices: ["15.7", "31.4", "62.8", "78.5", "157"],
    correctIndex: 3,
    difficulty: 4,
    topic: "plane-geometry",
    targetSeconds: 60,
    explanation: "A = πr² = 3.14 × 25 = 78.5.",
  },
  {
    id: 13,
    prompt:
      "If 2^x = 32, what is x?",
    choices: ["3", "4", "5", "6", "16"],
    correctIndex: 2,
    difficulty: 5,
    topic: "intermediate-algebra",
    targetSeconds: 70,
    explanation: "2^5 = 32, so x = 5.",
  },
  {
    id: 14,
    prompt:
      "The expression (3x²y)(2xy³) simplifies to:",
    choices: ["5x³y⁴", "6x²y³", "6x³y⁴", "6x³y³", "9x²y³"],
    correctIndex: 2,
    difficulty: 5,
    topic: "intermediate-algebra",
    targetSeconds: 75,
    explanation:
      "Multiply coefficients: 3 × 2 = 6. Add exponents: x² × x = x³, y × y³ = y⁴.",
  },
  {
    id: 15,
    prompt:
      "In the standard (x, y) coordinate plane, what is the distance between (1, 2) and (4, 6)?",
    choices: ["3", "4", "5", "7", "25"],
    correctIndex: 2,
    difficulty: 5,
    topic: "coordinate-geometry",
    targetSeconds: 80,
    explanation: "√((4-1)² + (6-2)²) = √(9 + 16) = √25 = 5.",
  },
  {
    id: 16,
    prompt:
      "The roots of x² - 5x + 6 = 0 are:",
    choices: ["1 and 6", "2 and 3", "-2 and -3", "-1 and -6", "0 and 5"],
    correctIndex: 1,
    difficulty: 5,
    topic: "intermediate-algebra",
    targetSeconds: 75,
    explanation: "Factors as (x - 2)(x - 3) = 0. Roots are 2 and 3.",
  },
  {
    id: 17,
    prompt:
      "In a right triangle, the angle θ has opposite side 3 and hypotenuse 5. What is sin(θ)?",
    choices: ["3/4", "3/5", "4/5", "5/3", "5/4"],
    correctIndex: 1,
    difficulty: 5,
    topic: "trigonometry",
    targetSeconds: 70,
    explanation: "sin = opposite/hypotenuse = 3/5.",
  },
  {
    id: 18,
    prompt:
      "If log₂(x) = 4, what is x?",
    choices: ["2", "4", "8", "16", "24"],
    correctIndex: 3,
    difficulty: 6,
    topic: "intermediate-algebra",
    targetSeconds: 90,
    explanation: "log₂(x) = 4 means 2⁴ = x, so x = 16.",
  },
  {
    id: 19,
    prompt:
      "A circle has center (3, -1) and passes through the point (6, 3). What is the equation of the circle?",
    choices: [
      "(x - 3)² + (y + 1)² = 5",
      "(x - 3)² + (y + 1)² = 25",
      "(x + 3)² + (y - 1)² = 25",
      "(x - 3)² + (y - 1)² = 25",
      "(x + 3)² + (y + 1)² = 5",
    ],
    correctIndex: 1,
    difficulty: 6,
    topic: "coordinate-geometry",
    targetSeconds: 110,
    explanation:
      "Radius² = (6 - 3)² + (3 - (-1))² = 9 + 16 = 25. Center (3, -1) gives (x - 3)² + (y + 1)² = 25.",
  },
  {
    id: 20,
    prompt:
      "For all θ where it is defined, the expression (sin²θ + cos²θ) / cos²θ equals:",
    choices: ["1", "sec²θ", "tan²θ", "csc²θ", "sin²θ"],
    correctIndex: 1,
    difficulty: 6,
    topic: "trigonometry",
    targetSeconds: 120,
    explanation:
      "sin²θ + cos²θ = 1, so the expression becomes 1/cos²θ = sec²θ.",
  },
];
