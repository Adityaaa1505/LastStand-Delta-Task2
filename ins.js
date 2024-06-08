//Setting up Canvas
const canvas = document.getElementById('gameCanvas');
canvas.width = innerWidth
canvas.height = innerHeight
const ctx = canvas.getContext('2d');

//Initializing some Constants
const gravity = 0.2;
const groundLevel = canvas.height - 80;
var time = 0;
let game = { over: false, active: false }
let score = 0

//Initializing Player
const player = {
    x: canvas.width / 2,
    y: groundLevel,
    width: 60,
    height: 60,
    speed: 0,
    verticalSpeed: 0,
    health: 100,
    opacity: 1
};

//Initializing Bullets Array
let bullets = [];
const bulletSpeed = 10;

//Initializing Box Array
let boxes = [];
const tempBox = {
    width: 100,
    height: 100,
    speed: 10,
}

//Initializing Zombie Array
let zombies = []


let mouseX = 0;
let mouseY = 0;

//Event Listeners
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mousedown', handleMouseDown);

function handleKeyDown(event) {
    if (game.over) return
    switch (event.code) {
        case 'KeyW':
            if (player.y > 80) {
                player.verticalSpeed = -10;
                break;
            }
        case 'KeyA':
            player.speed = -7;
            break;
        case 'KeyD':
            player.speed = 7;
            break;
    }
    if (event.code == "Space") {
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

function handleKeyUp(event) {
    switch (event.code) {
        case 'KeyA':
            player.speed = 0;
            break;
        case 'KeyD':
            player.speed = 0;
            break;
    }
}

function handleMouseMove(event) {
    mouseX = event.clientX - canvas.getBoundingClientRect().left;
    mouseY = event.clientY - canvas.getBoundingClientRect().top;
}

function handleMouseDown(event) {
    //Adding Boxes if less than 5 and not above Player
    if ((boxes.length < 5) && !((mouseX + tempBox.width > player.x) && (mouseX - tempBox.width < player.x))) {
        boxes.push({ x: mouseX, y: mouseY, level: 0, health: 100 });
    }
    //Adding Bullets
    else {
        if (game.over) return
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

//Homescreen
function homeScreen() {
    ctx.fillStyle = "rgb(0, 0, 0, 0.7)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = "100px Ariel"
    ctx.fillStyle = "white"
    ctx.fillText("Last Stand", 550, 200)
    ctx.font = "75px Ariel"
    ctx.strokeStyle = "white"
    ctx.strokeRect(170, 415, 190, 135)
    ctx.fillText("Play", 200, 500)
    ctx.font = "40px Ariel"
    ctx.fillText("Instructions:", 1000, 300)
    ctx.font = "20px Ariel"
    ctx.fillText("W - Jump", 1050, 350)
    ctx.fillText("A - Left", 1050, 375)
    ctx.fillText("D - Right", 1050, 400)
    ctx.fillText("Space / Left Mouse - Shoot", 1050, 425)
    ctx.fillText("Place 5 defensive boxes strategically and then fight the", 1050, 500)
    ctx.fillText("zombie wave.", 1050, 525)
    ctx.fillText("You can not stay on a box for too long.", 1050, 550)
      game.active = true

}

//Draw Player and Gun
function drawPlayer() {
    //Drawing Player 
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = 'orange';
    // ctx.globalAlpha = player.opacity
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    console.log("Player Spawn")

    //Drawing Gun
    const gunAngle = Math.atan2(mouseY - player.y, mouseX - player.x);
    ctx.save();
    ctx.rotate(gunAngle);
    ctx.fillStyle = 'grey';
    ctx.fillRect(0, -5, 50, 10);
    ctx.restore();

    ctx.restore();

    //Drawing Player Health Bar
    ctx.fillStyle = "green"
    ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2 - 20, player.width / 100 * player.health, 5)
    ctx.fillStyle = "red"
    ctx.fillRect(player.x - player.width / 2 + player.width / 100 * player.health, player.y - player.height / 2 - 20, player.width / 100 * (100 - player.health), 5)

    if (player.x < 30) {
        player.x = 30;
    }
    else if (player.x > canvas.width - 30) {
        player.x = canvas.width - 30;
    }
}

//Draw Bullets
function drawBullets() {
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
    //Color changing acc to position
    if (boxes.length < 5) {
        ctx.fillStyle = "rgb(0, 255, 0, 0.7)";
        ctx.fillRect(mouseX - tempBox.width / 2, mouseY - tempBox.height / 2, tempBox.width, tempBox.height);

        if ((mouseX + tempBox.width > player.x) && (mouseX - tempBox.width < player.x)) {
            ctx.fillStyle = "rgb(255, 0, 0, 0.7)";
            ctx.fillRect(mouseX - tempBox.width / 2, mouseY - tempBox.height / 2, tempBox.width, tempBox.height);
        }
    }

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
                // console.log(index, "on top of", i);
                count.push(i)
                box.level = boxes[count[count.length - 1]].level + 1;

                //If box touching lower boxes[i] set Y
                if (box.y > boxes[count[count.length - 1]].y - tempBox.height) {
                    box.y = boxes[count[count.length - 1]].y - tempBox.height;
                }
            }
        }
        //Draw the final box
        ctx.fillStyle = "blue"
        ctx.fillRect(box.x - tempBox.width / 2, box.y, tempBox.width, tempBox.height);

        //Draw Box Health Bar
        ctx.fillStyle = "rgb(0, 255, 0)"
        ctx.fillRect(box.x - tempBox.width / 2, box.y + tempBox.height / 2, tempBox.width / 100 * box.health, 5)
        ctx.fillStyle = "red"
        ctx.fillRect(box.x - tempBox.width / 2 + tempBox.width / 100 * box.health, box.y + tempBox.height / 2, tempBox.width / 100 * (100 - box.health), 5)
    })
}

