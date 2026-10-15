<section id="cau-hoi">
<h2>The question</h2>
<p>Benchmarks say AI keeps getting better at writing code. But a benchmark is a tidy exam, and real work is messy: code written years ago, each project's own conventions, strict code reviewers.</p>
<p class="bb-thesis">For people who are already very good, working in a project they know by heart, how much faster does (early-2025) AI make them?</p>
</section>

<section id="thi-nghiem">
<h2>How the experiment worked</h2>
<p>METR borrowed the way medicine tests a drug: a <b>randomized controlled trial</b> (RCT). Instead of asking people how it felt, they timed them.</p>
<ol class="bb-buoc">
<li><b>The people.</b> 16 developers with years of contributions to large open-source projects, paid 150 USD an hour.</li>
<li><b>The tasks.</b> The developers listed 246 real tasks their projects needed: bug fixes and features.</li>
<li><b>The coin flip.</b> Each task was randomly assigned: AI allowed, or AI not allowed.</li>
<li><b>The tools.</b> Mostly Cursor with Claude 3.5 and 3.7 Sonnet, the strongest setup at the time.</li>
<li><b>The measurement.</b> Screen recordings and the time spent on each task, February to June 2025.</li>
<li><b>The feelings.</b> Before starting they forecast how much AI would help; afterwards they were asked again.</li>
</ol>
</section>

<section id="ket-qua">
<h2>The result, and the shock</h2>
<div class="bb-cot" role="img" aria-label="Forecast before: 24% faster. Believed afterwards: 20% faster. Measured: 19% slower.">
<div class="bb-cot-dong"><span>Forecast before</span><i style="--w:24%" class="tot"></i><b>24% faster</b></div>
<div class="bb-cot-dong"><span>Believed afterwards</span><i style="--w:20%" class="tot"></i><b>20% faster</b></div>
<div class="bb-cot-dong"><span>What the clock said</span><i style="--w:19%" class="xau"></i><b>19% slower</b></div>
</div>
<p>Tasks with AI took 19% longer. The confidence interval runs from 2% slower to 39% slower, so even the best case is slower. Stranger still, the developers believed they had been faster: feeling and measurement were almost 40 percentage points apart.</p>
</section>

<section id="vi-sao">
<h2>Why slower?</h2>
<p>METR looked at many possible causes and named 5 that likely contributed:</p>
<div class="bb-the">
<div><b>Over-optimism</b><span>People used AI even where doing it themselves was quicker.</span></div>
<div><b>Deep familiarity</b><span>The better you know the work, the less AI has to offer.</span></div>
<div><b>Large, complex projects</b><span>AI can't hold the full context of a large codebase.</span></div>
<div><b>Not good enough</b><span>Much AI-written code missed the project's bar and had to be dropped or reworked.</span></div>
<div><b>Unwritten rules</b><span>Many conventions live only in long-time contributors' heads.</span></div>
</div>
<p>Time also leaked into writing prompts, waiting for answers and reviewing AI-written code.</p>
</section>

<section id="kiem-chung">
<h2>Fact check: how far can we trust it?</h2>
<ul class="bb-ds">
<li><b>Strength:</b> a randomized trial on real work, far rarer than surveys of how people feel.</li>
<li><b>Small sample:</b> just 16 people, all experts on familiar projects. It says nothing about beginners, brand-new projects or quick prototypes.</li>
<li><b>Tools change fast:</b> early 2025 had none of today's multi-step agents.</li>
<li><b>The authors corrected themselves (24 Feb 2026):</b> a second round from August 2025 had 57 developers (10 returning, 47 new), 800+ tasks across 143 projects. The new estimates lean towards faster: about 18% for returning developers, about 4% for new ones. But the intervals are wide and still reach into "slower".</li>
<li><b>Why METR doesn't fully trust the new numbers:</b> many people declined to take part or held back hard tasks because they didn't want to work without AI. Pay dropped from 150 to 50 USD an hour. Whoever stayed no longer represents everyone, so the result is skewed (<i>selection bias</i>). Developers running several agents at once are also hard to time.</li>
</ul>
<p class="bb-thesis">The 19% held for the people and tools of early 2025. The lesson outlasts the number: feeling faster and being faster can be very far apart.</p>
</section>

<section id="danh-gia">
<h2>Verdict</h2>
<div class="bb-diem">
<div><span>Strength of method</span><b>High</b><small>RCT, real tasks, timed</small></div>
<div><span>How far it generalizes</span><b>Low to medium</b><small>16 experts, early-2025 tools</small></div>
<div><span>Lasting value</span><b>Very high</b><small>A rare study that measures instead of asks, and admits it is out of date</small></div>
</div>
</section>

<section id="ap-dung">
<h2>Try it: measure whether AI really helps you</h2>
<ol class="bb-buoc">
<li><b>Pick 10 similar tasks</b> you do every week: emails, reports, slide fixes.</li>
<li><b>Flip a coin</b> for each: 5 with AI, 5 on your own.</li>
<li><b>Write down your forecast</b> before you start: how much faster will AI make you?</li>
<li><b>Time it for real,</b> including writing prompts and fixing AI's output.</li>
<li><b>Compare the clock with your forecast.</b> Where AI is slower, do it yourself. Where it's faster, save the prompt as a template.</li>
</ol>
</section>

<section id="nguon">
<h2>Sources</h2>
<ul class="bb-nguon">
<li>Becker, Rush, Barnes, Rein (METR), "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity", 10 July 2025. <a href="https://arxiv.org/abs/2507.09089" target="_blank" rel="noopener">arXiv:2507.09089</a> · <a href="https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/" target="_blank" rel="noopener">METR blog</a></li>
<li>METR, "We are Changing our Developer Productivity Experiment Design", 24 Feb 2026. <a href="https://metr.org/blog/2026-02-24-uplift-update/" target="_blank" rel="noopener">metr.org</a></li>
</ul>
</section>
