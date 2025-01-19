// document.addEventListener('DOMContentLoaded', () => {});

let currentLanguage = 'en';

let translations = {};

async function loadTranslations() {
  try {
    const enResponse = await fetch('/lang/en.json');
    translations.en = await enResponse.json();
    const viResponse = await fetch('/lang/vi.json');
    translations.vi = await viResponse.json();
  } catch (error) {
    console.error('Error loading translations:', error);
  }
}

// Translation Function
function translate(key) {
  if (!translations[currentLanguage]) {
    console.warn(`1 Language '${currentLanguage}' not found.`);
    return key;
  }
  const keys = key.split('.');
  let current = translations[currentLanguage][currentLanguage];
  for (const k of keys) {
    if (current && current[k]) {
      current = current[k];
    } else {
      console.warn(`2 Translation key '${key}' not found in language '${currentLanguage}'.`);
      return key;
    }
  }
  return current;
}

// Apply Translations to the Page
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if ((element.tagName === 'INPUT' && element.type === 'text') || element.tagName === 'BUTTON') {
      element.setAttribute('placeholder', translate(key));
    } else {
      element.innerHTML = translate(key);
    }
  });
}

// Init language

async function initializeApp() {
  await loadTranslations();
  let storedLanguage = getLanguage();
  if (!storedLanguage) {
    setLanguage('en');
    storedLanguage = 'en';
  }
  currentLanguage = storedLanguage;

  applyTranslations();
}

// Word var
let wordIndex = 0;
let vocabularyData = [];
let fetchData = [];

// Quiz var
let quizDay = [];
let quizIndex = 0;
let quizList = [];
let quizAnswerList = [];
let quizOptionList = [];
let quizAnswerSelected = [];
let quizPerDay = 10;
let repeatQuizDay = 5;
let isSubmit = false;
let quizNumber = 0;
let rightAnwserNum = 0;

// Setting var
let wordMode = '10k';
let wordOrder = 'default';

// Marked Word var
let markedWordsIndex = [];
let isEdit = false;
let currentEditWordIndex = null;

// Added Word var
let addedWords = [];
let googleApiKey = '';

// Setting Screen var
let isDark = false;

(async () => {
  await initializeApp();
  fetchData = await fetch('data.json').then((res) => res.json());
  loadSettings();
  loadWords();
  loadWordIndex();
  loadQuizData();
  loadMarkedWords();
  loadAddedWords();
})();

function loadWords() {
  if (fetchData.length === 0) return;

  vocabularyDataByWordMode(fetchData);
  if (wordOrder === 'shuffer') shufferVocabularyData();
}

function vocabularyDataByWordMode(fetchData) {
  const data = [...fetchData];
  if (wordMode === '5k') vocabularyData = data.slice(0, 5000);
  else if (wordMode === '10k') vocabularyData = data.slice(0, 10000);
  else vocabularyData = data;
}

function shufferVocabularyData() {
  vocabularyData.sort(() => Math.random() - 0.5);
}

function loadQuizData() {
  let storedQuizPerDay = getQuizPerDay();
  if (!storedQuizPerDay) {
    setQuizPerDay(10);
    storedQuizPerDay = 10;
  }
  quizPerDay = parseInt(storedQuizPerDay) || 0;

  let storedQuizDay = getQuizDay();
  if (!storedQuizDay) {
    setQuizDay([]);
    storedQuizDay = [];
  }
  quizDay = storedQuizDay;

  let storedRepeatQuizDay = getRepeatQuizDay();
  if (!storedRepeatQuizDay) {
    setRepeatQuizDay(5);
    storedRepeatQuizDay = 5;
  }
  repeatQuizDay = parseInt(storedRepeatQuizDay) || 0;
}

function loadMarkedWords() {
  let storedMarkedWordsIndex = getMarkedWordsIndex();
  if (!storedMarkedWordsIndex) {
    setMarkedWordsIndex([]);
    storedMarkedWordsIndex = [];
  }
  markedWordsIndex = storedMarkedWordsIndex;
}

function loadAddedWords() {
  let storedAddedWords = getAddedWords();
  if (!storedAddedWords) {
    setAddedWords([]);
    storedAddedWords = [];
  }
  addedWords = storedAddedWords;

  let storedGoogleApiKey = getGoogleApiKey();
  if (!storedGoogleApiKey) {
    setGoogleApiKey('');
    storedGoogleApiKey = [];
  }
  googleApiKey = storedGoogleApiKey;
}

function loadWordIndex() {
  let storedWordIndex = getWordIndex();
  if (!storedWordIndex) {
    setWordIndex(0);
    storedWordIndex = 0;
  }
  wordIndex = parseInt(storedWordIndex) || 0;
}