//Draw Zombies
function drawZombies() {
    ctx.fillStyle = "red"
    zombies.forEach((zombie) => {
        zombie.x += zombie.speed

        if (zombie.speed > 0 && zombie.x + zombie.width / 2 > player.x) {
            zombie.speed = - zombie.speed
        }
        else if (zombie.speed < 0 && zombie.x + zombie.width / 2 < player.x) {
            zombie.speed = - zombie.speed
        }
        ctx.fillRect(zombie.x, zombie.y, zombie.width, zombie.height)

        //Draw Zombie Health Bar
        ctx.fillStyle = "green"
        ctx.fillRect(zombie.x, zombie.y - 20, zombie.width / 30 * zombie.health, 5)
        ctx.fillStyle = "red"
        ctx.fillRect(zombie.x + zombie.width / 30 * zombie.health, zombie.y - 20, zombie.width / 30 * (30 - zombie.health), 5)
        1
    })
}

// Distance Function
function distance(x1, y1, x2, y2) {
    return (Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)))
}

// Collision Mechs
function collisionMechanics() {

    //Between Player and Box (Need gande wale If Statements for accuracy)
    boxes.forEach((box) => {
        //4 direction ko alag alag karna padega
        if (distance(player.x, player.y, box.x, box.y + tempBox.height / 2) < (player.height + tempBox.height) * 0.707) {
            //Player on top edge 
            // 0 < box.y - player.y - player.height/2 &&      
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
    })

    //Between Box and Bullets
    bullets.forEach((bullet, index) => {
        boxes.forEach((box) => {
            if (distance(bullet.x, bullet.y, box.x, box.y + tempBox.height / 2) < 70) {
                bullets.splice(index, 1)
            }
        })


    })

    //Between Box and Zombie
    zombies.forEach((zombie, indexZombie) => {
        boxes.forEach((box, indexBox) => {
            if (Math.abs(zombie.x + zombie.width / 2 - box.x) < zombie.width / 2 + tempBox.width / 2 && box.y == groundLevel - tempBox.height + 30) {
                if (zombie.speed > 0) {
                    zombie.x = box.x - tempBox.width / 2 - 40 - zombie.width
                }
                if (zombie.speed < 0) {
                    zombie.x = box.x + tempBox.width / 2 + 40
                }

                box.health -= zombie.damage
                if (box.health == 0) {
                    boxes.splice(indexBox, 1)
                    boxes.push(-100, -100, -1, -1)
                }
            }
        })

        //Between Zombie and Bullets
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

        //Between Player and Zombie
        if (distance(player.x, player.y, zombie.x + zombie.width / 2, zombie.y + zombie.height / 2) < (player.width + zombie.width) * 0.6) {
            player.health -= zombie.damage
            score += 10
            zombies.splice(indexZombie, 1)
        }
    })
}

let frames = 0
//Main Update Function
function update() {
    ctx.font = "20px Arial"
    ctx.fillStyle = "white"
    ctx.fillText("Score: ", 20, 30)
    ctx.fillText(score, 85, 31)

    // Update player position
    player.x += player.speed;
    player.verticalSpeed += gravity; //Gravity to Player's Vertical Speed
    player.y = Math.max(player.y + player.verticalSpeed, 0);

    //Player dosen't go below ground
    if (player.y > groundLevel) {
        player.y = groundLevel;
        player.verticalSpeed = 0;
    }
    if (boxes.length >= 5) {
        drawBullets();
        if (frames % 300 == 0) {
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
    collisionMechanics();
    drawBoxes();
    drawPlayer();
    drawZombies();

    frames += 1
    if (player.health == 0) {
        // game.over = true
        player.opactiy = 0
        setTimeout(() => {
            game.active = false
            boxes = []
            bullets = []
            zombies = []
            homeScreen()
        }, 500);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(update);

    if (!game.active) {
        boxes = []
        bullets = []
        zombies = []
        homeScreen()
    }
}
update();
