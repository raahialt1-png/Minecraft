(() => {
  const TILE_SIZE = 32;
  const WORLD_WIDTH = 25;
  const WORLD_HEIGHT = 18;
  const BLOCKS = {
    GRASS: { id: 1, color: "#4caf50", label: "Grass" },
    DIRT: { id: 2, color: "#8d6e63", label: "Dirt" },
    STONE: { id: 3, color: "#9e9e9e", label: "Stone" },
    WATER: { id: 4, color: "#2196f3", label: "Water" },
  };

  const world = Array.from({ length: WORLD_HEIGHT }, (_, y) =>
    Array.from({ length: WORLD_WIDTH }, (_, x) => {
      if (y > WORLD_HEIGHT * 0.65) return BLOCKS.STONE.id;
      if (y > WORLD_HEIGHT * 0.5) return BLOCKS.DIRT.id;
      if (y > WORLD_HEIGHT * 0.4) return BLOCKS.GRASS.id;
      return Math.random() > 0.92 ? BLOCKS.WATER.id : 0;
    })
  );

  const state = {
    player: {
      x: 4,
      y: 4,
      color: "#ffeb3b",
    },
    selectedBlock: BLOCKS.DIRT.id,
    message: "Use WASD/Arrow keys to move. Click to place, Shift+Click to remove.",
  };

  const blockById = new Map(
    Object.values(BLOCKS).map((block) => [block.id, block])
  );

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = WORLD_WIDTH * TILE_SIZE;
  canvas.height = WORLD_HEIGHT * TILE_SIZE;
  canvas.style.border = "4px solid #2d2d2d";
  canvas.style.imageRendering = "pixelated";

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.style.gap = "12px";
  container.style.fontFamily = "'Trebuchet MS', sans-serif";
  container.style.background = "#1b1b1b";
  container.style.color = "#f5f5f5";
  container.style.minHeight = "100vh";
  container.style.padding = "20px";

  const title = document.createElement("h1");
  title.textContent = "Minecraft (Script.js Edition)";
  title.style.margin = "0";

  const status = document.createElement("div");
  status.style.maxWidth = "760px";
  status.style.textAlign = "center";
  status.style.fontSize = "0.95rem";

  const toolbar = document.createElement("div");
  toolbar.style.display = "flex";
  toolbar.style.flexWrap = "wrap";
  toolbar.style.gap = "8px";
  toolbar.style.justifyContent = "center";

  Object.values(BLOCKS).forEach((block) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = block.label;
    button.style.background = block.color;
    button.style.border = "2px solid #111";
    button.style.color = "#111";
    button.style.padding = "6px 10px";
    button.style.cursor = "pointer";
    button.addEventListener("click", () => {
      state.selectedBlock = block.id;
      updateStatus();
      draw();
    });
    toolbar.appendChild(button);
  });

  const legend = document.createElement("div");
  legend.style.fontSize = "0.9rem";
  legend.textContent = "Tip: Shift + Click removes blocks.";

  const controls = document.createElement("div");
  controls.style.display = "grid";
  controls.style.gridTemplateColumns = "repeat(3, 24px)";
  controls.style.gap = "4px";
  controls.style.alignItems = "center";
  controls.style.justifyContent = "center";
  controls.style.marginTop = "8px";

  ["", "↑", "", "←", "↓", "→", "", "", ""].forEach((label) => {
    const key = document.createElement("div");
    key.textContent = label;
    key.style.width = "24px";
    key.style.height = "24px";
    key.style.display = "flex";
    key.style.alignItems = "center";
    key.style.justifyContent = "center";
    key.style.background = "#333";
    key.style.borderRadius = "4px";
    key.style.color = "#f5f5f5";
    key.style.fontSize = "0.8rem";
    controls.appendChild(key);
  });

  container.append(title, status, toolbar, canvas, legend, controls);
  document.body.style.margin = "0";
  document.body.appendChild(container);

  function updateStatus() {
    const block = blockById.get(state.selectedBlock);
    status.textContent = `${state.message} Selected: ${block.label}. Player: (${state.player.x}, ${state.player.y})`;
  }

  function inBounds(x, y) {
    return x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT;
  }

  function drawGrid() {
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    for (let x = 0; x <= WORLD_WIDTH; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * TILE_SIZE, 0);
      ctx.lineTo(x * TILE_SIZE, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * TILE_SIZE);
      ctx.lineTo(canvas.width, y * TILE_SIZE);
      ctx.stroke();
    }
  }

  function drawWorld() {
    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    world.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 0) return;
        const block = blockById.get(cell);
        ctx.fillStyle = block.color;
        ctx.fillRect(
          x * TILE_SIZE,
          y * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE
        );
      });
    });
  }

  function drawPlayer() {
    ctx.fillStyle = state.player.color;
    ctx.fillRect(
      state.player.x * TILE_SIZE + 6,
      state.player.y * TILE_SIZE + 6,
      TILE_SIZE - 12,
      TILE_SIZE - 12
    );
  }

  function drawSelection() {
    ctx.strokeStyle = "#ffeb3b";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      state.player.x * TILE_SIZE + 2,
      state.player.y * TILE_SIZE + 2,
      TILE_SIZE - 4,
      TILE_SIZE - 4
    );
  }

  function draw() {
    drawWorld();
    drawGrid();
    drawPlayer();
    drawSelection();
  }

  function movePlayer(dx, dy) {
    const nextX = state.player.x + dx;
    const nextY = state.player.y + dy;
    if (!inBounds(nextX, nextY)) return;
    state.player.x = nextX;
    state.player.y = nextY;
    updateStatus();
    draw();
  }

  function handlePlacement(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((event.clientY - rect.top) / TILE_SIZE);
    if (!inBounds(x, y)) return;

    if (event.shiftKey) {
      world[y][x] = 0;
    } else {
      world[y][x] = state.selectedBlock;
    }

    draw();
  }

  window.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowUp":
      case "w":
      case "W":
        movePlayer(0, -1);
        break;
      case "ArrowDown":
      case "s":
      case "S":
        movePlayer(0, 1);
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        movePlayer(-1, 0);
        break;
      case "ArrowRight":
      case "d":
      case "D":
        movePlayer(1, 0);
        break;
      default:
        break;
    }
  });

  canvas.addEventListener("click", handlePlacement);

  updateStatus();
  draw();
})();
