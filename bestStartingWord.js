/* -------------------------------------------------------------------------- */
/*                      Best Wordle starting word finder                      */
/* -------------------------------------------------------------------------- */

const fs = require("fs");

/* -------------------------------------------------------------------------- */
/*                             Constant Variables                             */
/* -------------------------------------------------------------------------- */
// Scoring Config
const vowelPoints = 15;
const consPoints = 0;
const doubleLetterPoints = -500;
const totalMostUsedLetterPoints = 250;
const solveWordPoints = 0;

// Filenames
const acceptedWordsFileName = "acceptedWords.txt";
const solveWordsFileName = "solveWords.txt";
const outputFileName = "output.txt";

// List of vowels
const vowels = ["a", "e", "i", "o", "u", "y"];
const alphabet = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

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

var totalLettersInSolutions = 0;

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

function setupLettersArray() {
  alphabet.forEach((letter) => {
    letters.push({ letter: letter, count: 0, percent: 0 });
  });
}

function getLetterUsage(input) {
  input.forEach((word) => {
    for (var i = 0; i < word.length; i++) {
      let letter = word.charAt(i).toLowerCase();
      let index = letters.findIndex((element) => element.letter == letter);

      letters[index].count++;
      totalLettersInSolutions++;
    }
  });
  letters.sort((a, b) => b.count - a.count);
  letters.forEach((l, index) => {
    letters[index].percent = l.count / totalLettersInSolutions;
  });
}

/* -------------------------------------------------------------------------- */
/*                                  Main Code                                 */
/* -------------------------------------------------------------------------- */

// Read in all of the possible solve words
var solveWords = fs.readFileSync(solveWordsFileName, "utf-8").split("\n");

console.log("Creating letter list");
setupLettersArray();
getLetterUsage(solveWords);

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
    let index = letters.findIndex((element) => element.letter == letter);
    points += Math.round(letters[index].percent * totalMostUsedLetterPoints);

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
