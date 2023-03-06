const placeholder = document.createElement("div");

let templates = {
  emptyLine: placeholder,
  empty: placeholder,
  IO: placeholder,
  timer: placeholder,
}
const workspace = {
  programWidth: 18,
  container: document.getElementById("programWorkspace"),
  cursor: { x: -1, y: -1 },
  selection: {
    p1: { x: -1, y: -1 },
    p2: { x: -1, y: -1 }
  },
  cursorLastElement: undefined,
  getCoordinatesFromElement(element) {
    element = element.closest(".ldElement");
    if (!element)
      return;
    const line = element.parentElement;
    var x = -1;
    for (var i = 0; i < line.children.length; i++) {
      if (line.children[i] === element) {
        x = i;
        break;
      }
    }

    const lineContainer = line.parentElement;
    var y = -1;
    for (var i = 0; i < workspace.container.children.length; i++) {
      if (workspace.container.children[i] === lineContainer) {
        y = i
        break;
      }
    }
    return { x: x, y: y };
  },
  getElementAtPosition(position) {
    return workspace.container.children[position.y].children[0].children[position.x];
  },
  setCursorPosition(position, element) {
    workspace.cursor = position;
    workspace.cursorLastElement?.classList.remove("cursor");

    if (!element) {
      element = workspace.getElementAtPosition(position);
    }

    workspace.cursorLastElement = element;
    workspace.cursorLastElement.classList.add("cursor");

    //select do negacji itd, zrób żeby to była funkcja. lub inna rozkmina
  },
  clearSelection() {
    for (const element of document.querySelectorAll(".ldElement.selected")) {
      element.classList.remove("selected");
    }
  },
  setSelectionP1(position) {
    workspace.selection.p1 = position;
    workspace.clearSelection();
  },
  setSelectionP2(position) {
    workspace.selection.p2 = position;
    workspace.clearSelection();
    const xMin = Math.min(workspace.selection.p1.x, workspace.selection.p2.x);
    const xMax = Math.max(workspace.selection.p1.x, workspace.selection.p2.x) + 1;
    const yMin = Math.min(workspace.selection.p1.y, workspace.selection.p2.y);
    const yMax = Math.max(workspace.selection.p1.y, workspace.selection.p2.y) + 1;

    for (var x = xMin; x < xMax; x++) {
      for (var y = yMin; y < yMax; y++) {
        workspace.getElementAtPosition({ x: x, y: y }).classList.add("selected");
      }
    }
  },
  newLine() {
    const lineContainer = templates.emptyLine.cloneNode(true);
    const line = lineContainer.querySelector(".ldLine");

    for (let i = 0; i < workspace.programWidth; i++) {
      line.appendChild(templates.empty.cloneNode(true));
    }

    workspace.container.appendChild(lineContainer);
  },
  drawElement(type) {
    const element = workspace.getElementAtPosition(workspace.cursor);
    let newElement;

    if (element.children.length > 0) {
      if (!confirm("Replace element?")) {
        return;
      }
    }

    switch (type) {
      case "input": {
        newElement = templates.IO.cloneNode(true);
        element.replaceWith(newElement);
        break;
      }
      case "output": {
        newElement = templates.IO.cloneNode(true);
        element.replaceWith(newElement);
        newElement.querySelector(".ldIO-element-center").classList.add("ldIO-element-output");
        break;
      }
      case "timer": {
        newElement = templates.timer.cloneNode(true);
        element.replaceWith(newElement);
        break;
      }
      //todo więcej
      default:
        alert("chuj");
        break;
    }
    workspace.setCursorPosition(workspace.cursor, newElement);
    workspace.setSelectionP1(workspace.cursor);
    workspace.setSelectionP2(workspace.cursor);
  },
  toggleLine(direction) {
    function generateLine(direction) {
      const line = document.createElement("div");
      line.classList.add(`ldLine-${direction}`);
      return line;
    }


    const element = workspace.getElementAtPosition(workspace.cursor);
    if (element.children.length > 0 && !element.classList.contains("ldLine-element")) {
      if (!confirm("Replace element?")) {
        return;
      }
    }

    if (direction === "toggleAll") {
      if (element.querySelector(".ldLine-middle")) {
        element.innerHTML = "";
      } else {
        element.appendChild(generateLine("top"));
        element.appendChild(generateLine("middle"));
        element.appendChild(generateLine("bottom"));
        element.appendChild(generateLine("left"));
        element.appendChild(generateLine("right"));
      }
    } else {

      let line = element.querySelector(`.ldLine-${direction}`);
      if (line) {
        line.remove();
      } else {
        element.appendChild(generateLine(direction));
      }
    }

    if (element.querySelector(".ldLine-top, .ldLine-bottom, .ldLine-left, .ldLine-right")) {
      element.classList.add("ldLine-element");
      if (!element.querySelector(".ldLine-middle")) {
        element.appendChild(generateLine("middle"));
      }
    } else {
      element.querySelector(".ldLine-middle")?.remove();
      element.classList.remove("ldLine-element");
    }

    element.classList.contains("ldLine-element")
  }
};

