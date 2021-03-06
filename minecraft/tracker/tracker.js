function trackerStart(){
    
    var msg = new SpeechSynthesisUtterance();
    msg.volume = 0;
    if (!document.getElementById('trackerInputFormsUser')) return console.error('the id \"trackerInputFormUser\" is required');
    if (!document.getElementById('trackerConsole')) return console.error('the id \"trackerConsole\" is required');
    function notify(message){
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }
        if (Notification.permission == "granted"){
            var info = new Notification(`${tracker.option.name} ${message}`);
        } else {
            Notification.requestPermission();
        }
    }
    var request = new XMLHttpRequest();
    var firstRequest = new XMLHttpRequest();
    var tracker = {
        option : {
            user: document.getElementById('trackerInputFormsUser').value,
            uuid: document.getElementById('trackerInputFormsUser').value,
            name: '',
            interval: 15,
            hypixelKey: '3d97ee03-318d-45d9-8d25-68de20e9e64d',
        },
        calculation : {
            second: 0,
            minute: 0,
            hour: 0,
            getTime(){
                var s = tracker.calculation.second;
                var m = tracker.calculation.minute;
                var h = tracker.calculation.hour;
                if (tracker.calculation.second.toString().length == 1){
                    s = '0' + tracker.calculation.second;
                }
                if (tracker.calculation.minute.toString().length == 1){
                    m = '0' + tracker.calculation.minute;
                }
                return('Total time played: ' + h + ':' + m + ':' + s);
            },
            addtime(){
                tracker.calculation.second += tracker.option.interval;
                if (tracker.calculation.second >= 60){
                    tracker.calculation.second -= 60;
                    tracker.calculation.minute += 1;
                }
                if (tracker.calculation.minute >= 60){
                    tracker.calculation.minute -= 60;
                    tracker.calculation.hour += 1;
                }
            }
        },
        docLog(data){
            tracker.consoleContent = `${tracker.consoleContent}>${data} <BR>`;
            document.getElementById('trackerConsole').innerHTML = tracker.consoleContent;
        },
        mem: {
            online: false,
            game: '',
            lastLogout: new Date(),
            deviceOnline: true,
            lastLogin: new Date()
        },
        consoleContent: ''
    };
    function msToRecord(duration) {
        var milliseconds = parseInt((duration % 1000) / 100),
          seconds = Math.floor((duration / 1000) % 60),
          minutes = Math.floor((duration / (1000 * 60)) % 60),
          hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
      
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        
        tracker.calculation.hour = Number(hours)
        tracker.calculation.minute = Number(minutes)
        tracker.calculation.second = Number(seconds)
    }
    tracker.docLog('Support <a href="https://www.youtube.com/channel/UC-FLvOdIGGLOIRvKT9_QtOg" target="_blank">Hypersun_pro</a> on Youtube');
    tracker.docLog('Leave this page AFK, and I will report to you when someone go online');
    if (document.getElementById('trackerInputFormsInterval') && Number(document.getElementById('trackerInputFormsInterval').value)&& document.getElementById('trackerInputFormsInterval').value != ""){
        if (document.getElementById('trackerInputFormsInterval').value < 5){
            tracker.docLog('Due to network safety, your interval value is too low. Interval value will automatically set to 5');
            tracker.option.interval = 5;
        } else {
            tracker.option.interval = Number(document.getElementById('trackerInputFormsInterval').value);
        }
    }
    if (document.getElementById('trackerInputFormsTTS') && Number(document.getElementById('trackerInputFormsTTS').value)&& document.getElementById('trackerInputFormsTTS').value != ""){
        if (document.getElementById('trackerInputFormsTTS').value > 1 || document.getElementById('trackerInputFormsTTS').value < 0){
            tracker.docLog('TTS volume bust be between 0 and 1');
            tracker.option.interval = 0;
        } else {
            msg.volume = Number(document.getElementById('trackerInputFormsTTS').value);
        }
    }
    if (document.getElementById('trackerInputFormsHypixelKey') && document.getElementById('trackerInputFormsHypixelKey').value != ""){tracker.option.hypixelKey = document.getElementById('trackerInputFormsHypixelKey').value;}
    if (!'speechSynthesis' in window) {
        tracker.docLog(`Your browser doesn't support tts`);
    }
    //check uuid and name on hypixel
    firstRequest.open('get', `https://api.hypixel.net/player?key=${tracker.option.hypixelKey}&uuid=${tracker.option.uuid}`);
    firstRequest.onloadend = function(){
        var respond = JSON.parse(firstRequest.response);
        if (!respond.success) {
            tracker.docLog(`Error from Hypixel: ${respond.cause}`);
            return;
        } else {
            tracker.option.name = respond.player.playername;
            tracker.mem.lastLogout = new Date(respond.player.lastLogout);
            tracker.mem.lastLogin = new Date(respond.player.lastLogin);
            tracker.docLog(`Successfully connect to Hypixel`);
            tracker.docLog(`Start tracking ${tracker.option.name}`);
            msg.text = `start tracking ${tracker.option.name}`;
            window.speechSynthesis.speak(msg);
            firstCheck();
        }
    };
    firstRequest.send();
    firstRequest.timeout = 10000;
    if(document.getElementById("playerModule")){document.getElementById("playerModule").innerHTML = `<img src="https://crafatar.com/renders/body/${tracker.option.uuid}?overlay"></img>`};
    //get first session check
    function firstCheck(){
        if (!navigator.onLine){
            tracker.docLog(`Disconnected to internet. Retry in ${tracker.option.interval}s`);
            tracker.mem.deviceOnline = false;
            msg.text = `Internet connection disconnected`;
            window.speechSynthesis.speak(msg);
            return;
        }
        request.open('get', `https://api.hypixel.net/status?key=${tracker.option.hypixelKey}&uuid=${tracker.option.uuid}`);
        request.onloadend = function() {
            var respond = JSON.parse(request.response);
            if (!respond.success){
                tracker.docLog(`Error from Hypixel: ${respond.cause}`);
                msg.text = `Error, ${respond.cause}`;
                return;
            } else {
                if (respond.session.online){
                    respond.session.gameType = ""
                    tracker.mem.game = respond.session.gameType;
                    var nowtime = new Date();
                    msg.text = `${tracker.option.name} now online, game type, ${respond.session.gameType} ${respond.session.mode}`;
                    tracker.docLog(`${tracker.option.name} now online, game: ${respond.session.gameType.toLowerCase()} ${respond.session.mode.toLowerCase()} (since ${tracker.mem.lastLogin.toLocaleTimeString()})`);
                    msToRecord(Date.now() - tracker.mem.lastLogin)
                    notify('now online');
                    window.speechSynthesis.speak(msg);
                    tracker.mem.online = true;
                } else {
                    tracker.docLog(`${tracker.option.name} currently offline (Last online: ${tracker.mem.lastLogout.toLocaleDateString()} ${tracker.mem.lastLogout.toLocaleTimeString()})`);
                }
            }
        };
        request.send();
        request.timeout = 100000;
        request.ontimeout = function(){
            tracker.docLog('Error: connection timeout(internet too slow)');
        };
    }
    //real check
    function checkHypixel(){
        if (!navigator.onLine){
            tracker.docLog(`Disconnected to internet. Retry in ${tracker.option.interval}s`);
            tracker.mem.deviceOnline = false;

            msg.text = `Internet connection disconnected`;
            window.speechSynthesis.speak(msg);
            return;
        } else {
            if (!tracker.mem.deviceOnline){
                tracker.mem.deviceOnline = true;
                tracker.docLog(`Reconnected to internet`);
                msg.text = `Internet connection reconnected`;
                window.speechSynthesis.speak(msg);
            }
        }
        request.open('get', `https://api.hypixel.net/status?key=${tracker.option.hypixelKey}&uuid=${tracker.option.uuid}`);
        request.onloadend = function() {
            var respond = JSON.parse(request.response);
            if (!respond.success){
                tracker.docLog(`Error from Hypixel: ${respond.cause}`);
                msg.text = `Error, ${respond.cause}`;
                window.speechSynthesis.speak(msg);
                return;
            } else {
                if (respond.session.online){
                    if (!tracker.mem.online){
                        var nowtime = new Date();
                        tracker.docLog(`${tracker.option.name} now online, game = ${respond.session.gameType.toLowerCase()} (${new Date().toLocaleTimeString()})`);
                        notify('now online');
                        msg.text = `${tracker.option.name} now online, game type, ${respond.session.gameType}`;
                        window.speechSynthesis.speak(msg);
                        tracker.mem.online = true;
                        tracker.calculation.addtime();
                        tracker.mem.game = respond.session.gameType;
                    } else {
                        tracker.calculation.addtime();
                        if (respond.session.gameType != tracker.mem.game){
                            tracker.mem.game = respond.session.gameType;
                            tracker.docLog(`${tracker.option.name} change game to ${tracker.mem.game.toLowerCase()} (${new Date().toLocaleTimeString()})`);
                            notify('change game');
                            msg.text = `${tracker.option.name} changed game, game type, ${tracker.mem.game}`;
                            window.speechSynthesis.speak(msg);
                        }
                    }
                } else {
                    if (tracker.mem.online){
                        tracker.docLog(`${tracker.option.name} now offline (${new Date().toLocaleTimeString()})`);
                        notify('now offline');
                        tracker.mem.online = false;
                        msg.text = `${tracker.option.name} now offline`;
                        window.speechSynthesis.speak(msg);
                    }
                }
            }
        };
        request.send();
    }
    setInterval(checkHypixel, tracker.option.interval * 1000);
    if (document.getElementById('trackerCalculate')){
        document.getElementById('trackerCalculate').onclick = function() {
            tracker.docLog(tracker.calculation.getTime());
        };
    }
}
