/*
*
*   Wordsearch Generator : written by Oisín Nolan on Monday 20th April 2020
*
*   This website has been made for a module I'm following in Université Lumière Lyon 2
*   called 'Traitement de données textuelles et visuelles' with Prof. Dominique Maniez.
* 
*   This code uses JSDoc function annotations ('https://jsdoc.app/')
*
*/

/*

    Helper functions

*/

/**
 * Shorthand for document.getElementById
 * 
 * @param {string} id the id of the element to be returned.
 */
let getElem = (id) => {
    return document.getElementById(id);
};

/**
 * Shorthand for removing a single element with a given value
 * 
 * @param {Array} array the array we want to remove element with value 'value' from
 * @param {any} value the value with which we want to filter array
 */
let removeFromArray = (array, value) => {
    let index = array.indexOf(value);
    array.splice(index, 1);
}

/**
 * A function to copy multidimensional arrays by value and not by reference
 * 
 * @param {Array} array the array we want to copy
 * @returns {Array} a copy of 'array'
 */
let cloneArray = (array) => {
    return JSON.parse(JSON.stringify(array));
}

/**
 * A function to calculate a random integer value between 0 and 'max'
 * 
 * @param {number} max the maximum value our random number could take
 * @returns {number} a random number between 0 and 'max'
 */
let random = (max) => {
    return Math.floor(Math.random() * max);
}

/**
 * @param {number} a 
 * @param {number} b 
 * @returns {boolean} whichever of a and b is greater
 */
let getMax = (a, b) => {
    if(a < b) {
        return b;
    } else {
        return a;
    }
}

/**
 * Checks if 'array' contains an object {i:p,j:q}.
 * 
 * @param {object[]} array 
 * @param {number} p 
 * @param {number} q 
 * @return {boolean} true iff {i:p,j:q} is in 'array', false otherwise
 */
let containsPair = (array, p, q) => {
    let res = false;
    array.forEach(elem => {
        if(elem.i === p && elem.j === q) {
            res = true;
        }
    });
    return res;
}

/**
 * Return the length of the longest word it 'array'
 * @param {Array} array 
 * @returns {number} the length of the longest word in 'array'
 */
let getMaxWordLength = (array) => {
    let max = 0;
    array.forEach(word => {
        max = getMax(word.length, max);
    });
    return max;
}

/*

    Global variables

*/

let title = "";
let words = [];
let size = 10;
let alphabets = {
    english : "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z".split(","),
    french : "a,à,b,c,ç,d,e,è,é,f,g,h,i,î,j,k,l,m,n,o,ô,p,q,r,s,t,u,v,w,x,y,z".split(",")
}

let alphabet = alphabets.english;

let directions = [
    [0, 1], // right
    [1, 0],  // down
    [1, 1], // negative diagonal
    [-1, -1], // reverse negative diagonal
    [-1, 1], // positive diagonal
    [1, -1], // reverse positive diagonal
]

let dirCount = directions.length;

let wordLetterLocations = [];

/*

    Functions called by user interaction
    [i.e that populate the global variables]

*/

/**
 * Sets the value of 'title' to 'value'
 * 
 * @param {string} value 
 */
function setTitle(value) {
    title = value;
}

/**
 * Adds the string value of #wordInput to global variable words.
 */
function addWord() {
    let word = getElem("wordInput").value;
    
    if(word) {
        words.push(word);
        var wordContainerElem = document.getElementById("addedWordsContainer");
        wordContainerElem.insertAdjacentHTML('beforeend', '<span class="addedWord">' + word + '<i class="fas fa-times icon clickable" onClick=\'removeWord(this)\'></i></span>');
        getElem("wordInput").value = "";
        calculateRecommendedSize();
    }
    
}   

/**
 * Removes a chosen word from words and the dom
 * 
 * @param {HTMLElement} iconElem the element to remove from dom.
 */
function removeWord(iconElem) {
    let span = iconElem.parentElement;
    removeFromArray(words, span.innerText);
    span.remove();
    calculateRecommendedSize();
}

