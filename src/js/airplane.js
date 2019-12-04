let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Container = PIXI.Container,
    Rectangle = PIXI.Rectangle,
    TextureCache = PIXI.utils.TextureCache,
    Text = PIXI.Text,
    Graphics = PIXI.Graphics,
    TextStyle = PIXI.TextStyle,
    su = new SpriteUtilities(PIXI),
    d = new Dust(PIXI);
        
//Create a Pixi Application
let app = new Application({
    width: 1024, 
    height: 758,
//  width: 1024, 
//  height: 768,
    antialias: false,
    forceCanvas: true,
    backgroundColor : 0xC0C0C0,
});
        
document.body.appendChild(app.view);

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        
//创建拖拽事件
let t = new Tink(PIXI,app.renderer.view);
let stage = app.stage;
        
PIXI.loader
//.add("catImage","img/cat.png")//给文件路径设置别名
    .add(["src/img/airplan.json","src/img/airplan.png","src/img/wood2.jpg","src/img/ground2.png","src/img/stone.png","src/img/plane.png","src/img/playGame.png","src/img/resetGame.png","src/img/attack.png"])
    .load(setup);

let id,startButton,endButton,level,allLevel;
let plane,optionMessage = [],contentMessage = [];
let wood,ground,healthBar,correctNumber = 0,wrongNumber = 0;

let gamePlayScene = new Container();

let boolControl_1,
    boolControl_2,
    boolControl_3;

//const sound = PIXI.sound.Sound.from('resources/boing.mp3');
//sound.play();
function setup(){
    //init();//播放背景音乐
    id = PIXI.loader.resources["src/img/airplan.json"].textures; 
    makePlayScene();
    makeStartScene();
    makePlane();
    makeStone();
    makeEndScene();
    allLevel = setMessage();
    makeJoyPad();
    app.stage.addChild(gamePlayScene);
    state = startState;
    gameLoop();
    //app.stop();
}
        
function gameLoop(){
    // 循环调用gameLoop
    requestAnimationFrame(gameLoop);        
    //console.log("loop");
    //t.update();
    d.update();//实现粒子发射的效果
    state();
}

function startState() {
    woodPlay.tilePosition.x -= 1;
    groundPlay.tilePosition.x -= 5;
    for(let i = 0; i<Stones.length; i++){
        stoneInit(Stones[i]);
    }
    startButton.visible = true;
    //startButton.on('pointerdown', init );
    boolControl_3 = true;
    if(boolControl_1 === true && startButton.visible === true){
        
        boolControl_1 = false;
        startButton.visible = false;
        state = resetState;
    }
}

function resetState(){
    woodPlay.tilePosition.x -= 1;
    groundPlay.tilePosition.x -= 5;
    healthBar.outer.width = 198;
    plane.x = 100;
    plane.y = 100;
    
    level = 0;
    correctNumber = 0;
    wrongNumber = 0;
    boolControl_3 = false;
    state = playState;
}
        
function playState() {
    boolControl_3 = true;
    
    plane.x += plane.vX;
    plane.y += plane.vY;    
    woodPlay.tilePosition.x -= 1;
    groundPlay.tilePosition.x -= 5;  
        
    let stoneHit = false;
    for( let i = 0 ; i < numStone ; i++ ){
        if(level === allLevel){
            state = endState;
        }else{
            Stones[i].x -= Stones[i].speed;
            Stones[i].message.x -= Stones[i].speed;
            Stones[i].message.text = (optionMessage[level][i]);
            //检测碰撞
            if(!stoneHit)
                stoneHit = hitTest(plane,Stones[i]);    

            if(stoneHit === true){
                //generateSound();//碰撞产生声音
                stoneBoob(Stones[i]);
                stoneInit(Stones[i]);
                plane.alpha = 0.5;
                if(healthBar.outer.width >0 )
                healthBar.outer.width -= 10;
                stoneHit = false;
            }else{
                plane.alpha = 1;
            }
            //初始化石头
            if(Stones[i].x <= 0){
                stoneInit(Stones[i]);
            }
        }
    }
    
    rightMessage.text = ("答对题目数:" + correctNumber);
    wrongMessage.text = ("答错题目数:" + wrongNumber);
    gameMessage.text = (contentMessage[level]);
    
    if(healthBar.outer.width < 0){
        healthBar.outer.width = 0;
        plane.alpha = 1;
        state = endState;
    }
    
    if(level === allLevel){
        state = endState;
    }
}

