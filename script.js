let Types= { Standard: "standard", Daily: "daily", WrongQuestions:"wrong" }
let currentQuiz = {
    questions: [],
    currentIndex: 0,
    p_type: Types.Standard
};
function Question() {
    return currentQuiz.questions[currentQuiz.currentIndex];
}
function setupQuiz(questions, p_type) {
    currentQuiz = { questions: questions,
		    p_type: p_type,
		    currentIndex: -1};
}
  const dbKey = "quiz-progress";
  // DOM Elements
  const datasetsContainer = document.getElementById("datasets");
  const startBtn = document.getElementById("start-btn");
  const quizContainer = document.getElementById("quiz-container");
  const questionEl = document.getElementById("question");
  const answerEl = document.getElementById("answer");
  const answerContainer = document.getElementById("answer-container");
  const revealBtn = document.getElementById("reveal-btn");
  const correctBtn = document.getElementById("correct-btn");
  const incorrectBtn = document.getElementById("incorrect-btn");
  const progressEl = document.getElementById("progress");
  const dailyQuizBtn = document.getElementById("daily-quiz-btn");
const dailyKey = "daily-quiz-progress";
const wrongKey = "wrongquestions";
        const output = document.getElementById('output');
        const selectSource = document.getElementById('selectSource');
        const dbName = 'multiSourceCacheDB';
        const storeName = 'cachedData';
        const baseUrl = 'https://jaropawlak.github.io/nauka/data/'; 
        const indexUrl = 'index.json';
        let db;
let quiz = "none";
let wrongQuestions = loadProgress(Types.WrongQuestions)|| { questions: [], currentIndex: 0, p_type: Types.WrongQuestions };


correctBtn.addEventListener("click", () => {
  if (quiz === "wrong") {
         const currentQuestion = Question();
    wrongQuestions.questions = wrongQuestions.questions.filter(q => q.question !== currentQuestion.question);
    saveProgress(wrongQuestions);
  }
    saveProgress(); // sprawdz save progress
    showNextQuestion();
    
 });
incorrectBtn.addEventListener("click", () => {
    const currentQuestion = Question();
    currentQuiz.questions.push(currentQuestion);
    if (currentQuiz.p_type !== Types.WrongQuestions) {
      if (!wrongQuestions.questions.some(q => q.question === currentQuestion.question)) {
         wrongQuestions.questions.push(currentQuestion);
         saveProgress(wrongQuestions);
  }
  }
     saveProgress(); 
    showNextQuestion();
});
 
function getSelectedValues() {
  const checkedCheckboxes = document.querySelectorAll('#selectSource input[type="checkbox"]:checked');
  const values = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);
  return values;
}
 function startQuiz() {
  quiz = "standard"
  questions = [];
  const sources = getSelectedValues();
  let counter = 0;
  sources.forEach( (selectedId) =>   {
         loadDataById(selectedId, function(data) {
            questions = questions.concat(data);
            counter++;
            document.getElementById("dataset-selection").style.display = "none";
            quizContainer.style.display = "block";
            if (counter === sources.length) {
		setupQuiz(shuffleArray(questions), Types.Standard);
		showNextQuestion();
            }
          });
  });
}
dailyQuizBtn.addEventListener("click", async () => {
  allQuestions = [];
  const sources = getSelectedValues();
  let counter = 0;
  sources.forEach( (selectedId) =>   {
         loadDataById(selectedId, function(data) {
          allQuestions = allQuestions.concat(data);
            counter++;
            document.getElementById("dataset-selection").style.display = "none";
            quizContainer.style.display = "block";
            if (counter === sources.length) {
              allQuestions = shuffleArray(allQuestions);
             
              loadDailyProgress(allQuestions);
              document.getElementById("dataset-selection").style.display = "none";
              quizContainer.style.display = "block";
              showNextQuestion();
            }
          });
  });
});
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showNextQuestion() {
    currentQuiz.currentIndex++;
    if (currentQuiz.currentIndex >= currentQuiz.questions.length) {
	alert("Quiz completed!");
	clearProgress(); 
	location.reload();
	return;
    }
    let q = Question();
    questionEl.textContent = q.question;
    answerEl.textContent = q.answer;
    answerEl.style.display = "none";
    answerContainer.style.display = "none";
    updatePDesc();
}
function getDbKey(p_type) {
    if (p_type == Types.Daily) {
	return dailyKey;
    }
    if (p_type == Types.WrongQuestions) {
	return wrongKey;
    }
    return dbKey;
}
function clearProgress() {
    let key = getDbKey(currentQuiz.p_type);
    currentQuiz.currentIndex = 0;
    localStorage.removeItem(key);
}
function updatePDesc() {
    progressEl.textContent = `Pytanie ${currentQuiz.currentIndex + 1} z ${currentQuiz.questions.length}`;
}
  function saveProgress(quiz = currentQuiz) {
      localStorage.setItem(getDbKey(quiz.p_type), JSON.stringify(quiz));
  }
