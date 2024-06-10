//Made by Aditya Agrawal
//Setting up Canvas
const canvas = document.getElementById('gameCanvas');
canvas.width = innerWidth
canvas.height = innerHeight
const ctx = canvas.getContext('2d');

//Initializing some Constants
let gravity = 0.2;
const groundLevel = canvas.height - 80;
var time = 0;
let score = 0
let highscore = 0

game = { active: false }

//Initializing Player
const player = {
    x: canvas.width / 2,
    y: groundLevel,
    width: 60,
    height: 60,
    speed: 0,
    verticalSpeed: 0,
    health: 100,
    lastShootTime: 0,
    shootRate: 300,
    powerUpTaken: false,
    powerUpType: undefined
};

//Initializing Bullets Array
let bullets = [];
const bulletSpeed = 15;

//Initializing Box Array
let boxes = [];
const tempBox = {
    width: 100,
    height: 100,
    speed: 10,
}

//Initializing Zombie Array
let zombies = []

//Initializing PowerUps
powerUps = []

let mouseX = 0;
let mouseY = 0;

//Event Listeners
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mousedown', handleMouseDown);

//Player Movement
function handleKeyDown(event) {
    if (!game.active) return
    switch (event.code) {
        case 'KeyW':
            if (player.y > 80) {
                player.verticalSpeed = -10;
            }
            if (player.y < 100) {
                player.y = 70;
            }
            break;
        case 'KeyS':
            if (gravity) break
            else player.verticalSpeed = 7
        case 'KeyA':
            player.speed = -7;
            break;
        case 'KeyD':
            player.speed = 7;
            break;
        case 'Space':
            //Bullet Spam Control
            var now = Date.now();
            if (now - player.lastShootTime < player.shootRate) return;
            player.lastShootTime = now;

            //Player shot bullets
            const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
            bullets.push({
                x: player.x,
                y: player.y,
                angle: angle,
                verticalSpeed: 0,
                damage: 10
            });
            break;
        case 'KeyP':
            if (game.active) game.active = false
    }
}

function handleKeyUp(event) {
    if (!game.active) return
    switch (event.code) {
        case 'KeyA':
            player.speed = 0;
            break;
        case 'KeyD':
            player.speed = 0;
            break;
        case 'KeyW':
            player.verticalSpeed = 0;
        case 'KeyS':
            player.verticalSpeed = 0
    }
}

function handleMouseMove(event) {
    mouseX = event.clientX - canvas.getBoundingClientRect().left;
    mouseY = event.clientY - canvas.getBoundingClientRect().top;
}

function handleMouseDown(event) {
    if (!game.active) return
    //Adding Boxes if less than 5 and not above Player
    if ((boxes.length < 5) && !((mouseX + tempBox.width > player.x) && (mouseX - tempBox.width < player.x))) {
        boxes.push({ x: mouseX, y: mouseY, level: 0, health: 150 });
    }
    //Player shot some bullets
    else {
        const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
        bullets.push({
            x: player.x,
            y: player.y,
            angle: angle,
            verticalSpeed: 0,
            damage: 10
        });
    }
}
//Draw Home Screen
function homeScreen() {
    if (game.active) return
    ctx.fillStyle = "rgb(0, 0, 0, 0.7)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = "100px Ariel"
    ctx.fillStyle = "white"
    ctx.fillText("Last Stand", 550, 150)
    ctx.font = "60px Ariel"
    ctx.strokeStyle = "white"
    ctx.strokeRect(100, 600, canvas.width - 200, 90)
    ctx.fillText("Play", 680, 665)
    ctx.font = "40px Ariel"
    ctx.fillText("Instructions:", 640, 250)
    ctx.font = "20px Ariel"
    ctx.fillText("W - Jump", 700, 300)
    ctx.fillText("A - Left", 700, 325)
    ctx.fillText("D - Right", 700, 350)
    ctx.fillText("P - Pause", 700, 375)
    ctx.fillText("Space / Left Mouse - Shoot", 700, 400)
    ctx.fillText("You have 100 health. Zombies have 30 health. Boxes have 150 health.", 640, 450)
    ctx.fillText("Zombies do 10 damage to player and boxes. Bullets do 10 damage to", 640, 475)
    ctx.fillText("zombies. Place 5 boxes (when green) stratigically across the map to help ", 640, 500)
    ctx.fillText("you fend off the zombies. Be careful, don't stand on a box too long.", 640, 525)
    ctx.fillText("Look out for Power-Ups to help you on your quest.", 640, 550)
    ctx.fillText("Best of Luck, Soldier", 640, 575)
    ctx.fillText("Made with ❤️ by Aditya", 630, canvas.height - 15)

    //If Play Button Clicked
    document.addEventListener("mousedown", function () {
        if (100 < mouseX && mouseX < canvas.width - 200 && 600 < mouseY && mouseY < 690) {
            game.active = true
            return
        }
    });
}

