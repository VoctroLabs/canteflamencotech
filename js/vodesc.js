var step0Container = $('#step0-container'),
    step1Container = $('#step1-container'),
    step2Container = $('#step2-container');


var step0Title = step0Container.find('.step-title h1'),
    btnsCircle0 = step0Container.find('.btns-circle').find('a'),
    btnConfirm0 = btnsCircle0.filter('.btn-confirm'),
    btnCancel0 = btnsCircle0.filter('.btn-cancel');

var inputs = step0Container.find('input');

var input_user = step0Container.find('#user-input'),
    input_exercise = step0Container.find('#exercise-input');
//var input_user = inputs.filter('.user-input'),
//    input_exercise = inputs.filter('.exercise-input');

var selectExBtn = step0Container.find('#select-ex-btn'),
    selectExGroup = step0Container.find('#select-ex-group'),
    ex = selectExGroup.find('ul.dropdown-menu a');

var step1Title = step1Container.find('.step-title h1'),
    btnsCircle1 = step1Container.find('.btns-circle').find('a'),
    btnBack1 = btnsCircle1.filter('.btn-back'),
    btnConfirm1 = btnsCircle1.filter('.btn-confirm'),
    btnCancel1 = btnsCircle1.filter('.btn-cancel'),
    audioPlayer1 = step2Container.find('#audioPlayer');

/* *** BEGIN STEP 2 *** */

var step2Title = step2Container.find('.step-title h1'),
    btnsCircle2 = step2Container.find('.btns-circle').find('a'),
    canvasDescriptors2 = step2Container.find('#descriptorsCanvas'),
    audioPlayer2 = step2Container.find('#audioPlayer'),
/*    canvasDescriptors2 = $('#out').find('#descriptorsCanvas'),*/
    spinner = step2Container.find('#spinner'),
    playBtn = step2Container.find('#play-btn'),
    playBtnFg = playBtn.find('#play-btn-fg'),
    playBtnBg = playBtn.find('#play-btn-bg'),
    sound;

playBtn.click(function () {
    if (sound.playing()) sound.stop();
    else sound.play();
});

/* *** END STEP 2 *** */

input_user.keyup(function(){
  //if ((input_exercise[0].value != "") && (input_user[0].value!=""))
  if ((input_exercise[0].value != "") && (/\S/.test(input_user[0].value))) // string is not empty and not just whitespace
  {
    btnsCircle0.removeClass('disabled');
  }
  else
  {
    btnsCircle0.addClass('disabled');
  }

});

input_user.on('change',function(){
  if ((input_exercise[0].value != "") && (input_user[0].value!=""))
  {
    btnsCircle0.removeClass('disabled');
  }
  else
  {
    btnsCircle0.addClass('disabled');
  }

});


ex.on('click', function() {
    ex.removeClass('selected');
    $(this).addClass('selected');
    renderStep0();
});

selectExGroup.on('hidden.bs.dropdown', function () {
    var selectedEx = getSelectedEx();
    if (selectedEx.length === 0) return;

    selectExBtn[0].text = selectedEx[0].text;

    input_exercise[0].value = selectedEx[0].text;

    if ((input_exercise[0].value != "") && (input_user[0].value!=""))
    {
      btnsCircle0.removeClass('disabled');
    }
});

function getSelectedEx() {
    return ex.filter('.selected');
}




var au = document.createElement('audio');
au.id = "audiotagVoice";
au.controls = true;



var recordBtn = step1Container.find('#record-btn'),
    recordedSound,
    recordingTimeout,
    audioPickBtn = step1Container.find('#audio-pick-btn'),
    audioInput = step1Container.find('#audio-input'),
    audioInputSound,
    recorder = null;

recordBtn.status = 'init';
recordBtn.baseClasses = recordBtn.attr('class');
recordBtn.click(function () {
    if (recordBtn.status === 'init') {
        recordBtn.status = 'countdown';
        recordCountDown(3);
    } else if (recordBtn.status === 'recording') {
        recordBtn.status = 'recorded';
        stopRecording();
    } else if (recordBtn.status === 'recorded') {
        recordBtn.status = 'playing';
        recordedSound.play();
    } else if (recordBtn.status === 'playing') {
        recordBtn.status = 'recorded';
        recordedSound.stop();
    }
    renderStep1();
});

