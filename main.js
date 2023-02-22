const scaleInput = document.getElementById("scale");
const toggleTestRenderButton = document.getElementById("toggleTestRenderButton");
const programRender = document.getElementById("programRender");
const testRender = document.getElementById("testRender");

scaleInput.addEventListener("change", e => {
  testRender.style.transform = "scale(" + scaleInput.value / 100 + ")";
  programRender.style.transform = "scale(" + scaleInput.value / 100 + ")";
});

toggleTestRenderButton.addEventListener("click", () => {
  testRender.hidden = !testRender.hidden;
});