function loadDailyProgress(allQuestions) {
  const saved = localStorage.getItem(dailyKey);
  if (saved) {
    currentQuiz = JSON.parse(saved);
  } else {
    currentQuiz.questions = shuffleArray(allQuestions).slice(0, 50); // Pick 50 random questions
      currentQuiz.currentIndex = -1;
      currentQuiz.p_type = Types.Daily;
    saveProgress();
  }
}

function loadProgress(p_type, or_use_default) {
    const saved = localStorage.getItem(getDbKey(p_type));
    if (saved) {
      const data = JSON.parse(saved);
	currentQuiz = data;
    } else if (or_use_default) {
	currentQuiz = or_use_default;
    }
   return currentQuiz;
}
  // Reveal the answer
  revealBtn.addEventListener("click", () => {
    answerEl.style.display = "block";
    answerContainer.style.display = "block";
  });
  startBtn.addEventListener("click", async () => {
    clearProgress();
    startQuiz();
  });
        function startWrongQuestionsQuiz() {
          quiz = "wrong";
          if (wrongQuestions.questions.length === 0) {
              alert("No wrong questions to review!");
          } else {
              currentQuiz.questions = [...wrongQuestions.questions];
              currentQuiz.currentIndex = -1;
	      currentQuiz.p_type = Types.WrongQuestions;
              document.getElementById("dataset-selection").style.display = "none";
              quizContainer.style.display = "block";

	      showNextQuestion();
          }
      }

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
        async function saveData(id, data) {
          db = db || (await openDB());
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          store.put({ id, data });
          await tx.complete;
        }
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

        async function clearData() {
          db = db || (await openDB());
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          store.clear();
          await tx.complete;
          alert('Dane zostały usunięte z IndexedDB.');
          output.innerHTML = '';
        }
 function extractTitle(data) {
  const result = [];

  function traverse(node) {
    for (const key in node) {
      const value = node[key];
      if (typeof value === "object" && value !== null) {
        if (value.title && value.file) {
          result.push({ title: value.title, file: value.file });
        } else {
          traverse(value);
        }
      }
    }
  }

  traverse(data);
  return result;
}

        // Pobieranie danych z wszystkich źródeł
        async function fetchData() {
            try {
            const list = await fetch(baseUrl + indexUrl);
            const urls = await list.json();
            await saveData("index", urls);
          
	for (const url of extractTitle( urls)) {
              const response = await fetch(baseUrl + url.file);
              if (!response.ok) throw new Error(`Błąd podczas pobierania danych z ${url.url}`);
              const data = await response.json();
              await saveData(url.title, data); // Zapis danych z każdego źródła
        }
		//reload current page
		window.location.reload();
          } catch (error) {
            alert('Wystąpił problem: ' + error.message);
          }
        }
    


    function createNestedView(data, container) {
      for (const key in data) {
        const value = data[key];
        const groupElement = document.createElement("div");
        groupElement.classList.add("group");

        if (value.title) {
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.name = value.title;
          checkbox.value = value.title;
          checkbox.id = value.title;

          const label = document.createElement("label");
          label.htmlFor = value.title;
          label.textContent = value.title;

          groupElement.appendChild(checkbox);
          groupElement.appendChild(label);
        } else {
          // Group/Subgroup: Add a title with toggle functionality
          const titleElement = document.createElement("div");
          titleElement.classList.add("expandable");
          titleElement.textContent = key;

          const contentElement = document.createElement("div");
          contentElement.classList.add("hidden");

          // Add toggle functionality
          titleElement.addEventListener("click", () => {
            contentElement.classList.toggle("hidden");
          });

          // Recursively process nested groups/subgroups
          createNestedView(value, contentElement);

          groupElement.appendChild(titleElement);
          groupElement.appendChild(contentElement);
        }

        container.appendChild(groupElement);
      }
    }

 async function refreshIndex() { loadDataById("index", function(data) { createNestedView(data, selectSource); }); }

        // Obsługa przycisków
        document.getElementById('fetchData').addEventListener('click', fetchData);
        document.getElementById('clearData').addEventListener('click', clearData);
    
        // Załaduj dane z wybranego pliku
       refreshIndex();