function recordCountDown(seconds) {
    if (seconds > 0) {
        recordBtn.countdown = seconds;
        renderRecordBtn();
        setTimeout(function () { recordCountDown(seconds - 1); }, 1000);
    } else captureMicrophone();
}

function captureMicrophone() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    
    var constraints = {audio: true};

    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }
    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        // First get ahold of the legacy getUserMedia, if present
        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }
        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
    }

    //Code for modern browsers
    navigator.mediaDevices.getUserMedia(constraints).then(function(microphone) {
      var audio_context = new AudioContext,
          input = audio_context.createMediaStreamSource(microphone),
          config = { numChannels: 1 };

          recorder = new Recorder(input, config);
          recorder.clear();
          recorder.record();

          // UI actions
          recordBtn.status = 'recording';
          renderRecordBtn();

          // Put a maximum recording time
          recordingTimeout = setTimeout(function recordingTimeout() {
            if (recordBtn.status === 'recording') {
              stopRecording();
              alert('El límite máximo de grabación son 15 segundos.');
            }
          }, 15 * 1000); // 15 seconds
            
    })
    .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.

    /*navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    navigator.getUserMedia(
        {audio: true},
        function (microphone) {
            var audio_context = new AudioContext,
                input = audio_context.createMediaStreamSource(microphone),
                config = { numChannels: 1 };

            recorder = new Recorder(input, config);
            recorder.clear();
            recorder.record();

            // UI actions
            recordBtn.status = 'recording';
            renderRecordBtn();

            // Put a maximum recording time
            recordingTimeout = setTimeout(function recordingTimeout() {
                if (recordBtn.status === 'recording') {
                    stopRecording();
                    alert('El límite máximo de grabación son 15 segundos.');
                }
            }, 15 * 1000); // 15 seconds
        },
        function(error) {
            console.error(error);
            alert('Imposible acceder a tu micrófono.');
        }
    );*/

}

function stopRecording() {
    clearTimeout(recordingTimeout);
    recorder.stop();
    recordBtn.status = 'loading';
    renderStep1();
    var recordedFunc = function () {
        recordBtn.status = 'recorded';
        renderRecordBtn();
    };
    recorder.exportWAV(function (blob) {
        recorder.blob = blob;
        recordedSound = new Howl({
            src: URL.createObjectURL(blob),
            format: 'wav',
            onload: recordedFunc,
            onend: recordedFunc
        });
    });
}

function audioInputHasFile() {
    if (audioInput.get(0))
      return audioInput.get(0).files.length > 0;
    else
      return false;
}

function audioInputBlob() {
    return audioInput.get(0).files[0];
}

audioPickBtn.click(function () {
    if (audioInputHasFile()) {
        // Play or stop sound
        if (audioInputSound.playing()) audioInputSound.stop();
        else audioInputSound.play();
    }
    else audioInput.click();
});

audioInput.change(function () {
    if (audioInputHasFile()) {
        audioPickBtn.addClass('btn-loading').text('Cargando...');
        var reader = new FileReader();
        reader.addEventListener('load', function () {
            audioInputSound = new Howl({
                src: reader.result,
                onload: function () {
                    if (audioInputHasFile())
                        audioPickBtn.removeClass('btn-loading').addClass('btn-play').text('Reproducir');
                },
                onplay: function () {
                    if (audioInputHasFile())
                        audioPickBtn.removeClass('btn-play').addClass('btn-stop').text('Graba tu voz');
                },
                onstop: function () {
                    if (audioInputHasFile())
                        audioPickBtn.removeClass('btn-stop').addClass('btn-play').text('Reproducir');
                },
                onend: function () {
                    if (audioInputHasFile())
                        audioPickBtn.removeClass('btn-stop').addClass('btn-play').text('Reproducir');
                }
            });
        });
        reader.readAsDataURL(audioInputBlob());
    }
    renderStep1();
});

// Set correct selection and disabled state for buttons
function renderStep0() {

        step1Container.fadeOut(0);
        //btnsCircle0.removeClass('disabled');

}


