# About
A voice assistant demo using OpenAI assistant + connect to tthe internet using function calling.

- Voice input: Javascript Web Speech API
- AI assistant: OpenAI AI assistant
- Voice Output: [OpenAI Text to Speech](https://platform.openai.com/docs/guides/text-to-speech)

- Blog post explanation for the basic: [Build an AI Voice assistant like Siri using OpenAI](https://serpapi.com/blog/build-ai-voice-assistant-like-siri-use-openai-ai-assistant/)
- Blog post for this repo: [+ Connect the AI voice with Google - to get real time data](https://serpapi.com/blog/build-a-smart-ai-voice-assistant-connect-to-the-internet)

> Wathchout, make sure to choose a model that support function calling. Ref: https://platform.openai.com/docs/guides/function-calling

## Disclaimer

- OpenAI asisstants API is still in Beta. Some errors are expected. Please refer to forum.opneai.com if the error is related to OpenAI.
- It takes some time to generate the results (the more adv the model is, the longer you'll receive the response)


## Alternatives
- For voice input we can use speech-to-text API from OpenAI, AssemblyAI, or OtterAI
- For voice ouput we can use ElevenLabs API or Javascript SpeechSynthesis API (Web Speech API)

## Additional resources
- [Basic tutorial of Assistant API by OpenAI](https://serpapi.com/blog/assistant-api-openai-beginner-tutorial/)

## Assistant's Information

Instruction
```
You're a general AI assistant that can help with anything. You're a voice assistant, so don't speak too much, make it clear and concise. When needed, you can access the internet through an external functions that available to you. The external function is access to Google, you can get a direct answer or knowledge graph from your Google search. Only use the external API when needed.
```

Functions
```
{
  "name": "getSearchResult",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The search query"
      }
    },
    "required": [
      "query"
    ]
  },
  "description": "return search results from a given keyword"
}
```