//Draw Player and Gun
function drawPlayer() {
    if (!game.active) return
    //Drawing Player 
    ctx.save();
    ctx.translate(player.x, player.y);

    playerImg = new Image();
    playerImg.src = "assets/player.png"
    ctx.drawImage(playerImg, -player.width / 2, -player.height / 2, player.width, player.height)


    //Drawing Gun
    const gunAngle = Math.atan2(mouseY - player.y, mouseX - player.x);
    ctx.save();
    ctx.rotate(gunAngle);
    ctx.fillStyle = 'grey';
    ctx.fillRect(0, -5, 50, 10);
    ctx.restore();

    ctx.restore();

    //Drawing Player Health Bar
    ctx.fillStyle = "rgb(0, 255, 0)"
    ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2 - 20, player.width / 100 * player.health, 5)
    ctx.fillStyle = "rgb(255, 0, 0)"
    ctx.fillRect(player.x - player.width / 2 + player.width / 100 * player.health, player.y - player.height / 2 - 20, player.width / 100 * (100 - player.health), 5)

    // Update player position
    player.x += player.speed;
    player.verticalSpeed += gravity; //Gravity to Player's Vertical Speed
    player.y += player.verticalSpeed

    //Player Dosen't go out of map
    if (player.x < 30) {
        player.x = 30;
    }
    else if (player.x > canvas.width - 30) {
        player.x = canvas.width - 30;
    }
    //Player dosen't go below ground
    if (player.y > groundLevel) {
        player.y = groundLevel;
        player.verticalSpeed = 0;
    }
}

//Draw Bullets
function drawBullets() {
    if (!game.active) return
    ctx.fillStyle = 'yellow';
    bullets.forEach((bullet, index) => {
        bullet.verticalSpeed += gravity; // Gravity to Bullet's Vertical Speed
        bullet.x += bulletSpeed * Math.cos(bullet.angle);
        bullet.y += bulletSpeed * Math.sin(bullet.angle) + bullet.verticalSpeed;

        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Remove bullets that go out of bounds or hit the ground
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y > groundLevel + 30) {
            bullets.splice(index, 1);
        }
    });
}

//Draw Boxes
function drawBoxes() {
    if (!game.active) return
    //Check if box can be placed and change color accordingly
    if (boxes.length < 5) {
        ctx.fillStyle = "rgb(0, 255, 0, 0.7)";
        ctx.fillRect(mouseX - tempBox.width / 2, mouseY - tempBox.height / 2, tempBox.width, tempBox.height);

        if ((mouseX + tempBox.width > player.x) && (mouseX - tempBox.width < player.x)) {
            ctx.fillStyle = "rgb(255, 0, 0, 0.7)";
            ctx.fillRect(mouseX - tempBox.width / 2, mouseY - tempBox.height / 2, tempBox.width, tempBox.height);
        }
    }

    //Boxes are placed
    boxes.forEach((box, index) => {
        box.y += tempBox.speed

        //Collision between boxes and ground
        if (box.y > groundLevel - tempBox.height) {
            box.y = groundLevel - tempBox.height + 30;
        }
        //Collision between boxes and boxes
        for (let i = 0; i < index; i++) {
            //If box on top of boxes[i] wala box
            let count = []
            if (box.x - tempBox.width < boxes[i].x && boxes[i].x < box.x + tempBox.width) {
                count.push(i)
                box.level = boxes[count[count.length - 1]].level + 1;
                //If box touching lower boxes[i]
                if (box.y > boxes[count[count.length - 1]].y - tempBox.height) {
                    box.y = boxes[count[count.length - 1]].y - tempBox.height;
                }
            }
        }

        //Draw the final box
        boxImg = new Image();
        boxImg.src = "assets/box.jpg"
        ctx.drawImage(boxImg, box.x - tempBox.width / 2, box.y, tempBox.width, tempBox.height)

        //Draw Box Health Bar
        ctx.fillStyle = "rgb(0, 255, 0)"
        ctx.fillRect(box.x - tempBox.width / 2, box.y + tempBox.height / 2, tempBox.width / 150 * box.health, 5)
        ctx.fillStyle = "rgb(255, 0, 0)"
        ctx.fillRect(box.x - tempBox.width / 2 + tempBox.width / 150 * box.health, box.y + tempBox.height / 2, tempBox.width / 150 * (150 - box.health), 5)
    })
}

