window.addEventListener('touchmove', event => {
    event.preventDefault();
}, { passive: false });

const defaultMessage = '猫を描いてくだされ';

const catMessage = document.querySelector('#catMessage');
const catBody = document.querySelector('#catBody');
const catHead = document.querySelector('#catHead');
const catTail = document.querySelector('#catTail');
const canvas = document.querySelector('#canvas');
const w = window.innerWidth;
const h = window.innerHeight;
let size = 600;

if(w < h){
    size = (size < w) ? size : w;
}else{
    size = (size < h) ? size : h;
}

canvas.width = size;
canvas.height = size;

const catSize = size - catHead.clientWidth - catTail.clientWidth;

const ctx = canvas.getContext('2d');
ctx.lineWidth = 20;
ctx.lineCap = "round";

ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);


function init(classifier) {
    canvas.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
        ctx.beginPath();
        ctx.moveTo(event.offsetX, event.offsetY);
        canvas.addEventListener('pointermove', onMouseMove);
    });
    
    canvas.addEventListener('pointerup', (event) => {
        event.stopPropagation();
        canvas.removeEventListener('pointermove', onMouseMove);

        classifier.classify(canvas, gotResults);
    });
    
    canvas.addEventListener('pointerout', (event) => {
        event.stopPropagation();
        canvas.removeEventListener('pointermove', onMouseMove);

        classifier.classify(canvas, gotResults);
    });
    
    function onMouseMove(event) {
        event.stopPropagation();
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
    }
    
    const clearButton = document.querySelector('#clear');
    clearButton.addEventListener('click', () => {
        ctx.fillRect(0, 0, canvas.width, canvas.height); 
        catMessage.innerHTML = defaultMessage;
        catBody.style.width = '0px';
    } );
}

function gotResults(results, error) {
    if (error) {
        console.error(error);
        return;
    }

    console.log(toString(results[0]));
    console.log(toString(results[1]));

    results.filter(result => result.label === 'cat');
    if(results.length == 0) {
        catBody.style.width = '0px';
        catMessage.innerHTML = 'それは，猫ではない。(0%)';
    } else {
        setCatReaction(results[0]);
    }
}

function toString(result) {
    return `name: ${result.label}(${result.confidence}`;
}

function setCatReaction(result) {
    const parsent = result.confidence.toFixed(2);
    let catWidth = Math.trunc(catSize * parsent);
    if (catWidth - 20 < 0) {
        catBody.style.width = '0px';
    } else {
        catBody.style.width = (catWidth - 20) + 'px';
    }

    catMessage.innerHTML = getCatMessage(result.confidence, parsent);

}

function getCatMessage(confidence, parsent) {
    if(confidence > 0.8) return `猫だあああああああああ！(${parsent * 100}%)`;
    if(confidence > 0.6) return  `猫だ!(${parsent * 100}%)`;
    if(confidence > 0.4) return `ん？猫かも?(${parsent * 100}%)`;
    if(confidence > 0.2) return `猫ちゃうで...(${parsent * 100}%)`;
    return 'それは，猫ではない。(0%)';
}


const classifier = ml5.imageClassifier('DoodleNet', () => {
    catMessage.innerHTML = `モデルのロードが完了した故，${defaultMessage}`;
    init(classifier);
});    