function loadSettings() {
  let storedIsDark = getIsDark();
  if (!storedIsDark) {
    setIsDark(false);
    storedIsDark = false;
  }
  isDark = storedIsDark === 'true';
  if (isDark) {
    document.body.classList.add('dark-mode');
    themeSwitch.checked = true;
  }

  let storedWordMode = getWordMode();
  if (!storedWordMode) {
    setWordMode('10k');
    storedWordMode = '10k';
  }
  wordMode = storedWordMode;
  wordModeRadio.forEach((radio) => {
    if (radio.value === wordMode) {
      radio.checked = true;
    }
  });

  let storedWordOrder = getWordOrder();
  if (!storedWordOrder) {
    setWordOrder('default');
    storedWordOrder = 'default';
  }

  wordOrder = storedWordOrder;
  wordOrderRadio.forEach((radio) => {
    if (radio.value === wordOrder) {
      radio.checked = true;
    }
  });
}

// Storage
function getWordIndex() {
  return localStorage.getItem('wordIndex');
}

function getMarkedWordsIndex() {
  return JSON.parse(localStorage.getItem('markedWords'));
}

function getAddedWords() {
  return JSON.parse(localStorage.getItem('addedWords'));
}

function getGoogleApiKey() {
  return localStorage.getItem('googleApiKey');
}

function getQuizDay() {
  return JSON.parse(localStorage.getItem('quizDay'));
}

function getQuizPerDay() {
  return localStorage.getItem('quizPerDay');
}

function getRepeatQuizDay() {
  return localStorage.getItem('repeatQuizDay');
}

function getIsDark() {
  return localStorage.getItem('isDark');
}

function getWordMode() {
  return localStorage.getItem('wordMode');
}

function getWordOrder() {
  return localStorage.getItem('wordOrder');
}

function getLanguage() {
  return localStorage.getItem('language');
}

function setWordIndex(wordIndex) {
  localStorage.setItem('wordIndex', wordIndex);
}

function setMarkedWordsIndex(markedWordsIndex) {
  localStorage.setItem('markedWords', JSON.stringify(markedWordsIndex));
}

function setAddedWords(value) {
  localStorage.setItem('addedWords', JSON.stringify(value));
}

function setGoogleApiKey(value) {
  localStorage.setItem('googleApiKey', value);
}

function setQuizDay(value) {
  localStorage.setItem('quizDay', JSON.stringify(value));
}

function setQuizPerDay(value) {
  localStorage.setItem('quizPerDay', value);
}

function setRepeatQuizDay(value) {
  localStorage.setItem('repeatQuizDay', value);
}

function setIsDark(value) {
  localStorage.setItem('isDark', value);
}

function setWordMode(value) {
  localStorage.setItem('wordMode', value);
}

function setWordOrder(value) {
  localStorage.setItem('wordOrder', value);
}

function setLanguage(language) {
  localStorage.setItem('language', language);
}

// Screen
const homeScreen = document.getElementById('home-screen');
const wordScreen = document.getElementById('word-screen');
const quizScreen = document.getElementById('quiz-screen');
const settingsScreen = document.getElementById('settings-screen');
const markedWordScreen = document.getElementById('marked-word-screen');
const addedWordScreen = document.getElementById('added-word-screen');