//Draw Zombies
function drawZombies() {
    if (!game.active) return

    //Spawn Zombies after Boxes Placed
    if (boxes.length >= 5) {
        let zombieSpawnRate = 250
        //Zombie Spawn Rate changes according to score
        if (score % 40 == 0) {
            zombieSpawnRate -= 50
            if (zombieSpawnRate <= 0) zombieSpawnRate = 10
        }
        //Spawn Zombies
        if (frames % zombieSpawnRate == 0) {
            let zombie = { x: undefined, y: groundLevel - player.width / 2, width: player.width, height: player.height, speed: 0.5, damage: 10, health: 30 }
            let side = Math.random()
            if (side > 0.5) {
                zombie.x = 0
            }
            else {
                zombie.x = canvas.width
                zombie.speed = -zombie.speed
            }
            zombies.push(zombie)
        }
    }
    //Zombie Movement
    zombies.forEach((zombie) => {
        zombie.x += zombie.speed

        //Zombie goes towards player
        if (zombie.speed > 0 && zombie.x + zombie.width / 2 > player.x) {
            zombie.speed = - zombie.speed
        }
        else if (zombie.speed < 0 && zombie.x + zombie.width / 2 < player.x) {
            zombie.speed = - zombie.speed
        }

        //Draw Zombie
        zombieImg = new Image();
        zombieImg.src = "assets/zombie.jpg"
        ctx.drawImage(zombieImg, zombie.x, zombie.y, zombie.width, zombie.height)


        //Draw Zombie Health Bar
        ctx.fillStyle = "rgb(0, 255, 0)"
        ctx.fillRect(zombie.x, zombie.y - 20, zombie.width / 30 * zombie.health, 5)
        ctx.fillStyle = "rgb(255, 0, 0)"
        ctx.fillRect(zombie.x + zombie.width / 30 * zombie.health, zombie.y - 20, zombie.width / 30 * (30 - zombie.health), 5)
        1
    })
}

