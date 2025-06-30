//@input Asset.VoiceMLModule vmlModule {"label": "Voice ML Module"}
// @input Asset.TextToSpeechModule tts {"label": "Text To Speech"}
// @input Component.AudioComponent audio
// @input Component.ScriptComponent mch

var isListeningForQuery = false; // Flag to indicate if it's listening for the query

// Dictionary of hints
var hintDictionary = {
    Object1: "Where do you throw waste?",
    Object2: "Yellow is my color",
    Object3: "Something sky high!"
};

// Listening options
var options = VoiceML.ListeningOptions.create();
options.speechRecognizer = VoiceMLModule.SpeechRecognizer.Default;
options.languageCode = 'en_US'; // Set language to English
options.shouldReturnAsrTranscription = true;
options.shouldReturnInterimAsrTranscription = true;

// Keyword detection: Set "Hey, Snap" as the trigger
var keyword = "Hey, Snap";
var keywordAliases = ["hey snap", "hey, snap"];
var nlpKeywordModel = VoiceML.NlpKeywordModelOptions.create();
nlpKeywordModel.addKeywordGroup(keyword, keywordAliases);
options.nlpModels = [nlpKeywordModel];

// Callback when voice recognition is enabled
var onListeningEnabledHandler = function () {
    script.vmlModule.startListening(options);
    print("Listening for 'Hey, Snap'...");
};

// Callback when voice recognition is disabled
var onListeningDisabledHandler = function () {
    script.vmlModule.stopListening();
    print("Voice recognition stopped.");
};

// Callback to handle errors
var onListeningErrorHandler = function (eventErrorArgs) {
    print("Error: " + eventErrorArgs.error + " desc: " + eventErrorArgs.description);
};

// Callback for updating listening events (transcriptions and keyword detection)
var onUpdateListeningEventHandler = function (eventArgs) {
    print(eventArgs.transcription);


    if (isListeningForQuery) {
        handleQuery(eventArgs);
    } else {
        // print("IN HERE")
        handleKeywordDetection(eventArgs);
    }
};

// Function to handle keyword detection
function handleKeywordDetection(eventArgs) {
    // if (!eventArgs.isFinalTranscription) {
    //     return;
    // }

    // Check for the keyword
    var keywordResponses = eventArgs.getKeywordResponses();
    if (keywordResponses.length > 0 && eventArgs.transcription.toLowerCase().includes("hey snap")) {
        print("Keyword 'Hey, Snap' detected. Listening for a query...");
        isListeningForQuery = true; // Now listen for the query
        script.vmlModule.startListening(options); // Continue listening for the query
    }
}

// Function to handle the query once the keyword is detected
function handleQuery(eventArgs) {
    // if (!eventArgs.isFinalTranscription) {
    //     return;
    // }

    print("Final Transcription: " + eventArgs.transcription);

    if (eventArgs.transcription.toLowerCase().includes("give me a hint")) {
        outputHint();
    }
}

// Function to output the hint using TTS
function outputHint() {
    print("Outputting Hint...");
    // Randomly select a hint from the dictionary
    var keys = Object.keys(hintDictionary);
    var randomKey = keys[Math.floor(Math.random() * keys.length)];
    var hint = hintDictionary[randomKey];
    var options = TextToSpeech.Options.create();

    print("Selected Hint: " + hint);

    // Check if TTS module and audio component are available
    if (script.tts && script.audio) {
        print("Generating TTS Audio...");
        script.tts.synthesize(hint, options, TTSCompleteHandler, TTSErrorHandler);
    } else {
        print("Error: TextToSpeechModule or AudioComponent not available.");
    }
}

// TTS Complete Handler
function TTSCompleteHandler(audioTrackAsset, wordInfos, phonemeInfos, voiceStyle) {
    print("TTS Audio Generated. Playing the audio...");
    playTTSAudio(audioTrackAsset, script.audio);
}

// TTS Error Handler
function TTSErrorHandler(error, description) {
    print("TTS Error: " + error + " - " + description);
}

// Play the TTS Audio
function playTTSAudio(audioTrackAsset, audioComponent) {
    audioComponent.audioTrack = audioTrackAsset;
    audioComponent.play(1); // Play the audio
}

// var onTouchEventHandler = function (normalizedPosition, touchId, timestampMs, phase) {
//     print("Touch event detected.");
//     outputHint();
// }

    

// print(script.mch.onTouchEvent);
// script.mch.onTouchEvent.add(onTouchEventHandler);

// Attach callbacks to the VoiceML Module
script.vmlModule.onListeningUpdate.add(onUpdateListeningEventHandler);
script.vmlModule.onListeningError.add(onListeningErrorHandler);
script.vmlModule.onListeningEnabled.add(onListeningEnabledHandler);
script.vmlModule.onListeningDisabled.add(onListeningDisabledHandler);

// Start listening for the "Hey, Snap" keyword
script.vmlModule.startListening(options);