function endState(){ 
    woodPlay.tilePosition.x -= 1;
    groundPlay.tilePosition.x -= 5;
    endButton.visible = true;
    
    for(let i = 0; i<Stones.length; i++){
        stoneInit(Stones[i]);
    }
    if(boolControl_2 === true && endButton.visible === true){
        boolControl_2 = false;
        endButton.visible = false;
        boolControl_3 = false;
        state = startState;
    }
}

function makeStartScene(){
    
    startButton = new Sprite(resources["src/img/playGame.png"].texture);
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.x = app.screen.width / 2 - startButton.width / 2;
    startButton.y = app.screen.height / 2;
    startButton.visible = false;
    startButton.on('pointerdown', isOnClick_1);
    startButton.on('pointerdown', init );
    gamePlayScene.addChild(startButton);
    function isOnClick_1(){
        boolControl_1 = true;
    }
}

function makePlayScene(){
    woodPlay = new PIXI.extras.TilingSprite(resources["src/img/wood2.jpg"].texture,1286,640);
//  wood.width = 1286;
//  wood.height = 640;
    groundPlay = new PIXI.extras.TilingSprite(resources["src/img/ground2.png"].texture,1286,179);
//  ground.width = 1286;
//  ground.height = 179;
    groundPlay.y = 758-179;        
    gamePlayScene.addChild(woodPlay);
    gamePlayScene.addChild(groundPlay);        
    //制作血条
    healthBar = new PIXI.DisplayObjectContainer();
    healthBar.position.set(app.screen.width - 250, 25);    
    let innerBar = new PIXI.Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRoundedRect(0,0,200,20,30);
    innerBar.endFill();

    healthBar.addChild(innerBar);

    let outerBar = new PIXI.Graphics();
    outerBar.beginFill(0xFF3300);
    //outerBar.lineStyle(1,0x000000,1);
    outerBar.drawRoundedRect(0,0,200,20,30);
    outerBar.endFill();
    healthBar.addChild(outerBar);
    
    let style_1 = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 28,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#ffffff', '#00ff99'], // gradient
    stroke: '#4a1850',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 440,
    });
    
    //制作hp
    let hp = new Text("HP :",style_1);
    hp.position.set(app.screen.width - 285, 25);
    hp.width = 25;
    hp.height = 20;

    gamePlayScene.addChild(hp);
    gamePlayScene.addChild(healthBar);

    healthBar.outer = outerBar;
    
    rightMessage = new Text("答对题目数:" + correctNumber, style_1);
    rightMessage.x = 0;
    rightMessage.y = 0;
    rightMessage.visible = true;
    gamePlayScene.addChild(rightMessage);
    
    wrongMessage = new Text("答错题目数:" + wrongNumber, style_1);
    wrongMessage.x = 200;
    wrongMessage.y = 0;
    wrongMessage.visible = true;
    gamePlayScene.addChild(wrongMessage);
    
    let style_2 = new TextStyle({
    fontFamily: "Futura",
    fontSize: 32,
    fill: "white"
    });
    gameMessage = new Text(" ", style_2);
    gameMessage.x = 300;
    gameMessage.y = 650;
    gameMessage.visible = true;
    gamePlayScene.addChild(gameMessage);
}

function makeEndScene(){
    
    endButton = new Sprite(resources["src/img/resetGame.png"].texture);
    endButton.interactive = true;
    endButton.buttonMode = true;
    endButton.x = app.screen.width / 2 - endButton.width / 2;
    endButton.y = app.screen.height / 2;
    endButton.visible = false;
    endButton.on('pointerdown', isOnClick_2);
    gamePlayScene.addChild(endButton);
    
    function isOnClick_2(){
        boolControl_2 = true;
    }
}
        