function renderStep1() {

    step1Container.fadeIn(200);

    var btnBaseClasses = 'btn btn-default btn-lg',
        audioPickBtnClasses = [btnBaseClasses],
        recordBtnClasses = [btnBaseClasses];
    if (recordBtn.status !== 'init') { // there is a recorded audio or we are recording one
        recordBtnClasses.push('selected');
        audioPickBtnClasses.push('disabled');
        if ($.inArray(recordBtn.status, ['loading', 'recorded', 'playing']) > -1) // recording finished
            btnsCircle1.removeClass('disabled');
        else btnsCircle1.addClass('disabled');
    }
    else if (audioInputHasFile()) {
        recordBtnClasses.push('disabled');
        audioPickBtnClasses.push('selected');
        btnsCircle1.removeClass('disabled');
    } else {
        audioPickBtn.text('Click to upload');
        //btnsCircle1.addClass('disabled');
        btnCancel1.addClass('disabled');
        btnConfirm1.addClass('disabled');
        btnBack1.removeClass('disabled');

    }
    audioPickBtn.attr('class', audioPickBtnClasses.join(' '));
    renderRecordBtn(recordBtnClasses);
}

function renderRecordBtn(classes) {
    if (!classes) classes = ['btn btn-default btn-lg'];
    if (recordBtn.status === 'init') recordBtn.text('Graba tu voz');
    else if (recordBtn.status === 'countdown') {
        recordBtn.text('Grabando en ' + recordBtn.countdown);
        classes.push('selected');
    } else if (recordBtn.status === 'recording') {
        recordBtn.text('Parar grabación');
        classes.push('selected', 'btn-record');
    } else if (recordBtn.status === 'loading') {
        recordBtn.text('Tu grabación');
        classes.push('selected', 'btn-loading');
    } else if (recordBtn.status === 'recorded') {
        recordBtn.text('Tu grabación');
        classes.push('selected', 'btn-play');
    } else if (recordBtn.status === 'playing') {
        recordBtn.text('Tu grabación');
        classes.push('selected', 'btn-stop');
    }
    recordBtn.attr('class', classes.join(' '))
}

function stopAllSounds() {
    recordedSound && recordedSound.stop();
    audioInputSound && audioInputSound.stop();
}

// On confirm go to next step
btnConfirm0.click(function () {
    stepTransition(step0Container, step1Container);
    //get user from textbox
    user = input_user[0].value;
    exercise = input_exercise[0].value;
    //get exercise from combo
    window.location.href = String( window.location.href ).replace( "#", "" ) + "?user="+user+"&exercise="+exercise;
});

// On confirm go to next step
btnConfirm1.click(function () {
    stopAllSounds();
    stepTransition(step1Container, step2Container);
    vodesc();
});

btnCancel1.click(function () {
    stopAllSounds();
    audioInput.val(''); // clear file input
    recordBtn.status = 'init'; // clear recorded audio
    renderStep1();
});


/* *** STEP 2 *** */

var wavesurfer;
var spectrogram;
var voiceful_descriptors;

var vodescTask, descriptorsUrl;

