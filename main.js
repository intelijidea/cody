const BACKGROUND_COLOR = "#1e1e1e";
const GUTTER_WIDTH = 32;
const LINE_SPACE = 19;
const WINDOW_WIDTH = window.innerWidth;
const WINDOW_HEIGHT = window.innerHeight;

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const input = document.querySelector("input");

canvas.width = WINDOW_WIDTH;
canvas.height = WINDOW_HEIGHT;

// It doesn't wurk, Anybody fix it please.
// window.addEventListener("resize", () => {
//   WINDOW_WIDTH = window.innerWidth;
//   WINDOW_HEIGHT = window.innerHeight;
//   editor.update();
// });

// The base class for editor which contains all editing features.
class Editor {
  constructor(text, context) {
    this.text = text?.split("\n");
    this.context = context;
    this.activeLineIndex = 0;
    this.cursorPos = [0, 0];
    this.renderer = new Canvas2DRenderer(context);

    // Draw Everything
    this.update();
  }

  // Add new character
  insertChar(text) {
    if (text) {
      this.text[this.activeLineIndex] =
        this.text[this.activeLineIndex].slice(0, this.cursorPos[0]) +
        text +
        this.text[this.activeLineIndex].slice(this.cursorPos[0]);
      this.cursorPos[0]++;
    }
    this.update();
  }

  // Remove character
  // Have some bug over here, we have to delete character behind the cursor
  removeChar() {
    if (this.cursorPos[0] === 0 && this.activeLineIndex === 0) return;

    if (this.cursorPos[0] === 0) {
      this.text.pop();
      this.activeLineIndex--;
      this.cursorPos[1]--;
      this.cursorPos[0] = this.text[this.activeLineIndex].length;
      this.update();
      return;
    }

    this.text[this.activeLineIndex] =
      this.text[this.activeLineIndex].slice(0, this.cursorPos[0] - 1) +
      this.text[this.activeLineIndex].slice(this.cursorPos[0]);

    this.cursorPos[0]--;

    this.update();
  }

  // Add line
  newLine() {
    this.text.push("");
    this.cursorPos[0] = 0;
    this.cursorPos[1]++;
    this.activeLineIndex++;
    this.update();
  }

  matchCursorInXAxis() {
    if (this.cursorPos[0] < this.text[this.activeLineIndex].length) {
      return;
    }
    this.cursorPos[0] = this.text[this.activeLineIndex].length;
  }
  moveCursorUp() {
    if (this.cursorPos[1] !== 0) {
      this.cursorPos[1]--;
      this.activeLineIndex--;
      this.matchCursorInXAxis();
      this.update();
    }
  }
  moveCursorDown() {
    if (this.cursorPos[1] < this.text.length - 1) {
      this.cursorPos[1]++;
      this.activeLineIndex++;
      this.matchCursorInXAxis();
      this.update();
    }
  }
  moveCursorLeft() {
    if (this.cursorPos[0] !== 0) {
      this.cursorPos[0]--;
    } else if (this.cursorPos[1] !== 0) {
      this.cursorPos[1]--;
      this.activeLineIndex--;
      this.cursorPos[0] = this.text[this.activeLineIndex].length;
    }
    this.update();
  }
  moveCursorRight() {
    if (this.cursorPos[0] < this.text[this.activeLineIndex].length) {
      this.cursorPos[0]++;
    } else if (this.cursorPos[1] < this.text.length - 1) {
      this.cursorPos[0] = 0;
      this.cursorPos[1]++;
      this.activeLineIndex++;
    }
    this.update();
  }
  // draw line number.
  drawLineNumber() {
    this.text.map((v, i) => {
      this.context.fillStyle = "white";
      this.context.fillText(
        i + 1,
        8,
        this.renderer.textMetrics.height + 5 + i * LINE_SPACE
      );
    });
  }

  // Update and Re-draw everything.
  update() {
    this.renderer.update(this.text, this.cursorPos);
    this.drawLineNumber();
    input.style.transform = `translate(${
      5 +
      GUTTER_WIDTH +
      this.cursorPos[0] * (this.renderer.textMetrics.width + 1.4)
    }px,${
      this.cursorPos[1] * LINE_SPACE + this.renderer.textMetrics.height - 5
    }px)`;
  }
}

class Canvas2DRenderer {
  constructor(context) {
    this.context = context;
    this.textMetrics = { width: 0, height: 0 };
    this.calcText();
    this.drawRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT, BACKGROUND_COLOR);
    this.context.font = "14px monospace";
  }
  update(text, cursorPos) {
    // Background
    this.drawRect(
      WINDOW_WIDTH - GUTTER_WIDTH,
      WINDOW_HEIGHT,
      GUTTER_WIDTH,
      0,
      BACKGROUND_COLOR
    );

    // Gutter
    this.drawRect(GUTTER_WIDTH, WINDOW_HEIGHT, 0, 0, "#2e2e2e");

    text.map((v, i) => {
      this.drawText(v, 0, i * LINE_SPACE);
    });
    this.rendererCursor(cursorPos);
  }

  drawRect(width, height, x, y, background) {
    this.context.fillStyle = background;
    this.context.fillRect(x, y, width, height);
  }
  calcText() {
    const tM = this.context.measureText("C");
    this.textMetrics.width = tM.width;
    // The thing below is not available in chromium, I was causing text rendering issue in chromium
    // this.textMetrics.height = tM.emHeightAscent;
    this.textMetrics.height = tM.actualBoundingBoxAscent;
  }
  drawText(text, offX = 0, offY = 0) {
    this.context.fillStyle = "#FFF";
    this.context.fillText(
      text,
      GUTTER_WIDTH + 4 + offX,
      5 + this.textMetrics.height + offY
    );
  }
  rendererCursor(cursorPos) {
    this.drawRect(
      1,
      this.textMetrics.height + 6,
      // TODO: Replace hardcoded value
      5 + GUTTER_WIDTH + cursorPos[0] * (this.textMetrics.width + 1.3),
      cursorPos[1] * LINE_SPACE + this.textMetrics.height - 5,
      "white"
    );
  }
}

const editor = new Editor(
  //Demo code
  `input.addEventListener("input", (i) => {
  editor.insert(i.target.value);
  i.target.value = "";
});`,

  // Canvas 2d context
  context
);

input.addEventListener("input", (i) => {
  editor.insertChar(i.target.value);
  i.target.value = "";
});

input.addEventListener("keydown", (i) => {
  switch (i.key) {
    case "Backspace":
      editor.removeChar();
      break;
    case "Enter":
      editor.newLine();
      break;
    case "ArrowUp":
      editor.moveCursorUp();
      break;
    case "ArrowDown":
      editor.moveCursorDown();
      break;
    case "ArrowLeft":
      editor.moveCursorLeft();
      break;
    case "ArrowRight":
      editor.moveCursorRight();
      break;
    default:
      break;
  }
});

/*
// Not sure what to do.
function tick() {
  editor.update();
  requestAnimationFrame(tick);
}
tick();
 */

window.addEventListener("focus", () => input.focus());
canvas.addEventListener("focus", () => input.focus());
canvas.addEventListener("click", () => input.focus());
