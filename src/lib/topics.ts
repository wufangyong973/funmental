export type TopicId = 'general' | 'science' | 'history' | 'geography' | 'screen' | 'music' | 'sports' | 'food'

export interface TopicMeta {
  id: TopicId
  name: string
  emoji: string
}

/** Also the order the Daily Dive rotates through, one topic per day. */
export const TOPICS: TopicMeta[] = [
  { id: 'general', name: 'General Knowledge', emoji: '🧠' },
  { id: 'history', name: 'History', emoji: '🏛️' },
  { id: 'science', name: 'Science & Nature', emoji: '🔬' },
  { id: 'screen', name: 'Movies & TV', emoji: '🎬' },
  { id: 'geography', name: 'Geography', emoji: '🌍' },
  { id: 'music', name: 'Music', emoji: '🎵' },
  { id: 'sports', name: 'Sports', emoji: '🏅' },
  { id: 'food', name: 'Food & Drink', emoji: '🍜' },
]

export type PracticeTopic = TopicId | 'mixed'

export const MIXED = { id: 'mixed' as const, name: 'Mixed', emoji: '🎲' }

export const topicMeta = (id: PracticeTopic) => (id === 'mixed' ? MIXED : TOPICS.find((t) => t.id === id)!)

export const isTopic = (s: string | undefined): s is TopicId => TOPICS.some((t) => t.id === s)
export const isPracticeTopic = (s: string | undefined): s is PracticeTopic => s === 'mixed' || isTopic(s)
