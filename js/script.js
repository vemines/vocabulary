let wordMode = '10k';
let wordOrder = 'default';
let vocabularyData = [];
let fetchData = [];

(async () => {
  fetchData = await fetch('data.json').then((res) => res.json());
  loadSettings();
  vocabularyDataByWordMode(fetchData);
  if (wordOrder === 'shuffer') shufferVocabularyData();
})();

const shufferVocabularyData = () => {
  vocabularyData.sort(() => Math.random() - 0.5);
};

const vocabularyDataByWordMode = (fetchData) => {
  if (wordMode === '5k') vocabularyData = fetchData.slice(0, 5000);
  else if (wordMode === '10k') vocabularyData = fetchData.slice(0, 10000);
  else vocabularyData = fetchData;
};

// Storage
const getWordIndex = () => localStorage.getItem('wordIndex');
const getMarkedWords = () => JSON.parse(localStorage.getItem('markedWords'));
const getQuizDay = () => localStorage.getItem('quizDay');
const getWordPerDay = () => localStorage.getItem('wordPerDay');
const getRelearnDay = () => localStorage.getItem('relearnDay');
const getIsDark = () => localStorage.getItem('isDark');
const getWordMode = () => localStorage.getItem('wordMode');
const getWordOrder = () => localStorage.getItem('wordOrder');
const getLanguage = () => localStorage.getItem('language');

const setWordIndex = (wordIndex) => localStorage.setItem('wordIndex', wordIndex);
const setMarkedWords = (markedWordsIndex) =>
  localStorage.setItem('markedWords', JSON.stringify(markedWordsIndex));
const setQuizDay = (day) => localStorage.setItem('quizDay', day);
const setWordPerDay = (value) => localStorage.setItem('wordPerDay', value);
const setRelearnDay = (value) => localStorage.setItem('relearnDay', value);
const setIsDark = (value) => localStorage.setItem('isDark', value);
const setWordMode = (e) => localStorage.setItem('wordMode', e.target.value);
const setWordOrder = (e) => localStorage.setItem('wordOrder', e.target.value);
const setLanguage = (language) => localStorage.setItem('language', language);

// Screen
const homeScreen = document.getElementById('home-screen');
const wordScreen = document.getElementById('word-screen');
const quizScreen = document.getElementById('quiz-screen');
const settingsScreen = document.getElementById('settings-screen');
const markedScreen = document.getElementById('marked-screen');

// Navigation const
const screens = [homeScreen, wordScreen, quizScreen, settingsScreen, markedScreen];
const showScreen = (screen) => {
  screens.forEach((s) => s.classList.add('hidden'));
  screen.classList.remove('hidden');
};
const showHomeScreen = () => showScreen(homeScreen);
showHomeScreen();

let wordIndex = 0;
const showWordScreen = () => {
  loadWordIndex();
  renderWord();
  showScreen(wordScreen);
};

const showQuizScreen = () => {
  isSubmit = false;
  loadQuizData();
  renderQuiz();
  showScreen(quizScreen);
};
const showSettingsScreen = () => showScreen(settingsScreen);

const showMarkedScreen = () => {
  renderMarkedWords();
  showScreen(markedScreen);
};

// Home screen
const learnButton = homeScreen.querySelectorAll('button')[0];
const exerciseButton = homeScreen.querySelectorAll('button')[1];
const markedButton = homeScreen.querySelectorAll('button')[2];
const settingButton = homeScreen.querySelectorAll('button')[4];

learnButton.addEventListener('click', () => showWordScreen());
exerciseButton.addEventListener('click', () => showQuizScreen());
markedButton.addEventListener('click', () => showMarkedScreen());
settingButton.addEventListener('click', () => showSettingsScreen());

// Word screen
let markedWordsIndex = [];

