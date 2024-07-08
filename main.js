// AndroidのブラウザでCANVASに絵を描く際にスクロールすることを防ぐ(触らない)
window.addEventListener('touchmove', event => {
    event.preventDefault();
}, { passive: false });

// 必要な変数を宣言する（触らない）
const defaultMessage = '猫を描いてくだされ';
let catMessage;
let catBody;
let catHead;
let catTail;
let catSize;
let canvas;
let ctx;
let size = 600;

function init() {
    catMessage = document.querySelector('#catMessage');
    catBody = document.querySelector('#catBody');
    catHead = document.querySelector('#catHead');
    catTail = document.querySelector('#catTail');
    canvas = document.querySelector('#canvas');
    const w = window.innerWidth;
    const h = window.innerHeight;

    if(w < h){
        size = (size < w) ? size : w;
    }else{
        size = (size < h) ? size : h;
    }

    canvas.width = size;
    canvas.height = size;

    catSize = size - catHead.clientWidth - catTail.clientWidth;

    ctx = canvas.getContext('2d');
    ctx.lineWidth = 20;
    ctx.lineCap = "round";

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const classifier = ml5.imageClassifier('DoodleNet', () => {
        catMessage.innerHTML = `モデルのロードが完了した故，${defaultMessage}`;
        ready(classifier);
    });    
}

init();


function ready(classifier) {
    canvas.addEventListener('pointerdown', event => {
        event.stopPropagation();
        ctx.beginPath();
        ctx.moveTo(event.offsetX, event.offsetY);
        canvas.addEventListener('pointermove', onPointerMove);
    });
    
    canvas.addEventListener('pointerup', onPointerUp);
    
    canvas.addEventListener('pointerout', onPointerUp);
    
    function onPointerMove(event) {
        event.stopPropagation();
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
    }
    
    function onPointerUp(event) {
        event.stopPropagation();
        canvas.removeEventListener('pointermove', onPointerMove);
        classifier.classify(canvas, gotResults);
    }
    
    const clearButton = document.querySelector('#clear');
    clearButton.addEventListener('click', () => {
        ctx.fillRect(0, 0, canvas.width, canvas.height); 
        catMessage.innerHTML = defaultMessage;
        catBody.style.width = '0px';
    } );
}

// 取得した結果をもとに判定結果を画面上に表示する関数（触らない）
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

// 取得した判定情報を文字列に変換する関数（触らない）
function toString(result) {
    return `name: ${result.label}(${result.confidence}`;
}

// 猫の反応(メッセージの表示・サイズの変更)を画面上に表示する関数
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

// 猫の反応メッセージを取得する関数(自分好みにいじろう)
function getCatMessage(confidence, parsent) {
    if(confidence > 0.8) return `猫だあああああああああ！(${parsent * 100}%)`;
    if(confidence > 0.6) return  `猫だ!(${parsent * 100}%)`;
    if(confidence > 0.4) return `ん？猫かも?(${parsent * 100}%)`;
    if(confidence > 0.2) return `猫ちゃうで...(${parsent * 100}%)`;
    return 'それは，猫ではない。(0%)';
}