/**
 * Calculates the recommended size for the wordsearch based on the max word length
 * and total number of words input.
 */
function calculateRecommendedSize() {
    let recommendedSizeElem = getElem("recommendedSize");
    let recommendation = getMax(getMaxWordLength(words), words.length) + 1;
    recommendedSizeElem.innerText = "(We recommend using a size greater than " + recommendation + " × " + recommendation + "!)";
}

/**
 * Display the value of the range slider in the dom
 * 
 * @param {number} sliderValue the value from the slider input.
 */
function updateSizeDisplay(sliderValue) {
    size = sliderValue;
    getElem("sizeDisplay").value = sliderValue + ' × ' + sliderValue;
}

/**
 * Makes an empty matrix of the right size, places the words randomly in the grid,
 * fills in the remaining empty spots.
 */
function generateWordsearch() {
    let m = makeEmptyMatrix(size);
    wordLetterLocations = [];
    let wordsearch = placeWords(m, 0);
    let container = getElem("wordsearchContainer");
    if(wordsearch === null) {
        container.innerHTML = "<div class=\"errorText\">We couldn't fit all of your words in a grid of size " + size + " × " + size + ", try a bigger grid!</div>";
    } else {
        fillGaps(wordsearch);
        let htmlString = "";
        for(let i=0; i<size; i++) {
            htmlString += "<div>";
            for(let j=0; j<size; j++) {
                console.log();
                htmlString += "<div class=\"word" + (containsPair(wordLetterLocations, i, j) ? " wordLetter " : "") + "\">" + wordsearch[i][j].toUpperCase() + "</div>";
            }
            htmlString += "</div>";
        }
        getElem("revealButtonContainer").innerHTML = "<button class=\"revealBtn btnHover\" id=\"reavealBtn\" onClick=\"revealWords()\">Reveal words</button>"
        + "<button class=\"printBtn btnHover\" onClick=\"print()\">Make PDF <i class=\"fas fa-print\"></i></button>"
        container.innerHTML = htmlString;
        getElem("wordsearchTitle").innerText = title;
    }
}

/**
 * Changes chosen alphabet to french from english
 * @param {HTMLElement} buttonElem 
 */
function chooseFrench(buttonElem) {
    alphabet = alphabets.french;
    let englishBtn = getElem("englishButton");
    englishBtn.classList.remove("selected");
    buttonElem.classList.add("selected");
}

/**
 * Changes chosen alphabet to english from french
 * @param {HTMLElement} buttonElem 
 */
function chooseEnglish(buttonElem) {
    alphabet = alphabets.english;
    let frenchBtn = getElem("frenchButton");
    frenchBtn.classList.remove("selected");
    buttonElem.classList.add("selected");
}

/*

    Functions used to generate wordsearch

*/

/**
 * This functions makes a matrix 'm' of size 'size' x 'size' populated
 * with empty strings at each m[i,j], 0 <= i,j < size 
 * @param {number} size 
 * @returns {char[]} m
 */
function makeEmptyMatrix(size) {
    let m = [];
    for(let i=0; i<size; i++) {
        let row = [];
        for(let j=0; j<size; j++) {
            row.push('');
        }
        m.push(row);
    }
    return m;
}

/**
 * Calculates whether or not a position is within the bounds of the matrix
 * @param {number} i the row number 
 * @param {number} j the column number
 * @returns {boolean} true if within bounds, false otherwise
 */
function withinBounds(i, j) {
    return i >=0 && j >=0 && i < size && j < size;
}

/**
 * This function attempts to place word[wordIndex] at matrix[i][j] in direction 
 * directions[dirIndex]. If succesful, the function returns 'true' and a new matrix
 * with the word succesfully placed, otherwise it returns 'false' and the original matrix
 * without the new word placed.
 * 
 * @param {string[][]} matrix the current wordsearch state
 * @param {number} wordIndex the index of the word that we want to place
 * @param {number} i the row we want to place it on
 * @param {number} j the column we want to place it on
 * @param {number} dirIndex the index of the direction we want to place it in
 * @returns {Array[boolean, string[][]]}
 */