const loadWordIndex = () => {
  const storedWordIndex = getWordIndex();
  if (storedWordIndex) {
    wordIndex = parseInt(storedWordIndex) || 0;
  }
};
const markButton = wordScreen.querySelector('#bookmark-btn');
const ttsButton = wordScreen.querySelector('#tts-btn');
const prevWordButton = wordScreen.querySelector('.btn.prev-word');
const nextWordButton = wordScreen.querySelector('.btn.next-word');

const markWord = () => {
  const checkMarked = markedWordsIndex.indexOf(wordIndex);

  if (checkMarked === -1) {
    markedWordsIndex.push(wordIndex);
    updateMarkButton(true);
  } else {
    markedWordsIndex.splice(checkMarked, 1);
    updateMarkButton(false);
  }

  setMarkedWords(markedWordsIndex);
};
const textToSpeech = () => {
  const word = vocabularyData[wordIndex].word;
  const utterance = new SpeechSynthesisUtterance(word);
  speechSynthesis.speak(utterance);
};
const showPrevWord = () => {
  wordIndex--;
  renderWord();
  setWordIndex();
};
const showNextWord = () => {
  wordIndex++;
  renderWord();
  setWordIndex();
};
const updateMarkButton = (marked) => {
  markButton.classList.remove('fa-regular', 'fa-solid');
  markButton.classList.add(marked ? 'fa-solid' : 'fa-regular');
};

nextWordButton.addEventListener('click', showNextWord);
prevWordButton.addEventListener('click', showPrevWord);
markButton.addEventListener('click', () => markWord());
ttsButton.addEventListener('click', () => textToSpeech());

const renderWord = () => {
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
    disable(prevWordButton, true);
  } else {
    disable(prevWordButton, false);
  }

  if (wordIndex === vocabularyData.length - 1) {
    disable(nextWordButton, true);
  } else {
    disable(nextWordButton, false);
  }

  updateMarkButton(markedWordsIndex.includes(wordIndex));
};

// Quiz screen
let quizDay = 1;
let quizIndex = 0;
let quizList = [];
let quizAnswerList = [];
let quizOptionList = [];
let quizAnswerSelected = [];
let wordPerDay = 10;
let relearnDay = 5;
let isSubmit = false;
let quizNumber = 0;

const quizNavigation = quizScreen.querySelector('#quiz-nav');
const quizContent = quizScreen.querySelector('#quiz-content');
const submitQuizButton = quizScreen.querySelector('.submit-btn');
const prevQuizButton = quizScreen.querySelector('.prev-btn');
const nextQuizButton = quizScreen.querySelector('.next-btn');

const loadQuizData = () => {
  const storedWordPerDay = getWordPerDay();
  const storedQuizDay = getQuizDay();
  const storedRelearnDay = getRelearnDay();

  if (storedWordPerDay) wordPerDay = parseInt(storedWordPerDay);
  if (storedQuizDay) quizDay = parseInt(storedQuizDay);
  if (storedRelearnDay) relearnDay = parseInt(storedRelearnDay);
};

const getQuizList = () => {
  // quizDay = 8;
  let startIndex = 0;
  if (quizDay >= relearnDay) startIndex = wordPerDay * (quizDay - relearnDay);

  const maxQuiz = relearnDay * wordPerDay;

  quizNumber = wordPerDay * quizDay;
  if (quizNumber > maxQuiz) quizNumber = maxQuiz;

  const quizList = Array.from(
    { length: quizNumber },
    (_, index) => vocabularyData[index + startIndex],
  );

  quizAnswerList = quizList.map((quiz) => wordToAnswer(quiz));
  quizAnswerSelected = Array(quizList.length).fill(-1);
  quizOptionList = quizList.map((quiz) => createSufferAnswers(quiz));

  return quizList;
};

