const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const button = document.querySelector("button");
var sigUrl = document.getElementById("sig-url");
let x = 0;
let y = 0;

document.addEventListener("mousedown", function startPos(e) {
    document.addEventListener("mousemove", draw);
    reposition(e);
});
document.addEventListener("mouseup", function stopPos() {
    document.removeEventListener("mousemove", draw);
    var dataURL = canvas.toDataURL();
    sigUrl.value = dataURL;
});

function reposition(event) {
    x = event.clientX - canvas.offsetLeft;
    y = event.clientY - canvas.offsetTop;
}

function draw(e) {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    ctx.moveTo(x, y);
    reposition(e);
    ctx.lineTo(x, y);
    ctx.stroke();
}
