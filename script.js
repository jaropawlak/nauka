
  // Variables
  let questions = [];
  let currentIndex = 0;
  let progress = [];
  const dbKey = "quiz-progress";
  
  // DOM Elements
  const datasetsContainer = document.getElementById("datasets");
  const startBtn = document.getElementById("start-btn");
  const quizContainer = document.getElementById("quiz-container");
  const questionEl = document.getElementById("question");
  const answerEl = document.getElementById("answer");
  const revealBtn = document.getElementById("reveal-btn");
  const correctBtn = document.getElementById("correct-btn");
  const incorrectBtn = document.getElementById("incorrect-btn");
  const progressEl = document.getElementById("progress");
  
  const dailyQuizBtn = document.getElementById("daily-quiz-btn");
const dailyKey = "daily-quiz-progress";
let dailyQuestions = [];
let dailyCurrentIndex = 0;
let quiz = "none";
let wrongQuestions = JSON.parse(localStorage.getItem('wrongQuestions')) || [];
function saveWrongQuestions() {
  localStorage.setItem('wrongQuestions', JSON.stringify(wrongQuestions));
}

// Mark Daily Quiz Correct
correctBtn.addEventListener("click", () => {
  if (quiz === "wrong") {
    const currentQuestion = questions[currentIndex];
    wrongQuestions = wrongQuestions.filter(q => q.question !== currentQuestion.question);
    saveWrongQuestions();
  }
  if (dailyQuestions.length > 0) {
    dailyCurrentIndex++;
    saveDailyProgress();
    showDailyQuestion();
  } else {
    currentIndex++;
    saveProgress();
    showQuestion();
  }
});

// Mark Daily Quiz Incorrect
incorrectBtn.addEventListener("click", () => {
  if (quiz !== "wrong") {
  const currentQuestion = questions[currentIndex];
  // Add to wrongQuestions if not already there
  if (!wrongQuestions.some(q => q.question === currentQuestion.question)) {
      wrongQuestions.push(currentQuestion);
      saveWrongQuestions();
  }
}
  if (dailyQuestions.length > 0) {
    dailyQuestions.push(dailyQuestions[dailyCurrentIndex]); // Append to end
    dailyCurrentIndex++;
    saveDailyProgress();
    showDailyQuestion();
  } else {
    questions.push(questions[currentIndex]);
    currentIndex++;
    saveProgress();
    showQuestion();
  }
});
 
 // Start the quiz
 function startQuiz() {
  quiz = "standard"
    const selectedId = selectSource.value;
         loadDataById(selectedId, function(data) {
            questions = data;
            document.getElementById("dataset-selection").style.display = "none";
            quizContainer.style.display = "block";
            showQuestion();
          }
        );
    }
  
  // Show the current question
  function showQuestion() {
    if (currentIndex >= questions.length) {
      alert("Quiz completed!");
      clearProgress();
      location.reload(); // Restart quiz
      return;
    }
  
    const questionObj = questions[currentIndex];
    questionEl.textContent = questionObj.question;
    answerEl.textContent = questionObj.answer;
    answerEl.style.display = "none";
  
    updateProgress();
  }
  
  
// Handle Daily Quiz button click
dailyQuizBtn.addEventListener("click", async () => {
 
  const selectedFiles = Array.from(
    datasetsContainer.querySelectorAll("input:checked")
  ).map((input) => input.value);

  if (selectedFiles.length === 0) {
    alert("Please select at least one dataset.");
    return;
  }

  let allQuestions = [];
  for (const file of selectedFiles) {
    if (file.startsWith("datasets/")) {
      const firebaseData = await loadFirebaseDataset(file);
      allQuestions = allQuestions.concat(firebaseData);
    } else {
      const response = await fetch(file);
      const data = await response.json();
      allQuestions = allQuestions.concat(data);
    }
  }

  loadDailyProgress(allQuestions);
  startDailyQuiz();
});
// Utility to shuffle questions randomly
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Start Daily Quiz
function startDailyQuiz() {
  quiz = "daily";
  document.getElementById("dataset-selection").style.display = "none";
  quizContainer.style.display = "block";
  showDailyQuestion();
}

// Show Daily Quiz Question
function showDailyQuestion() {
  if (dailyCurrentIndex >= dailyQuestions.length) {
    alert("Daily Quiz completed!");
    clearDailyProgress();
    location.reload(); // Restart app
    return;
  }

  const questionObj = dailyQuestions[dailyCurrentIndex];
  questionEl.textContent = questionObj.question;
  answerEl.textContent = questionObj.answer;
  answerEl.style.display = "none";

  updateDailyProgress();
}

// Save Daily Quiz Progress
function saveDailyProgress() {
  const progress = { dailyQuestions, dailyCurrentIndex };
  localStorage.setItem(dailyKey, JSON.stringify(progress));
}