function vodesc() {
    var parameters = {
        metadata: "{ \"user\": \"" + user + "\", \"exercise\": \"" + exercise + "\"}"
        /*preset_name: getSelectedVoice().text()*/
    };

    var uploads = {
        audio: recordBtn.status === 'recorded' ?
            {
                contentType: 'audio/wav',
                data: recorder.blob
            } :
            {
                contentType: false,
                data: audioInputBlob()
            }
    };

    vodescTask = new VocloudTask('vodesc');
    vodescTask.process(parameters, uploads).done(function () 
    {

        var playBtn = step2Container.find('#play-btn');
        var audioUser = step2Container.find('#audiotagVoice');

        playBtn.click(function () {
            /*if (playBtn.status === 'init') {
                playBtn.status = 'countdown';
                recordCountDown(3);
            } else if (playBtn.status === 'recording') {
                playBtn.status = 'recorded';
                stopRecording();
            } else*/ if (playBtn.status === 'recorded') {
                playBtn.status = 'playing';
                audioUser.play();
            } else if (playBtn.status === 'playing') {
                playBtn.status = 'recorded';
                audioUser.stop();
            }
        });



        var audioelement = document.getElementById("audiotagVoice");
        
        audioelement.src = recordBtn.status === 'recorded' ? recordedSound._src : audioInputSound._src;
        
        audioelement.ontimeupdate = function(){updateWaveSurferTime(audioelement);};


        var SpectrogramPlugin = window.WaveSurfer.spectrogram;
        var TimelinePlugin = window.WaveSurfer.timeline;

        wavesurfer = WaveSurfer.create({
              container: '#waveform',
              scrollParent: false,
              fillParent: true,
              pixelRatio: 1,
              waveColor: '#FFFFFF',
              progressColor: '#C80A0A',
              cursorColor: '#111111',
              cursorWidth: 4,
              hideScrollbar: true,
              mediaControls: false,
              normalize: true,
              responsive: true,
              plugins: [
                SpectrogramPlugin.create({ container: '#wave-spectrogram',
                                           fftSamples: 4096,
                                           labels: false
                                         }),
                TimelinePlugin.create({ container: '#wave-timeline',
                                        height: 20,
                                        notchPercentHeight: 90,
                                        labelPadding: 5,
                                        unlabeledNotchColor: '#f0f0f0',
                                        primaryColor: '#f0f0f0',
                                        secondaryColor: '#f0f0f0',
                                        primaryFontColor: '#f0f0f0',
                                        secondaryFontColor: '#f0f0f0',
                                        fontFamily: 'Arial',
                                        fontSize: 10
                                      })
              ]
            });
        
        wavesurfer.on('seek', function () {
              updateVoiceAudioTime(this);
            });


        wavesurfer.load(audioelement.src);

        /*wavesurfer.on('ready', function () 
        {
          //drawDescriptors();
        });*/

        /*var responsiveWave = wavesurfer.util.debounce(function() {
          wavesurfer.empty();
          wavesurfer.drawBuffer();
          //spectrogram.empty();
          //spectrogram.drawBuffer();
        }, 150);
*/
        var responsiveSpectrogram = function(){
            wavesurfer.spectrogram.render();
            };
        window.addEventListener('resize', responsiveSpectrogram);
                
        descriptorsUrl = vodescTask.descriptors_url;

        var jqxhr = $.getJSON( descriptorsUrl, function(data) {
          console.log( "success" );
        })
          .done(function(data) {
            console.log( "second success" );
          })
          .fail(function(data) {
            console.log( "error" );
          })
          .always(function(data) {
            console.log( "complete" );
            console.log(data.pitch[0][0]);

            voiceful_descriptors = data;
            //voiceful_descriptors = JSON.parse(JSON.stringify(data));

            drawDescriptors();
            drawSpectrogramLabels();

            setTimeout(function () {
              if (1) {
                  //drawDescriptors();
                  window.dispatchEvent(new Event('resize'));
              }
            }, 3000);

          });

        stepTransition(spinner, /*playBtn*/canvasDescriptors2, function () {
            step2Title.text('Resultado');
            
            if (window.innerWidth >= 800)
              $('body').css('background', 'url(img/bg-canteflamenco-nowave.png)');
            else
              $('body').css('background', 'url(img/bg-canteflamenco-nowave_small.png)');

            $('.step-title h1').css('margin-bottom', '35px');

            $('wave').css('height', '60px' );
            
            $('.btns-circle').css('margin-top', '20px');            

            $("a#repeat-button").attr("href", "index.html"+"?user="+user+"&exercise="+exercise)

            //var header = $('body');
            //header.css('background', url("../img/bg-canteflamenco-nowave.png"));
            //audioPlayer2.removeClass('disabled')
            btnsCircle2.removeClass('disabled');
            //canvasDescriptors2.removeClass('disabled');
        });

        audioPlayer2.fadeIn(1000);
        
        //playBtnFg.removeClass('glyphicon-stop').addClass('glyphicon-play');
        //playBtnBg.removeClass('spinning');
        //loadDescriptorsFromUrl(descriptorsUrl);
    });
}

$('#share-btn').click(function () {
    var url = 'demo_vodesc_share.html?audio_url=' + encodeURIComponent(shareAudioUrl);
    window.open(url, '_self');
});


var seekFromAudioElement = false;

