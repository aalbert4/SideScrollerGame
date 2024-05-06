// create Phaser.Game object named "game" and set width and height of game display
var game = new Phaser.Game(1000, 600, Phaser.AUTO, 'my-game',
    { preload: preload, create: create, update: update });

// GLOBAL VARIABLES
// game objects
var player, platformGroup, wallGroup, catGroup, coinGroup, powerUpGroup;

// background tilesprites
var sky, mountains, city;

// user input
var arrowKey;

// user interface elements
var scoreText, healthBar, messageText, timeBar;

// sounds
var catSound;

// game variables
var score = 0;
var powerUpActive = false;
var timeUp = false, timeLimit = 180; // timeLimit in seconds

// PRELOAD game assets - runs once at start
function preload() {

    // load sounds
    game.load.audio('cat-sound', 'assets/sounds/Albert.wav');
    
    // load spritesheets
    game.load.spritesheet('dude', 'assets/images/Abraham.png', 32, 48);
    game.load.spritesheet('coin', 'assets/images/coin.png', 32, 32);
    game.load.spritesheet('cat', 'assets/images/cat.png', 32, 32);

    // load images
    game.load.image('sky', 'assets/images/sky-clouds.jpg');
    game.load.image('mountains', 'assets/images/mountain-skyline.png');
    game.load.image('city', 'assets/images/city-skyline.png');
    game.load.image('platform-50', 'assets/images/platform-050w.png');
    game.load.image('platform-100', 'assets/images/platform-100w.png');
    game.load.image('platform-200', 'assets/images/platform-200w.png');
    game.load.image('platform-500', 'assets/images/platform-500w.png');    
    game.load.image('wall-50', 'assets/images/wall-050h.png');
    game.load.image('wall-150', 'assets/images/wall-150h.png');
    game.load.image('wall-250', 'assets/images/wall-250h.png');
    game.load.image('red-bar', 'assets/images/bar-red.png');
    game.load.image('green-bar', 'assets/images/bar-green.png');
    game.load.image('bar-outline', 'assets/images/bar-outline.png');
    game.load.image('star', 'assets/images/star.png');
    game.load.image('black-bar', 'assets/images/bar-black.png');
    game.load.image('yellow-bar', 'assets/images/bar-yellow.png');

}

