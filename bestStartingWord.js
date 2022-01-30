/* -------------------------------------------------------------------------- */
/*                      Best Wordle starting word finder                      */
/* -------------------------------------------------------------------------- */

const fs = require("fs");

/* -------------------------------------------------------------------------- */
/*                             Constant Variables                             */
/* -------------------------------------------------------------------------- */
// Scoring Config
const vowelPoints = 10;
const consPoints = 0;
const doubleLetterPoints = -500;
const mostUsedLetterPoints = 26;
const mostUsedLetterMultiplier = 1;
const solveWordPoints = 0;

// Filenames
const mostCommonLetterFileName = "mostUsedLetters.txt";
const acceptedWordsFileName = "acceptedWords.txt";
const solveWordsFileName = "solveWords.txt";
const outputFileName = "output.txt";

// List of vowels
const vowels = ["a", "e", "i", "o", "u", "y"];

/* -------------------------------------------------------------------------- */
/*                                  Variables                                 */
/* -------------------------------------------------------------------------- */
var letters = [];

var words = [];
var wordObj = {
  word: "null",
  points: 0,
};

var uniquePoints = [];

/* -------------------------------------------------------------------------- */
/*                                  Functions                                 */
/* -------------------------------------------------------------------------- */
function checkUniqueLetters(word) {
  return !/(.).*\1/.test(word);
}

function addUniquePoints(points) {
  if (!uniquePoints.includes(points)) {
    uniquePoints.push(points);
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Main Code                                 */
/* -------------------------------------------------------------------------- */
// Read in the most used letters
console.log("Creating letter list");
var letters = fs.readFileSync(mostCommonLetterFileName, "utf-8").split("\n");

// Read in all of the possible solve words
var solveWords = fs.readFileSync(solveWordsFileName, "utf-8").split("\n");

// Read in all possible words and calculate points per word
console.log("Calculating word scores");
var allWords = fs.readFileSync(acceptedWordsFileName, "utf-8").split("\n");
allWords.forEach((word) => {
  var newWord = Object.create(wordObj);
  newWord.word = word;
  var points = 0;
  if (!checkUniqueLetters(word)) {
    points += doubleLetterPoints;
  }

  if (solveWords.includes(word)) {
    points += solveWordPoints;
  }

  for (var i = 0; i < word.length; i++) {
    var letter = word.charAt(i).toLowerCase();
    let index = letters.findIndex((element) => element == letter);
    points +=
      mostUsedLetterPoints * mostUsedLetterMultiplier -
      index * mostUsedLetterMultiplier;

    if (vowels.includes(letter)) {
      points += vowelPoints;
    } else {
      points += consPoints;
    }
  }

  newWord.points = points;
  addUniquePoints(points);
  words.push(newWord);
});

// Sort result by number of points DESC then by alphabetical ASC
console.log("Sorting results");
words.sort((a, b) =>
  a.points > b.points
    ? -1
    : a.points === b.points
    ? a.word > b.word
      ? 1
      : -1
    : 1
);

// Sort unique points DESC
uniquePoints.sort((a, b) => {
  return b - a;
});

// Try to delete previous output file
try {
  fs.unlinkSync(outputFileName);
} catch (err) {
  console.error(err);
}

// Write result to file
console.log("Writing to file");
words.forEach((result) => {
  let place = uniquePoints.findIndex((element) => element === result.points);
  let output = `#${place + 1}: ${result.word} ${result.points}\n`;
  fs.appendFileSync(outputFileName, output);
});
console.log(`Done! Results in ${outputFileName}`);