const renderQuiz = () => {
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
};
const updateQuizNav = () => {
  quizNavigation.querySelectorAll('button').forEach((el, i) => {
    el.classList.remove('active');
    if (i === quizIndex) {
      el.classList.add('active');
    }
  });
};
const renderQuizContent = () => {
  const answersListEl = quizContent.querySelector('.answer_list');
  const quiz = quizList[quizIndex];

  quizContent.querySelector(
    '.question',
  ).textContent = `Question: What is the meaning of "${quiz.word}"`;

  answersListEl.innerHTML = '';

  const optionData = quizOptionList[quizIndex];
  optionData.forEach((option, i) => {
    const optionEl = document.createElement('div');
    optionEl.classList.add('answer');
    optionEl.textContent = option.join('; ');
    optionEl.dataset.answerIndex = i;

    const selectedAnswer = quizAnswerSelected[quizIndex];
    if (isSubmit) {
      disable(optionEl, true);
      if (compareArrayAnswer(quizOptionList[quizIndex][i], quizAnswerList[quizIndex])) {
        optionEl.classList.add('correct');
      }

      if (selectedAnswer !== -1 && selectedAnswer === i) {
        optionEl.classList.add('incorrect');
      }
    }

    if (selectedAnswer !== -1 && selectedAnswer === i) {
      optionEl.classList.add('selected');
    }

    optionEl.addEventListener('click', () => {
      selectOption(i);
    });
    answersListEl.appendChild(optionEl);
  });
  quizIndex === 0 ? disable(prevQuizButton, true) : disable(prevQuizButton, false);
  quizIndex === quizNumber - 1 ? disable(nextQuizButton, true) : disable(nextQuizButton, false);
};

const createSufferAnswers = (quiz) => {
  const correctAnswer = wordToAnswer(quiz);
  let wrongAnswer = quizAnswerList.filter((m) => !compareArrayAnswer(m, correctAnswer));
  wrongAnswer = sufferAnswer(wrongAnswer).slice(0, 3);
  const options = [correctAnswer, ...wrongAnswer];
  return sufferAnswer(options);
};

const selectOption = (i) => {
  const quizMavButton = quizNavigation.querySelector(`button[data-quiz-index="${quizIndex}"]`);
  const answerListEl = quizContent.querySelector('.answer_list');
  const answersEl = answerListEl.querySelectorAll(`.answer`);

  quizMavButton.classList.add('selected');

  answersEl.forEach((answerEl) => {
    answerEl.classList.remove('selected');
  });
  answerListEl.querySelector(`.answer[data-answer-index="${i}"]`).classList.add('selected');

  quizAnswerSelected[quizIndex] = i;
};

const submitQuiz = () => {
  quizContent.querySelectorAll('.answer_list .answer').forEach((el) => {
    el.classList.add('disabled');
    el.disabled = true;
  });

  for (let i = 0; i < quizList.length; i++) {
    const navButton = quizNavigation.querySelectorAll('button')[i];
    const answerListEl = quizContent.querySelector('.answer_list');
    const selectedAnswerEl = answerListEl.querySelector('.selected');
    const answerListDiv = answerListEl.querySelectorAll('.answer');

    if (compareArrayAnswer(quizAnswerList[i], quizOptionList[i][quizAnswerSelected[i]])) {
      navButton.classList.add('correct');
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
};

const showPrevQuiz = () => {
  if (quizIndex === 0) return;
  quizIndex--;
  renderQuizContent();
  updateQuizNav();
};
const showNextQuiz = () => {
  if (quizIndex === quizList.length - 1) return;
  quizIndex++;
  renderQuizContent();
  updateQuizNav();
};

prevQuizButton.addEventListener('click', showPrevQuiz);
nextQuizButton.addEventListener('click', showNextQuiz);
submitQuizButton.addEventListener('click', submitQuiz);

// Marked screen
const markedWordsList = markedScreen.querySelector('.marked-words-list');

const renderMarkedWords = () => {
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

        setMarkedWords(markedWordsIndex);
      });
      markedWordsList.appendChild(markedWordDiv);
    }
  });
};

// Setting screen
let isDark = false;

const themeSwitch = settingsScreen.querySelector('input[type="checkbox"]');
const wordModeRadio = settingsScreen.querySelectorAll('input[name="word-mode"]');
const wordOrderRadio = settingsScreen.querySelectorAll('input[name="word-order"]');

