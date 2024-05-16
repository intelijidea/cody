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
    this.cursorPos = new Pointer(0, 0);
    this.renderer = new Canvas2DRenderer(context);
    this.keyModifier = 0;
    // Draw Everything
    this.update();
  }

  // Add new character
  insertChar(text) {
    if (text) {
      this.text[this.cursorPos.line] =
        this.text[this.cursorPos.line].slice(0, this.cursorPos.column) +
        text +
        this.text[this.cursorPos.line].slice(this.cursorPos.column);
      this.cursorPos.column++;
    }
    this.update();
  }

  // Remove character
  // Have some bug over here, we have to delete character behind the cursor
  removeChar() {
    if (this.cursorPos.column === 0 && this.cursorPos.line === 0) return;

    if (this.cursorPos.column === 0) {
      this.text.pop();
      this.cursorPos.line--;
      this.cursorPos.column = this.text[this.cursorPos.line].length;
      this.update();
      return;
    }

    this.text[this.cursorPos.line] =
      this.text[this.cursorPos.line].slice(0, this.cursorPos.column - 1) +
      this.text[this.cursorPos.line].slice(this.cursorPos.column);

    this.cursorPos.column--;

    this.update();
  }

  // Add line
  newLine() {
    this.text.push("");
    this.cursorPos.column = 0;
    this.cursorPos.line++;
    this.update();
  }

  matchCursorInXAxis() {
    if (this.cursorPos.column < this.text[this.cursorPos.line].length) return;
    this.cursorPos.column = this.text[this.cursorPos.line].length;
  }

  moveCursor(direction) {
    switch (direction) {
      case DIRECTION.UP:
        if (this.cursorPos.line !== 0) {
          this.cursorPos.line--;
          this.matchCursorInXAxis();
        }
        break;
      case DIRECTION.DOWN:
        if (this.cursorPos.line < this.text.length - 1) {
          this.cursorPos.line++;
          this.matchCursorInXAxis();
        }
        break;
      case DIRECTION.LEFT:
        if (this.cursorPos.column !== 0) this.cursorPos.column--;
        else if (this.cursorPos.line !== 0) {
          this.cursorPos.line--;
          this.cursorPos.column = this.text[this.cursorPos.line].length;
        }
        break;
      case DIRECTION.RIGHT:
        if (this.cursorPos.column < this.text[this.cursorPos.line].length)
          this.cursorPos.column++;
        else if (this.cursorPos.line < this.text.length - 1) {
          this.cursorPos.column = 0;
          this.cursorPos.line++;
        }
        break;
      default:
        break;
    }
    this.update();
  }
  moveCursorToEndOrStart(direction) {
    switch (direction) {
      case DIRECTION.LEFT:
        this.cursorPos.column = 0;
        break;
      case DIRECTION.RIGHT:
        this.cursorPos.column = this.text[this.cursorPos.line].length;
        break;
      default:
        break;
    }
    this.update();
  }

  // DEPRECATED

  /*   moveCursorUp() {}
  moveCursorDown() {}
  moveCursorLeft() {}
  moveCursorRight() {} */

  // Handle Key Events

  handleKeyPress(key) {
    switch (key) {
      case "Control":
      case "Alt":
      case "Shift":
        this.keyModifier = key;
        return;
      default:
        break;
    }

    if (this.keyModifier === "Control") {
      switch (key) {
        case "a":
        // TOOD: Select All
        case "c":
        // TODO:Copy
        case "v":
          // TODO:Paste
          break;
      }
      this.keyModifier = 0;
    }

    switch (key) {
      case "Backspace":
        this.removeChar();
        break;
      case "Enter":
        this.newLine();
        break;
      case "ArrowUp":
        this.moveCursor(DIRECTION.UP);
        break;
      case "ArrowDown":
        this.moveCursor(DIRECTION.DOWN);
        break;
      case "ArrowLeft":
        this.moveCursor(DIRECTION.LEFT);
        break;
      case "ArrowRight":
        this.moveCursor(DIRECTION.RIGHT);
        break;
      case "End":
        this.moveCursorToEndOrStart(DIRECTION.RIGHT);
        break;
      case "Home":
        this.moveCursorToEndOrStart(DIRECTION.LEFT);
        break;
      default:
        break;
    }
  }

  // Update and Re-draw everything.
  update() {
    this.renderer.update(this.text, this.cursorPos);
    this.renderer.drawLineNumber(this.text.length);
    input.style.transform = `translate(${
      5 +
      GUTTER_WIDTH +
      this.cursorPos.column * (this.renderer.textMetrics.width + 1.4)
    }px,${
      this.cursorPos.line * LINE_SPACE + this.renderer.textMetrics.height - 5
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

  drawLineNumber(length) {
    // console.log(this);
    for (let index = 0; index < length; index++) {
      this.context.fillStyle = "white";
      this.context.fillText(
        index + 1,
        8,
        this.textMetrics.height + 5 + index * LINE_SPACE
      );
    }
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
      5 + GUTTER_WIDTH + cursorPos.column * (this.textMetrics.width + 1.4),
      cursorPos.line * LINE_SPACE + this.textMetrics.height - 5,
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
  editor.handleKeyPress(i.key);
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
