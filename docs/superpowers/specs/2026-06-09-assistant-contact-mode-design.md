# Assistant Contact Mode Design

## Summary

Move the current contact workflow into the floating AI assistant as a local Contact Mode. The assistant keeps its existing RAG Ask Mode, but can switch into a guided contact flow when the visitor clicks “联系我” or types contact-related intent.

## Goals

- Make the floating assistant the unified entry for site Q&A and contacting the owner.
- Preserve the current contact module's core behavior: intent selection, name, email, message, confirmation, and `mailto:` handoff.
- Avoid AI/provider calls for contact collection to reduce cost and keep personal contact data local to the browser.
- Provide quick actions for copying email, copying phone, restarting contact flow, and returning to Ask Mode.
- Keep the original `ContactChat` component in place for now to avoid large navigation/content changes in the first iteration.

## Non-Goals

- Do not add a backend email service in this iteration.
- Do not store contact messages in Supabase.
- Do not persist contact/chat history across refreshes.
- Do not delete the existing contact page or navigation entry in this iteration.
- Do not use LLMs to rewrite or summarize the contact message in the first version.

## User Experience

### Entry Points

Visitors can enter Contact Mode by:

- Clicking a welcome suggestion button labeled `联系我`.
- Typing contact intent such as “联系你”, “怎么联系”, “合作”, “面试”, “邮箱”, “电话”, or “加微信”.

### Ask Mode Welcome Suggestions

The assistant welcome area should offer four actions:

- `问项目`
- `看技术栈`
- `资源推荐`
- `联系我`

The first three continue using Ask Mode and submit predefined RAG questions. `联系我` starts Contact Mode without calling `/api/rag/chat`.

### Contact Flow

Contact Mode is a guided local flow:

1. Choose intent: `合作咨询`, `技术交流`, `面试机会`, `就是打个招呼`.
2. Enter name.
3. Enter email.
4. Enter message.
5. Review generated email draft.
6. Choose an action:
   - `打开邮箱发送`
   - `复制邮箱`
   - `复制电话`
   - `重新填写`
   - `返回问答`

### Direct Contact Questions

If a visitor asks only for contact information, such as “你的邮箱是什么” or “电话多少”, the assistant should show a contact card and actions without forcing the full contact form.

## State Design

### Assistant Mode

```ts
type AssistantMode = 'ask' | 'contact'
```

### Contact Stage

```ts
type ContactStage = 'intent' | 'name' | 'email' | 'message' | 'confirm' | 'done'
```

### Contact Data

```ts
interface ContactData {
  intent: string
  name: string
  email: string
  message: string
}
```

### Message Actions

Extend assistant messages with optional actions so local UI actions can be rendered inside the same chat stream.

```ts
interface MessageAction {
  id: string
  label: string
  kind: 'primary' | 'secondary' | 'ghost'
}
```

## File Design

### `src/components/rag/contactFlow.ts`

Owns local contact-flow constants and pure helpers:

- `CONTACT_EMAIL`
- `CONTACT_PHONE`
- `CONTACT_INTENTS`
- `detectContactIntent(message: string)`
- `isDirectContactInfoRequest(message: string)`
- `validateContactEmail(email: string)`
- `buildMailtoUrl(data: ContactData)`
- `createContactSummary(data: ContactData)`

### `src/lib/rag/types.ts`

Extend `ChatMessage` with optional UI actions:

- `actions?: MessageAction[]`
- optional `variant?: 'default' | 'contact' | 'system'`

### `src/components/rag/ContactActions.tsx`

Renders action buttons for contact flow messages.

### `src/components/rag/ContactSummary.tsx`

Renders a compact draft preview before opening `mailto:`.

### `src/components/rag/ChatPanel.tsx`

Adds:

- `mode`
- `contactStage`
- `contactData`
- contact flow handler before RAG API calls
- action dispatcher for contact buttons

### `src/components/rag/SuggestedQuestions.tsx`

Allows suggestion items to be either Ask Mode questions or local actions.

## Validation Rules

- Name must have at least 2 non-whitespace characters.
- Email must match a simple email regex.
- Message must have at least 2 characters and at most 800 characters.
- `mailto:` subject/body/cc must be URL encoded.
- Phone/email copy should use `navigator.clipboard` with a fallback when necessary.

## Privacy And Safety

- Contact form data remains in client component state only.
- Contact flow must not call `/api/rag/chat`, OpenAI, or DeepSeek.
- Contact flow must not write to Supabase.
- Direct contact info actions should expose only already-public contact details from the existing contact module.
- The assistant should make it clear that clicking `打开邮箱发送` opens the user's local mail client.

## Acceptance Criteria

- The assistant welcome suggestions include `联系我`.
- Clicking `联系我` starts Contact Mode without calling the RAG API.
- Contact Mode collects intent, name, email, and message with validation.
- Confirmation shows a readable email draft preview.
- `打开邮箱发送` opens a correctly encoded `mailto:` URL.
- `复制邮箱` and `复制电话` provide visible feedback.
- `返回问答` switches back to Ask Mode and preserves the ability to ask RAG questions.
- Existing RAG Ask Mode still works for normal questions.
- Existing `ContactChat` remains untouched in this iteration.
- Scoped lint passes for modified RAG assistant files.