const toggleDarkMode = () => {
  const body = document.body;
  body.classList.toggle('dark-mode');
  isDark = !isDark;
  setIsDark(isDark.toString());
};

const updateWordMode = (el) => {
  wordMode = el.target.value;
  setWordMode(el);
  vocabularyDataByWordMode(fetchData);
};
const updateWordOrder = (el) => {
  wordOrder = el.target.value;
  setWordOrder(el);
  if (wordOrder === 'shuffer') shufferVocabularyData();
};

themeSwitch.addEventListener('change', toggleDarkMode);
wordModeRadio.forEach((radio) => radio.addEventListener('change', updateWordMode));
wordOrderRadio.forEach((radio) => radio.addEventListener('change', updateWordOrder));

const loadSettings = () => {
  const storedIsDark = getIsDark();
  const storedWordMode = getWordMode();
  const storedWordOrder = getWordOrder();

  if (storedIsDark !== null) {
    isDark = storedIsDark === 'false';
    if (isDark) {
      document.body.classList.add('dark-mode');
      themeSwitch.checked = true;
    }
  }

  if (storedWordMode) {
    wordMode = storedWordMode ?? 'dict';
    wordModeRadio.forEach((radio) => {
      if (radio.value === wordMode) {
        radio.checked = true;
      }
    });
  }
  if (storedWordOrder) {
    wordOrder = storedWordOrder ?? 'default';
    wordOrderRadio.forEach((radio) => {
      if (radio.value === wordOrder) {
        radio.checked = true;
      }
    });
  }
};

// Settings dropdown
const languageDropdown = settingsScreen.querySelector('#language-dropdown');
const downloadDropdown = settingsScreen.querySelector('#download-dropdown');

languageDropdown.querySelectorAll('.dropdown-item').forEach((item) => {
  item.addEventListener('click', () => {
    setLanguage(item.textContent.toLowerCase());
    languageDropdown.parentNode.querySelector('span').textContent = item.textContent;
  });
});

const showLanguageDropdown = () => languageDropdown.classList.toggle('show');
const showDownloadDropdown = () => downloadDropdown.classList.toggle('show');

// Utils
const jsonDownload = (url, file_name) => {
  fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file_name;
      a.click();
      document.removeChild(a);
    });
};

const sufferAnswer = (array) => array.sort(() => Math.random() - 0.5);

const disable = (el, isDisable) => {
  if (isDisable) {
    el.classList.add('disabled');
    el.disabled = true;
  } else {
    el.classList.remove('disabled');
    el.disabled = false;
  }
};

const compareArrayAnswer = (arr1, arr2) => JSON.stringify(arr1) === JSON.stringify(arr2);

const wordToAnswer = (word) => Object.values(word.meaning).flatMap((m) => m);

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

// add edit word
// const addType() {
//   const newType = document.createElement('div');
//   newType.classList.add('select-wrapper');
//   newType.innerHTML = `
//     <div class="select word-type">
//         <div class="selected-option">Select type</div>
//         <div class="options-container">
//             <div class="option" data-value="verb">Verb</div>
//             <div class="option" data-value="noun">Noun</div>
//             <div class="option" data-value="adverb">Adverb</div>
//             <div class="option" data-value="adjective">Adjective</div>
//             <div class="option" data-value="pronoun">Pronoun</div>
//             <div class="option" data-value="auxiliary verb">Auxiliary verb</div>
//             <div class="option" data-value="determiner">Determiner</div>
//             <div class="option" data-value="conjunction">Conjunction</div>
//             <div class="option" data-value="preposition">Preposition</div>
//         </div>
//     </div>
//     <input type="text" placeholder="Meanings, separate by ;" />
//   `;
//   // customWordModal
//   //   .querySelector('.modal-content')
//   //   .insertBefore(newType, customWordModal.querySelector('.btn-footer'));

//   const wordTypeSelect = newType.querySelector('.select.word-type');
//   const optionContainer = wordTypeSelect.querySelector('.options-container');
//   const selectedOption = wordTypeSelect.querySelector('.selected-option');

