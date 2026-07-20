# RAG Quality, Citations, Evaluation, and Feedback Design

## Summary

Improve the public RAG assistant through four connected capabilities: hybrid retrieval, exact citations, a repeatable evaluation set, and anonymous response feedback. The work extends the existing OpenAI Embedding, Supabase pgvector, DeepSeek, and SSE architecture without introducing a new model provider, vector database, administration UI, or persistent conversation history.

The quality loop is:

```text
Measure current behavior
  -> retrieve better evidence
  -> expose only evidence actually cited
  -> collect anonymous user feedback
  -> use evaluation and feedback to guide later changes
```

## Goals

- Combine semantic and lexical retrieval so both natural-language concepts and exact technical terms can be found reliably.
- Prevent one document from dominating the model context with near-duplicate chunks.
- Require generated claims based on site content to reference stable source identifiers.
- Show visitors only the sources actually cited by the generated answer.
- Replace raw vector similarity percentages with understandable source metadata and matching excerpts.
- Add a version-controlled golden evaluation set and deterministic tests for the retrieval and citation pipeline.
- Provide an opt-in online evaluation command for measuring the deployed RAG providers and corpus.
- Collect anonymous helpfulness feedback without storing IP addresses, user agents, email addresses, phone numbers, or browser fingerprints.
- Preserve the existing streaming chat experience and degrade safely when one retrieval channel fails.

## Non-Goals

- Do not replace OpenAI Embeddings, DeepSeek, Supabase, or pgvector.
- Do not add a dedicated reranking provider or general-purpose RAG framework.
- Do not add persistent multi-turn chat history or long-term visitor memory.
- Do not add a feedback administration dashboard.
- Do not add authentication to the public assistant.
- Do not store contact-flow messages in RAG feedback.
- Do not make the assistant a general web-search chatbot.

## Selected Approach

Use a gradual extension of the current architecture:

1. Keep the existing pgvector retrieval RPC.
2. Add a PostgreSQL full-text retrieval RPC covering chunk content, document titles, and tags.
3. Merge both ranked candidate lists in TypeScript with Reciprocal Rank Fusion (RRF).
4. Enforce per-document diversity and apply a small page-context boost.
5. Assign stable source identifiers to the selected context chunks.
6. Require the model to cite those identifiers and validate them after generation.
7. Store anonymous feedback through a server-only API.
8. Evaluate deterministic pipeline behavior locally and full provider behavior through an explicit online command.

This keeps SQL focused on efficient candidate retrieval while leaving ranking policy, confidence rules, and citation validation in testable TypeScript modules.

## Retrieval Architecture

### Vector Retrieval

Continue using the existing `match_rag_chunks` RPC and query embedding. Retrieve a wider candidate pool than the final context requires so fusion and diversity rules have meaningful choices.

The vector channel may return up to 12 candidates with its current similarity value. The final values remain internal and are not presented as answer confidence to visitors.

### Lexical Retrieval

Add a new SQL patch that creates a full-text retrieval function. It searches:

- `rag_chunks.content`
- `rag_documents.title`
- `rag_documents.tags`

The function returns the same source identity fields as vector retrieval plus a lexical rank. It must filter to `rag_documents.is_public = true` and remain executable only by the server-side service role.

Chinese text segmentation in the existing PostgreSQL configuration may be limited. The first implementation therefore combines PostgreSQL full-text rank with exact case-insensitive substring matches for titles and tags. This improves project names, framework names, version strings, and identifiers without introducing another search service.

### Rank Fusion

Create a focused `fusion.ts` module containing pure functions for:

- normalizing candidates from both channels;
- merging duplicate chunks;
- calculating RRF scores;
- applying a small page-context source-type boost;
- limiting one document to at most two chunks;
- selecting the final context candidates;
- classifying retrieval confidence.

RRF uses rank positions rather than incomparable raw vector and text-search scores. The default formula is:

```text
score(candidate) = sum(1 / (60 + channelRank)) + optionalPageBoost
```

The page boost is deliberately smaller than the difference between a clearly relevant and weak candidate. It helps break close ties but cannot make unrelated page content outrank strong matches.

### Page Context

The client sends a constrained page-context value derived from the known route categories, such as `projects`, `skills`, `knowledge`, or `resources`. The server validates this value against a fixed union before using it.

Page context influences source-type weighting only. It is not inserted as trusted factual content and cannot select private documents.

### Degraded Retrieval

- If vector retrieval fails and lexical retrieval succeeds, continue with lexical candidates.
- If lexical retrieval fails and vector retrieval succeeds, continue with vector candidates.
- If both fail, return the existing safe assistant-unavailable error.
- Log which channel failed with a request trace ID, without returning provider or database details to the visitor.

### Confidence Gate

The fusion module classifies the final selection as sufficient or insufficient using deterministic evidence signals:

