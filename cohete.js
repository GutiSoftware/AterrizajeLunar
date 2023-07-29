const GRAVITY = 1.62;
let FUEL_INITIAL = 9000; //9000
let THRUST_MAIN = 15000; //5000
let THRUST_SECONDARY = 2500; //1000
let FUEL_RATE_MAIN = 0.125; //0,05
let FUEL_RATE_SECONDARY = 0.05; //0.02

let position;
let velocity;
let fuel;
let weight;
let empty_ship_weight;
let landingPad;
let exploded = false;
let explosionSize = 0;
let explosionOpacity = 255;
let crashMessageShown = false;
let successfulLanding = false;
let gameState = "start";  // Start, play, end
let img;

function preload() {
  img = loadImage('https://raw.githubusercontent.com/GutiSoftware/AterrizajeLunar/main/PaisajeLunar.jpg');
}

function goFullScreen(){
    let fs = fullscreen();
    fullscreen(!fs);
}

function setup() {
    createCanvas(windowWidth*0.95, windowHeight*0.8);  // Create the canvas with 90% of the window's width and height
    initGame();
}

function windowResized() {
    resizeCanvas(windowWidth*0.95, windowHeight*0.8);  // Resize the canvas to 90% of the window's width and height when the window is resized
    initGame();
}

function initGame() {
    img.resize(windowWidth*0.95, windowHeight*0.8);  // Resize the image to match the canvas size
    position = createVector(width / 2, height / 12);
    velocity = createVector(0, 0);
    let screenScale = Math.max(windowWidth / 1680, windowHeight / 762);  // Calculate the screen scale
    fuel = FUEL_INITIAL //* screenScale;  // Adjust the initial fuel value based on the screen size
    //THRUST_MAIN *= screenScale;
    //THRUST_SECONDARY *= screenScale;
    //FUEL_RATE_MAIN *= screenScale;
    //FUEL_RATE_SECONDARY *= screenScale;
    empty_ship_weight = 1000;
    weight = empty_ship_weight + fuel;
    landingPad = createVector(random(width - 50), height - 30);
    exploded = false;
    explosionSize = 0;
    explosionOpacity = 255;
    crashMessageShown = false;
    successfulLanding = false;
}




// Función para dibujar la explosión
function drawExplosion() {
    if (explosionOpacity > 0) {
        if (explosionSize < 300) {  // Aumenta el tamaño de la explosión hasta un máximo de 300
            explosionSize += 10;  // Aumenta el tamaño de la explosión
        }
        if (explosionOpacity > 0) {
            explosionOpacity -= 5;  // Una vez que la explosión ha alcanzado su tamaño máximo, empieza a disminuir la opacidad
        }
        
        let explosionColor = color(255, 0, 0);
        let backgroundColor = color(0, 0, 0);
        let interpColor = lerpColor(explosionColor, backgroundColor, 1 - (explosionOpacity / 255));
        
        fill(interpColor);  // Establece el color de relleno con la opacidad decreciente
        ellipse(position.x, position.y, explosionSize, explosionSize);  // Dibuja la explosión

        }
}


function draw() {
    if (gameState === "start") {
        background(0);

        fill(255);
        textAlign(CENTER, CENTER);
        text("Hemos entrado en la atmósfera de la Luna y tenemos que aterrizar nuestra nave con el fuel remanente\nHay que hacerlo con seguridad (agujas en verde) usando las flechas del teclado para encender los motores\n\nPulsa la tecla ENTER para comenzar\n\n(Si quieres el juego a pantalla completa pulsa primero F11)", width / 2, height / 2);
    } else if (gameState === "play") {
        background(0); // Moved this line here
        // Muestra la imagen en la parte superior izquierda del lienzo
        image(img,0,0);
        playGame();
    } else if (gameState === "end") {
        endGame();
    }

    if (exploded) {
        drawExplosion();
    }

    // Drawing the spaceship
    push();
    translate(position.x, position.y);

    if (!exploded && gameState === "play" || gameState === "end" && successfulLanding) { // Updated condition
        fill(255, 255, 0); // color amarillo
        vertex(0, -10);
        vertex(10, 10);
        vertex(0, 0);
        vertex(-10, 10);
        endShape(CLOSE);

        // Draw a small ellipse at the inverted vertex of the 'V'
        fill(255, 255, 0); // Color changed to yellow
        ellipse(0, -12, 8, 12); // Moved the ellipse 10 units up, made it wider (8 units) and taller (12 units)

        // Drawing the flames
        if (keyIsDown(UP_ARROW) && fuel > 0) {
            fill(255, 0, 0);;  // Orange color for the main flame
            triangle(0, 10, -5, 20, 5, 20);
        }
        if (keyIsDown(LEFT_ARROW) && fuel > 0) {
            fill(255, 0, 0);;  // Orange color for the side flames
            triangle(10, 10, 15, 10, 10, 15);  // Modified coordinates
        }
        if (keyIsDown(RIGHT_ARROW) && fuel > 0) {
            fill(255, 0, 0);;  // Orange color for the side flames
            triangle(-10, 10, -15, 10, -10, 15);  // Modified coordinates
        }
        
    }
    pop();

    
}



