// The writing rules from docs/rebuild/WRITING.md that a machine can check. Errors block the build;
// warnings are printed for a person to judge. Both the content build and the interface scan use
// these, so a lesson and a button are held to the same rules.

const word = (pattern) => new RegExp(`(?<![\\w'])(?:${pattern})(?![\\w'])`, 'i');

const ERRORS = [
  { rule: 'dash', test: /[–—]| -- /, why: 'No em or en dashes. Use a period, comma, colon or parentheses.' },
  { rule: 'curly quote', test: /[‘’“”]/, why: 'Use straight quotes.' },
  { rule: 'exclamation', test: /!/, why: 'No exclamation marks.' },
  { rule: 'emoji', test: /\p{Extended_Pictographic}/u, why: 'No emoji.' },
  { rule: 'contrast staging', test: /\bnot (?:just|only|merely)\b|\b(?:it|this|that)'?s not\b[^.]*,\s*(?:it|this|that)'?s\b|\bisn't the (?:problem|point|question)\b/i, why: 'State the point directly.' },
  { rule: 'puffed-up word', test: word('delve|delves|crucial|robust|journey|unlock|unlocks|elevate|seamless|seamlessly|vibrant|testament|essential|dive into|deep dive|leverage|empower'), why: 'Say the plain thing.' },
  { rule: 'filler', test: word("simply|just|easily|obviously|of course|basically|essentially|actually|really|it's important to|note that|remember to|don't worry|let's"), why: 'Cut it. "Just" and "simply" tell a struggling learner the task is trivial.' },
  { rule: 'about the text', test: word("this section|as we'll see|below you'll find"), why: 'Talk about drawing, not about the page.' },
  { rule: 'slogan', test: /\bone (?:skill|step|thing|line|lesson) at a time\b|\bfor whatever time you have\b|\b(?:learn|draw|watch) it, (?:draw|do|practise|practice) it\b/i, why: 'Headings and intros name things plainly. No taglines.' },
  { rule: 'praise', test: word('great job|well done|awesome|amazing|you nailed it'), why: 'No praise copy.' },
];

const WARNINGS = [
  { rule: 'passive voice', test: /\b(?:is|are|was|were|be|been|being)\s+(?!used to\b)\w+ed\b/i, why: 'Check whether a person should be the subject.' },
  { rule: 'key as adjective', test: word('key'), why: 'Usually padding. Name the thing.' },
];

export const MAX_SENTENCE_WORDS = 28;

export function words(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function sentences(text) {
  return text.replace(/\s+/g, ' ').split(/(?<=[.?:;])\s+(?=[A-Z0-9"(])/).map((s) => s.trim()).filter(Boolean);
}

// Findings for one piece of prose: [{ level: 'error' | 'warning', rule, match, why }].
export function lintProse(text) {
  const findings = [];
  for (const { rule, test, why } of ERRORS) {
    const match = text.match(test);
    if (match) findings.push({ level: 'error', rule, match: match[0], why });
  }
  for (const { rule, test, why } of WARNINGS) {
    const match = text.match(test);
    if (match) findings.push({ level: 'warning', rule, match: match[0], why });
  }
  for (const sentence of sentences(text)) {
    if (words(sentence) > MAX_SENTENCE_WORDS) {
      findings.push({ level: 'warning', rule: 'long sentence', match: `${sentence.slice(0, 60)}...`, why: `Over ${MAX_SENTENCE_WORDS} words. Split it.` });
    }
  }
  return findings;
}