- whether any candidates exist;
- whether a candidate appeared in both retrieval channels;
- vector similarity of the leading candidate when available;
- exact title or tag matches from the lexical channel;
- the fused score gap between leading and weak candidates.

When evidence is insufficient, the prompt requires the answer to state that the site corpus does not fully cover the question. Sources are shown only if the answer actually cites valid candidates.

## Citation Architecture

### Context Identifiers

Before generation, selected chunks receive stable request-local identifiers:

```text
[S1] Project Alpha
[S2] React knowledge note
```

The context contains the identifier, title, source type, tags, and chunk text. Retrieved content remains explicitly untrusted and cannot override system instructions.

### Generation Contract

The model must:

- append `[S1]`, `[S2]`, and similar identifiers directly after claims based on site content;
- cite only identifiers present in the supplied context;
- avoid citations for clearly labelled general technical advice;
- state that site coverage is incomplete when the confidence gate is insufficient;
- never invent a citation identifier.

The response stays plain streamed text so the existing SSE and DeepSeek streaming client remain usable.

### Validation

Create a pure `citations.ts` module that:

- extracts unique source identifiers from completed answer text;
- discards identifiers not present in the request context;
- maps valid identifiers to public source objects;
- converts displayed identifiers from internal `[S1]` form to visitor-facing `[1]` form;
- produces a final list containing only sources actually referenced by the answer.

Invalid citation markers are removed from visitor-facing text. A generated answer with no valid citations may still be returned, but it must not display unrelated source cards. When the response offers general guidance without site evidence, the UI labels it as general guidance.

### Streaming Events

The SSE protocol becomes:

```text
meta  -> responseId and safe request metadata
delta -> generated answer text
done  -> validated answer text if normalization changed it,
         cited sources, evidence mode, and timing metrics
error -> safe visitor-facing error
```

Candidate sources are not exposed in the initial `meta` event. This prevents the UI from briefly showing sources that the answer never cites. The client applies the authoritative citation and timing data from `done`.

### Source UI

The source list shows:

- citation number;
- localized source type;
- source title;
- a short matching excerpt;
- a safe internal or external link when available.

Raw vector similarity percentages are removed because they are retrieval scores, not calibrated answer-confidence values.

## Anonymous Feedback

### Response Identity

Each generated assistant answer receives a cryptographically random `responseId`. The browser maintains a random anonymous `sessionId` in local storage. Neither value encodes personal information.

Contact-mode messages do not receive a feedback identity and are never sent to the feedback API.

### Data Model

Add two server-managed tables through a new SQL patch.

`rag_responses` stores the immutable quality snapshot produced by the chat route:

- `response_id uuid primary key`
- `question_summary text not null`
- `question_hash text not null`
- `answer text not null`
- `cited_source_ids text[] not null default '{}'`
- `retrieval_ms integer null`
- `first_token_ms integer null`
- `total_ms integer null`
- `created_at timestamptz not null default now()`

`rag_feedback` stores the visitor's evaluation of that snapshot:

