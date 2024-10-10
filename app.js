(async function () {
    if (typeof ai === 'undefined') {
        alert('This browser does not support the AI feature or it is disabled. Please follow the repo instructions.');
        return;
    }
    try {
        const aiSession = await createAISession();
        const video = document.getElementById('video');
        await startVideoStream(video);
        setupSpeechRecognition(aiSession);
    } catch (error) {
        console.error('Initialization error:', error);
        alert('An error occurred during initialization. Refresh the page and try again.');
    }
})();

async function createAISession() {
    return await ai.assistant.create({
        systemPrompt: `Extract personal information from the provided text and output it as a single, VALID JSON object (no additional lines, characters, or fields) with the following fields:
            "fullName": The person's full name (preferably) or first name/last name if explicitly mentioned; otherwise, set to null.
            "age": The age; if not mentioned, set to null.
            "role": The job title, role, or specialization; if not mentioned, set to null.
            "country": The country of residence; if not mentioned, set to null.
            "skills": The mentioned work-related skills, excluding hobbies, sports and non-work related activities, listed in an array; if no skills are mentioned, set to an empty array [].`
    });
}

async function startVideoStream(video) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            video.srcObject = stream;
            video.play();
            const startSpeakingButton = document.getElementById('startSpeakingButton');
            startSpeakingButton.removeAttribute('disabled');
        } catch (err) {
            console.error('Error accessing webcam:', err);
            alert('Could not access the webcam and/or microphone.');
        }
    } else {
        alert('getUserMedia is not supported in this browser.');
    }
}

function setupSpeechRecognition(aiSession) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speakNowMessage = document.getElementById('speakNowMessage');
    const processing = document.getElementById('processing');
    const startSpeakingButton = document.getElementById('startSpeakingButton');
    const stopSpeakingButton = document.getElementById('stopSpeakingButton');
    const infoContainer = document.getElementById('infoContainer');

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        let interimTranscript = '';

        recognition.onstart = () => {
            speakNowMessage.style.display = 'block';
            startSpeakingButton.style.display = 'none';
        };

        recognition.onend = async () => {
            speakNowMessage.style.display = 'none';
            startSpeakingButton.style.display = 'block';
            processing.style.display = 'block';
            await addTranscript(aiSession, interimTranscript.trim());
            interimTranscript = '';
        };

        recognition.onerror = (err) => {
            console.error('Speech Recognition error:', err);
            alert('Speech Recognition error: check your internet connection and try again.');
        };

        recognition.onresult = (event) => {
            interimTranscript = handleSpeechResult(event, interimTranscript);
        };

        startSpeakingButton.addEventListener('click', () => {
            infoContainer.style.display = 'none';
            recognition.start();
        });

        stopSpeakingButton.addEventListener('click', () => {
            recognition.stop();
        });
    } else {
        alert('Web Speech API is not supported in this browser.');
    }
}

function handleSpeechResult(event, interimTranscript) {
    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.trim();
        interimTranscript += transcript + ' ';
    }
    return interimTranscript;
}

function cleanJson(potentiallyDirtyJson) {
    const jsonOpening = potentiallyDirtyJson.indexOf('{');
    const jsonClosing = potentiallyDirtyJson.lastIndexOf('}');
    if (jsonOpening === -1 || jsonClosing === -1) {
        throw new Error('Potential JSON object not found');
    }
    return potentiallyDirtyJson.substring(jsonOpening, jsonClosing + 1);
}

async function addTranscript(aiSession, transcript) {
    const infoContainer = document.getElementById('infoContainer');
    const processing = document.getElementById('processing');
    try {
        const potentiallyDirtyJson = await aiSession.prompt(transcript);
        const cleanedJson = cleanJson(potentiallyDirtyJson);
        const output = JSON.parse(cleanedJson);
        processing.style.display = 'none';
        infoContainer.style.display = 'block';
        updateDOM(output);
    } catch (e) {
        console.error('Error parsing JSON:', e);
    }
}

function updateDOM(output) {
    document.getElementById('fullName').textContent = output.fullName;
    document.getElementById('age').textContent = output.age;
    document.getElementById('role').textContent = output.role;
    document.getElementById('country').textContent = output.country;
    document.getElementById('skills').textContent = output.skills.join(', ');
}