function tryToPlace(matrix, wordIndex, i, j, dirIndex) {
    let word = words[wordIndex];
    let dir = directions[dirIndex];
    let matrixCopy = cloneArray(matrix);
    let couldBePlaced = true;
    let newWordLetterLocations = [];

    for(let k=0; k<word.length && couldBePlaced; k++) {
        if(matrix[i][j] !== '' && matrix[i][j] !== word[k]) {
            couldBePlaced = false;
        } else {
            matrix[i][j] = word[k];
            newWordLetterLocations.push({i:i,j:j});
        }
        i += dir[0];
        j += dir[1];
        if(!withinBounds(i, j)) {
            couldBePlaced = false;
        }
    }

    if(couldBePlaced) {
        newWordLetterLocations.forEach(wordLoc => {
            wordLetterLocations.push(wordLoc);
        })
    }

    return [couldBePlaced, couldBePlaced ? matrix : matrixCopy];
}

/**
 * This algorithm tryies to place each of the words in 'words' into
 * the grid 'matrix' in random positions and directions.
 * 
 * It uses the 'backtracking' technique to try all possible solutions.
 * 
 * @param {string[][]} matrix the current wordsearch state. This will be empty on the first call, full on the final.
 * @param {number} wordIndex the index of the word that the function is currently trying to place.
 * @returns {string[][]} a grid containing each of the words in 'words' placed and directed randomly, or
 *                      null if it was not possible to place the words.
 */
function placeWords(matrix, wordIndex) {

    // base case
    if(wordIndex === words.length) {
        return matrix;
    }

    let iRand = random(size);
    let jRand = random(size);

    for(let iIndex=iRand; iIndex<size+iRand; iIndex++) {
        for(let jIndex=jRand; jIndex<size+jRand; jIndex++) {
            let i = iIndex%size;
            let j = jIndex%size;
            if(withinBounds(i, j)) {
                let kRand = random(dirCount);
                for(let k=kRand; k<dirCount+kRand; k++) {
                    let matrixCopy = cloneArray(matrix);
                    let newMatrix = tryToPlace(matrixCopy, wordIndex, i, j, k%dirCount);
                    
                    if(newMatrix[0] === true) {
                        return placeWords(newMatrix[1], wordIndex+1);
                    }
                }
                
            }
        }
    }
    return null;
}

/**
 * This function fills any empty spots in 'matrix' with random characters
 * from the chosen alphabet
 * @param {string[][]} matrix 
 */
function fillGaps(matrix) {
    for(let i=0; i<size; i++) {
        for(let j=0; j<size; j++) {
            if(matrix[i][j] === '') {
                matrix[i][j] = alphabet[random(alphabet.length)];
            }
        }
    }
}

/**
 * highlights the search-words in the wordsearch
 */
function revealWords() {
    let wordLetters = document.getElementsByClassName("wordLetter");
    let revealBtnElem = getElem("reavealBtn");
    for(let wordLetter of wordLetters) {
        wordLetter.classList.add("revealed");
    }
    revealBtnElem.setAttribute("onclick", "hideWords()");
    revealBtnElem.innerText = "Hide Words";
}

/**
 * hides the search-words in the wordsearch
 */
function hideWords() {
    let wordLetters = document.getElementsByClassName("wordLetter");
    let revealBtnElem = getElem("reavealBtn");
    for(let wordLetter of wordLetters) {
        wordLetter.classList.remove("revealed");
    }
    revealBtnElem.setAttribute("onclick", "revealWords()");
    revealBtnElem.innerText = "Reveal Words";
}

/**
 * Creates and downloads a PDF file containing the children contained in
 * the wordsearchForPrint element. (Using html2pdf : 'https://github.com/eKoopmans/html2pdf.js')
 */
function print() {
    let wordsearchContainerElem = getElem("wordsearchForPrint");
    let options = {
        margin: 20,
        filename: 'wordsearch' + (title !== "" ? "_" + title : "") + '.pdf',
    }
    html2pdf(wordsearchContainerElem, options);
}