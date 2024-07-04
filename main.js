window.addEventListener('touchmove', function(event) {
    event.preventDefault();
});

const catBody = document.querySelector('#catBody');
const catMessage = document.querySelector('#catMessage');
const catHead = document.querySelector('#catHead');
const catTail = document.querySelector('#catTail');

const defaultMessage = '猫を描いてくだされ';

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
        ctx.beginPath();
        ctx.moveTo(event.offsetX, event.offsetY);
        canvas.addEventListener('pointermove', onMouseMove);
    });
    
    canvas.addEventListener('pointerup', () => {
        canvas.removeEventListener('pointermove', onMouseMove);

        classifier.classify(ctx, gotResults);
    });
    
    canvas.addEventListener('pointerout', () => {
        canvas.removeEventListener('pointermove', onMouseMove);

        classifier.classify(canvas, gotResults);
    });
    
    function onMouseMove(event) {
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

    console.log(`name: ${results[0].label}(${results[0].confidence}`);
    console.log(`name: ${results[1].label}(${results[1].confidence}`);

    if(results[0].label == 'cat'){
        setCatReaction(results[0]);
    } else if(results[1].label == 'cat') {
        setCatReaction(results[1]);
    } else {
        catBody.style.width = '0px';
        catMessage.innerHTML = 'それは，猫ではない。(0%)';
    }
}

function setCatReaction(result) {
    const parsent = result.confidence.toFixed(2);
    let catWidth = Math.trunc(catSize * parsent);
    if (catWidth - 20 < 0) {
        catBody.style.width = '0px';
    } else {
        catBody.style.width = (catWidth - 20) + 'px';
    }

    if (result.confidence > 0.8) {
        catMessage.innerHTML = `猫だあああああああああ！(${parsent * 100}%)`;
    } else if(result.confidence > 0.6) {
        catMessage.innerHTML = `猫だ!(${parsent * 100}%)`;
    } else if(result.confidence > 0.4) {
        catMessage.innerHTML = `ん？猫かも?(${parsent * 100}%)`;
    } else if(result.confidence > 0.2)  {
        catMessage.innerHTML = `猫ちゃうで...(${parsent * 100}%)`;
    } else {
        catBody.style.width = '0px';
        catMessage.innerHTML = 'それは，猫ではない。(0%)';
    }
}

const classifier = ml5.imageClassifier('DoodleNet', () => {
    catMessage.innerHTML = `モデルのロードが完了した故，${defaultMessage}`;

    init(classifier);
});