//Draw Power Ups
function drawPowerUps() {
    if (!game.active) return

    //If Game Started?
    if (boxes.length >= 5) {
        //If to Spawn Power Up randomly every 1000 ticks?
        if (frames % 500 == 0) {
            let spawnPowerUps = Math.random()
            if (spawnPowerUps < 0.2) {
                powerUp = {
                    x: Math.random() * canvas.width,
                    y: Math.random() * 200 + Math.random() * 70,
                    radius: 25,
                    type: "playerImmunity"
                }
                powerUps.push(powerUp)

                setTimeout(() => {
                    powerUps.splice(0, 1)
                }, 5000);
            }
            else if (0.2 < spawnPowerUps && spawnPowerUps < 0.4) {
                powerUp = {
                    x: Math.random() * canvas.width,
                    y: Math.random() * 200 + Math.random() * 70,
                    radius: 25,
                    type: "playerIncreaseShootRate"
                }
                powerUps.push(powerUp)

                setTimeout(() => {
                    powerUps.splice(0, 1)
                }, 5000);
            }
            else if (0.4 < spawnPowerUps && spawnPowerUps < 0.5) {
                powerUp = {
                    x: Math.random() * canvas.width,
                    y: Math.random() * 200 + Math.random() * 70,
                    radius: 25,
                    type: "playerJetpack"
                }
                powerUps.push(powerUp)

                setTimeout(() => {
                    powerUps.splice(0, 1)
                }, 5000);
            }
        }
    }

    //For Each Power Up
    powerUps.forEach((powerUp) => {
        //Determine which type
        // ctx.fillStyle = "rgb(0, 255, 0)"
        // ctx.beginPath();
        // ctx.arc(powerUp.x, powerUp.y, 35, 0, Math.PI*2);
        // ctx.fill();
        if (powerUp.type == "playerImmunity") {
            //Draw
            powerUpImmunity = new Image();
            powerUpImmunity.src = "assets/playerImmunityPowerUp.png"
            ctx.drawImage(powerUpImmunity, powerUp.x - powerUp.radius, powerUp.y - powerUp.radius)

        }
        else if (powerUp.type == "playerIncreaseShootRate") {
            //Draw
            powerUpShootRate = new Image();
            powerUpShootRate.src = "assets/playerIncreaseShootRate.png"
            ctx.drawImage(powerUpShootRate, powerUp.x - powerUp.radius, powerUp.y - powerUp.radius)

        }

        else if (powerUp.type == "playerJetpack") {
            //Draw
            powerUpJetpack = new Image();
            powerUpJetpack.src = "assets/playerJetpack.png"
            ctx.drawImage(powerUpJetpack, powerUp.x - powerUp.radius, powerUp.y - powerUp.radius)
        }
    })

}

let row = 0
let col = 0

//Draw Power Up Animation
function drawPowerUpAnimation() {
    if (!player.powerUpTaken || !game.active) return
    //Do the Animation
        powerUpAnimation = new Image();
        powerUpAnimation.src = "assets/animationSpriteSheet.png"
    if (player.powerUpType == 2) {
        row = 2
        ctx.drawImage(powerUpAnimation, col*120, row*120, 120, 120, player.x - 38, player.y - 40, 75, 75)
            if (frames % 10 == 0) {
                if (col<4) col ++
                else col = 0
            } 
        }

    else if (player.powerUpType == 1) {
        row = 1
        ctx.drawImage(powerUpAnimation, col*120, row*120, 120, 120, player.x - 60, player.y - 60, 130, 130)
        if (frames % 30 == 0){
            if (col<4) col ++
            else col = 0
        }
    }

    else if (player.powerUpType == "0") {
        row = 0
        ctx.drawImage(powerUpAnimation, col*120, row*120, 120, 120, player.x - 40, player.y - 40, 80, 80)
        if (frames % 30 == 0){
            if (col<4) col ++
            else col = 0
        }
    }
}

// Distance Function
function distance(x1, y1, x2, y2) {
    return (Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)))
}