function updateWaveSurferTime(track)
{
  var currTime = track.currentTime; 
  var duration = track.duration;

  if (isNaN(duration))
    return;

  var progress = currTime/duration;

  seekFromAudioElement = true;
  wavesurfer.seekTo(progress);

  //document.getElementById("metadata").innerHTML = "ct:" + currTime + " dur:" + duration;
}

function updateVoiceAudioTime()
{
  if (seekFromAudioElement)
  {
    seekFromAudioElement = false;
    return;
  }
  
  var audioVoice = document.getElementById('audiotagVoice');
  if (audioVoice.paused) 
  {
    if (Math.abs(audioVoice.currentTime - wavesurfer.backend.startPosition) > 0.01)
      audioVoice.currentTime = wavesurfer.backend.startPosition;
  }
  else if (Math.abs(audioVoice.currentTime - wavesurfer.backend.startPosition) > 0.5)
  {
    audioVoice.currentTime = wavesurfer.backend.startPosition;
  }
}

function HzToCents(Hz)
{
  // convert from Hz to cents referred to 440 Hz
  if (Hz > 0)
    return 1200.0*Math.log(Hz / 440.0) / 0.69314718055994530941723212145818; // convert pitch to cents referred to 440 Hz
  else
    return -1e10;
}

function drawSpectrogramLabels()
{
  var c = document.querySelector('#spectrogram-labels');
  
  /* Begin size adjusting. */
  c.width = c.offsetWidth;
  c.height = c.offsetHeight;
  /* End size adjusting. */

  var h = c.height;
  var w = c.width;
  
  ctx = c.getContext("2d");
  ctx.translate(0.5, 0.5);
  //ctx.scale(2,2);
  

  var font = 11;
  ctx.font = font + 'px Arial';
  ctx.fillStyle = 'rgb(' + 250 + ', ' + 250 + ', ' + 250 + ')';


  ctx.textAlign = "left";
  ctx.fillText("- 2.5 KHz", 4, 15);  


  ctx.textAlign = "right";
  ctx.fillText("tiempo (s)", ctx.canvas.width-10, ctx.canvas.height-8);

  var text = "frecuencia (Hz)";
  var metrics = ctx.measureText(text);
  var new_x = font/2;
  var new_y = h/2;

  ctx.save();
  ctx.translate(new_x, new_y);
  ctx.rotate(-Math.PI/2);
  ctx.textAlign = "center";
  ctx.fillText(text, 0, font/2);
  ctx.restore();

}

