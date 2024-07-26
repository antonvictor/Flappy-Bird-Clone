document.addEventListener("keypress", handleStart, { once: true });
const title = document.querySelector("[data-title]");
const subtitle = document.querySelector("[data-subtitle]");
const bird = document.querySelector("[data-bird]");

let lastTime;
function updateLoop(time) {
  if (lastTime == null) {
    lastTime = time;
    window.requestAnimationFrame(updateLoop);
    return;
  }

  const delta = time - lastTime;
  updateBird(delta);
  updatePipes(delta);
  if (checkLose()) return handleLose();
  lastTime = time;
  window.requestAnimationFrame(updateLoop);
}

function checkLose() {
  const birdRect = getBirdRect();
  const insidePipe = getPipeRects().some(rect => isCollision(birdRect, rect));
  const outsideWorld = birdRect.top < 0 || birdRect.bottom > window.innerHeight;

  return outsideWorld || insidePipe
}

function isCollision(rect1 , rect2) {
return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top  


)
}

function handleStart() {
  title.classList.add("hide");
  setupBird();
  setupPipes();
  lastTime = null;
  window.requestAnimationFrame(updateLoop);
}

function handleLose() {
  setTimeout(() => {
    title.classList.remove("hide");
    subtitle.classList.remove("hide");
    subtitle.textContent = `${getPassedPipesCount()} Pipes`;
    document.addEventListener("keypress", handleStart, { once: true });
  }, 100);
}

//Bird Code

const BIRD_SPEED = 0.5;
const JUMP_DURATION = 125;
let timeSinceLastJump = Number.POSITIVE_INFINITY;

function setupBird() {
  setTop(window.innerHeight / 2);
  document.removeEventListener("keydown", handleJump);
  document.addEventListener("keydown", handleJump);
}

function updateBird(delta) {
  if (timeSinceLastJump < JUMP_DURATION) {
    setTop(getTop() - BIRD_SPEED * delta);
  } else {
    setTop(getTop() + BIRD_SPEED * delta);
  }
  timeSinceLastJump += delta;
}

function getBirdRect() {
  return bird.getBoundingClientRect();
}

function setTop(top) {
  bird.style.setProperty("--bird-top", top);
}

function getTop() {
  return parseFloat(getComputedStyle(bird).getPropertyValue("--bird-top"));
}

function handleJump(e) {
  if (e.code !== "Space") return
  timeSinceLastJump = 0;
}

//pipes Code

const HOLE_HEIGHT = 200;
const PIPE_WIDTH = 120
const PIPE_INTERVAL =1500
const PIPE_SPEED = 0.75
let pipes = []
let timeSinceLastPipe
let passedPipesCount



function setupPipes() { 
    document.documentElement.style.setProperty("--pipe-width", PIPE_WIDTH);
    document.documentElement.style.setProperty("--hole-height", HOLE_HEIGHT);
    pipes.forEach(pipe=> pipe.remove())
    timeSinceLastPipe = PIPE_INTERVAL;
    passedPipesCount = 0
}


function updatePipes(delta) {
    timeSinceLastPipe += delta

    if (timeSinceLastPipe > PIPE_INTERVAL) {
        timeSinceLastPipe -= PIPE_INTERVAL
        createPipe()
    }

    pipes.forEach( pipe =>{ 
        if (pipe.left + PIPE_WIDTH < 0 ) {
            passedPipesCount ++
            return pipe.remove()
        }
        pipe.left = pipe.left- delta * PIPE_SPEED
    } )
}

function getPassedPipesCount() {
    return passedPipesCount
}

function getPipeRects() {
return pipes.flatMap(pipe => pipe.rects())
}

function createPipe() {
  const pipeElem = document.createElement("div");
  const topElem = createPipeSegment("top");
  const bottomElem = createPipeSegment("bottom");
  pipeElem.append(topElem);
  pipeElem.append(bottomElem);
  pipeElem.classList.add("pipe");
  pipeElem.style.setProperty(
    "--hole-top",
    randomNumberBetween(
      HOLE_HEIGHT * 1.5,
      window.innerHeight - HOLE_HEIGHT * 0.5
    )
  )
  const pipe = {
    get left() {
      return parseFloat(
        getComputedStyle(pipeElem).getPropertyValue("--pipe-left")
      );
    },

    set left(value) {
      pipeElem.style.setProperty("--pipe-left", value);
    },
    remove() {
        pipes = pipes.filter(p => p !== pipe)
        pipeElem.remove();
    },
    rects() {
        return [
            topElem.getBoundingClientRect(),
            bottomElem.getBoundingClientRect(),

        ]
    },
  };
  pipe.left = window.innerWidth;
  document.body.append(pipeElem)
  pipes.push(pipe);
}

function createPipeSegment(position) {
  const segment = document.createElement("div");
  segment.classList.add("segment", position);
  return segment;
}

function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