//创建飞机
function makePlane(){
    plane = new Sprite(id["Plane.png"]);
    plane.vX = 0;
    plane.vY = 0;
    plane.x = 100;
    plane.y = 100;
    plane.anchor.set(0.5,0.5);
    plane.rotation =1.5;

    //设置飞机的触屏拖拽
    //t.makeDraggable(plane);

    plane.interactive = true;
    plane.buttonMode = true;
    
    gamePlayScene.addChild(plane);
}
    
//创建子弹
function bulletSheet(){
    let bullet = new Graphics();
    bullet.beginFill(0xD98719, 1);
    bullet.drawCircle(0,0, 7);
    bullet.endFill();

    //x，y是相对于出生地的坐标，所以我们在0，0出身，再将位置调到飞机头
    bullet.x = plane.x + plane.width/3;
    bullet.y = plane.y;
    bullet.speed = 2;
    bullet.visible = true;//判断是否是撞击之后消失de

//            console.log(bullet.x);
//            console.log(bullet.y);

    app.stage.addChild(bullet);

    app.ticker.add(delta => bulletLoop(bullet));
}
        
function bulletLoop(sprite){
    //requestAnimationFrame(bulletLoop);
    //console.log("bullet");
    if(sprite.visible === true){
        bState = bPlay;
    }
    else bState = end;

    bState(sprite);
}

function end(){
    
}

function bPlay(sprite){
    if(boolControl_3 === false){
        sprite.visible = false;
        app.stage.removeChild(sprite);
    }
    sprite.x += sprite.speed;
    //console.log(sprite.x);
    if(hitTest(sprite, Stones[0])){
        level++;
        sprite.visible = false;
        app.stage.removeChild(sprite);
        correctNumber++;
        for(let i = 0; i < numStone; i++){
            stoneBoob(Stones[i]);
            stoneInit(Stones[i]);
        }
    }else if(hitTest(sprite, Stones[1]) ||hitTest(sprite,Stones[2])){
        level++;
        sprite.visible = false;
        app.stage.removeChild(sprite);
        wrongNumber++;
        for(let i = 0; i < numStone; i++){
            stoneBoob(Stones[i]);
            stoneInit(Stones[i]);
        }
    }
            
    if(sprite.x >= stage.width){
        sprite.visible = false;
        app.stage.removeChild(sprite);
        //console.log("delt");
        //bState = end;
    }
}

//石头的爆炸效果
function stoneBoob(sprite){
    let boob = d.create(
        sprite.x,
        sprite.y,//初始位置
        () => su.sprite(sprite.texture),
        stage,//粒子容器
        50,//粒子数
        0,//重力
        true,//随机间隔
        0,6.28,//最小/大角度
        30,90,//最小/大尺寸
        1,3//最小/大速度
    );
    sprite.visible = false;
    sprite.message.visible = false;
}

//初始化石头回到起点
function stoneInit(sprite){
    sprite.x = app.screen.width + sprite.width;
    sprite.y = randomInt(0,app.screen.height - groundPlay.height - sprite.height);
    
    sprite.message.x = sprite.x - 30;
    sprite.message.y = sprite.y - 25;
    sprite.speed = randomInt(2,6);
    sprite.visible = true;
    sprite.message.visible = true;
}
        
let Stones = [];
let numStone = 3;
let texture;
function makeStone(){
    texture = TextureCache["src/img/stone.png"];
    texture.frame = new PIXI.Rectangle(410,1023,60,70);
    
    for( let i = 0 ; i < numStone ; i++ ){
        let stone = new Sprite(texture);
        stone.anchor.set(0.5, 0.5);
        stone.x = randomInt(stage.width/2,stage.width - stone.width);
        stone.y = randomInt(0,stage.height - groundPlay.height - stone.height);
        //stone.y = stage.height - ground.height - stone.height;
        gamePlayScene.addChild(stone);
        
        let style = new TextStyle({
        fontFamily: "Futura",
        fontSize: 32,
        fill: "white"
        });
        stone.message = new Text("", style);
        stone.message.visible = true;
        gamePlayScene.addChild(stone.message);
        
        Stones.push(stone);
        Stones[i].speed = randomInt(2,6);;
    }
}
        
