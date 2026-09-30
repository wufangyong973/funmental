import { useEffect, useRef, useState } from 'react'
import { checkInput } from '../lib/answers'
import { shuffle } from '../lib/random'
import { play } from '../lib/sound'
import type { BlankQuestion, ChoiceQuestion, InputQuestion, MatchQuestion, OrderQuestion, Question } from '../types'

interface Props<Q> {
  q: Q
  /** Once answered, inputs lock and the correct answer is revealed. */
  locked: boolean
  onSubmit: (correct: boolean) => void
  /** Number keys pick choices. Off where the question is embedded in a longer page. */
  keyboard?: boolean
}

export function QuestionView(props: Props<Question>) {
  const { q } = props
  // Keyed by id so each new question starts with fresh local state.
  switch (q.kind) {
    case 'choice':
      return <ChoiceView key={q.id} {...props} q={q} />
    case 'input':
      return <InputView key={q.id} {...props} q={q} />
    case 'match':
      return <MatchView key={q.id} {...props} q={q} />
    case 'order':
      return <OrderView key={q.id} {...props} q={q} />
    case 'blank':
      return <BlankView key={q.id} {...props} q={q} />
  }
}

function ChoiceView({ q, locked, onSubmit, keyboard = true }: Props<ChoiceQuestion>) {
  const [chosen, setChosen] = useState<number | null>(null)

  const choose = (i: number) => {
    if (locked) return
    setChosen(i)
    onSubmit(i === q.answerIndex)
  }

  useEffect(() => {
    if (locked || !keyboard) return
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key)
      if (n >= 1 && n <= q.choices.length) choose(n - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="question">
      <h2 className="prompt">{q.prompt}</h2>
      <div className="choices">
        {q.choices.map((c, i) => {
          let state = ''
          if (locked && i === q.answerIndex) state = 'correct'
          else if (locked && i === chosen) state = 'wrong'
          return (
            <button key={i} className={`choice ${state}`} onClick={() => choose(i)} disabled={locked}>
              {keyboard && <span className="key">{i + 1}</span>}
              <span>{c}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function InputView({ q, locked, onSubmit }: Props<InputQuestion>) {
  const [value, setValue] = useState('')
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => ref.current?.focus(), [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (locked || !value.trim()) return
    const ok = checkInput(value, q.answer, q.accept)
    setWasCorrect(ok)
    onSubmit(ok)
  }

  return (
    <form className="question" onSubmit={submit}>
      <h2 className="prompt">{q.prompt}</h2>
      <div className="input-row">
        <input
          ref={ref}
          className={`answer-input ${locked ? (wasCorrect ? 'correct' : 'wrong') : ''}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={locked}
          inputMode="text"
          autoComplete="off"
          placeholder="Your answer"
          aria-label="Your answer"
        />
        <button className="btn primary" type="submit" disabled={locked || !value.trim()}>
          Enter
        </button>
      </div>
      {locked && !wasCorrect && (
        <p className="reveal">
          Answer: <strong>{q.answer}</strong>
        </p>
      )}
      <p className="hint">Fractions like 3/4 and decimals are both fine.</p>
    </form>
  )
}

const PAIR_COLORS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6']

function MatchView({ q, locked, onSubmit }: Props<MatchQuestion>) {
  const [rights] = useState(() => shuffle(q.pairs.map(([, r]) => r)))
  const [active, setActive] = useState<number | null>(null)
  // left index -> index into `rights`
  const [links, setLinks] = useState<Record<number, number>>({})

  const linkRight = (ri: number) => {
    if (locked || active === null) return
    play('tap')
    const next = { ...links }
    for (const k of Object.keys(next)) if (next[Number(k)] === ri) delete next[Number(k)]
    next[active] = ri
    setLinks(next)
    const unlinked = q.pairs.findIndex((_, i) => next[i] === undefined)
    setActive(unlinked === -1 ? null : unlinked)
  }

  const leftFor = (ri: number) => Object.entries(links).find(([, v]) => v === ri)?.[0]
  const done = Object.keys(links).length === q.pairs.length
  const isRight = (li: number) => rights[links[li]] === q.pairs[li][1]

  return (
    <div className="question">
      <h2 className="prompt">{q.prompt}</h2>
      <p className="hint">Tap an item on the left, then its match on the right.</p>
      <div className="match">
        <div className="match-col">
          {q.pairs.map(([l], i) => {
            const linked = links[i] !== undefined
            const state = locked ? (isRight(i) ? 'correct' : 'wrong') : ''
            return (
              <button
                key={i}
                className={`tile ${active === i ? 'active' : ''} ${linked ? PAIR_COLORS[i] : ''} ${state}`}
                onClick={() => {
                  if (locked) return
                  play('tap')
                  setActive(i)
                }}
                disabled={locked}
              >
                {l}
              </button>
            )
          })}
        </div>
        <div className="match-col">
          {rights.map((r, ri) => {
            const li = leftFor(ri)
            return (
              <button
                key={ri}
                className={`tile ${li !== undefined ? PAIR_COLORS[Number(li)] : ''}`}
                onClick={() => linkRight(ri)}
                disabled={locked}
              >
                {r}
              </button>
            )
          })}
        </div>
      </div>
      {locked && q.pairs.some((_, i) => !isRight(i)) && (
        <ul className="reveal-list">
          {q.pairs.map(([l, r]) => (
            <li key={l}>
              <strong>{l}</strong> → {r}
            </li>
          ))}
        </ul>
      )}
      {!locked && (
        <button className="btn primary" disabled={!done} onClick={() => onSubmit(q.pairs.every((_, i) => isRight(i)))}>
          Check
        </button>
      )}
    </div>
  )
}

function OrderView({ q, locked, onSubmit }: Props<OrderQuestion>) {
  const [items, setItems] = useState(() => {
    let s = shuffle(q.items)
    for (let i = 0; i < 5 && s.every((x, j) => x === q.items[j]); i++) s = shuffle(q.items)
    return s
  })

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    play('tap')
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
  }

  return (
    <div className="question">
      <h2 className="prompt">{q.prompt}</h2>
      <ol className="order">
        {items.map((item, i) => {
          const state = locked ? (item === q.items[i] ? 'correct' : 'wrong') : ''
          return (
            <li key={item} className={`order-item ${state}`}>
              <span className="order-num">{i + 1}</span>
              <span className="order-text">{item}</span>
              {!locked && (
                <span className="order-btns">
                  <button className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${item} up`}>
                    ↑
                  </button>
                  <button className="icon-btn" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${item} down`}>
                    ↓
                  </button>
                </span>
              )}
            </li>
          )
        })}
      </ol>
      {locked && items.some((x, i) => x !== q.items[i]) && <p className="reveal">Correct order: {q.items.join(' → ')}</p>}
      {!locked && (
        <button className="btn primary" onClick={() => onSubmit(items.every((x, i) => x === q.items[i]))}>
          Check
        </button>
      )}
    </div>
  )
}

function BlankView({ q, locked, onSubmit }: Props<BlankQuestion>) {
  const [chosen, setChosen] = useState<string | null>(null)
  const [before, after] = q.sentence.split('___')
  const state = locked ? (chosen === q.answer ? 'correct' : 'wrong') : ''

  return (
    <div className="question">
      <h2 className="prompt">{q.prompt}</h2>
      <p className="sentence">
        {before}
        <span className={`blank ${chosen ? 'filled' : ''} ${state}`}>{chosen ?? ' '}</span>
        {after}
      </p>
      <div className="tiles">
        {q.options.map((o) => (
          <button
            key={o}
            className={`tile ${chosen === o ? 'active' : ''}`}
            onClick={() => {
              play('tap')
              setChosen(o)
            }}
            disabled={locked}
          >
            {o}
          </button>
        ))}
      </div>
      {locked && chosen !== q.answer && (
        <p className="reveal">
          Answer: <strong>{q.answer}</strong>
        </p>
      )}
      {!locked && (
        <button className="btn primary" disabled={!chosen} onClick={() => onSubmit(chosen === q.answer)}>
          Check
        </button>
      )}
    </div>
  )
}
