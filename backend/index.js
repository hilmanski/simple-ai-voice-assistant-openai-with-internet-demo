const express = require('express');
const cors = require('cors')

require("dotenv").config();
const OpenAI = require('openai');
const { OPENAI_API_KEY, ASSISTANT_ID, SERPAPI_KEY } = process.env;

// Addition for function calling
const { getJson } = require("serpapi");

// Setup Express
const app = express();
app.use(express.json());
app.use(cors()) // allow CORS for all origins

// Set up OpenAI Client
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

// Assistant can be created via API or UI
const assistantId = ASSISTANT_ID
let pollingInterval


// Addition for function calling: 3rd party API calls
async function getSearchResult(query) {
    console.log('------- CALLING AN EXTERNAL API ----------')
    const json = await getJson({
        engine: "google",
        api_key: SERPAPI_KEY,
        q: query,
        location: "Austin, Texas",
    });

    return json['answer_box'] ;
}

// ========================
// OpenAI assistant section
// ========================

// Set up a Thread
async function createThread() {
    console.log('Creating a new thread...');
    const thread = await openai.beta.threads.create();
    return thread;
}

async function addMessage(threadId, message) {
    console.log('Adding a new message to thread: ' + threadId);
    const response = await openai.beta.threads.messages.create(
        threadId,
        {
            role: "user",
            content: message
        }
    );
    return response;
}

async function runAssistant(threadId) {
    console.log('Running assistant for thread: ' + threadId)
    const response = await openai.beta.threads.runs.createAndPoll(
        threadId,
        { 
          assistant_id: assistantId
          // Make sure to not overwrite the original instruction, unless you want to
        }
      );

    return response;
}

async function checkingStatus(res, threadId, runId) {
    const runObject = await openai.beta.threads.runs.retrieve(
        threadId,
        runId
    );

    const status = runObject.status;
    console.log('> Current status: ' + status);
    
    if(status == 'completed') {
        clearInterval(pollingInterval);

        const messagesList = await openai.beta.threads.messages.list(threadId);
        const lastMessage = messagesList.body.data[0].content[0].text.value

        res.json({ message: lastMessage });

    } else if(status == 'queued' || status == 'in_progress') {
        console.log('Still in progress or queued ... ')
        await new Promise(r => setTimeout(r, 2000)); // wait 2 seconds
        checkingStatus(res, threadId, runId)
    } else if(status === 'requires_action') {
        if(runObject.required_action.type === 'submit_tool_outputs') {
            console.log('submit tool outputs ... ')
            const tool_calls = await runObject.required_action.submit_tool_outputs.tool_calls

            // We can call for a function simultaneously, by adding them in one array
            let toolOutputs = []
            for(const toolCall of tool_calls) {
                const parsedArgs = JSON.parse(toolCall.function.arguments);
                const apiResponse = await getSearchResult(parsedArgs.query)
                console.log('Query for 3rd API: ' + parsedArgs.query)

                toolOutputs.push({
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(apiResponse)
                })
            }

            openai.beta.threads.runs.submitToolOutputs(
                threadId,
                runId,
                {
                    tool_outputs: toolOutputs
                }
            )

            await new Promise(r => setTimeout(r, 2000)); // wait 2 seconds
            checkingStatus(res, threadId, runId)
        }
    }
}

// ========================
//       Route server
// ========================
app.get('/', (req, res) => {
    res.send('Hello World!');
})

// Open a new thread
app.get('/thread', (req, res) => {
    createThread().then(thread => {
        res.json({ threadId: thread.id });
    });
})

app.post('/message', async (req, res) => {
    const { message, threadId } = req.body;
    addMessage(threadId, message).then(message => {
        runAssistant(threadId).then(run => {
            const runId = run.id;       
            checkingStatus(res, threadId, runId);
        });
    });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});