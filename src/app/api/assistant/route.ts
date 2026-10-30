import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fail, guard } from '@/lib/guard';

// A small retrieval demo: TF-IDF style keyword scoring over the dummy documents stored in the
// KnowledgeChunk table. No LLM is called. Swapping this for embeddings + an LLM is the natural next step.
const STOP = new Set('the a an and or of to in is are for on with be by as at it this that can how what when do does i my you your from'.split(' '));
const tokenize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w));

export async function POST(req: Request) {
  const g = await guard();
  if (g.error) return g.error;

  const body = (await req.json().catch(() => ({}))) as { question?: unknown };
  const question = String(body.question ?? '').trim().slice(0, 300);
  if (question.length < 3) return fail('Please ask a question');

  const chunks = await db.knowledgeChunk.findMany();
  const tokens = chunks.map((c) => tokenize(c.text));
  const docFreq = new Map<string, number>();
  tokens.forEach((toks) => new Set(toks).forEach((t) => docFreq.set(t, (docFreq.get(t) ?? 0) + 1)));

  const q = tokenize(question);
  const ranked = chunks
    .map((chunk, i) => {
      const score = q.reduce((sum, term) => {
        const tf = tokens[i].filter((t) => t === term).length;
        return tf ? sum + tf * Math.log(1 + chunks.length / (docFreq.get(term) ?? 1)) : sum;
      }, 0);
      return { chunk, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (!ranked.length) {
    return NextResponse.json({
      answer: "I couldn't find anything about that in the sample documents. Try asking about projects, loans, safety, plant alerts or properties.",
      sources: [],
    });
  }
  return NextResponse.json({
    answer: ranked.map((r) => r.chunk.text).join(' '),
    sources: ranked.map((r) => ({ doc: r.chunk.doc, snippet: r.chunk.text.slice(0, 90) + '…', score: +r.score.toFixed(2) })),
  });
}
