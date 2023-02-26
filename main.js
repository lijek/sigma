function initThemeChange() {
  function getSystemPreferredTheme(){
    return (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }

  const themeSelect = document.getElementById("themeSelect");

  const storedTheme = localStorage.getItem('theme') || getSystemPreferredTheme();
  if (storedTheme){
    if (storedTheme === "system"){
      document.documentElement.setAttribute('data-theme', getSystemPreferredTheme());
    } else {
      document.documentElement.setAttribute('data-theme', storedTheme);
    }
    themeSelect.value = storedTheme;
  }

  themeSelect.addEventListener("change", () => {
    var targetTheme = themeSelect.value;
    localStorage.setItem('theme', targetTheme);
    if(targetTheme === "system"){
      targetTheme = getSystemPreferredTheme();
    }
    document.documentElement.setAttribute('data-theme', targetTheme);
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    if(themeSelect.value !== "system")
      return;
		const targetTheme = e.matches ? "dark" : "light";
		document.documentElement.setAttribute('data-theme', targetTheme);
	});
}

function initWorkspaceScale(){
  function appendScale(value){
    testRender.style.transform = "scale(" + scaleInput.value / 100 + ")";
    programWorkspace.style.transform = "scale(" + scaleInput.value / 100 + ")";
    /* testRender.style.scale = value;
    programWorkspace.style.scale = value; */
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
}

initThemeChange();
initWorkspaceScale();

const toggleTestRenderButton = document.getElementById("toggleTestRenderButton");
const testRender = document.getElementById("testRender");

toggleTestRenderButton.addEventListener("click", () => {
  testRender.hidden = !testRender.hidden;
});

/*
  Struktura danych:
  Program {
    nazwa;
    komentarze, presety, ID do elementów: {
      id: {dane}
    };
    linie indeks - y kursora: [
      komórki indeks - x kursora: [
        elementy;
        linie;
        inne bloczki;
      ];
    ];
  }
*/

const program = {
  name: "TEST, do remontu", // nazwa
  lineWidth: 18,            // szerokość programu (ile komórek)
  elements: {},             // dane kontrolek
  lines: []
}

const programWorkspace = document.getElementById("programWorkspace");
const emptyLineElement = document.getElementById("ldEmptyLineElement").cloneNode(true);
emptyLineElement.id = "";

const emptyLine = document.getElementById("ldLineContainer").cloneNode(true);
emptyLine.id = "";

for(var i = 0; i < program.lineWidth; i++){
  emptyLine.childNodes[1].appendChild(emptyLineElement.cloneNode(true));
}

function prepareWorkspace(){
  programWorkspace.innerHTML = "";
  programWorkspace.appendChild(emptyLine.cloneNode(true));
  programWorkspace.appendChild(emptyLine.cloneNode(true));
  programWorkspace.appendChild(emptyLine.cloneNode(true));
  programWorkspace.appendChild(emptyLine.cloneNode(true));
}

//init program, TODO inicjalizacja programu
prepareWorkspace(program);

const workspace = {
  cursor: {x: -1, y: -1},
  selection: {
    p1: {x: -1, y: -1},
    p2: {x: -1, y: -1}
  },
  cursorLastElement: undefined,
}

function getElementAtPosition(position){
  return programWorkspace.children[position.y].children[0].children[position.x];
}

function getCoordinatesFromElement(element){
  element = element.closest(".ldElement");
  if(!element)
    return;
  const line = element.parentElement;
  var x = -1;
  for(var i = 0; i < line.children.length; i++){
    if (line.children[i] === element){
      x = i;
      break;
    }
  }

  const lineContainer = line.parentElement;
  const programRender = lineContainer.parentElement;
  var y = -1;
  for(var i = 0; i < programRender.children.length; i++){
    if (programRender.children[i] === lineContainer){
      y = i
      break;
    }
  }
  /* alert(`x: ${x + 1}, y: ${y + 1}`); */
  return {x: x, y: y};
}

function setCursorPosition(position){
  workspace.cursor = position;
  workspace.cursorLastElement?.classList.remove("cursor");
  
  workspace.cursorLastElement = getElementAtPosition(position);
  workspace.cursorLastElement.classList.add("cursor");
}

function clearSelection(){
  for(const element of document.querySelectorAll(".ldElement.selected")){
    element.classList.remove("selected");
  }
}

function setSelectionP1(position){
  workspace.selection.p1 = position;
  clearSelection();
}

function setSelectionP2(position){
  workspace.selection.p2 = position;
  clearSelection();
  const xMin = Math.min(workspace.selection.p1.x, workspace.selection.p2.x);
  const xMax = Math.max(workspace.selection.p1.x, workspace.selection.p2.x) + 1;
  const yMin = Math.min(workspace.selection.p1.y, workspace.selection.p2.y);
  const yMax = Math.max(workspace.selection.p1.y, workspace.selection.p2.y) + 1;

  for(var x = xMin; x < xMax; x++){
    for(var y = yMin; y < yMax; y++){
      getElementAtPosition({x: x, y: y}).classList.add("selected");
    }
  }
}

/* for(const element of document.querySelectorAll(".ldElement")){
  element.addEventListener("click", () => {
    getCoordinatesFromElement(element);
  });
} */

let isMouseDown = false;

programWorkspace.addEventListener("mousedown", e => {
  if(e.buttons !== 1)
    return;
  const point = getCoordinatesFromElement(e.target);
  setCursorPosition(point);
  setSelectionP1(point);
  isMouseDown = true;
});

programWorkspace.addEventListener("mousemove", e => {
  if(!isMouseDown)
    return;
  const point = getCoordinatesFromElement(e.target);
  if(!point)
    return;
  setCursorPosition(point);
  setSelectionP2(point);
});

programWorkspace.addEventListener("mouseup", e => {
  if(!isMouseDown)
    return;
  isMouseDown = false;
  const point = getCoordinatesFromElement(e.target);
  setCursorPosition(point);
  setSelectionP2(point);
});