- `id uuid primary key`
- `response_id uuid not null references rag_responses(response_id) on delete cascade`
- `session_id uuid not null`
- `helpful boolean not null`
- `reason text null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

A unique constraint on `(response_id, session_id)` allows one anonymous visitor to update feedback for an answer without creating duplicates.

Allowed negative reasons are:

- `inaccurate`
- `irrelevant_sources`
- `did_not_answer`
- `incomplete`
- `other`

### Privacy Boundary

The system does not store:

- IP addresses;
- email addresses;
- phone numbers;
- user agents;
- browser fingerprints;
- authenticated user identifiers;
- contact-flow content.

Questions and answers are stored in plain text because they are required for quality diagnosis. The feedback UI states that submitted feedback is anonymously used to improve answers.

### Feedback API

The chat route writes the `rag_responses` snapshot after generation completes. A snapshot write failure is logged but does not invalidate an otherwise successful answer.

Add `POST /api/rag/feedback`. It validates:

- UUID formats for `responseId` and `sessionId`;
- boolean helpfulness;
- the fixed reason enum;
- that `responseId` exists in `rag_responses`.

The API accepts no question, answer, source, timing, IP, or user-agent values from the browser. It upserts by `(response_id, session_id)` through the server-side Supabase admin client. Database policies do not grant anonymous clients direct table access.

The endpoint uses the existing public-request rate-limit infrastructure with a separate, lower-cost feedback bucket. The limiter may inspect the request IP transiently but does not persist it in either response or feedback storage.

### Feedback UI

After a completed RAG answer:

- show “有帮助” and “没帮助” actions;
- submit positive feedback immediately;
- expand the reason choices after negative feedback;
- show a lightweight anonymous-use notice;
- allow changing an existing choice;
- show a retry state if submission fails;
- never block or remove the answer when feedback fails.

## Evaluation Design

### Golden Dataset

Create a version-controlled dataset of approximately 30 initial cases covering:

- known project, experience, and skill facts;
- exact names and technical versions;
- multi-source summaries;
- questions unsupported by the site corpus;
- prompt injection and sensitive-information requests;
- Chinese and English variants;
- synonyms and minor spelling variation.

Each case includes:

- stable case ID;
- category;
- question;
- expected source types or source IDs;
- required answer terms;
- forbidden answer terms;
- whether insufficient coverage is expected;
- whether valid citations are required;
- whether a safe refusal is expected.

Cases must avoid brittle full-answer string matching.

### Deterministic Tests

Add local tests for pure pipeline behavior without calling paid providers:

- RRF merges and orders both channels correctly;
- duplicate chunks and excessive same-document chunks are removed;
- page context provides only a bounded boost;
- insufficient evidence is classified correctly;
- citation extraction ignores invalid identifiers;
- only cited sources become public sources;
- feedback request validation rejects personal or malformed fields;
- golden dataset records conform to their schema.

Tests are written before implementation and must be observed failing for the intended missing behavior before production code is added.

### Online Evaluation

Add an explicit command that uses the configured OpenAI, Supabase, and DeepSeek services. It runs the golden cases and reports:

- expected-source hit rate;
- valid citation rate;
- insufficient-coverage recognition rate;
- safe-refusal rate;
- average retrieval latency;
- average first-token latency;
- average total latency;
- per-case failures.

The command exits non-zero when configured quality thresholds fail:

- expected-source hit rate below 85%;
- valid citation rate below 90% for cases requiring citations;
- any unsupported personal fact in explicitly guarded cases;
- any failed sensitive-information refusal.

Online evaluation is not part of ordinary unit tests, lint, type checking, or builds. Missing environment variables produce a clear setup error rather than silently skipping cases.

## Observability

Each RAG request receives a trace ID used only in server logs. Record structured events for:

- embedding duration;
- vector and lexical retrieval duration and candidate counts;
- fusion result count and evidence mode;
- first-token and total generation duration;
- cited source count;
- safe error category.

Logs must not include service keys, raw provider error bodies, IP addresses, contact details, or complete feedback payloads.

## File Boundaries

Expected responsibilities:

- `src/lib/rag/retrieval.ts`: database retrieval adapters only.
- `src/lib/rag/fusion.ts`: pure candidate fusion, diversity, page boost, and confidence rules.
- `src/lib/rag/citations.ts`: pure citation formatting, extraction, normalization, and mapping.
- `src/lib/rag/deepseek.ts`: prompt construction and generation calls.
- `src/app/api/rag/chat/route.ts`: validation, orchestration, timing, logging, and SSE protocol.
- `src/lib/rag/feedback.ts`: feedback request validation and persistence inputs.
- `src/app/api/rag/feedback/route.ts`: public feedback endpoint.
- `src/components/rag/chat/AnswerFeedback.tsx`: visitor feedback interaction.
- `src/components/rag/chat/SourceList.tsx`: cited-source presentation.
- `src/lib/rag/evaluation/*`: golden dataset types and deterministic scoring.
- `scripts/rag/evaluate-rag.ts`: opt-in online evaluation runner.
- `scripts/sql/patch-rag-hybrid-search-feedback.sql`: additive database changes.

Existing files are modified surgically. Current uncommitted user changes in the chat route, chat panel, DeepSeek client, embedding client, and proxy layer must be preserved.

## Error Handling

- A single retrieval-channel failure degrades to the remaining channel.
- A double retrieval failure returns the existing safe assistant-unavailable message.
- Provider timeouts and streaming failures never expose raw provider responses.
- Invalid model citations are removed and never create clickable source cards.
- Feedback submission failure presents a retry action but does not affect chat state.
- Online evaluation failures identify the failed case and metric.
- Missing online-evaluation credentials fail before paid calls begin.

## Accessibility

- Feedback actions use explicit button labels and pressed states.
- Negative feedback reasons are keyboard accessible.
- Feedback success and error messages use an appropriate status region.
- Streaming answer updates use a polite live region without announcing every token individually.
- Citation links retain visible titles and safe focus styles.

## Verification

The implementation is complete when:

- deterministic tests pass for fusion, diversity, confidence, citations, feedback validation, and dataset schema;
- the public assistant exposes only sources actually cited by the final answer;
- source cards no longer display raw vector similarity percentages;
- anonymous feedback can be created and updated without identity fields;
- the online evaluation command runs against configured services and produces metric summaries;
- existing contact flow continues to work and does not enter feedback storage;
- `pnpm lint`, `pnpm typecheck`, relevant tests, and `pnpm build` pass;
- the user’s pre-existing workspace changes remain intact.

## Rollout

1. Apply the additive SQL patch for lexical search and feedback storage.
2. Deploy hybrid retrieval, citation validation, SSE changes, and UI changes together so the protocol stays consistent.
3. Run the online evaluation against the production-like corpus before enabling feedback broadly.
4. Inspect anonymous feedback through Supabase queries until a dedicated administration experience is justified by usage volume.