// CREATE game world - runs once after "preload" finished
function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.physics.arcade.checkCollision.up = false; // turn off collision with upper game boundary

    game.world.setBounds(0, 0, 5000, 600); // change size of game world (make larger than game display)

    // SOUNDS
    catSound = game.add.audio('cat-sound', 0.2);
    
    // BACKGROUND TILESPRITES
    sky = game.add.tileSprite(0, 0, 1000, 600, 'sky');
    mountains = game.add.tileSprite(0, 0, 1000, 600, 'mountains');
    city = game.add.tileSprite(0, 0, 1000, 600, 'city');

    sky.fixedToCamera = true;
    mountains.fixedToCamera = true;
    city.fixedToCamera = true;


    // PLATFORMS
    platformGroup = game.add.group();
    platformGroup.enableBody = true;
    
    // add ground platform
    var ground = platformGroup.create(0, game.world.height - 25, 'platform-500');
    ground.scale.setTo(10, 1); // 10 * 500 = 5000 pixels wide

    // add other platforms
    platformGroup.create(200, 500, 'platform-100');
    platformGroup.create(400, 425, 'platform-100');
    platformGroup.create(600, 350, 'platform-100');
    platformGroup.create(50, 100, 'platform-50');
    platformGroup.create(250, 175, 'platform-50');
    platformGroup.create(450, 260, 'platform-50');
    platformGroup.create(900, 275, 'platform-200');
    platformGroup.create(1600, 200, 'platform-50');
    platformGroup.create(1800, 400, 'platform-50');
    platformGroup.create(800, 100, 'platform-50');
    platformGroup.create(600, 100, 'platform-100');
    platformGroup.create(900, 500, 'platform-50');

    platformGroup.setAll('body.immovable', true);


   // WALLS
    wallGroup = game.add.group();
    wallGroup.enableBody = true;

    wallGroup.create(525, 525, 'wall-50');
    wallGroup.create(1000, 425, 'wall-150');
    wallGroup.create(2000, 525, 'wall-50');
    wallGroup.create(3000, 525, 'wall-50');
    wallGroup.create(4000, 525, 'wall-50');
    wallGroup.create(1750, 500, 'wall-50');
    wallGroup.create(2400, 500, 'wall-150');

    wallGroup.setAll('body.immovable', true);


    // COINS
    coinGroup = game.add.group();
    coinGroup.enableBody = true;

    // JSON array listing coin positions
    var coinData = [
        { "x":75, "y":0 },
        { "x":150, "y":0 },
        { "x":250, "y":250 },
        { "x":275, "y":0 },
        { "x":350, "y":0 },
        { "x":450, "y":300 },
        { "x":475, "y":0 },
        { "x":537, "y":0 },
        { "x":650, "y":0 },
        { "x":700, "y":400 },
        { "x":850, "y":0 },
        { "x":950, "y":0 },
        { "x":1050, "y":0 },
        { "x":1175, "y":0 },
        { "x":1375, "y":0 }
        // no comma after last item in array
    ];

    // add coins using coinData
    for (var i = 0; i < coinData.length; i++) {
        var coin = coinGroup.create(coinData[i].x, coinData[i].y, 'coin');
        coin.anchor.set(0.5, 0.5);
        coin.body.gravity.y = 400;
        coin.body.bounce.y = 0.5;
        coin.animations.add('spin', [0, 1, 2, 3, 4, 5], 10, true);
        coin.animations.play('spin');
    }


    // POWER-UPS
    powerUpGroup = game.add.group();
    powerUpGroup.enableBody = true;
    
    powerUpGroup.create(1000, 200, 'star');
    powerUpGroup.create(3000, 400, 'star');
    
    powerUpGroup.setAll('anchor.set', 0.5);
    

    // CATS
    catGroup = game.add.group();
    catGroup.enableBody = true;

    // add cats evenly spaced out (but with random velocity)
    for (var i = 0; i < 30; i++) {
        var cat = catGroup.create(i * 200 + 100, 0, 'cat');
        cat.anchor.set(0.5, 0.5);
        cat.body.gravity.y = 300;
        cat.body.bounce.x = 1;
        cat.body.collideWorldBounds = true;
        cat.animations.add('left', [0, 1], 10, true);
        cat.animations.add('right', [2, 3], 10, true);
        cat.body.velocity.x = Math.random() * 50 + 100; // random speed between 100-150
        if (Math.random() < 0.5) cat.body.velocity.x *= -1; // 50% chance of reversed direction
    }


    // PLAYER
    player = game.add.sprite(25, 300, 'dude');
    player.anchor.set(0.5, 0.5);
    
    game.camera.follow(player);

    game.physics.arcade.enable(player);
    player.body.gravity.y = 450;
    player.body.collideWorldBounds = true;
    player.body.bounce.y = 0.1;
    
    player.health = 100;
    player.maxHealth = 100;
    
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    player.events.onKilled.add(function(){
        player.reset(25, 300, 100); // reset(x, y, health)
        healthBar.scale.setTo(player.health / player.maxHealth, 1);
    });

    
    // USER INPUT
    arrowKey = game.input.keyboard.createCursorKeys();

    
    // USER INTERFACE
    // by default, Phaser uses Arial bold for text (unless you change font or fontWeight)

    // Score Text
    scoreText = game.add.text(20, 20, 'Score: ' + score, { fontSize: '20px', fill: '#222222' });
    scoreText.fixedToCamera = true;

    // Health Bar
    var healthText = game.add.text(325, 20, 'Health', { fontSize: '20px', fill: '#222222' });
    healthText.fixedToCamera = true;

    var barBackground, barOutline;
    
    barBackground = game.add.image (400, 20, 'red-bar');
    barBackground.fixedToCamera = true;

    healthBar = game.add.image (400, 20, 'green-bar');
    healthBar.fixedToCamera = true;

    barOutline = game.add.image(400, 20, 'bar-outline');
    barOutline.fixedToCamera = true;

    // Time Bar
    var timeText = game.add.text(720, 20, 'Time', { fontSize: '20px', fill: '#222222' });
    timeText.fixedToCamera = true;
    
    barBackground = game.add.image (780, 20, 'black-bar');
    barBackground.fixedToCamera = true;

    timeBar = game.add.image (780, 20, 'yellow-bar');
    timeBar.fixedToCamera = true;

    barOutline = game.add.image(780, 20, 'bar-outline');
    barOutline.fixedToCamera = true;    

    // Message Text
    messageText = game.add.text(500, 100, '', { fontSize: '48px' });
    messageText.anchor.set(0.5);
    messageText.setShadow(2, 2, '#000000', 2);
    messageText.fixedToCamera = true;
    messageText.visible = false;

    
