/** Difficulty 1 (Sunlight, easy) to 5 (Hadal, expert). */
export type Difficulty = 1 | 2 | 3 | 4 | 5

/**
 * One question as written in a topic bank: [difficulty, prompt, correct answer,
 * wrong answer, wrong answer, wrong answer, optional one-line explanation].
 * The correct answer is always listed first; choices are shuffled when shown.
 */
export type RawQuestion = [Difficulty, string, string, string, string, string, string?]