//   // Toggle options container visibility when clicking the select
//   selectedOption.addEventListener('click', const () {
//     optionContainer.classList.toggle('open');
//   });

//   // Handle selecting an option
//   wordTypeSelect.querySelectorAll('.option').forEach((option) => {
//     option.addEventListener('click', const () {
//       const value = option.getAttribute('data-value');
//       selectedOption.textContent = option.textContent;
//       optionContainer.classList.remove('open');
//     });
//   });

//   // Optional: Close the dropdown if the user clicks outside
//   document.addEventListener('click', const (event) {
//     if (!newType.contains(event.target)) {
//       optionContainer.classList.remove('open');
//     }
//   });
// }

// let addedWords = [];

// const clearForm() {
//   const modalContent = customWordModal.querySelector('.modal-content');
//   modalContent.querySelectorAll('input[type="text"]').forEach((input) => (input.value = ''));
//   modalContent.querySelectorAll('.select-wrapper').forEach((el, index) => {
//     if (index !== 0) {
//       el.remove();
//     }
//   });
//   modalContent.querySelector('.select .selected-option').textContent = 'Select type';
// }

// const addWord() {
//   const modalContent = customWordModal.querySelector('.modal-content');
//   const word = modalContent.querySelector('input[placeholder="Word"]').value;
//   const ipa = modalContent.querySelector('input[placeholder="IPA"]').value;
//   const meanings = {};

//   modalContent.querySelectorAll('.select-wrapper').forEach((wrapper) => {
//     const type = wrapper.querySelector('.select .selected-option').textContent;
//     const meaning = wrapper.querySelector('input[placeholder="Meanings, separate by ;"]').value;
//     if (type !== 'Select type' && meaning !== '') {
//       meanings[type.toLowerCase()] = meaning.split(';').map((m) => m.trim());
//     }
//   });

//   const newWord = { word, ipa, meaning: meanings };
//   vocabularyData.push(newWord);
//   addedWords.push(newWord);

//   togglecustomWordModal();
//   clearForm();
// }

// addTypeBtn.addEventListener('click', addType);
// clearFormBtn.addEventListener('click', clearForm);
// actionFormBtn.addEventListener('click', addWord);
// const customWordModal = document.getElementById('custom-word-modal');
// const markedButton = homeScreen.querySelectorAll('button')[2];
// const addedButton = homeScreen.querySelectorAll('button')[3];

// addedButton.addEventListener('click', () => togglecustomWordModal());
// markedButton.addEventListener('click', () => console.log('marked word'));

// Word type upcase first letter
// const upperFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

// Dropdown add/edit word
// document.addEventListener('DOMContentLoaded', const () {
//   const wordTypeSelect = document.querySelectorAll('.select.word-type');
//   wordTypeSelect.forEach((select) => {
//     const optionContainer = select.querySelector('.options-container');
//     const selectedOption = select.querySelector('.selected-option');

//     // Toggle options container visibility when clicking the select
//     selectedOption.addEventListener('click', const () {
//       optionContainer.classList.toggle('open');
//     });

//     // Handle selecting an option
//     select.querySelectorAll('.option').forEach((option) => {
//       option.addEventListener('click', const () {
//         const value = option.getAttribute('data-value');
//         selectedOption.textContent = option.textContent;
//         optionContainer.classList.remove('open');
//       });
//     });

//     // Optional: Close the dropdown if the user clicks outside
//     document.addEventListener('click', const (event) {
//       if (!select.contains(event.target)) {
//         optionContainer.classList.remove('open');
//       }
//     });
//   });
// });

// const togglecustomWordModal() {
//   customWordModal.classList.toggle('hidden');
//   clearForm();
// }

// const addTypeBtn = customWordModal.querySelector('.add-type');
// const clearFormBtn = customWordModal.querySelector('.clear-form');
// const actionFormBtn = customWordModal.querySelector('.action-form');
// const closecustomWordModal = customWordModal.querySelector('.close-modal');
