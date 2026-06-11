# Google Gemini Dashboard - Upcoming Developer Features Roadmap

This document outlines the top 10 planned features for the Gemini API Checker & Playground Dashboard. These features are designed to transition the tool from a simple key validation checker into a premium, comprehensive developer utility.

---

## 1. Generation Parameters Panel (Sliders)
- **Description**: Add sliders to adjust native Gemini parameter controls.
- **Key Parameters**:
  - `Temperature` (0.0 to 2.0): Creativity control.
  - `Max Output Tokens` (e.g. up to 8k): Limits response length.
  - `Top-P` (Nucleus sampling threshold).
  - `Top-K` (Token pool sampling limits).
- **API Payload Schema**:
  ```json
  "generationConfig": {
    "temperature": 0.4,
    "maxOutputTokens": 2048,
    "topP": 0.95,
    "topK": 40
  }
  ```

---

## 2. Live Response Streaming (`generateContentStream`)
- **Description**: Upgrade the network fetch utility to handle server-sent chunk streams for real-time text rendering.
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?key={apiKey}`
- **Benefits**: Eliminates wait time by rendering character outputs immediately, enhancing the visual feel.

---

## 3. Copy Code Integration Utility ("Show Code")
- **Description**: A visual modal rendering code snippets to replicate the active prompt, parameters, and model setup.
- **Supported Languages**:
  - **cURL / Bash**: Raw HTTP post request syntax.
  - **Node.js**: Using `@google/genai` modern SDK.
  - **Python**: Google generative AI client library.
  - **Go**: Golang SDK config script.

---

## 4. Safety Filters Configuration Panel
- **Description**: Control settings to test prompt injection or safe text thresholds.
- **Adjustable Categories**:
  - `HARM_CATEGORY_HARASSMENT`
  - `HARM_CATEGORY_HATE_SPEECH`
  - `HARM_CATEGORY_SEXUALLY_EXPLICIT`
  - `HARM_CATEGORY_DANGEROUS_CONTENT`
- **Block Thresholds**: `BLOCK_NONE`, `BLOCK_LOW_AND_ABOVE`, `BLOCK_MEDIUM_AND_ABOVE`, `BLOCK_ONLY_HIGH`.

---

## 5. Custom System Instructions
- **Description**: Add a prompt window to declare system roles and behaviors before conversation starts.
- **API Payload Schema**:
  ```json
  "systemInstruction": {
    "parts": [{ "text": "You are a strict code auditor that only responds in JSON." }]
  }
  ```

---

## 6. Structured Outputs & JSON Schema Mode
- **Description**: Force model output structure by setting output requirements and supplying JSON schema objects.
- **API Payload Schema**:
  ```json
  "generationConfig": {
    "responseMimeType": "application/json",
    "responseSchema": {
      "type": "OBJECT",
      "properties": {
        "score": { "type": "INTEGER" },
        "explanation": { "type": "STRING" }
      },
      "required": ["score", "explanation"]
    }
  }
  ```

---

## 7. Local Chat Logs & Historical Exports
- **Description**: Auto-save active chat logs locally and support exporting conversation transcripts.
- **Supported Formats**: Markdown (`.md`), raw JSON payload logs (`.json`), or plain text logs (`.txt`).

---

## 8. Saved Prompt Templates Library
- **Description**: Pre-populated and custom templates categorized by developer use-cases (e.g. Code refactoring, system debug logs analysis, dataset formatting).

---

## 9. Split-Screen Side-by-Side Model Comparison
- **Description**: Dispatch the same prompt to two selected models simultaneously (e.g., Flash vs Pro) and compare outputs, tokens consumption, and API roundtrip latency in a split-screen view.

---

## 10. Vector Embeddings Inspector Tab
- **Description**: A dedicated developer dashboard page to inspect raw embedding vectors, dimensions, and similarity matrices using the `embedContent` API.
