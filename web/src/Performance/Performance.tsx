import { RvdComponent, eventState, RxO } from '@atom-iq/core'
import { animationFrameScheduler, asyncScheduler, interval, pipe, scheduled } from 'rxjs'
import { concatAll, map, scan, switchMap, takeWhile } from 'rxjs/operators'
import './Performance.scss'

interface ResultProps {
  name: string
  score: number
  winner: boolean
  scoreToPxDivider: number
  replay: RxO<null>
}

const Result: RvdComponent<ResultProps> = ({ name, score, winner, scoreToPxDivider, replay }) => {
  const scoreToPx = Math.round(score / scoreToPxDivider)

  const styleAnimation = () =>
    pipe(
      takeWhile(index => index <= scoreToPx),
      scan((all, index: number) => 150 - index, 150),
      map(top => ({
        marginTop: `${top}px`,
        height: '100%'
      }))
    )(interval(15, animationFrameScheduler))

  const style = switchMap(() => styleAnimation())(replay)

  const scoreAnimation = () =>
    pipe(
      takeWhile(index => index <= scoreToPx + 1),
      map((index: number) => (index === scoreToPx + 1 ? score : index * scoreToPxDivider))
    )(interval(15, animationFrameScheduler))

  const animatedScore = switchMap(() => scoreAnimation())(replay)

  return (
    <section class="result">
      <section class="result__bar-container">
        <div class={winner ? 'result__bar result__bar--winner' : 'result__bar'} style={style} />
      </section>
      <div class="result__name">{name}</div>
      <div class="result__score">{animatedScore} ops/sec</div>
    </section>
  )
}

interface PerformanceProps {
  header: string
  subheader?: string
  description?: string
  results: { [key: string]: number }
  scoreToPxDivider: (score: number) => number
}

const Performance: RvdComponent<PerformanceProps> = ({
  header,
  results,
  subheader,
  description,
  scoreToPxDivider
}) => {
  const [replay, connectReplay] = eventState(map(() => null))
  const resultsArray = Object.entries(results)
  const winner = resultsArray.reduce((win, [name, score]) => {
    return !win || score > results[win] ? name : win
  }, '')

  return (
    <section class="performance">
      <header
        class="performance__header"
        title="Click to replay animation!"
        onClick$={connectReplay()}
      >
        {header}
      </header>
      {subheader && <p class="performance__subheader">{subheader}</p>}
      <section class="performance__results">
        {resultsArray.map(([libraryName, score]) => (
          <Result
            name={libraryName}
            score={score}
            winner={winner === libraryName}
            scoreToPxDivider={scoreToPxDivider}
            replay={concatAll()(scheduled([[null], replay], asyncScheduler))}
          />
        ))}
      </section>
      {description && <p class="performance__description">{description}</p>}
    </section>
  )
}

export default Performance