// Collision Mechs
function collisionMechanics() {
    if (!game.active) return

    //Collision with Box and
    boxes.forEach((box, indexBox) => {
        //Between Player (Need gande wale If Statements for accuracy)
        //4 direction ko alag alag karna padega
        if (distance(player.x, player.y, box.x, box.y + tempBox.height / 2) < (player.height + tempBox.height) * 0.707) {
            //Player on top edge      
            if (player.y < box.y && box.y - player.y - player.height / 2 < 1 && box.x - tempBox.width / 2 - player.width / 2 < player.x && player.x < box.x + tempBox.width / 2 + player.width / 2) {
                player.y = box.y - player.width / 2
                verticalSpeed = 0
            }
            //Player on right edge
            if (player.x > box.x && player.x - player.width / 2 - tempBox.width / 2 - box.x < 1 && box.y - player.height / 2 < player.y && player.y < box.y + tempBox.height + player.height / 2) {
                player.x = box.x + tempBox.width
            }
            //Player on left edge
            if (player.x < box.x && box.x - tempBox.width / 2 - player.width / 2 - player.x < 1 && box.y - player.height / 2 < player.y && player.y < box.y + tempBox.height + player.height / 2) {
                player.x = box.x - tempBox.width;
            }
            // //Player on bottom edge
            if (player.y - player.height / 2 - tempBox.y - tempBox.height < 1 && box.x - tempBox.width / 2 - player.width / 2 < player.x && player.x < box.x + tempBox.width / 2 + player.width / 2) {
                player.y = box.y + tempBox.height + player.height / 2
            }
        }

        //Between Bullets
        bullets.forEach((bullet, index) => {
            if (distance(bullet.x, bullet.y, box.x, box.y + tempBox.height / 2) < 70) {
                bullets.splice(index, 1)
            }
        })

        //Between Zombies 
        zombies.forEach((zombie) => {
            if (Math.abs(zombie.x + zombie.width / 2 - box.x) < zombie.width / 2 + tempBox.width / 2 && box.y == groundLevel - tempBox.height + 30) {
                if (zombie.speed > 0) {
                    zombie.x = box.x - tempBox.width / 2 - 40 - zombie.width
                }
                if (zombie.speed < 0) {
                    zombie.x = box.x + tempBox.width / 2 + 40
                }

                box.health -= zombie.damage
                if (box.health <= 0) {
                    boxes.splice(indexBox, 1)
                    boxes.push(-100, -100, -1, -1)
                }
            }
        })
    })

    //Collision with Zombie and
    zombies.forEach((zombie, indexZombie) => {
        //Between Bullets
        bullets.forEach((bullet, indexBullet) => {
            if (distance(bullet.x, bullet.y, zombie.x + zombie.width / 2, zombie.y + zombie.height / 2) < 55) {
                zombie.health -= bullet.damage
                bullets.splice(indexBullet)
                if (zombie.speed > 0) {
                    zombie.x = zombie.x - tempBox.width / 2 - 20 - zombie.width
                }
                if (zombie.speed < 0) {
                    zombie.x = zombie.x + tempBox.width / 2 + 20
                }
            }
            if (zombie.health == 0) {
                score += 10
                zombies.splice(indexZombie, 1)
            }
        })

        //Between Player
        if (distance(player.x, player.y, zombie.x + zombie.width / 2, zombie.y + zombie.height / 2) < (player.width + zombie.width) * 0.6) {
            player.health -= zombie.damage
            score += 10
            zombies.splice(indexZombie, 1)
        }
    })

    //Collision with Power Ups and between Player
    powerUps.forEach((powerUp, index) => {
        if (distance(powerUp.x, powerUp.y, player.x, player.y) < (player.width / 2 + powerUp.radius)) {
            //Do the Powerup
            player.powerUpTaken = true

            if (powerUp.type == "playerImmunity") {
                player.powerUpType = 2
                player.health += 40
                if (player.health > 100) player.health = 100
                setTimeout(() => {
                    powerUpTaken = false
                    player.powerUpType = undefined
                }, 1000);
            }

            else if (powerUp.type == "playerIncreaseShootRate") {
                player.powerUpType = 1
                player.shootRate = 100
                //Reset the Power Up
                setTimeout(() => {
                    player.shootRate = 300
                    powerUpTaken = false
                    player.powerUpType = undefined
                }, 5000);
            }

            else if (powerUp.type == "playerJetpack") {
                player.powerUpType = 0
                gravity = 0
                //Reset the Power Up
                setTimeout(() => {
                    gravity = 0.2
                    powerUpTaken = false
                    player.powerUpType = undefined
                }, 10000);
            }
            powerUps.splice(index, 1)
        }
    })
}

let frames = 0
//Main Update Function
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Score
    ctx.font = "20px Arial"
    ctx.fillStyle = "white"
    ctx.fillText("High Score: ", 20, 30)
    ctx.fillText(highscore, 130, 31)
    ctx.fillText("Score: ", 190, 31)
    ctx.fillText(score, 250, 32)

    //Run all Functions
    drawPlayer();
    drawBullets();
    drawBoxes();
    drawZombies();
    drawPowerUps();
    homeScreen();
    collisionMechanics();
    drawPowerUpAnimation()

    frames += 1

    //Lose Condition
    if (player.health <= 0) {
        boxes = []
        bullets = []
        zombies = []
        powerUps = []
        player.health = 100
        if (score > highscore) highscore = score
        score = 0
        game.active = false
    }
    requestAnimationFrame(update);
}
update();
