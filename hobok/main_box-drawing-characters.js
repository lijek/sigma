let nextId = 0;

/* function getNextInputId(){
  return "I" + nextId++;
}

function getNextOutputId(){
  return "Q" + nextId++;
} */

function getNextId(){
  return nextId++;
}

function generateLdElementBase(id, isInput, isNormalClosed){
  const element = document.createElement("span");
  element.classList.add("ldElement");
  element.id = this.id;

  const nc = isNormalClosed ? "╲" : " ";
  element.left = "──";
  element.middle = isInput ? "─┤" + nc + "├───" : "─(" + nc + ")───";
  element.innerHTML = element.left + element.middle;

  element.updateText = function() {
    element.innerHTML = element.left + element.middle;
  }

  return element;
}

function Input(isNormalClosed, isOr){
  this.id = getNextId();
  this.isNormalClosed = typeof isNormalClosed !== 'boolean' ? false : isNormalClosed;
  this.isOr = typeof isOr !== 'boolean' ? false : isOr;

  this.element = generateLdElementBase(this.id, false, isNormalClosed);

  this.render = function(topElement){
    if(isOr){
      if(topElement?.isOR)
        this.element.left = "&nbsp;├";
      else
        this.element.left = "─┬"
    }else
      if(topElement?.isOr)
        this.element.left = "&nbsp;└";

    this.element.updateText();
    return this.element;
  }
}

function Output(isNormalClosed, isOr){
  this.id = getNextId();
  this.isNormalClosed = typeof isNormalClosed !== 'boolean' ? false : isNormalClosed;
  this.isOr = typeof isOr !== 'boolean' ? false : isOr;

  this.element = generateLdElementBase(this.id, false, isNormalClosed);

  this.render = function(topElement){
    if(isOr){
      if(topElement?.isOR)
        this.element.left = "&nbsp;├";
      else
        this.element.left = "─┬"
    }else
      if(topElement?.isOr)
        this.element.left = "&nbsp;└";

    this.element.updateText();
    return this.element;
  }

  this.setName = function(name){

  }
}

const sampleProgram = [
  [new Input(), new Input(), new Output()],
  [new Input(true, true), new Input(), new Output(true)],
  [new Input(false, true), new Input()],
  [new Input(true)]
]

const programRender = document.getElementById("programRender");

for(const lineIndex in sampleProgram){
  const midLineContainer = document.createElement("div");
  const lineContainer = document.createElement("div");
  const line = sampleProgram[lineIndex];
  for(const elementIndex in line){
    const element = line[elementIndex];
    let topElement = undefined;
    if(sampleProgram[lineIndex - 1])
      topElement = sampleProgram[lineIndex - 1][elementIndex]
    lineContainer.appendChild(element.render(topElement));
  }
  programRender.appendChild(midLineContainer);
  programRender.appendChild(lineContainer);
}