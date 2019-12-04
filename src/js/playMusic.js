//    <script>  
    ;$(init);
var source;
//var name = "Schappi.mp3";
function init() {
        console.log(1);
        var xhr = new XMLHttpRequest();  
        var ac = new (window.AudioContext || window.webkitAudioContext)();  
        var gainNode = ac[ac.createGain?'createGain':'createGainNode']();  
        gainNode.connect(ac.destination);  
        var analyser = ac.createAnalyser();  
        var num = 256;  
        analyser.fftSize = num * 2;  
        analyser.connect(gainNode);  
  
        source = null;  
        var count = 0;  
        
        //播放音乐 
       //$('button').on('click', playAudio);
    function playAudio(){
            console.log('加载中，请稍候...');
            var n = ++count;  
            source && source[source.stop?'stop':'noteOff']();//先停止上一首  
            xhr.abort();  
            xhr.open('get', './src/audio/Schappi.mp3'); 
            //xhr.open('get', './src/audio/' + name); 
            xhr.responseType = 'arraybuffer';//关键点  
            xhr.onload = function() {  
                if(n != count) return;  
                //播放音乐  
                ac.decodeAudioData(xhr.response, function(buffer) {  
                    if(n != count) return;  
                    var bufferSource = ac.createBufferSource();  
                    bufferSource.buffer = buffer;  
                    bufferSource.connect(analyser);  
                    bufferSource[bufferSource.start?'start':'noteOn'](0);  
                    source = bufferSource;  
                });  
            }  
            xhr.send();  
               //s}
    }
    playAudio();
  
} 

//停止播放
function stop(){
    source &&   source[source.stop?'stop':'noteOff']();
}
//</script>