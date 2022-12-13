// #region SpeechRecognition dependencies
if(!window.webkitSpeechRecognition){
    log('Sorry this will work only in Chrome for now...');
  }
  
const wakeWord = 'hey computer'
const sanitizeList = ['paint me ', 'make me ']

const button = document.getElementById('start')
const recognition = new webkitSpeechRecognition();
recognition.continuous = true
recognition.lang = 'en-US'
recognition.interimResults = false
recognition.maxAlternatives = 1
// #endregion

// #region handle speech sampling
const detectSilence = (
    stream,
    onSoundEnd = _=> {},
    onSoundStart = _=> {},
    silenceDelay = 500,
    minDecibels = -80) => {
        const ctx = new AudioContext()
        const analyser = ctx.createAnalyser()
        const streamNode = ctx.createMediaStreamSource(stream)
        streamNode.connect(analyser)
        analyser.minDecibels = minDecibels

        const data = new Uint8Array(analyser.frequencyBinCount)
        let silenceStart = performance.now()
        let triggered = false

        const loop = (time) => {
            requestAnimationFrame(loop)
            analyser.getByteFrequencyData(data)
            if (data.some(v => v)) {
                if (triggered) {
                    triggered = false
                    onSoundStart()
                }
                silenceStart = time
            }

            if (!triggered && time - silenceStart > silenceDelay) {
                onSoundEnd()
                triggered = true
            }
        }
        loop()
}

const startSpeech = () => {
    recognition.start()
}

const stopSpeech = () => {
    recognition.stop()
}

navigator.mediaDevices.getUserMedia({audio:true})
    .then(stream => detectSilence(stream, stopSpeech, startSpeech))
    .catch(e => console.log(e.message))
// #endregion

recognition.onresult = (e) => {
    var transcripts = [].concat.apply([], [...e.results])
        .map(res => [...res]
            .map(alt => alt.transcript
    ))

    if (transcripts[0][0].includes(wakeWord)) {
        console.log('Heard keyword')
        console.log(transcripts[0][0])

        var sanitizedTranscript = sanitzeTranscript(transcripts[0][0].toString())
        console.log(sanitizedTranscript)
        sendPrompt(sanitizedTranscript)
        
    } else {
        return
    }
}

const sendPrompt = async (prompt) => {
    var header = {
        'Content-Type': 'application/json'
    }

    var body = {
        'prompt': `${prompt}`
    }

    var url = new URL('http://localhost:5876/sendText')
    var result = await fetch(url, {method: 'post', headers: header, body:JSON.stringify(body)})
    console.log(prompt)
    console.log(result)
}

const sanitzeTranscript = (transcript) => {
    var sanitized = transcript.split(wakeWord).pop()
    for (var i = 0; i < sanitizeList.length; i++) {
        sanitized = sanitized.replaceAll(sanitizeList[i], '')
    }

    var i = 0;
    while (sanitized[i] === ' ')  {
        sanitized = sanitized.slice(i)
        i++
    }
    return sanitized
}
