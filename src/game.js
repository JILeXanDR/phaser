var player,
    zombi,
    loadingText;

const GAME_WIDTH = 600;
const GAME_HEIGHT = 600;
const CELLS_COUNT = 100;

/**
 * Загрузка игры
 * @type {Phaser.State}
 */
var BootGameState = new Phaser.State();

BootGameState.create = function () {

    myGame.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // включаем нужный режим мастабирования
    myGame.scale.pageAlignHorizontally = true; // выравнивание канваса  по центру по горизонтали
    myGame.scale.pageAlignVertically = true; // ... и по вертикали

    loadingText = myGame.add.text(myGame.world.width / 2, myGame.world.height / 2, 'Loading...', {
        font: '32px "Press Start 2P"',
        fill: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center'
    });

    loadingText.anchor.setTo(0.5, 0.5);

    myGame.state.start('Preloader', false, false);
};

var PreloaderGameState = new Phaser.State();

PreloaderGameState.preload = function () {
    myGame.load.image('zombi', 'assets/zombi.png', 40, 40);
    myGame.load.image('bg', 'assets/bg.jpg');
    myGame.load.image('bg1', 'assets/bg-1.jpg');
    myGame.load.image('wall', 'assets/wall.png');
    myGame.load.image('box', 'assets/wall-1.gif');
    myGame.load.image('kitty', 'assets/kitty.png');

    var bgData = "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAFFJREFUWIXtzjERACAQBDFgMPOKzr8ScADFFlBsFKRX1WqfStLG68SNQcogZZAySBmkDFIGKYOUQcogZZAySBmkDFIGKYOUQcog9X1wJnl9ONrTcwPWLGFOywAAAABJRU5ErkJggg==";

    var iBg = new Image();
    iBg.src = bgData;
    myGame.cache.addImage('bg-grid', bgData, iBg);

};

PreloaderGameState.create = function () {

    var tween = myGame.add.tween(loadingText).to({
        alpha: 0
    }, 100, Phaser.Easing.Linear.None, true);

    tween.onComplete.add(function () {
        myGame.state.start('Game', false, false);
    }, this);
};

var GameState = new Phaser.State();

GameState.create = function () {

    myGame.physics.startSystem(Phaser.Physics.ARCADE);
    myGame.add.tileSprite(0, 0, myGame.width, myGame.height, 'bg1');

    var gridSize = Math.sqrt(CELLS_COUNT);

    var boxes = [];

    for (let i = 0; i < gridSize; i++) {

        for (let x = 0; x < gridSize; x++) {

            let boxSize = GAME_WIDTH / gridSize;

            boxes[i] = myGame.add.sprite(i * boxSize, x * boxSize, 'box');
            boxes[i].height = boxes[i].width = 50;
        }
    }

    var socket = io('http://localhost:8888');

    socket.on('new_player', function (data) {
        console.info('new_player');

        zombi = myGame.add.sprite(0, 0, 'zombi');
        zombi.width = 70;
        zombi.height = 70;

        //socket.emit('my other event', {my: 'data'});
    });

    socket.on('connect', function () {
        console.info('socket:connect');
        socket.emit('new_player');
    });

    socket.on('player_move', function (data) {
        window[data.id].x = data.coordinates[0];
        window[data.id].y = data.coordinates[1];
        console.log(data);
    });

    socket.on('disconnect', function () {
        console.info('socket:disconnect');
    });

    //zombi.scale.setTo(0.2, 0.2);

    //var kitty = myGame.add.sprite(0, 0, 'kitty');
    //kitty.scale.setTo(0.2, 0.2);

    //myGame.physics.arcade.enable(zombi);

    function click(pointer, event) {
        zombi.x = pointer.x - (zombi.width / 2);
        zombi.y = pointer.y - (zombi.height / 2);

        socket.emit('player_move', {id: 'zombi', coordinates: [zombi.x, zombi.y]});
    }

    myGame.input.onDown.add(click);
};

GameState.update = function () {

    //Bird.y = (myGame.world.height / 2) + 32 * Math.cos(myGame.time.now / 500);
    //Bird.x = (myGame.world.width / 4) + 64 * Math.sin(myGame.time.now / 2000);
    //
    //Town.tilePosition.x -= myGame.time.physicsElapsed * GAME_SPEED / 5;
};

var myGame = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, 'body', null, false, false);

myGame.state.add('Boot', BootGameState, false);
myGame.state.add('Preloader', PreloaderGameState, false);
myGame.state.add('Game', GameState, false);
//myGame.state.add('GameOver', GameOverState, false);

myGame.state.start('Boot');