//碰撞边缘实现
//container{x，y，width，height}
 function contain(sprite,container){
    let collision = undefined;

    //Left
    if (sprite.x < container.x) {
        sprite.x = container.x;
        collision = "left";
    }

    //Top
    if (sprite.y < container.y) {
        sprite.y = container.y;
        collision = "top";
    }

    //Right
    if (sprite.x + sprite.width > container.width) {
        sprite.x = container.width - sprite.width;
        collision = "right";
    }

    //Bottom
    if (sprite.y + sprite.height > container.height) {
        sprite.y = container.height - sprite.height;
        collision = "bottom";
    }

    //Return the `collision` value
    return collision;
}

//
function setMessage(){
    var jsonText = '{"F_data": [{"accessory": [{"options": ["nɑme","friend","fɑther"],"type": 101}],"answer": "","category": 0,"content": "补全句子：Whɑt’s your ___（名字）?","correctAnswer": ["A"],"difficulty": 0,"grade": 3,"id": 1726700,"keypoint": null,"material": null,"relation": null,"role": 0,"section": null,"solution": "","solutionAccessory": null,"subject": 3,"type": 101,"updateTime": 1472235778},{"accessory": [{"options": ["clɑss","ɑge","grɑde"],"type": 101}],"answer": "","category": 0,"content": "补全句子：I’m in ___（班） two.","correctAnswer": ["A"],"difficulty": 0,"grade": 3,"id": 1736700,"keypoint": null,"material": null,"relation": null,"role": 0,"section": null,"solution": "","solutionAccessory": null,"subject": 3,"type": 101,"updateTime": 1472235778}]}';
    var obj = JSON.parse(jsonText);

    for(let k = 0; k < obj.F_data.length; k++)
    {
        optionMessage[k] = [];
        contentMessage[k] = obj.F_data[k].content;
        for (let i = 0; i < obj.F_data[k].accessory[0].options.length; i++){
            optionMessage[k][i] = obj.F_data[k].accessory[0].options[i];
        }
    }
    return obj.F_data.length;
}

//产生随机数
function randomInt(min , max){
    return Math.floor(Math.random() * (max  - min + 1)) + min;
}

//碰撞检测
function hitTest(r1, r2) {

  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x;
  r1.centerY = r1.y;
  r2.centerX = r2.x;
  r2.centerY = r2.y;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {

    //A collision might be occurring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {

      //There's definitely a collision happening
      hit = true;
    } else {

      //There's no collision on the y axis
      hit = false;
    }
  } else {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
};