function init() {
  //initializes theme change, workspace scale, simple button controls
  function initThemeChange() {
    function getSystemPreferredTheme() {
      return (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }

    const themeSelect = document.getElementById("themeSelect");

    const storedTheme = localStorage.getItem('theme') || "system";
    if (storedTheme) {
      if (storedTheme === "system") {
        document.documentElement.setAttribute('data-theme', getSystemPreferredTheme());
      } else {
        document.documentElement.setAttribute('data-theme', storedTheme);
      }
      themeSelect.value = storedTheme;
    }

    themeSelect.addEventListener("change", () => {
      var targetTheme = themeSelect.value;
      localStorage.setItem('theme', targetTheme);
      if (targetTheme === "system") {
        targetTheme = getSystemPreferredTheme();
      }
      document.documentElement.setAttribute('data-theme', targetTheme);
    });

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      if (themeSelect.value !== "system")
        return;
      const targetTheme = e.matches ? "dark" : "light";
      document.documentElement.setAttribute('data-theme', targetTheme);
    });
  }

  function initWorkspaceScale() {
    function appendScale(value) {
      /* testRender.style.transform = "scale(" + value / 100 + ")";
      programWorkspace.style.transform = "scale(" + value / 100 + ")"; */
      testRender.style.scale = value;
      programWorkspace.style.scale = value;
    }

    const scaleInput = document.getElementById("scale");
    const programWorkspace = document.getElementById("programWorkspace");
    const testRender = document.getElementById("testRender");

    const savedScale = localStorage.getItem("workspaceScale") || 100;
    scaleInput.value = savedScale;
    appendScale(scaleInput.value / 100);

    scaleInput.addEventListener("change", () => {
      localStorage.setItem("workspaceScale", scaleInput.value);
      appendScale(scaleInput.value / 100);
    });

    scaleInput.addEventListener("input", () => {
      localStorage.setItem("workspaceScale", scaleInput.value);
      appendScale(scaleInput.value / 100);
    });
  }

  function initTestRenderToggle() {
    const toggleTestRenderButton = document.getElementById("toggleTestRenderButton");
    const testRender = document.getElementById("testRender");

    const isTestRenderHidden = localStorage.getItem("isTestRenderHidden") || true;
    testRender.hidden = isTestRenderHidden === "true";

    toggleTestRenderButton.addEventListener("click", () => {
      testRender.hidden = !testRender.hidden;
      localStorage.setItem("isTestRenderHidden", testRender.hidden);
    });
  }

  function initTemplates() {
    const emptyLine = document.getElementById("ldLineContainer").cloneNode(true);
    emptyLine.removeAttribute("id");
    templates.emptyLine = emptyLine;

    const empty = document.getElementById("ldEmptyElement").cloneNode(true);
    empty.removeAttribute("id");
    templates.empty = empty;

    const IO = document.getElementById("ldIO").cloneNode(true);
    IO.removeAttribute("id");
    templates.IO = IO;

    const timer = document.getElementById("ldTimer").cloneNode(true);
    timer.removeAttribute("id");
    templates.timer = timer;

    //todo więcej
  }

  function initControlButtons() {
    document.getElementById("newLine").addEventListener("click", workspace.newLine);
    document.getElementById("drawInput").addEventListener("click", () => workspace.drawElement("input"));
    document.getElementById("drawOutput").addEventListener("click", () => workspace.drawElement("output"));

    document.getElementById("lineDrawingButtons").querySelectorAll("button").forEach(button => {
      button.addEventListener("click", e => {
        workspace.toggleLine(button.value);
      });
    });
    //aaaaaaaaaa kurwa
  }

  function initSelection() {
    let isMouseDown = false;
    workspace.container.addEventListener("mousedown", e => {
      if (e.buttons !== 1)
        return;
      const point = workspace.getCoordinatesFromElement(e.target);
      workspace.setCursorPosition(point, e.target.closest(".ldElement"));
      workspace.setSelectionP1(point);
      isMouseDown = true;
    });

    workspace.container.addEventListener("mousemove", e => {
      if (!isMouseDown)
        return;
      const point = workspace.getCoordinatesFromElement(e.target);
      if (!point)
        return;
      workspace.setCursorPosition(point, e.target.closest(".ldElement"));
      workspace.setSelectionP2(point);
    });

    workspace.container.addEventListener("mouseup", e => {
      if (!isMouseDown)
        return;
      isMouseDown = false;
      const point = workspace.getCoordinatesFromElement(e.target);
      workspace.setCursorPosition(point, e.target.closest(".ldElement"));
      workspace.setSelectionP2(point);
    });
    workspace.container.addEventListener("mouseleave", () => {
      isMouseDown = false;
    });
  }

  initThemeChange();
  initWorkspaceScale();
  initTestRenderToggle();
  initTemplates();
  initControlButtons();
  initSelection();

}

init();

workspace.newLine();