// Navigation
const screenList = [
  homeScreen,
  wordScreen,
  quizScreen,
  settingsScreen,
  markedWordScreen,
  addedWordScreen,
];
function showScreen(screen) {
  screenList.forEach((s) => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

function showHomeScreen() {
  showScreen(homeScreen);
}
showHomeScreen();

function showWordScreen() {
  loadWordIndex();
  renderWord();
  showScreen(wordScreen);
}

function showQuizScreen() {
  loadQuizData();
  isSubmit = false;
  renderQuiz();
  showScreen(quizScreen);
}

function showSettingsScreen() {
  loadSettings();
  showScreen(settingsScreen);
}

function showMarkedWordScreen() {
  loadMarkedWords();
  renderMarkedWords();
  showScreen(markedWordScreen);
}

function showAddedWordScreen() {
  loadAddedWords();
  renderAddedWords();
  showScreen(addedWordScreen);
}

// Home screen
const learnButton = homeScreen.querySelectorAll('button')[0];
const exerciseButton = homeScreen.querySelectorAll('button')[1];
const markedButton = homeScreen.querySelectorAll('button')[2];
const addedWordButton = homeScreen.querySelectorAll('button')[3];
const settingButton = homeScreen.querySelectorAll('button')[4];

learnButton.addEventListener('click', showWordScreen);
exerciseButton.addEventListener('click', showQuizScreen);
markedButton.addEventListener('click', showMarkedWordScreen);
addedWordButton.addEventListener('click', showAddedWordScreen);
settingButton.addEventListener('click', showSettingsScreen);

// Word Screen
const markButton = wordScreen.querySelector('#bookmark-btn');
const ttsButton = wordScreen.querySelector('#tts-btn');
const prevWordButton = wordScreen.querySelector('.btn.prev-word');
const nextWordButton = wordScreen.querySelector('.btn.next-word');

markButton.addEventListener('click', markWord);
ttsButton.addEventListener('click', textToSpeech);
prevWordButton.addEventListener('click', showPrevWord);
nextWordButton.addEventListener('click', showNextWord);

function markWord() {
  const checkMarked = markedWordsIndex.indexOf(wordIndex);

  if (checkMarked === -1) {
    markedWordsIndex.push(wordIndex);
    updateMarkButton(true);
  } else {
    markedWordsIndex.splice(checkMarked, 1);
    updateMarkButton(false);
  }

  setMarkedWordsIndex(markedWordsIndex);
}

function updateMarkButton(marked) {
  markButton.classList.remove('fa-regular', 'fa-solid');
  markButton.classList.add(marked ? 'fa-solid' : 'fa-regular');
}

function textToSpeech() {
  const word = vocabularyData[wordIndex].word;
  const utterance = new SpeechSynthesisUtterance(word);
  speechSynthesis.speak(utterance);
}

function showPrevWord() {
  wordIndex--;
  renderWord();
  setWordIndex(wordIndex);
}

function showNextWord() {
  wordIndex++;
  renderWord();
  setWordIndex(wordIndex);
}

function renderWord() {
  const wordEl = wordScreen.querySelector('.word');
  const ipaEl = wordScreen.querySelector('.ipa');
  const pathEl = wordScreen.querySelector('.path');
  const meaningsEl = wordScreen.querySelector('.meanings');

  const word = vocabularyData[wordIndex];

  wordEl.textContent = word.word;
  ipaEl.textContent = word.ipa;
  pathEl.textContent = `[${word.parts.join(', ')}]`;

  meaningsEl.innerHTML = '';
  const partOfSpeech = Object.keys(word.meaning);
  partOfSpeech.forEach((pos) => {
    const meaningEl = document.createElement('p');
    meaningEl.classList.add('meaning');

    const wordMeanings = word.meaning[pos].join('; ');
    meaningEl.innerHTML += `<b>${pos}:</b>${wordMeanings}`;

    meaningsEl.appendChild(meaningEl);
  });

  if (wordIndex === 0) {
    disableButton(prevWordButton, true);
  } else {
    disableButton(prevWordButton, false);
  }

  if (wordIndex === vocabularyData.length - 1) {
    disableButton(nextWordButton, true);
  } else {
    disableButton(nextWordButton, false);
  }

  updateMarkButton(markedWordsIndex.includes(wordIndex));
}

// Quiz screen
const quizNavigation = quizScreen.querySelector('#quiz-nav');
const quizContent = quizScreen.querySelector('#quiz-content');
const submitQuizButton = quizScreen.querySelector('.submit-btn');
const prevQuizButton = quizScreen.querySelector('.prev-btn');
const nextQuizButton = quizScreen.querySelector('.next-btn');
const quizResultDialog = document.getElementById('quiz-result-dialog');

prevQuizButton.addEventListener('click', showPrevQuiz);
nextQuizButton.addEventListener('click', showNextQuiz);
submitQuizButton.addEventListener('click', submitQuiz);

function submitQuiz() {
  rightAnwserNum = 0;
  quizContent.querySelectorAll('.answer_list .answer').forEach((el) => {
    el.classList.add('disabled');
    el.disabled = true;
  });

  for (let i = 0; i < quizList.length; i++) {
    const navButton = quizNavigation.querySelectorAll('button')[i];
    const answerListEl = quizContent.querySelector('.answer_list');
    const selectedAnswerEl = answerListEl.querySelector('.selected');
    const answerListDiv = answerListEl.querySelectorAll('.answer');

    const isRightAnswer = compareArrayAnswer(
      quizAnswerList[i],
      quizOptionList[i][quizAnswerSelected[i]],
    );

    if (isRightAnswer) {
      navButton.classList.add('correct');
      rightAnwserNum++;
      if (selectedAnswerEl) {
        selectedAnswerEl.classList.remove('selected');
        selectedAnswerEl.classList.add('correct');
      }
    } else {
      navButton.classList.add('incorrect');

      if (selectedAnswerEl) {
        selectedAnswerEl.classList.remove('selected');
        selectedAnswerEl.classList.add('incorrect');
      } else {
        for (let i = 0; i < answerListDiv.length; i++) {
          const answerDiv = answerListDiv[i];
          const currentSelectAnswer = quizAnswerSelected[quizIndex];
          answerDiv.disabled = true;
          if (compareArrayAnswer(quizOptionList[quizIndex][i], quizAnswerList[quizIndex])) {
            answerDiv.classList.add('correct');
          } else if (currentSelectAnswer !== -1 && currentSelectAnswer === i) {
            answerDiv.classList.add('incorrect');
          } else if (currentSelectAnswer !== -1 && currentSelectAnswer === i) {
            answerDiv.classList.add('selected');
          }
        }
      }
    }
  }
  isSubmit = true;
  displayResultDialog();
  processQuizDay();
}
function displayResultDialog() {
  const dialogContent = quizResultDialog.querySelector('.dialog-content');
  dialogContent.innerHTML = '';

  const isPass = rightAnwserNum / quizList.length >= 0.8;
  const isPassEl = isPass
    ? '<p id="dialog-text">You have completed today\'s quiz:</p>'
    : '<p id="dialog-text">You failed today\'s quiz, try again:</p>';

  dialogContent.innerHTML += isPassEl;

  //Create element to show correct and wrong answers
  const resultStats = document.createElement('div');
  resultStats.innerHTML += `
            <br />
            <div class="quiz-result">
            <b>Correct Answer: ${rightAnwserNum}</b>
            <b>Wrong Answer: ${quizList.length - rightAnwserNum}</b></div>`;

  //Append to dialog content
  dialogContent.appendChild(resultStats);

  quizResultDialog.classList.add('open');
  overlay.classList.add('open');
}
function processQuizDay() {
  const isPass = rightAnwserNum / quizList.length >= 0.8;
  const today = getCurrentDay();

  if (isPass && !quizDay.includes(today)) quizDay.push(today);
  setQuizDay(quizDay);
}

function closeQuizResultDialog() {
  quizResultDialog.classList.remove('open');
  overlay.classList.remove('open');
}

function showPrevQuiz() {
  if (quizIndex === 0) return;
  quizIndex--;
  renderQuizContent();
  updateQuizNav();
}

function showNextQuiz() {
  if (quizIndex === quizList.length - 1) return;
  quizIndex++;
  renderQuizContent();
  updateQuizNav();
}

function getQuizList() {
  let startIndex = 0;
  let currentQuizDay = 0;
  currentQuizDay = quizDay.includes(getCurrentDay()) ? quizDay.length : quizDay.length + 1;
  if (currentQuizDay >= repeatQuizDay) startIndex = quizPerDay * (currentQuizDay - repeatQuizDay);

  const maxQuiz = repeatQuizDay * quizPerDay;

  quizNumber = quizPerDay * currentQuizDay;
  if (quizNumber > maxQuiz) quizNumber = maxQuiz;

  const quizList = Array.from(
    { length: quizNumber },
    (_, index) => vocabularyData[index + startIndex],
  );

  quizAnswerList = quizList.map((quiz) => wordToAnswer(quiz));
  quizAnswerSelected = Array(quizList.length).fill(-1);
  quizOptionList = quizList.map((quiz) => createSufferAnswers(quiz));

  return quizList;
}

function renderQuiz() {
  quizContent.innerHTML = `<div class="question"></div><div class="answer_list"></div>`;

  quizList = getQuizList();

  quizNavigation.innerHTML = '';

  quizList.forEach((_, index) => {
    const quizNavButton = document.createElement('button');
    quizNavButton.classList.add('unselect');
    quizNavButton.textContent = index + 1;
    quizNavButton.dataset.quizIndex = index;

    quizNavButton.addEventListener('click', () => {
      quizIndex = index;
      updateQuizNav();
      renderQuizContent();
    });

    quizNavigation.appendChild(quizNavButton);
  });

  // init quiz
  updateQuizNav();
  renderQuizContent();
}

function updateQuizNav() {
  quizNavigation.querySelectorAll('button').forEach((el, i) => {
    el.classList.remove('active');
    if (i === quizIndex) {
      el.classList.add('active');
    }
  });
}

function renderQuizContent() {
  const questionText = translations[currentLanguage][currentLanguage].quizScreen.question;

  const answersListEl = quizContent.querySelector('.answer_list');
  const quiz = quizList[quizIndex];

  quizContent.querySelector('.question').textContent = `${questionText} "${quiz.word}"`;

  answersListEl.innerHTML = '';

  const optionData = quizOptionList[quizIndex];
  optionData.forEach((option, i) => {
    const optionEl = document.createElement('div');
    optionEl.classList.add('answer');
    optionEl.textContent = option.join('; ');
    optionEl.dataset.answerIndex = i;

    const selectedAnswer = quizAnswerSelected[quizIndex];
    if (isSubmit) {
      disableButton(optionEl, true);
      // if true
      if (compareArrayAnswer(quizOptionList[quizIndex][i], quizAnswerList[quizIndex])) {
        optionEl.classList.add('correct');
      } else if (selectedAnswer === i) {
        optionEl.classList.add('incorrect');
      }
    } else {
      // just select but not submit
      if (selectedAnswer !== -1 && selectedAnswer === i) {
        optionEl.classList.add('selected');
      }
    }

    optionEl.addEventListener('click', () => {
      selectOption(i);
    });
    answersListEl.appendChild(optionEl);
  });
  quizIndex === 0 ? disableButton(prevQuizButton, true) : disableButton(prevQuizButton, false);
  quizIndex === quizNumber - 1
    ? disableButton(nextQuizButton, true)
    : disableButton(nextQuizButton, false);
}

function createSufferAnswers(quiz) {
  const correctAnswer = wordToAnswer(quiz);
  let wrongAnswer = quizAnswerList.filter((m) => !compareArrayAnswer(m, correctAnswer));
  wrongAnswer = sufferAnswer(wrongAnswer).slice(0, 3);
  const options = [correctAnswer, ...wrongAnswer];
  return sufferAnswer(options);
}

function selectOption(i) {
  const quizMavButton = quizNavigation.querySelector(`button[data-quiz-index="${quizIndex}"]`);
  const answerListEl = quizContent.querySelector('.answer_list');
  const answersEl = answerListEl.querySelectorAll(`.answer`);

  quizMavButton.classList.add('selected');

  answersEl.forEach((answerEl) => {
    answerEl.classList.remove('selected');
  });
  answerListEl.querySelector(`.answer[data-answer-index="${i}"]`).classList.add('selected');

  quizAnswerSelected[quizIndex] = i;
}

// Marked screen
const markedWordsList = markedWordScreen.querySelector('.marked-words-list');

function renderMarkedWords() {
  markedWordsList.innerHTML = '';

  markedWordsIndex.forEach((index) => {
    const word = vocabularyData[index];
    if (word) {
      const markedWordDiv = document.createElement('div');
      markedWordDiv.classList.add('marked-word-item');
      markedWordDiv.innerHTML = `
                <div class="marked-word">
                    <p class="word">${word.word}</p>
                    <div class="meanings">
                    </div>
                </div>
                 <i class="fa-solid fa-bookmark bookmark-btn" data-index="${index}"></i>
            `;

      const meaningsEl = markedWordDiv.querySelector('.meanings');
      const iconEl = markedWordDiv.querySelector('i');
      const partOfSpeech = Object.keys(word.meaning);
      partOfSpeech.forEach((pos) => {
        const meaningEl = document.createElement('p');
        meaningEl.classList.add('meaning');

        const wordMeanings = word.meaning[pos].join('; ');
        meaningEl.innerHTML += `<b>${pos}:</b>${wordMeanings}`;

        meaningsEl.appendChild(meaningEl);
      });
      const markButton = markedWordDiv.querySelector('.bookmark-btn');
      markButton.addEventListener('click', (e) => {
        const wordIndex = parseInt(e.target.dataset.index);
        const marked = markedWordsIndex.indexOf(wordIndex);

        iconEl.classList.remove('fa-regular', 'fa-solid');
        iconEl.classList.add(marked === -1 ? 'fa-solid' : 'fa-regular');

        marked === -1 ? markedWordsIndex.push(wordIndex) : markedWordsIndex.splice(marked, 1);

        setMarkedWordsIndex(markedWordsIndex);
      });
      markedWordsList.appendChild(markedWordDiv);
    }
  });
}

// Add word screen
const addWordButton = addedWordScreen.querySelector('.add-word-btn');
const customWordModal = document.getElementById('custom-word-modal');
const addTypeBtn = customWordModal.querySelector('.add-type');
const clearFormBtn = customWordModal.querySelector('.clear-form');
const submitFormBtn = customWordModal.querySelector('.action-form');
const generatedBtn = customWordModal.querySelector('.generated-data');
const closeCustomWordModal = customWordModal.querySelector('.close-modal');

addWordButton.addEventListener('click', () => {
  addType();
  togglecustomWordModal();
});
addTypeBtn.addEventListener('click', addType);
clearFormBtn.addEventListener('click', clearForm);
submitFormBtn.addEventListener('click', addWord);
generatedBtn.addEventListener('click', throttle(generatedData, 4000));
closeCustomWordModal.addEventListener('click', () => togglecustomWordModal());

function addType() {
  const selectTypeText = translations[currentLanguage][currentLanguage].customWordModal.selectType;
  const meaningsText = translations[currentLanguage][currentLanguage].customWordModal.meanings;
  const newType = document.createElement('div');
  newType.classList.add('select-wrapper');

  newType.innerHTML = `
    <div class="select word-type">
        <div class="selected-option">${selectTypeText}</div>
        <div class="options-container">
            <div class="option" data-value="verb">Verb</div>
            <div class="option" data-value="noun">Noun</div>
            <div class="option" data-value="adverb">Adverb</div>
            <div class="option" data-value="adjective">Adjective</div>
            <div class="option" data-value="pronoun">Pronoun</div>
            <div class="option" data-value="auxiliary verb">Auxiliary verb</div>
            <div class="option" data-value="determiner">Determiner</div>
            <div class="option" data-value="conjunction">Conjunction</div>
            <div class="option" data-value="preposition">Preposition</div>
        </div>
    </div>
    <input type="text" placeholder="${meaningsText}" />
    <i class="fa-solid fa-trash delete-btn"></i>
  `;
  customWordModal
    .querySelector('.modal-content')
    .insertBefore(newType, customWordModal.querySelector('.add-type'));

  const wordTypeSelect = newType.querySelector('.select.word-type');
  const optionContainer = wordTypeSelect.querySelector('.options-container');
  const selectedOption = wordTypeSelect.querySelector('.selected-option');
  const deleteButton = newType.querySelector('.delete-btn');

  // Toggle options container visibility when clicking the select
  selectedOption.addEventListener('click', () => optionContainer.classList.toggle('open'));

  // Handle selecting an option
  wordTypeSelect.querySelectorAll('.option').forEach((option) => {
    option.addEventListener('click', () => {
      const value = option.getAttribute('data-value');
      selectedOption.textContent = option.textContent;
      optionContainer.classList.remove('open');
    });
  });

  deleteButton.addEventListener('click', () => {
    newType.remove();
  });
}

function clearForm() {
  const selectTypeText = translations[currentLanguage][currentLanguage].customWordModal.selectType;
  const modalContent = customWordModal.querySelector('.modal-content');
  modalContent.querySelectorAll('input[type="text"]').forEach((input) => (input.value = ''));
  modalContent.querySelectorAll('.select-wrapper').forEach((el, index) => {
    if (index !== 0) {
      el.remove();
    }
  });
  if (modalContent.querySelectorAll('.select-wrapper').length > 0) {
    modalContent.querySelector('.select .selected-option').textContent = selectTypeText;
  }
  isEdit = false;
  currentEditWordIndex = null;
}

function loadEditWord(word) {
  const modalContent = customWordModal.querySelector('.modal-content');
  modalContent.querySelector('#custom-word').value = word.word;
  modalContent.querySelector('#custom-ipa').value = word.ipa;
  modalContent.querySelector('#custom-parts').value = word.parts?.join('; ') || '';

  const meaningKeys = Object.keys(word.meaning);

  meaningKeys.forEach((key, index) => {
    addType();
    const newType = modalContent.querySelectorAll('.select-wrapper')[index];
    newType.querySelector('.selected-option').textContent = key;
    newType.querySelector('input[type="text"]').value = word.meaning[key].join('; ');
  });
}

function togglecustomWordModal() {
  customWordModal.classList.toggle('hidden');
  if (!isEdit) {
    clearForm();
  }
}

function addWord() {
  const modalContent = customWordModal.querySelector('.modal-content');
  const word = modalContent.querySelector('#custom-word').value;
  const ipa = modalContent.querySelector('#custom-ipa').value;
  const parts = modalContent.querySelector('#custom-parts').value;
  const meanings = {};

  modalContent.querySelectorAll('.select-wrapper').forEach((wrapper) => {
    const type = wrapper.querySelector('.select .selected-option').textContent;
    const meaning = wrapper.querySelector('input[type="text"]').value;
    if (type !== 'Select type' && meaning !== '') {
      meanings[type.toLowerCase()] = meaning.split(';').map((m) => m.trim());
    }
  });
  const newWord = { word, ipa, meaning: meanings, parts: parts.split(';').map((p) => p.trim()) };

  if (isEdit) {
    vocabularyData = vocabularyData.map((item) => {
      if (item.word === addedWords[currentEditWordIndex].word) return newWord;
      return item;
    });
    addedWords[currentEditWordIndex] = newWord;
  } else {
    vocabularyData.push(newWord);
    addedWords.push(newWord);
  }
  setAddedWords(addedWords);

  togglecustomWordModal();
  clearForm();
  renderAddedWords();
}

const addedWordsList = addedWordScreen.querySelector('.added-words-list');
function renderAddedWords() {
  addedWordsList.innerHTML = '';

  addedWords.forEach((word, index) => {
    if (word) {
      const addedWordDiv = document.createElement('div');
      addedWordDiv.classList.add('added-word-item');
      addedWordDiv.innerHTML = `
                <div class="added-word">
                    <p class="word">${word.word}</p>
                    <p class="pronounce"> 
                     <span class="ipa">${word.ipa}</span>
                    <span class="parts">${
                      word.parts?.length > 0 ? '[' + word.parts.join(', ') + ']' : ''
                    }</span>
                    </p>
                    <div class="meanings">
                    </div>
                </div>
                <div>
                 <i class="fa-solid fa-edit edit-btn" data-index="${index}"></i>
                 <i class="fa-solid fa-trash delete-btn" data-index="${index}"></i>
                 </div>
            `;

      const meaningsEl = addedWordDiv.querySelector('.meanings');
      if (word.meaning) {
        const partOfSpeech = Object.keys(word.meaning);
        partOfSpeech.forEach((pos) => {
          const meaningEl = document.createElement('p');
          meaningEl.classList.add('meaning');

          const wordMeanings = word.meaning[pos].join('; ');
          meaningEl.innerHTML += `<b>${pos}:</b>${wordMeanings}`;

          meaningsEl.appendChild(meaningEl);
        });
      }

      const deleteButton = addedWordDiv.querySelector('.delete-btn');
      const editButton = addedWordDiv.querySelector('.edit-btn');
      deleteButton.addEventListener('click', (e) => {
        const wordIndex = parseInt(e.target.dataset.index);
        addedWords.splice(wordIndex, 1);
        setAddedWords(addedWords);
        renderAddedWords();
      });
      editButton.addEventListener('click', (e) => {
        const wordIndex = parseInt(e.target.dataset.index);
        const word = addedWords[wordIndex];
        isEdit = true;
        currentEditWordIndex = wordIndex;
        loadEditWord(word);
        togglecustomWordModal();
      });

      addedWordsList.appendChild(addedWordDiv);
    }
  });
}

function generatedData() {
  if (googleApiKey.length === 0) {
    apiKeyDialog.classList.add('open');
    overlay.classList.add('open');
    return;
  }

  const currentWord = this.parentNode.parentNode.querySelector('#custom-word').value;
  if (currentWord.length === 0) {
    return;
  }
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`;
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: getPromt(currentWord) }],
        },
      ],
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // Assuming the API returns the story in a predictable format, adjust accordingly
      if (
        data.candidates &&
        data.candidates.length > 0 &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0
      ) {
        const response = data.candidates[0].content.parts[0].text;
        processResponse(response);
      } else {
        console.log('Error or unexpected response.');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function processResponse(res) {
  try {
    const response = JSON.parse(res);
    if (response.error) {
      console.log(response.error);
    } else {
      const modalContent = customWordModal.querySelector('.modal-content');
      modalContent.querySelectorAll('.select-wrapper').forEach((el) => {
        el.remove();
      });
      loadEditWord(response);
    }
  } catch (e) {
    console.log(e, 'invalid json');
  }
}

// Dropdown add/edit word
const wordTypeSelect = document.querySelectorAll('.select.word-type');
wordTypeSelect.forEach((select) => {
  const optionContainer = select.querySelector('.options-container');
  const selectedOption = select.querySelector('.selected-option');

  // Toggle options container visibility when clicking the select
  selectedOption.addEventListener('click', () => {
    optionContainer.classList.toggle('open');
  });

  // Handle selecting an option
  select.querySelectorAll('.option').forEach((option) => {
    option.addEventListener('click', () => {
      const value = option.getAttribute('data-value');
      selectedOption.textContent = option.textContent;
      optionContainer.classList.remove('open');
    });
  });

  // Optional: Close the dropdown if the user clicks outside
  document.addEventListener('click', (event) => {
    if (!select.contains(event.target)) {
      optionContainer.classList.remove('open');
    }
  });
});

// Setting screen
const themeSwitch = settingsScreen.querySelector('input[type="checkbox"]');
const wordModeRadio = settingsScreen.querySelectorAll('input[name="word-mode"]');
const wordOrderRadio = settingsScreen.querySelectorAll('input[name="word-order"]');
const quizPerDayInput = document.getElementById('quizPerDay');
const repeatQuizDayInput = document.getElementById('repeatQuizDay');

themeSwitch.addEventListener('change', toggleDarkMode);
wordModeRadio.forEach((radio) => radio.addEventListener('change', updateWordMode));
wordOrderRadio.forEach((radio) => radio.addEventListener('change', updateWordOrder));

quizPerDayInput.addEventListener(`focus`, () => quizPerDayInput.select());
quizPerDayInput.onchange = function () {
  const value = parseInt(quizPerDayInput.value) || 10;
  if (value > 0) {
    quizPerDay = value;
    setQuizPerDay(value);
  }
};
repeatQuizDayInput.addEventListener(`focus`, () => repeatQuizDayInput.select());
repeatQuizDayInput.onchange = function () {
  const value = parseInt(repeatQuizDayInput.value) || 5;
  if (value > 0) {
    repeatQuizDay = value;
    setRepeatQuizDay(value);
  }
};

function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  isDark = !isDark;
  setIsDark(isDark.toString());
}

function updateWordMode(el) {
  wordMode = el.target.value;
  setWordMode(wordMode);
  loadWords();
}

function updateWordOrder(el) {
  wordOrder = el.target.value;
  setWordOrder(wordOrder);
  loadWords();
}

// Settings dropdown
const languageDropdown = settingsScreen.querySelector('#language-dropdown');
const downloadDropdown = settingsScreen.querySelector('#download-dropdown');

languageDropdown.querySelectorAll('.dropdown-item').forEach((item) => {
  item.addEventListener('click', () => {
    currentLanguage = item.dataset.lang;
    setLanguage(currentLanguage);
    languageDropdown.parentNode.querySelector('span').textContent = item.textContent;
    applyTranslations();
  });
});

function showLanguageDropdown() {
  languageDropdown.classList.toggle('show');
}
function showDownloadDropdown() {
  downloadDropdown.classList.toggle('show');
}
// Utils
function downloadJSON(wordNum) {
  if (vocabularyData.length === 0 || wordNum >= vocabularyData.length) {
    return;
  }
  const wordData = vocabularyData.slice(0, wordNum);
  const blob = new Blob([JSON.stringify(wordData, null, 0)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${wordNum}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sufferAnswer(array) {
  return array.sort(() => Math.random() - 0.5);
}

function disableButton(el, isDisable) {
  if (isDisable) {
    el.classList.add('disabled');
    el.disabled = true;
  } else {
    el.classList.remove('disabled');
    el.disabled = false;
  }
}

function compareArrayAnswer(arr1, arr2) {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
}

function wordToAnswer(word) {
  return Object.values(word.meaning).flatMap((m) => m);
}

function getPromt(word) {
  return `Okay, I understand. Here's the prompt again, emphasizing the raw JSON output format:

You are a highly precise linguistic analysis tool that provides phonetic transcriptions, syllabic breakdowns, and meanings of words, formatted as a single JSON object.

Instructions:

Input: ${word}.

Word Validation:

If the input is a valid English word, proceed to analysis (steps 3-5).

If the input is not a recognized English word, respond immediately with the following JSON object: {"error": "word invalid"}. Do not proceed with any further analysis.

Phonetic Analysis: For valid words, determine the following:

IPA Transcription: The International Phonetic Alphabet (IPA) representation of the word. Use standard IPA symbols.

Syllabic Parts: Divide the word into approximate phonetic parts (syllable-like segments) as they would typically appear when spoken (e.g., "pre", "set", not as individual IPA characters). Present these parts as a string array. Focus on representing visual syllabic segments, not strict phonetic divisions. The representation of syllabic parts should reflect how the word would be visually broken into syllables, not strict phonetic divisions.

Meaning: The values for each part of speech are lists of the most common and relevant Vietnamese meanings of the word when used as that part of speech. Focus on providing the most common and direct translations, similar to how Google Translate presents its top results. Avoid less common or overly nuanced meanings unless they are very frequently encountered.

Output Format: Respond with a single JSON object formatted as follows. No code block. Raw JSON text. Do not use backticks or any other markdown formatting that would create a code block.

{
"word": "input_word",
"ipa": "/ipa_transcription/",
"parts": ["part1", "part2", "part3"],
"meaning": {
"noun": ["vietnamese1", "vietnamese2"],
"verb": ["vietnamese1"],
"adjective": ["vietnamese1"]
}
}

Important: There should always be a single top level JSON object output, not an array of JSON object.

Example:
Input: "programming"

Output:

{
"word": "programming",
"ipa": "/ˈproʊɡræmɪŋ/",
"parts": ["pro", "gram", "ming"],
"meaning": {
"noun": ["lập trình", "công việc lập trình"],
"verb": ["lập trình"]
}
}
`;
}

function getCurrentDay() {
  return new Date().toLocaleDateString('en-GB');
}
function throttle(func, delay) {
  let lastCallTime = 0;

  return function (...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    if (timeSinceLastCall >= delay) {
      lastCallTime = now;
      func.apply(this, args);
    }
  };
}

// Binding keyboard event
document.addEventListener('keydown', (event) => {
  let nextconst = null;
  let prevconst = null;
  if (!wordScreen.classList.contains('hidden')) {
    nextconst = showNextWord;
    prevconst = showPrevWord;
  }
  if (!quizScreen.classList.contains('hidden')) {
    nextconst = showNextQuiz;
    prevconst = showPrevQuiz;
  }
  if (nextconst === null || prevconst === null) return;

  if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'p') {
    prevconst();
  } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'n') {
    nextconst();
  }
});

// Fab Dialog
const apiKeyFab = document.getElementById('fab-api-key');
const info1Fab = document.getElementById('fab-info1');

const apiKeyDialog = document.getElementById('api-key-dialog');
const info1Dialog = document.getElementById('info1-dialog');
const overlay = document.getElementById('overlay');
const addApiKeyBtn = apiKeyDialog.querySelector('#google-api-key-btn');

addApiKeyBtn.addEventListener('click', function () {
  const inputGoogleApiKeyEl = this.parentNode.querySelector('input');
  if (inputGoogleApiKeyEl) {
    setGoogleApiKey(inputGoogleApiKeyEl.value);
    googleApiKey = inputGoogleApiKeyEl.value;
    closeApiKeyDialog();
  }
});

apiKeyFab.addEventListener('click', () => {
  apiKeyDialog.classList.add('open');
  overlay.classList.add('open');
});

info1Fab.addEventListener('click', () => {
  info1Dialog.classList.add('open');
  overlay.classList.add('open');
});

function closeApiKeyDialog() {
  apiKeyDialog.classList.remove('open');
  overlay.classList.remove('open');
}
function closeInfo1Dialog() {
  info1Dialog.classList.remove('open');
  overlay.classList.remove('open');
}