function keyPressed() {
    if (keyCode === ENTER) {
        if (gameState === "start" || gameState === "end") {
            gameState = "play";
            initGame();
        }
    }
}

function playGame() {
    if (!exploded && !successfulLanding) {
        let acceleration = createVector(0, GRAVITY);

        if (keyIsDown(UP_ARROW) && fuel > 0) {
            acceleration.y -= THRUST_MAIN / weight;
            fuel -= FUEL_RATE_MAIN * deltaTime;
        }
        if (keyIsDown(LEFT_ARROW) && fuel > 0) {
            acceleration.x -= THRUST_SECONDARY / weight;
            fuel -= FUEL_RATE_SECONDARY * deltaTime;
        }
        if (keyIsDown(RIGHT_ARROW) && fuel > 0) {
            acceleration.x += THRUST_SECONDARY / weight;
            fuel -= FUEL_RATE_SECONDARY * deltaTime;
        }
        velocity.add(p5.Vector.mult(acceleration, deltaTime / 1000));
        position.add(p5.Vector.mult(velocity, deltaTime / 1000));
        weight = empty_ship_weight + fuel;

        // Checking if the spaceship is outside of the canvas
        if (position.x < 0 || position.x > width || position.y < 0 || position.y > height) {
            exploded = true;
            gameState = 'end';
        }
    }

// Drawing fuel
let fullFuelColor = color(0, 255, 0); // Green when fuel is full
let emptyFuelColor = color(255, 0, 0); // Red when fuel is empty
let currentFuelColor = lerpColor(emptyFuelColor, fullFuelColor, fuel/10000); // Interpolates between the two colors based on the current fuel level

fill(currentFuelColor);
rect(10, 10, map(fuel, 0, 10000, 0, 200), 20); // Draws a bar indicating the fuel level. This bar decreases in length as the fuel runs out.

fill(255);
textAlign(LEFT, TOP);
text("Fuel: " + fuel.toFixed(2) + "Kg.", 10, 35); 

// Add screen scale text
//let screenScale = Math.max(windowWidth / 612, windowHeight / 344);  // Calculate the screen scale
//text("Screen Scale: " + screenScale.toFixed(2), 10, 55);  // Display the screen scale

// Drawing velocities
noFill();
strokeWeight(4); // Adjusts the thickness of the arc.

// Drawing vertical speed indicator
push(); // Save the current transformation matrix
translate(60, 80); // Move the origin to the center of the indicator
strokeWeight(2); // Adjust the thickness of the gauge

// Drawing outer circle
stroke(255);
ellipse(0, 0, 40, 40);

// Drawing limit marks
line(-15, -15, -17.5, -17.5); // 10 o'clock mark
line(0, -20, 0, -22.5); // 12 o'clock mark
line(15, -15, 17.5, -17.5); // 2 o'clock mark
line(20, 0, 22.5, 0); // 3 o'clock mark
line(15, 15, 17.5, 17.5); // 4 o'clock mark
line(0, 20, 0, 22.5); // 6 o'clock mark
line(-15, 15, -17.5, 17.5); // 8 o'clock mark
line(-20, 0, -22.5, 0); // 9 o'clock mark

// Drawing the needle
stroke(abs(velocity.y) > 10 ? 255 : 0, abs(velocity.y) <= 10 ? 255 : 0, 0);
let angleY = map(velocity.y, -10, 10, -PI, PI);
line(0, 0, 15 * cos(angleY - PI / 2), 15 * sin(angleY - PI / 2)); // We subtract PI/2 from the angle to make the needle start at 12 o'clock position

// Drawing the label
fill(255);
noStroke();
textAlign(CENTER, CENTER);
textSize(10); // Reduce text size
text("V. Vertical: " + velocity.y.toFixed(2) + " m/s", 0, 30);
pop(); // Restore the original transformation matrix



// Drawing lateral speed indicator
push(); // Save the current transformation matrix
translate(60, 150); // Move the origin to the center of the indicator
strokeWeight(2); // Adjust the thickness of the gauge

// Drawing outer circle
stroke(255);
ellipse(0, 0, 40, 40);

// Drawing limit marks
line(-15, -15, -17.5, -17.5); // 10 o'clock mark
line(0, -20, 0, -22.5); // 12 o'clock mark
line(15, -15, 17.5, -17.5); // 2 o'clock mark
line(20, 0, 22.5, 0); // 3 o'clock mark
line(15, 15, 17.5, 17.5); // 4 o'clock mark
line(0, 20, 0, 22.5); // 6 o'clock mark
line(-15, 15, -17.5, 17.5); // 8 o'clock mark
line(-20, 0, -22.5, 0); // 9 o'clock mark

// Drawing the needle
stroke(abs(velocity.x) > 2 ? 255 : 0, abs(velocity.x) <= 2 ? 255 : 0, 0);
let angleX = map(velocity.x, -6, 6, -PI, PI);
line(0, 0, 15 * cos(angleX - PI / 2), 15 * sin(angleX - PI / 2)); // We subtract PI/2 from the angle to make the needle start at 12 o'clock position


// Drawing the label
fill(255);
noStroke();
textAlign(CENTER, CENTER);
textSize(10); // Reduce text size
text("V. Lateral: " + velocity.x.toFixed(2) + " m/s", 0, 30);
pop(); // Restore the original transformation matrix


    // Drawing the landing pad
fill(0); // Paint the landing pad black
rect(landingPad.x, landingPad.y, 50, 20);

// Drawing the structure of the landing pad
stroke(0); // White color for the structure
line(landingPad.x, landingPad.y, landingPad.x + 10, landingPad.y - 10); // Left leg
line(landingPad.x + 50, landingPad.y, landingPad.x + 40, landingPad.y - 10); // Right leg
line(landingPad.x + 10, landingPad.y - 10, landingPad.x + 40, landingPad.y - 10); // Connecting bar
noStroke(); // Remove the stroke for other elements

// Drawing the target on the landing pad
fill(255, 0, 0); // Red color for the target
ellipse(landingPad.x + 25, landingPad.y - 5, 30, 12); // Outer ellipse
fill(255); // white color for the next ellipse
ellipse(landingPad.x + 25, landingPad.y - 5, 20, 10); // Middle ellipse
fill(255, 0, 0); // Red color for the inner ellipse
ellipse(landingPad.x + 25, landingPad.y - 5, 10, 5); // Inner ellipse


    // Checking for landing or crash
    let shipHalfHeight = 10;
    let shipHalfWidth = 10;
    if (!exploded && position.y + shipHalfHeight >= landingPad.y -7 && position.x - shipHalfWidth >= landingPad.x && position.x + shipHalfWidth <= landingPad.x + 50) {
        if (velocity.y > 10 || abs(velocity.x) > 2) {
            exploded = true;
            gameState = 'end';
        } else {
            successfulLanding = true;
            gameState = 'end';
        }
    }
}

function endGame() {
    
    if(successfulLanding){
        fill(255);
        textAlign(CENTER, CENTER);
        text("¡Aterrizaje con éxito!\nPulsa la tecla F5 para reiniciar el juego", width / 2, height / 2);
    }

    else {
        fill(255);
        textAlign(CENTER, CENTER);
        text("¡Has estrellado la nave!\nPulsa la tecla F5 para reiniciar el juego", width / 2, height / 2);
    }
}















    






