/*
    // TEMPORARY - distance markers
    game.add.text(1000, 300, '1000px', { fill: 'white' });
    game.add.text(2000, 300, '2000px', { fill: 'white' });
    game.add.text(3000, 300, '3000px', { fill: 'white' });
    game.add.text(4000, 300, '4000px', { fill: 'white' });   
*/

}

// UPDATE gameplay - runs in continuous loop after "create" finished
function update() {

    // CHECK TIME REMAINING
    if (timeUp) gameOver();
    else displayTimeLeft();


    // CHECK FOR COLLIDE & OVERLAP
    game.physics.arcade.collide(player, platformGroup);
    game.physics.arcade.collide(player, wallGroup);
    
    game.physics.arcade.collide(coinGroup, platformGroup);
    game.physics.arcade.collide(coinGroup, wallGroup);
    
    game.physics.arcade.collide(player, coinGroup, collectCoin, null, this);
    game.physics.arcade.collide(player, powerUpGroup, collectPowerUp, null, this);

    game.physics.arcade.collide(catGroup, platformGroup, patrolPlatform, null, this);
    game.physics.arcade.collide(catGroup, wallGroup);

    game.physics.arcade.overlap(player, catGroup, touchCat, null, this);



    // CHECK PLAYER INPUT
    // run right or left
    if (arrowKey.right.isDown) {
        var runSpeed = 300;
        if (powerUpActive) runSpeed = 400;
        player.body.velocity.x = runSpeed;
        player.animations.play('right');
    }
    else if (arrowKey.left.isDown) {
        var runSpeed = -200;
        if (powerUpActive) runSpeed = -300;
        player.body.velocity.x = runSpeed;
        player.animations.play('left');
    }
    else {
        player.body.velocity.x = 0;
        player.animations.stop();
        player.frame = 4;
    }
    
    // jump up
    if (arrowKey.up.justDown && player.body.touching.down) {
        var jumpSpeed = -400;
        if (powerUpActive) jumpSpeed = -550;
        player.body.velocity.y = jumpSpeed;
    }
    else {
      // Start text
    var startText = game.add.text(320, 280, 'Press Up to start', { fontSize: '45px', fill: '#FF0000' });
    startText.visible = true;
    startText.fixedToCamera = false;
    }

    // BACKGROUND PARALLAX - tilesprites scroll at different speeds
    sky.tilePosition.x = game.camera.x * -0.2;
    mountains.tilePosition.x = game.camera.x * -0.3;
    city.tilePosition.x = game.camera.x * -0.4;

    
    // CHECK CAT ANIMATIONS
    catGroup.forEach(function (cat) {
        if (cat.body.velocity.x < 0) cat.animations.play('left');
        else cat.animations.play('right');
    });
    
}

// CUSTOM FUNCTIONS (for collisions, etc.)

function collectCoin(player, coin) {
    coin.kill();
    score += 50;
    scoreText.text = 'Score: ' + score;
}

function patrolPlatform(enemy, platform) {
    // check if enemy is about to go over right or left edge of platform
    if (enemy.body.velocity.x > 0 && enemy.right > platform.right || enemy.body.velocity.x < 0 && enemy.left < platform.left) {
        enemy.body.velocity.x *= -1; // reverse direction to avoid falling off
    }
}

function touchCat(player, cat) {
    cat.body.velocity.x *= -1; // reverse direction
    cat.body.velocity.y = -150; // jump up
    // move cat backwards
    if (player.x < cat.x) cat.x += 20;
    else cat.x -= 20;
    catSound.play();
    player.damage(5);
    healthBar.scale.setTo(player.health / player.maxHealth, 1);
}

function collectPowerUp(player, powerUp) {
    powerUp.kill();
    powerUpActive = true;
    messageText.text = 'Power Boost';
    messageText.fill = '#00ff00'; // green
    messageText.visible = true;
    player.tint = 0x00ff00; // green
    game.time.events.add(Phaser.Timer.SECOND * 10, stopPowerUp, this);
} 

function stopPowerUp() {
    powerUpActive = false;
    messageText.visible = false;
    player.tint = 0xffffff; // remove tint
}

function displayTimeLeft() {
    var time = game.time.totalElapsedSeconds();
    var timeLeft = timeLimit - time;
    
    if (timeLeft < 0) {
        timeLeft = 0;
        timeUp = true;
    }
    
    timeBar.scale.setTo(timeLeft / timeLimit, 1);
}

function gameOver() {
    messageText.text = 'Time Up';
    messageText.fill = '#ff0000';
    messageText.visible = true;
    player.exists = false;
}
