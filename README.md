# LLM in the browser experiment

This project is a fun experiment to test the new LLM model by Google that runs locally in the browser.

[Live demo](https://aldovincenti.github.io/llm-browser-experiment).

## Prerequisites

1. **Download Chrome Dev or Canary Channel** (version **≥ 129.0.6667.0**).
2. **Ensure at least 22 GB of free storage space** (not less than 10 GB after download).

## Instructions

### Enable Gemini Nano and Prompt API

1. Go to: 
   ```
   chrome://flags/#optimization-guide-on-device-model
   ```
   - Set **BypassPerfRequirement** to **Enabled**.
   
2. Go to:
   ```
   chrome://flags/#prompt-api-for-gemini-nano
   ```
   - Set **Prompt API** to **Enabled**.

3. **Relaunch Chrome.**

### Confirm Gemini Nano Availability

1. Open **DevTools** and run:
   ```javascript
   (await ai.assistant.capabilities()).available;
   ```
   - If it returns **“readily”** you’re set.

2. If it fails, run:
   ```javascript
   await ai.assistant.create();
   ```
   - Relaunch Chrome and check:
   ```
   chrome://components
   ```
   - Ensure **Optimization Guide On Device Model** is up-to-date.

---

A little experiment by [Aldo Vincenti](https://www.linkedin.com/in/aldo-vincenti).
