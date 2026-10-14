import { TOTAL_LESSONS, useContent } from '../content/load';
import { href } from '../router';
import { saveSetting } from '../store/db';

// What opens the first time, and again from "How Delineare works".
export function Welcome() {
  const content = useContent();
  const first = content.parts[0]?.lessons[0];
  const welcomed = () => void saveSetting('welcomed', true);

  return (
    <div className="page welcome narrow">
      <section className="welcome-intro">
        <h1>Welcome to Delineare</h1>
        <p>Delineare is a course for learning to draw, with a library of exercises for whenever you want to practise. It works whether you've never drawn before or you can already draw a bit and want to fill in the gaps.</p>
        <p>Each lesson covers one skill. You read a short explanation and watch a video from a teacher who explains it well. Then you do an exercise on paper while Delineare shows the reference and keeps time. Afterwards you photograph your page and check it against a short list, and the photo goes in your sketchbook so you can see how you're improving.</p>
        <p>You'll need a pen, some printer paper and a phone to take photos. Everything you save stays on this computer.</p>
      </section>

      <section aria-labelledby="start-title">
        <h2 id="start-title">Where to start</h2>
        <div className="start-options">
          <div className="start-option">
            <div>
              <h3>I'm new to drawing</h3>
              <p>Start with lesson 1. It teaches you to draw confident lines, which everything else in the course builds on.</p>
            </div>
            {first ? <a className="button primary" href={href('lesson', first.slug)} onClick={welcomed}>Start lesson 1</a> : null}
          </div>
          <div className="start-option">
            <div>
              <h3>I can already draw a bit</h3>
              <p>Look through the course and open the lessons you're unsure about. Each lesson has an "I already know this" button, so the ones you skip stop coming up.</p>
            </div>
            <a className="button" href={href('course')} onClick={welcomed}>Browse the course</a>
          </div>
          <div className="start-option">
            <div>
              <h3>I want to draw something now</h3>
              <p>The practice library has exercises from every lesson, timed pose sessions and a new drawing prompt each day.</p>
            </div>
            <a className="button" href={href('practice')} onClick={welcomed}>Go to practice</a>
          </div>
        </div>
      </section>

      <section aria-labelledby="covers-title">
        <h2 id="covers-title">What the course covers</h2>
        <p>{TOTAL_LESSONS(content)} lessons in {content.parts.length} parts. Each part builds on the one before it, but every lesson is open from the start.</p>
        <ul className="part-list">
          {content.parts.map((part) => (
            <li key={part.number}>
              <a href={href('course')} onClick={welcomed}>
                <span>
                  <span className="part-list-title">Part {part.number}: {part.title}</span>
                  <span className="part-list-text">{part.lessons.map((entry) => entry.title).join(', ')}</span>
                </span>
                <span className="meta">{part.lessons.length} lessons</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
