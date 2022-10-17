'use strict';
let img = new Image();

let canvasContext = document.createElement('canvas').getContext("2d")
let trimmedPhoto = document.getElementById("trimmedPhoto").getContext('2d')
document.getElementById("trimmedPhoto").style.display = "none";

let imgData = [];
let dataArray = [];
let trimmedImgData = [];
let trimmedDataArray = [];

let thresholdArray = [...Array(10).keys()]

export default function cropImage(imageSource, callback) {
    img.src = imageSource
    img.onload = function() {
        callback(app())
    }
}

function changeTransparency(dataArray, type) {
    for(let i = 0; i < dataArray.length; i+=4) {
        if (thresholdArray.includes(dataArray[i])
            && thresholdArray.includes(dataArray[i+1])
            && thresholdArray.includes(dataArray[i+2])
            && type === 'blackToTransparent'
            ) {
            dataArray[i+3] = 0;
        } else {
            dataArray[i+3] = 255;
        }

        if((dataArray[i+3] === 0) && type === 'transparentToBlack') {
            dataArray[i] = 0;
            dataArray[i+1] = 0;
            dataArray[i+2] = 0;
        }
    }
}

function trimCanvas(originalCanvas) {
    let _ctx = originalCanvas.getContext('2d')
    let pixels = _ctx.getImageData(0, 0, originalCanvas.width, originalCanvas.height)
    let dataLength = pixels.data.length
    let index
    let bound = {
            top: null,
            left: null,
            right: null,
            bottom: null
        }
    let x 
    let y
    
    for (index = 0; index < dataLength; index += 4) {

        if (pixels.data[index + 3] !== 0) {

            x = (index / 4) % originalCanvas.width;
            y = ~~((index / 4) / originalCanvas.width);

            if (bound.top === null) {
                bound.top = y;
            }

            if (bound.left === null) {
                bound.left = x;
            } else if (x < bound.left) {
                bound.left = x;
            }

            if (bound.right === null) {
                bound.right = x;
            } else if (bound.right < x) {
                bound.right = x;
            }

            if (bound.bottom === null) {
                bound.bottom = y;
            } else if (bound.bottom < y) {
                bound.bottom = y;
            }

        }

    }
    
    // Calculate the height and width of the content
    let trimHeight = bound.bottom - bound.top;
    let trimWidth = bound.right - bound.left;
    let diff
    let bigNumber
    let trimmed

    if (trimHeight !== trimWidth) {
        diff = trimWidth - trimHeight

        if (diff > 0) {
            bigNumber = trimWidth
            bound.top = bound.top - (diff / 2)
        } else {
            bigNumber = trimHeight
            bound.left = bound.left + (diff / 2)
        }
        trimWidth = bigNumber
        trimHeight = bigNumber
        setImageSize(trimmed, _ctx, bound, bigNumber, bigNumber)
    } else {
        setImageSize(trimmed, _ctx, bound, trimWidth, trimHeight)
    }

    // Return trimmed canvas data
    return trimmedPhoto.getImageData(0, 0, trimWidth, trimHeight);
}

function setImageSize(trimmed, _ctx, bound, trimHeight, trimWidth) {
    trimmed = _ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);
    trimmedPhoto.canvas.width = trimWidth;
    trimmedPhoto.canvas.height = trimHeight;
    trimmedPhoto.putImageData(trimmed, 0, 0);
}

function app() {
    canvasContext.canvas.width = img.width;
    canvasContext.canvas.height = img.height;
    canvasContext.drawImage(img, 0, 0);

    imgData = canvasContext.getImageData(0, 0, img.width, img.height);
    dataArray = imgData.data
    changeTransparency(dataArray, 'blackToTransparent');
    canvasContext.putImageData(imgData, 0, 0)

    trimmedImgData = trimCanvas(canvasContext.canvas);
    trimmedDataArray = trimmedImgData.data
    changeTransparency(trimmedDataArray, 'transparentToBlack');
    trimmedPhoto.putImageData(trimmedImgData, 0, 0)

    return trimmedPhoto.canvas.toDataURL()
};