// Load Daily Quiz Progress
function loadDailyProgress(allQuestions) {
  const saved = localStorage.getItem(dailyKey);
  if (saved) {
    const data = JSON.parse(saved);
    dailyQuestions = data.dailyQuestions;
    dailyCurrentIndex = data.dailyCurrentIndex;
  } else {
    dailyQuestions = shuffleArray(allQuestions).slice(0, 50); // Pick 50 random questions
    dailyCurrentIndex = 0;
    saveDailyProgress();
  }
}

// Clear Daily Quiz Progress
function clearDailyProgress() {
  localStorage.removeItem(dailyKey);
}

// Update Daily Quiz Progress
function updateDailyProgress() {
  progressEl.textContent = `Pytanie ${dailyCurrentIndex + 1} z ${dailyQuestions.length}`;
}


  // Update progress text
  function updateProgress() {
    progressEl.textContent = `Pytanie ${currentIndex + 1} z ${questions.length}`;
  }
  
  // Save progress to browser storage
  function saveProgress() {
    progress = { questions, currentIndex };
    localStorage.setItem(dbKey, JSON.stringify(progress));
  }
  
  // Load progress from browser storage
  function loadProgress() {
    const saved = localStorage.getItem(dbKey);
    if (saved) {
      const data = JSON.parse(saved);
      questions = data.questions;
      currentIndex = data.currentIndex;
    }
  }
  
  // Clear progress when the quiz is done
  function clearProgress() {
    localStorage.removeItem(dbKey);
  }

  // Reveal the answer
  revealBtn.addEventListener("click", () => {
    answerEl.style.display = "block";
  });
  
 

  startBtn.addEventListener("click", async () => {
    loadProgress();
    startQuiz();
  });

        const output = document.getElementById('output');
        const selectSource = document.getElementById('selectSource');
    
        const dbName = 'multiSourceCacheDB';
        const storeName = 'cachedData';
    
        // Lista adresów URL
        const baseUrl = 'https://raw.githubusercontent.com/jaropawlak/nauka/refs/heads/main/data/'; 
        const indexUrl = 'index.json';
    
        let db;
    
        function startWrongQuestionsQuiz() {
          quiz = "wrong";
          if (wrongQuestions.length === 0) {
              alert("No wrong questions to review!");
          } else {
              questions = [...wrongQuestions];
              currentIndex = 0;
              document.getElementById("dataset-selection").style.display = "none";
              quizContainer.style.display = "block";
              showQuestion();
          }
      }
        // Otwieranie lub tworzenie bazy danych IndexedDB
        function openDB() {
          return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, 1);
    
            request.onupgradeneeded = (event) => {
              const db = event.target.result;
              if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
              }
            };
    
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject('Błąd otwierania DB: ' + event.target.errorCode);
          });
        }
    
        // Zapis danych do IndexedDB dla każdego źródła
        async function saveData(id, data) {
          db = db || (await openDB());
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          store.put({ id, data });
          await tx.complete;
        }
    
        // Odczyt danych z konkretnego źródła po ID
        async function loadDataById(id, callback) {
          db = db || (await openDB());
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const request = store.get(id);
    
          request.onsuccess = () => {
            const result = request.result;
            if (result) {
                callback(result.data);
                return result.data;
             
            } 
            return null;
          };
    
          request.onerror = () => {
            output.innerHTML = 'Błąd podczas ładowania danych.';
          };
        }
    
        // Funkcja do czyszczenia danych z IndexedDB
        async function clearData() {
          db = db || (await openDB());
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          store.clear();
          await tx.complete;
          alert('Dane zostały usunięte z IndexedDB.');
          output.innerHTML = '';
        }
    
        // Pobieranie danych z wszystkich źródeł
        async function fetchData() {
            try {
            const list = await fetch(baseUrl + indexUrl);
            const urls = await list.json();
            await saveData("index", urls);
          
            for (const url of urls) {
              const response = await fetch(baseUrl + url.file);
              if (!response.ok) throw new Error(`Błąd podczas pobierania danych z ${url.url}`);
              const data = await response.json();
              await saveData(url.title, data); // Zapis danych z każdego źródła
            }
            alert('Dane zostały zapisane w IndexedDB.');
          } catch (error) {
            alert('Wystąpił problem: ' + error.message);
          }
        }
    
        async function refreshIndex() {
             loadDataById("index", function(data) {
                for (const url of data || []) {
              const option = document.createElement('option');
              option.value = url.title;
              option.textContent = url.title;
              selectSource.appendChild(option);
            }
             })
            //fill selectSource with urls from data
           
          
        }
        // Obsługa przycisków
        document.getElementById('fetchData').addEventListener('click', fetchData);
        document.getElementById('clearData').addEventListener('click', clearData);
    
        // Załaduj dane z wybranego pliku
       refreshIndex();