//摇杆逻辑
 let joyStick,joyPad,tempJoy;
        function makeJoyPad(){
            joyStick = new Graphics();
            
            joyStick.lineStyle(5,0xD98719,1);
            joyStick.beginFill(0xC0C0C0, 1);
            joyStick.drawCircle(120,app.screen.height - 130, 70);
            joyStick.alpha = 0.4;
            joyStick.endFill();
            
            
            //相对于屏幕的位置
            joyStick.centerX = 120;
            joyStick.centerY = app.screen.height - 130;
            joyStick.r = 70;
            //joyStick.alpha = 0;
            
            gamePlayScene.addChild(joyStick);
            
            //遥杆替身，在出圈后代替此摇杆出现在边界处；
            //tempJoy = new Sprite(resources["img/joypad.png"].texture);
            tempJoy = new Sprite(resources["src/img/plane.png"].texture);
            tempJoy.scale.set(0.4,0.4);
            tempJoy.alpha = 0;
            gamePlayScene.addChild(tempJoy);
            
            joyPad = new Sprite(resources["src/img/plane.png"].texture);
            joyPad.scale.set(0.4,0.4);
            joyPad.x = joyStick.centerX - joyPad.width/2;
            joyPad.y = joyStick.centerY - joyPad.height / 2;
            //记录在屏幕中的位置
            joyPad.centerX = joyPad.x + joyPad.width/2;
            joyPad.centerY = joyPad.y + joyPad.height/2;
//            joyPad.disX = 0;
//            joyPad.disY = 0;
            
            joyPad.interactive = true;
            joyPad.buttonMode = true;
            
            joyPad.on('mousedown', onDragStart)
                .on('touchstart', onDragStart)
                // events for drag end
                .on('mouseup', onDragEnd)
                .on('mouseupoutside', onDragEnd)
                .on('touchend', onDragEnd)
                .on('touchendoutside', onDragEnd)
                // events for drag move
                .on('mousemove', onDragMove)
                .on('touchmove', onDragMove);
            
            gamePlayScene.addChild(joyPad);
            
//            let attack = new Graphics();
//            attack.beginFill(0xD98719, 1);
//            attack.drawCircle(app.screen.width - 130,app.screen.height - 130, 48);
//            attack.alpha = 1;
//            attack.endFill();
//            
            let attack = new Sprite(resources["src/img/attack.png"].texture);
            attack.x = app.screen.width - 130;
            attack.y = app.screen.height - 200;
            attack.alpha = 0.5;
            
            attack.interactive = true;
            attack.buttonMode = true;
            
            attack.on('mousedown', bulletSheet)
                .on('touchstart', bulletSheet);
            
            gamePlayScene.addChild(attack);
            
            joyState = joyPlay;
            app.ticker.add(delta => posLoop(delta));
        }
        
        function posLoop(delta){
            joyState(delta);
            
        }
        
        function joyPlay(delta){
            
            contain(plane,{
                x:plane.width/4,
                y:plane.height/2,
                width:app.screen.width + plane.width/2,
                height:app.screen.height + plane.height/2
            });
            
            joyPad.centerX = joyPad.x + joyPad.width/2;
            joyPad.centerY = joyPad.y + joyPad.height/2;
            
            let disX = joyPad.centerX - joyStick.centerX;
            let disY = joyPad.centerY - joyStick.centerY;
            let middle = Math.sqrt(disX*disX + disY*disY);
            
            let speed ;
            
            if(middle >= joyStick.r)
                 speed = 6 ;
            else  speed = 6* middle / joyStick.r;

//            console.log(disX);
//            console.log(disY);
//            console.log(middle);
//            console.log((disX / middle) );
            if(disX !== 0)
                plane.x += (disX / middle)*speed ;
            
            if(disY !== 0)
                plane.y += (disY / middle)*speed;
        }
        
        //创建拖拽
        function onDragStart(event){
            this.data = event.data;
            this.dragging = true;
            //console.log("start");
        }
        
        function onDragEnd(){
            this.dragging = false;            
            this.x = joyStick.centerX - joyPad.width/2;
            this.y = joyStick.centerY - joyPad.height / 2;
            this.alpha = 1;
            tempJoy.alpha = 0;
            //console.log("end");
        }
        
        function onDragMove(){
            if(this.dragging){
                let newPosition = this.data.getLocalPosition(this.parent);
                this.position.x = newPosition.x;
                this.position.y = newPosition.y;
                //console.log("move");
                
                //检测使遥感不出圈
                let dis = Math.sqrt(((joyPad.centerX - joyStick.centerX)*(joyPad.centerX - joyStick.centerX)) + ((joyPad.centerY - joyStick.centerY)*(joyPad.centerY - joyStick.centerY)));
                //console.log(dis);
                
                if( dis >joyStick.r ){
                    joyPad.alpha = false;
                    tempJoy.alpha = 1;
                    tempJoy.x = joyStick.centerX + (joyPad.centerX - joyStick.centerX) *joyStick.r/dis - joyPad.width/2;
                    tempJoy.y = joyStick.centerY + (joyPad.centerY - joyStick.centerY) *joyStick.r/dis - joyPad.height/2;
                }
                else{
                    joyPad.alpha = 1;
                    tempJoy.alpha = 0;
                }
            }
        }

//系统发出声音
function generateSound () {
    console.log(1);
    let audioCtx = new AudioContext();
    let oscillator = audioCtx.createOscillator();
    let gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine';
    // 设置音调频率  
    oscillator.frequency.value = 196.00;
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    // 1秒后停止声音 
    oscillator.stop(audioCtx.currentTime + 1);
    }