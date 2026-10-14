# Research report: designing a learn-to-draw app for retention and real skill gain

**Notes on method.** Reddit blocks the fetch tool, so I read threads through a Redlib mirror. Links below point to reddit.com, and vote counts are snapshot values. Where I could reach only an abstract or a secondary summary, I say so. Effect sizes are Cohen's d or Hedges' g as each source reports them.

---

## Part A. Learning science applied to drawing

### A1. Deliberate practice and its critics
- **The original claim.** Ericsson, Krampe and Tesch-Römer defined deliberate practice as "effortful activities… designed to optimize improvement." They argued that differences between performers, even elite ones, "are closely related to assessed amounts of deliberate practice" ([Ericsson et al. 1993](https://doi.org/10.1037/0033-295X.100.3.363)). The paper cites training research showing no benefit beyond about 4 hours a day and smaller benefits beyond about 2 ([secondary summary of the paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC6731745/)).
- **The meta-analysis.** Macnamara, Hambrick and Oswald found deliberate practice explained 26% of performance variance in games, 21% in music, 18% in sports, 4% in education and under 1% in professions ([Macnamara et al. 2014](https://doi.org/10.1177/0956797614535810)).
- **The replication.** A double-blind replication with 39 violinists did not reproduce the core finding. The effect was "substantial, but considerably smaller" than in the original ([Macnamara & Maitra 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6731745/)).
- **Ericsson's rebuttal.** Counting only studies that match his strict, teacher-designed definition, practice explained 29% of variance, or 61% after correcting for measurement error ([Ericsson & Harwell 2019](https://doi.org/10.3389/fpsyg.2019.02396)).
- **Drawing specifically.** In 682 art students, drawing ability tracked time spent drawing *and* the number of drawing techniques used. Visual memory had its own independent effect. "Surface" learners practised more but learned fewer techniques and reached lower skill ([Chamberlain et al. 2015](https://repository.uwtsd.ac.uk/755)).
- **Takeaway.** Hours alone are a weak lever. What the hours contain matters more: specific techniques, goals and feedback.

### A2. Retrieval, spacing, interleaving and desirable difficulties
- **Retrieval practice.** Testing yourself beat restudying on delayed tests, even though restudying made learners more confident ([Roediger & Karpicke 2006](https://doi.org/10.1111/j.1467-9280.2006.01693.x)). A meta-analysis of 118 articles found g ≈ 0.61, with transfer g ≈ 0.53 ([Adesope et al. 2017](https://doi.org/10.3102/0034654316689306), figures via [summary](https://www.learningscientists.org/blog/2017/2/9-1)). Effortful recall beats recognition ([Rowland 2014](https://doi.org/10.1037/a0037559)).
- **Spacing.** The best gap between sessions grows with how long you need to remember ([Cepeda et al. 2006](https://www.evullab.org/pdf/CepedaPashlerVulWixtedRohrer-PB-2006.pdf)). As a share of that period it shrinks, from about 20–40% at one week to 5–10% at one year ([Cepeda et al. 2008](https://www.evullab.org/pdf/CepedaVulRohrerWixtedPashler-PS-2008.pdf)).
- **Interleaving, shown with paintings.** Learners induced artists' styles better when paintings were interleaved, yet rated massed study as more effective, "even after their own test performance had demonstrated the opposite" ([Kornell & Bjork 2008](https://doi.org/10.1111/j.1467-9280.2008.02127.x)). A meta-analysis found g = 0.42 overall and g = 0.67 for paintings. The effect is strongest when categories look alike and weakest, even negative, for expository text and words ([Brunmair & Richter 2019](https://www.psychologie.uni-wuerzburg.de/fileadmin/06020400/2019/Brunmair_Richter_in_press__2019_META-ANALYSIS_OF_INTERLEAVED_LEARNING.pdf)).
- **Contextual interference (mixing motor tasks).** Random practice beat blocked practice on retention and transfer ([Shea & Morgan 1979](https://www.gwern.net/doc/psychology/spaced-repetition/1979-shea.pdf)). But the effect is d = 0.57 in lab studies against only 0.19 in applied ones ([Brady 2004](https://www.gwern.net/docs/spaced-repetition/2004-brady.pdf)). For transfer it is 0.75 in labs and 0.34, not significant, in applied settings ([Czyż et al. 2024](https://frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1377122/full)).
- **The complex-skill caveat.** Low-demand tasks benefit from added challenge, but very high-load tasks benefit from reducing load. Lab results on simple tasks may not generalise ([Wulf & Shea 2002](https://www.doi.org/10.3758/BF03196276)).
- **Desirable difficulties.** Performance during practice is "often an unreliable index" of learning, and some manipulations push the two in opposite directions ([Soderstrom & Bjork 2015](https://doi.org/10.1177/1745691615569000)).

### A3. Cognitive load, worked examples, expertise reversal and fading
- **Expertise reversal.** Techniques that help novices "can lose their effectiveness and even have negative consequences" for experienced learners ([Kalyuga et al. 2003](https://doi.org/10.1207/S15326985EP3801_4)).
- **Placing learners quickly.** A rapid first-step test correlated up to .92 with full knowledge tests, in a fraction of the time, and could be used to choose the instructional format ([Kalyuga & Sweller 2004](https://doi.org/10.1037/0022-0663.96.3.558)).
- **Fading.** Worked examples are best early and problem solving later. Fading in problem-solving steps gradually manages that transition ([Renkl & Atkinson 2003](https://doi.org/10.1207/S15326985EP3801_3)).
- **Order.** Example-then-problem pairs beat problem-then-example pairs for novices ([van Gog, Kester & Paas 2011](https://repub.eur.nl/pub/26205)).
- **What this means for how much to show.** Beginners need full, stepwise demonstrations. Experienced learners need the goal, a reference and a check, with steps available on request.

### A4. Mayer's multimedia principles (text plus image or video)
- **Coherence:** cut extraneous material. Supported in 23 of 23 tests, median d = 0.86 ([Mayer & Fiorella 2014 chapter](https://www.cambridge.org/core/books/abs/cambridge-handbook-of-multimedia-learning/principles-for-reducing-extraneous-processing-in-multimedia-learning-coherence-signaling-redundancy-spatial-contiguity-and-temporal-contiguity-principles/C98AB3A6CE760DD63C048936EA0B3B44), counts via search excerpt). Interesting but irrelevant "seductive details" hurt recall and transfer ([Rey 2012](https://doi.org/10.1016/j.edurev.2012.05.003)).
- **Signalling:** cues that highlight structure. 24 of 28 tests, median d = 0.41 (same chapter).
- **Segmenting:** learner-paced segments. 10 of 10 tests, d = 0.79, stronger for low-knowledge learners ([Mayer et al. 2018, citing Mayer & Pilegard 2014](https://par.nsf.gov/servlets/purl/10061485)).
- **Pre-training:** teach the names and characteristics of key concepts first. 13 of 16 tests, d = 0.75 (search excerpt of the Mayer & Pilegard chapter).
- **Redundancy:** do not add on-screen text that repeats narration. **Spatial contiguity:** put words next to the picture they describe ([Mayer 2020 list](https://ugc.futurelearn.com/uploads/files/7d/d6/7dd6188d-c343-4311-b064-ac98d2c95abc/Multimedia_Principles._R._E._Mayer__2020.pdf)).
- **Watching someone draw.** Watching an instructor draw diagrams beat seeing finished ones. With only the hand visible, d = 0.35 for all learners; with the full body, the benefit appeared only for low-prior-knowledge learners ([Fiorella & Mayer](https://alexandria.ucsb.edu/lib/ark:/48907/f37d2sbv)).
- **Caveat.** Most of this evidence comes from short STEM lessons given to university students, not motor skills.

### A5. Drawing-specific research
- **Why people can't draw what they see.** Comparing tracing with freehand drawing, motor coordination was "a very minimal source" of error. The main source was misperception of the object ([Cohen & Bennett 1997](https://doi.org/10.1037/0096-1523.23.3.609)). Fine motor tests do not predict drawing skill ([Chamberlain & Wagemans 2016](https://research.gold.ac.uk/id/eprint/20010), citing McManus et al. 2014).
- **Attention and schemas, not "seeing more truly."** Low-level perception (constancies, illusions, Gestalt grouping) correlates inconsistently with skill. Three months of art training did not change susceptibility to the Müller-Lyer illusion. The review concludes that what matters is "domain-specific, flexible, top-down control of visual attention": suppressing wrong category schemas, using helpful pictorial schemas, and segmenting the scene well ([Chamberlain & Wagemans 2016](https://research.gold.ac.uk/id/eprint/20010)).
- **Experts break lines into parts.** Expert artists split complex lines into simple segments; novices segment arbitrarily or not at all ([Tchalenko 2009](https://research.gold.ac.uk/id/eprint/20010), via the same review).
- **Negative space.** Orientation is drawn more accurately in negative space than in recognisable positive shapes ([Carson et al. 2014](https://research.gold.ac.uk/id/eprint/20010), via review).
- **Upside-down drawing.** Drawing from an inverted image had no effect in one study and only a small one in another ([Chamberlain & Wagemans 2016](https://research.gold.ac.uk/id/eprint/20010)).
- **Errors are systematic.** Non-artists draw faces too round, with the eyes too high and too far apart. 96% placed the eye-line too high ([Ostrofsky, Cohen & Kozbelt 2014](https://oudev.stockton.edu/social-behavioral-sciences/documents/Ostrofsky2014.pdf)). Being told "eyes are halfway down the head" *reduced but did not eliminate* the error ([Ostrofsky et al. 2016](https://doi.org/10.1037/a0040368); [BPS summary](https://bps.org.uk/research-digest/when-we-draw-face-why-do-most-us-put-eyes-wrong-place)).
- **Memory matters.** Poorer drawers recall the Rey-Osterrieth complex figure less well, both immediately and after a delay ([McManus et al. 2010](https://repository.uwtsd.ac.uk/322)). Experts better detect changes to both the model and their own drawing while drawing ([Perdreau & Cavanagh 2015](https://doi.org/10.1167/15.5.5)). This advantage looks specific to drawing ([Chamberlain & Wagemans 2016](https://research.gold.ac.uk/id/eprint/20010)). Looking back and forth between model and drawing more often increased accuracy (Cohen 2005, same review).
- **Does training work and transfer?**
  - Art students improved in drawing, mental rotation, disembedding figures and attention switching over five months. But one person's gain on one task did not predict their gain on another ([Chamberlain et al. 2019/2021](https://research.gold.ac.uk/id/eprint/25885)).
  - A three-month course improved figure drawing from observation ([Schlegel et al. 2015](https://home.dartmouth.edu/news/2015/07/dartmouth-study-shows-taking-art-course-rewires-your-brain)).
  - A ten-lesson online course for older adults raised drawing accuracy (d = 1.27, against 0.35 for controls). Cognitive transfer was limited, and 47% of the treatment group dropped out, mostly over time commitment ([Vodyanyk & Jaeggi 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12102519/)).
  - Practising sketches with recogniser feedback improved the recognisability of the practised objects. Similar unpractised objects got *worse* ([Fan, Yamins & Turk-Browne](https://escholarship.org/uc/item/14n7j9hn)).
- **Drawing from memory (Lecoq de Boisbaudran).** The method in [the 1911 translation](https://archive.org/details/TheTrainingOfTheMemoryInArtAndTheEducationOfTheArtist):
  - Study a simple copy, starting with "a nose drawn in profile," then draw it "entirely from memory."
  - Compare with the original, then correct "from memory alone," repeatedly.
  - Demand an effort "exactly equal to, but never beyond its strength."
  - Shorten the study time as the student progresses, and keep memory lessons alongside ordinary work: "one or two memory lessons for six lessons in ordinary drawing."
  - After three months of graduated exercises, his students drew simple heads from memory with "a very satisfactory likeness."

  This is retrieval practice with feedback and fading, but the evidence is the author's own testimony, not controlled data.
- **Perceptual learning.** Many short, varied classification trials with feedback build pattern discovery and fluency in mathematics and medical imaging. The evidence comes mostly from Kellman's own lab ([Kellman et al. 2008](https://kellmanlab.psych.ucla.edu/wp-content/uploads/sites/357/2025/09/kellman_et_al_2008.pdf)). Comparing cases gives d = 0.50, and perceptual content shows the largest benefit ([Alfieri et al. 2013](https://doi.org/10.1080/00461520.2013.775712)).
- **Teaching drawing from imagination.** I found no controlled research. The only empirical anchors are the memory correlations above and Lecoq's method.

### A6. Feedback without a teacher
- **Feedback can hurt.** Feedback helps on average (d = 0.41), but over a third of interventions reduced performance. Effectiveness drops as attention shifts "closer to the self and away from the task" ([Kluger & DeNisi 1996](https://doi.org/10.1037/0033-2909.119.2.254)). A later meta-analysis found d = 0.48, depending heavily on how much information the feedback carries ([Wisniewski et al. 2020](https://www.frontiersin.org/articles/10.3389/fpsyg.2019.03087/full)).
- **Too much guidance.** Feedback on every trial can create dependence on it, which hurts retention once it is removed ([guidance hypothesis review](https://www.frontiersin.org/articles/10.3389/fnins.2016.00251/full)).
- **Estimate your error first.** With feedback after every attempt, learners who first estimated their own error retained best; those who did not retained worst ([Guadagnoli & Kohl 2001](https://doi.org/10.1080/00222890109603152)). Letting learners choose when to get feedback helps when the choice is made *after* the attempt ([Carter et al. 2014](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4237043/)).
- **Overlays.** In a drawing task (n = 20 crowdworkers), visual overlays raised immediate scores by about 10 points but produced smaller learning gains than language corrections ([Srivastava et al. 2023](https://arxiv.org/html/2306.07012)). I found no study of overlay comparison in observational drawing.
- **Self-assessment.** Self-ratings relate only "tenuous[ly] to modest[ly]" to actual performance ([Dunning, Heath & Suls 2004](https://doi.org/10.1111/j.1529-1006.2004.00018.x)). Yet self-assessment interventions improved self-regulation (effect sizes 0.23–0.65) and self-efficacy (0.73) ([Panadero et al. 2017](https://doi.org/10.1016/j.edurev.2017.08.004)). Rubrics: g = 0.45 on performance ([Panadero et al. 2023](https://link.springer.com/10.1007/s10648-023-09823-4)).
- **Peer feedback.** Peer assessment: g = 0.31, not significantly different from self-assessment (g = 0.23) ([Double et al. 2020](https://doi.org/10.1007/s10648-019-09510-3)). Students who only *gave* reviews improved their own writing more than those who only received them ([Lundstrom & Baker 2009](https://scholarsarchive.byu.edu/facpub/5913)).
- **Before/after comparisons.** Monitoring progress improves goal attainment (d = 0.40), more so when the progress is physically recorded or made public ([Harkin et al. 2016](https://doi.org/10.1037/bul0000025)).

### A7. Motivation, dropout, streaks and gamification
- **Dropout is the norm.** Only 3.13% of edX participants completed their courses in 2017–18 ([Reich & Ruipérez-Valiente 2019, via Inside Higher Ed](https://www.insidehighered.com/node/7744)). A self-paced drawing course lost 47% of its treatment group ([Vodyanyk & Jaeggi 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12102519/)).
- **Basic needs.** Competence, autonomy and relatedness sustain motivation ([Ryan & Deci 2000](https://doi.org/10.1037/0003-066X.55.1.68)). Choice raises intrinsic motivation, most with 2–4 successive choices ([Patall et al. 2008](https://doi.org/10.1037/0033-2909.134.2.270)).
- **Rewards and praise.** Expected tangible rewards undermine free-choice motivation (d ≈ −0.28 to −0.40). Positive informational feedback raises it (d = 0.33) ([Deci, Koestner & Ryan 1999](https://depts.washington.edu/techdocs/papers/deciExtrinsicRewardsAndIntrinsicMotivation99.pdf)).
- **Progress.** Making progress was "by far the most prominent" event on people's best workdays, and setbacks weighed two to three times more ([Amabile & Kramer](https://hbswk.hbs.edu/item/6685.html)).
- **Gamification.** Small positive effects: cognitive g = 0.49, motivational 0.36, behavioural 0.25. The motivational and behavioural effects were unstable in the most rigorous studies ([Sailer & Homner 2020](https://opus.bibliothek.uni-augsburg.de/opus4/frontdoor/index/index/docId/109056)).
- **Streaks.**
  - Highlighting broken streaks reduces further engagement, even when the break was outside the person's control. Letting people "repair" a streak softens this ([Silverman & Barasch 2023](https://doi.org/10.1093/jcr/ucac029)).
  - Goals with an explicit "emergency reserve" of slack increased persistence ([Sharif & Shu 2017](https://doi.org/10.1509/jmr.15.0231)).
  - Duolingo reports that allowing two streak freezes raised daily actives by 0.38%, but discloses no methodology ([Duolingo](https://blog.duolingo.com/duolingo-streak-research/)).
- **Habit and flexibility.** Missing one opportunity "did not materially affect" habit formation ([Lally et al. 2010](https://www.ucl.ac.uk/news/2009/aug/how-long-does-it-take-form-habit)). Paying people for flexible gym visits produced more, and more lasting, exercise than paying for a fixed daily window ([Beshears et al. 2021](https://doi.org/10.1287/mnsc.2020.3706)).

---

## Part B. What self-taught learners struggle with

- **Where to start and too many resources.** "I feel stuck and overwhelmed by the amount of advice online… I just don't know the correct order… tired of jumping between random tutorials" ([r/learntodraw](https://www.reddit.com/r/learntodraw/comments/1tux5yw/)). The top reply described buying many books and starting Drawabox and Proko, burning out quickly, then improving through daily repetition plus a feedback partner.
- **Tutorial dependence and knowing without doing.** "I'm struggling to learn how to draw without following a tutorial or copying anime" ([r/learntodraw](https://www.reddit.com/r/learntodraw/comments/191ob3x/)). "I know so much about art and i'm absolutely terrible." A moderator replied: "The drawings in your head don't matter, only the ones you actually draw" ([r/learnart](https://www.reddit.com/r/learnart/comments/7y0rok/)).
- **Reference versus imagination.** "Copying is recreating the marks another artist made… Studying means asking why" ([r/learntodraw](https://www.reddit.com/r/learntodraw/comments/1vfsibg/why_can_i_only_copy/)). The r/learnart FAQ says imagination is built by "developing your ability to draw things from memory by drawing them from life or other references first." Its self-check method is "ABC: Always Be Comparing" ([FAQ](https://www.reddit.com/r/learnart/wiki/faq)).
- **Burning out on fundamentals.**
  - Drawabox's 50% rule says at least half of drawing time must be "for its own sake" ([Lesson 0 FAQ](https://drawabox.com/lesson/0/2/faq)). Its rule against "grinding" means no redoing work out of perfectionism ([search excerpts](https://drawabox.com/lesson/250boxes)).
  - Students still describe the play half as forced: "whenever I draw things I like for 'fun' I do it because I'm forcing myself" (403 points, [r/ArtFundamentals](https://www.reddit.com/r/ArtFundamentals/comments/hybiqn/)).
  - Another student "genuinely feels like I'm headed straight for a burnout." The Drawabox author replied that "the killer when learning any skill are expectations" ([thread](https://drawabox.com/r/artfundamentals/post/10n7lyc)).
  - Box-challenge veterans advise spreading the boxes over months and mixing in other drawing ([Drawabox community](https://drawabox.com/community/submission/CQHXYMSX)).
- **Not knowing whether you are improving.** "I feel like I'm not improving fast enough, made six months apart." Commenters saw clear progress the poster did not ([r/learnart](https://www.reddit.com/r/learnart/comments/s4ffsm/)). "Is this a good drawing or am I blind" ([r/learntodraw](https://www.reddit.com/r/learntodraw/comments/1hegr3n/)). "First page vs last page" posts are among r/ArtFundamentals' most upvoted ([example](https://www.reddit.com/r/ArtFundamentals/comments/mtqhfp/)). Learners also built an app that extends box lines toward their vanishing points and scores them, wanting "a concrete, 'objective' indication of progress" ([r/ArtFundamentals](https://www.reddit.com/r/ArtFundamentals/comments/mhjmki/)).
- **Blank page, perfectionism and discouragement.** "The biggest problem I always had was… not knowing what I should draw" ([r/learnart](https://www.reddit.com/r/learnart/comments/48xqyi/)). "Painting small and fast has helped me get past my fear of failure and perfectionism" (2.8k points, [r/learnart](https://www.reddit.com/r/learnart/comments/fgh7kj/)). The r/learntodraw wiki warns against expensive sketchbooks you may fear to "ruin" ([wiki](https://www.reddit.com/r/learntodraw/wiki/index)). "Looking at how bad I am on day 1 is… discouraging" ([r/learntodraw](https://www.reddit.com/r/learntodraw/comments/1p5z52s/)).
- **What people credit for success.** Consistency on bad days ("Just a little bit every day is enough"). Drawing along with Proko videos, pausing before the instructor, then comparing. A "Fresh Eyes" before/after challenge ([r/learntodraw, 7.2k points](https://www.reddit.com/r/learntodraw/comments/1oum4gk/)).

---

## Part C. Writing instructional text for retention

- **The trade-off.** Detailed, specific instructions help initial performance, while more general instructions that require problem solving help learning and transfer. Fading and mixing instruction types can get both ([Eiriksdottir & Catrambone 2011](https://doi.org/10.1177/0018720811419154)).
- **Act first, read little.** Learners "jump the gun" and skip reading. Trimmed, task-centred "minimal manuals" outperformed long manuals ([Carroll's minimalism, secondary summary](https://www.instructionaldesign.org/theories/minimalism/)). Web users read about 20% of a page's words ([NN/g](https://www.nngroup.com/articles/how-little-do-users-read/)).
- **Example first, then rule.** Example-problem order beats problem-example ([van Gog et al. 2011](https://repub.eur.nl/pub/26205)). In case comparisons, giving the principle *after* the comparison and asking learners to find similarities improved learning ([Alfieri et al. 2013](https://doi.org/10.1080/00461520.2013.775712)). Concrete-to-abstract "concreteness fading" is recommended ([Fyfe et al. 2014](https://pc.cogs.indiana.edu/?p=885)).
- **Name the purpose of each step.** Subgoal labels, which say what a group of steps achieves, improve transfer to new problems ([subgoal-labelling review](https://www.frontiersin.org/articles/10.3389/feduc.2022.832901/pdf)).
- **Showing mistakes.** Erroneous examples have a small effect (g = 0.136) that grows when the error is explained ([Alemdag et al. 2025](https://doi.org/10.3102/00346543251390901)). Contrasting cases prepare learners for an explanation that follows ([Schwartz & Bransford 1998](https://www.wright.edu/sites/www.wright.edu/files/uploads/2017/Feb/event/Schwartz_Bransford_1998_TimeForTelling.pdf)). Training that encourages errors improves transfer (d = 0.56) ([Keith & Frese 2008](https://doi.org/10.1037/0021-9010.93.1.59)).
- **Experts leave steps out.** Experts reportedly omit about 70% of their decisions when describing a task (a [workshop-level claim](https://digitalcommons.usu.edu/itls_facpub/368); weak). It is a reason to test lesson text on real beginners.
- **Analogies.** I found no drawing-specific evidence and did not pursue the general literature.

---

## Design implications

1. **One skill per lesson page, always in the same order:**
   - The goal, one sentence plus a finished example image.
   - Two or three key terms, introduced first (pre-training).
   - A demonstration broken into numbered steps, each with its image beside it and a label saying what the step achieves.
   - A correct-versus-wrong pair showing the typical error and why it happens.
   - "Do this now": the exercise with a quantity or time.
   - A three-to-five item self-check.
   - "Next."

   *Evidence:* Mayer's segmenting, contiguity and pre-training principles; van Gog 2011; subgoal labelling; Alfieri 2013; Carroll.
2. **Keep the text short and on task.** No anecdotes. Captions sit beside the image. Narration does not repeat on-screen text. *Evidence:* coherence and redundancy principles; Rey 2012; NN/g.
3. **Adjust instruction density to the learner.** Place learners with a short diagnostic drawing. Show full steps to beginners; show experienced learners the goal, reference and check, with steps collapsed. Within each skill, fade support across exercises: guided demonstration, then a partly started drawing, then from reference, then from memory. *Evidence:* Kalyuga 2003 and 2004; Renkl & Atkinson 2003; Eiriksdottir & Catrambone 2011.
4. **Teach where to look, not just how to move the hand.** Make negative space, measuring angles, comparing proportions, gaze shifts and breaking lines into parts explicit exercises. Teach known schema corrections, such as the eye-line, but follow them with measuring, since knowing the rule only partly fixes the error. *Evidence:* Cohen & Bennett 1997; Chamberlain & Wagemans 2016; Ostrofsky 2014 and 2016.
5. **Make practice a library, not a schedule.** Every skill gets an always-available practice pool with no required daily session. When the learner opens it, suggest a short mixed set:
   - First exposure to a skill is practised on its own (blocked).
   - Later sets interleave skills, especially easily confused ones.
   - Skills learned earlier resurface at expanding intervals.

   *Evidence:* Brunmair & Richter 2019; Kornell & Bjork 2008; Cepeda 2006/2008; Wulf & Shea 2002 on reducing load early. The contextual-interference benefit is weak in applied settings, so do not over-engineer the mixing.
6. **Build in memory drawing as retrieval practice:** study the reference, hide it, draw, reveal and compare, then correct without looking. Grade the difficulty, shorten study time as the learner improves, and aim for roughly one memory exercise per three to six observational ones. *Evidence:* Lecoq de Boisbaudran; Roediger & Karpicke; McManus 2010; Perdreau & Cavanagh 2015. This is also the most defensible bridge to drawing from imagination, though no controlled evidence exists.
7. **Overlay comparison after the drawing, not during it.**
   - The learner first marks where they think they went wrong, then reveals the overlay (scaled and aligned).
   - Offer named error types (angle, proportion, placement) rather than one global score.
   - No live tracing guides in practice mode.

   *Evidence:* Guadagnoli & Kohl 2001; guidance hypothesis; Carter 2014; the overlay-versus-language result in Srivastava 2023.
8. **Skill-specific self-check rubrics with worked exemplars,** paired with objective checks wherever geometry allows (for example, extending box edges toward vanishing points). Beginners cannot judge their own work unaided. *Evidence:* Panadero 2017 and 2023; Dunning 2004; the Drawabox scoring app.
9. **Optional structured peer critique** using the same checklist and kept about the task, never the person. Reviewing others' work is itself practice. *Evidence:* Double 2020; Lundstrom & Baker 2009; Kluger & DeNisi 1996.
10. **Show progress automatically with repeat "benchmark" drawings,** the same prompt every few weeks, displayed side by side with accuracy changes. Present them as delayed comparisons, not per-session scores, because in-session performance misleads. *Evidence:* Harkin 2016; Soderstrom & Bjork 2015; the Reddit posts about not seeing one's own progress.
11. **No daily streaks.**
    - Count sessions per week or month, with built-in slack or a reserve.
    - Never display a "broken" state; offer a fresh start at natural landmarks such as a new week or month.
    - Praise should be specific and informational, not points for finishing.

    *Evidence:* Silverman & Barasch 2023; Sharif & Shu 2017; Lally 2010; Beshears 2021; Deci et al. 1999.
12. **Protect free drawing.** Include an ungraded play mode with a prompt generator for the blank page, plus "small and fast" timed prompts against perfectionism. Offer two to four choices of what to do next rather than a single locked path. *Evidence:* Drawabox's 50% rule; Ryan & Deci 2000; Patall 2008; the Reddit perfectionism and blank-page threads.
13. **Give one default path that answers "where do I start?"** Resources are linked inside lessons, not offered as an open catalogue. *Evidence:* the overwhelm threads; Carroll's minimalism.
14. **Things to avoid:**
    - Large mandatory quotas; split them into small units spread over weeks.
    - Rules that demand perfection before moving on.
    - Video-only lessons without step segmentation.
    - Leaderboards, for which I found no supporting evidence.
    - Judging the app's success by engagement rather than by delayed benchmarks.

    *Evidence:* box-challenge burnout reports; Drawabox's grinding warning; the segmenting principle; Soderstrom & Bjork.

## Where the evidence is weak

- **Drawing-specific training studies** are few, small, and mostly correlational or limited to art students. Transfer beyond the trained task is limited or unshown (Chamberlain 2019/2021; Fan et al.).
- **Overlay feedback, teaching imagination and memory drawing** have no controlled drawing studies. Lecoq is a historical first-hand account.
- **Mayer's principles** come from short STEM lessons. **Contextual interference** is small or non-significant in applied settings.
- **Streak and gamification findings** come from consumer-behaviour studies or undisclosed company data, not drawing learners.
- **How much deliberate practice explains** is still disputed (Macnamara versus Ericsson).
- **The Reddit material** shows what learners say they struggle with, not what causes it.

No files were written except temporary extraction scripts and text in the session scratchpad.