function drawDescriptors()
{
  var c, surface;
  c = document.getElementById ("descriptorsCanvas");
  /* Begin size adjusting. */
  c.width = c.offsetWidth;
  c.height = c.offsetHeight;
  /* End size adjusting. */

  var h = c.height;
  var w = c.width;
  var lastx = 0;
  var lastPitchHz = 0;
  var x = 0;
  var y = h-0;

  ctx = c.getContext("2d");
  ctx.translate(0.5, 0.5);
  //ctx.scale(2,2);

  var currentIdx = 0;
  var frameDur = voiceful_descriptors.pitch[1][0] - voiceful_descriptors.pitch[0][0];
  var descLength = voiceful_descriptors.pitch.length;
  var fileDurationLocal = document.getElementById('audiotagVoice').duration;
  var fileDurationServer = voiceful_descriptors.pitch.length*frameDur;

  var minPitch = 1e6;
  var maxPitch = 0.0;
  var avgPitch = 0.0;
  var voicedFrames = 0;
  for (var i=0;i<voiceful_descriptors.pitch.length;i++)
  {
    var curPitch = voiceful_descriptors.pitch[i][1];
    if (curPitch > 0.0 && curPitch < minPitch)
    {
        minPitch = curPitch;
    }
    if (curPitch > maxPitch)
    {
        maxPitch = curPitch;
    }

    if (curPitch > 0.0)
    {
        voicedFrames++;
        avgPitch += curPitch;
    }

  }

  if (voicedFrames == 0)
    return;

  avgPitch = avgPitch / voicedFrames;

  var maxPitchCents = HzToCents(maxPitch);
  var minPitchCents = HzToCents(minPitch);
  var avgPitchCents = HzToCents(avgPitch);

  var minPitchGUI = Math.floor((minPitchCents - 200.0) / 100.0) * 100.0;
  var maxPitchGUI = Math.ceil((maxPitchCents + 200.0) / 100.0) * 100.0;
  var rangePitchGUI = Math.max(1200.0,maxPitchGUI-minPitchGUI);

  var first_oct = 55;
  var count_oct = Math.floor(Math.log2(minPitch/first_oct))+1;
  //BEGIN DRAW BACKGROUND
  var lastidx = -1;
  var lasti = 0;
  ctx.lineWidth = 1;
  var offset = ((minPitchGUI / 100.0) + 9600) % 12;
  for (var i=0;i<h;i++)
  {
    var idx = (Math.round(((i/h) * rangePitchGUI) / 100.0) + offset) % 12;
    
    if (idx != lastidx)
    {
        if (lastidx > -1)
        {
            var colorValue = 255 - (lastidx*10);
            ctx.fillStyle = 'rgb(' + colorValue + ', ' + colorValue + ', ' + colorValue + ')';
            ctx.fillRect(0, h-i, w, i-lasti);
            
            if (idx == 1)
            {
              ctx.font = "11px Arial";
              ctx.fillStyle = 'rgb(' + 10 + ', ' + 10 + ', ' + 10 + ')';
              
              var hz_ = Math.pow(2,count_oct)*first_oct;
              count_oct = count_oct+1;
              ctx.fillText("La ("+ hz_.toString() +" Hz)",20,h-lasti);
            }

            lasti = i;
            lastidx = idx;
        }
        else
        {
            lastidx = idx;
        }
    }
    

    /*var colorValue = 255 - (idx*10);

    ctx.beginPath();
    ctx.strokeStyle = 'rgb(' + colorValue + ', ' + colorValue + ', ' + colorValue + ')';
    ctx.moveTo(0, h-i);
    ctx.lineTo(w, h-i);
    ctx.stroke();

    if (idx == 1)
    {
      ctx.font = "12px Arial";
      ctx.fillStyle = 'rgb(' + 200 + ', ' + 10 + ', ' + 10 + ')';
      ctx.fillText("A",10,h-i);
    }
    */
  }
  //END DRAW BACKGROUND

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgb(' + 200 + ', ' + 10 + ', ' + 10 + ')';
  ctx.beginPath();
  ctx.moveTo(x, y);
  var pitch_length = voiceful_descriptors.pitch.length;
  for (var i=0;i<w;i++)
  {
    currentIdx = Math.round(((i/w)*fileDurationServer) / frameDur);
    if (currentIdx >= pitch_length)
        currentIdx = pitch_length-1;
    x = i;
    //y = h - (voiceful_descriptors.pitch[currentIdx][1]/880.0) * h;
    //y = h - ((HzToCents(voiceful_descriptors.pitch[currentIdx][1])+2400.0)/4800.0) * h;
    y = h - ((HzToCents(voiceful_descriptors.pitch[currentIdx][1])-minPitchGUI)/rangePitchGUI) * h;

    if (x>lastx)
    {
      if ((y > 0) && (y<h))
      {
          if (lastPitchHz <= 0.0)
            ctx.moveTo(x, Math.round(y));
          else if (voiceful_descriptors.pitch[currentIdx][1] <= 0.0)
            ctx.moveTo(x, Math.round(y));
          else
            ctx.lineTo(x, Math.round(y));
          lastx = x;
          lastPitchHz = voiceful_descriptors.pitch[currentIdx][1];
      }
      else
      {
         ctx.moveTo(x, 0.0);
         lastx = x;
         lastPitchHz = voiceful_descriptors.pitch[currentIdx][1];
      }
    }
  }
  ctx.stroke();

  var font = 11;
  ctx.font = font + 'px Arial';
  ctx.fillStyle = 'rgb(' + 10 + ', ' + 10 + ', ' + 10 + ')';
  ctx.textAlign = "right";
  ctx.fillText("tiempo (s)", ctx.canvas.width-10, ctx.canvas.height-8);

  var text = "semitonos";
  var metrics = ctx.measureText(text);
  var new_x = font/2;
  var new_y = h/2;

  ctx.save();
  ctx.translate(new_x, new_y);
  ctx.rotate(-Math.PI/2);
  ctx.textAlign = "center";
  ctx.fillText(text, 0, font/2);
  ctx.restore();

}

function drawDescriptors2()
{
  var c = document.getElementById("descriptorsCanvas");
  var h = c.height;
  var w = c.width;
  var lastx = 0;
  var x = 0;
  var y = h-0;
  
  var ctx = c.getContext("2d");
  
  var currentIdx = 0;
  var frameDur = voiceful_descriptors.pitch[1][0] - voiceful_descriptors.pitch[0][0];
  var descLength = voiceful_descriptors.pitch.length;
  var fileDurationLocal = document.getElementById('audiotagVoice').duration;
  var fileDurationServer = voiceful_descriptors.pitch.length*frameDur;

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (var i=0;i<w;i++)
  {
    currentIdx = Math.round(((i/w)*fileDurationServer) / frameDur);
    x = i;
    //y = h - (voiceful_descriptors.pitch[currentIdx][1]/880.0) * h;
    y = h - ((HzToCents(voiceful_descriptors.pitch[currentIdx][1])+2400.0)/4800.0) * h;

    if (x>lastx)
    {
      ctx.lineTo(x, Math.round(y));
      lastx = x;
    }
  }
  ctx.stroke();
}


function redrawAll()
{
    if (document.getElementById("descriptorsCanvas").style.display != '')
    {
        drawDescriptors();
        drawSpectrogramLabels();
    }
}

document.addEventListener('keydown', (event) => {
  const keyName = event.key;
  const keyWhich = event.which;
  if (keyName === 'Control') {
    // do not alert when only Control key is pressed.
    return;
  }

  if (event.ctrlKey)
  {
    // Even though event.key is not 'Control' (e.g., 'a' is pressed),
    // event.ctrlKey may be true if Ctrl key is pressed at the same time.
    //alert(`Combination of ctrlKey + ${keyName}`);
  }
  else
  {
    if (keyWhich == 32)
    {
      var audioVoice = document.getElementById('audiotagVoice');
      if (audioVoice.paused == false) 
        audioVoice.pause();
      else 
        audioVoice.play();
    }  
  }
}, false);

var user = "";
var exercise = "";

function getURLParameter(name) 
{
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

// for http://xxxxx/xxxxx.html?exercise=ABCHUWQZ&user=AYRFGHTE

if (getURLParameter('user'))
{
  user = getURLParameter('user');
}

if (getURLParameter('exercise'))
{
  exercise = getURLParameter('exercise');
  
  /*  var debug_div = document.getElementById("debug_div");

    debug_div.style.display = "block";


    document.getElementById("basic_arrangement_li_id").style.display = "block";
*/
    /*var debug_table_optimize_button = "<div class=\"table_cell\"></div><div class=\"table_cell\"></div><div class=\"table_cell\"><button id=\"autotune_mid_optimize\" type=\"autotune_mid_optimize_button\" class=\"btn btn-default\">mid_optimize</button></div><div class=\"table_cell\"></div>\n";

    var tmp = debug_table_optimize.innerHTML;
    debug_table_optimize.innerHTML =  tmp + debug_table_optimize_button;
    
    var debug_table_repeat = document.getElementById("debug_table_repeat");

    var debug_table_repeat_button = "<div class=\"table_cell\"></div><div class=\"table_cell\"></div><div class=\"table_cell\"><button id=\"autotune_mid_repeat\" type=\"autotune_mid_repeat_button\" class=\"btn btn-default\">mid_repeat</button></div><div class=\"table_cell\"></div>";

    var tmp = debug_table_repeat.innerHTML;
    debug_table_repeat.innerHTML =  tmp + debug_table_repeat_button;    */

}

if ((user != "") && (exercise!=""))
{

  stepTransition(step0Container, step1Container);
  
  //renderStep1();
}
else
{
  renderStep0();
}

$("div#user").html("<b>usuario:</b> "+user);
$("div#exercise").html("<b>ejercicio:</b> "+exercise);
//$("div#info").html("<b>user:</b> "+user+" <b>exercise:</b> "+exercise);
$("div#copyright").html("&copy; CanteFlamencoTech, 2018 @ powered by voiceful.io");
