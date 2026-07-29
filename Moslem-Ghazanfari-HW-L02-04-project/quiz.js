//start common variable, function
let currentquestion = parseInt(localStorage.getItem("Currentquestion") ?? "0");
let indexcorrectanswer = parseInt(localStorage.getItem("Indexcorrectanswer") ?? "-1");
let resultCurrectAnswer = parseInt(localStorage.getItem("ResultCurrectAnswer") ?? "0");
const questions = [];
questions.push(...JSON.parse(localStorage.getItem("Questions") ?? "[]"));
const answers = [];
answers.push(...JSON.parse(localStorage.getItem("Answers") ?? "[]"));
answers.forEach((value) => {
  if (value == "true") value = true;
  if (value == "null") value = null;
})
let timer;

function displaynone(element) {
  document.getElementById(element).className = "display-none";
}
function displayelement(element, cssclass = "") {
  document.getElementById(element)
    .className = cssclass;
}
//end common variable, function

//start initpage
function initPage() {

  const getcategory = async () => {

    try {
      displayelement("progressbox", "progress");
      const response = await fetch("https://opentdb.com/api_category.php");
      if (!response.ok)
        throw new Error("اطلاعاتی از سرور دریافت نشد");
      const data = await response.json();
      const categoryitems = data.trivia_categories;
      if (categoryitems.length == 0)
        throw new Error("دسته ای یافت نشد");

      let selectoption;
      for (const categoryitem of categoryitems) {
        selectoption = document.createElement("option");
        selectoption.value = categoryitem.id;
        selectoption.textContent = categoryitem.name;
        selectCategory.appendChild(selectoption);
      }
      displaynone("progressbox");
      btnStart.disabled = false;
    } catch (error) {
      alert(error)
    }
  }
  const getquestions = async () => {
    displayelement("progressbox", "progress");
    try {
      const response = await fetch(`https://opentdb.com/api.php?amount=${countquestion.value}&category=${selectCategory.value}&difficulty=${selectDifficulty.value}&type=multiple`);
      if (!response.ok)
        throw new Error("اطلاعاتی از سرور دریافت نشد");

      const data = await response.json();
      if (data.response_code != 0 || data.results.length == 0)
        throw new Error("هیچ سوالی وجود ندارد");

      questions.push(...data.results);
      localStorage.setItem("Questions", JSON.stringify(questions));
      displaynone("progressbox")
      questionsPage();
    } catch (error) {
      alert(error.message);
    }
  }

  const selectCategory = document.getElementById("category");
  const selectDifficulty = document.getElementById("Difficulty");
  const countquestion = document.querySelector("input");
  getcategory();
  btnStart.addEventListener("click", () => {
    getquestions();
  });
}
//end initpage

//start questions
function questionsPage(isshowanswer = false) {

  function savestatus() {
    localStorage.setItem("Currentquestion", currentquestion);
    localStorage.setItem("Indexcorrectanswer", indexcorrectanswer);
    localStorage.setItem("ResultCurrectAnswer", resultCurrectAnswer);
    localStorage.setItem("Isshowanswer", isshowanswer);
    localStorage.setItem("Answers", JSON.stringify(answers));

  }
  const nextquestion = () => {
    if (isshowanswer == false) { showanswer(); return; }
    isshowanswer = false;
    btnNext.textContent = "نمایش جواب"
    showquestion();
    /*  if (isshowanswer) {
       showanswer();
       return;
     } */

  }
  const showquestion = () => {
    clearInterval(timer);
    pquestion[0].innerHTML = questions[currentquestion].question;

    let randomCorrectanswer = parseInt(localStorage.getItem("RandomCorrectanswer")) || Math.trunc(Math.random() * 4);
    localStorage.setItem("RandomCorrectanswer", randomCorrectanswer)
    labeloption[randomCorrectanswer].innerHTML = questions[currentquestion].correct_answer;
    indexcorrectanswer = randomCorrectanswer;
    let j = 2;
    for (let i = labeloption.length - 1; i >= 0; i--) {
      if (i == randomCorrectanswer) continue
      labeloption[i].innerHTML = questions[currentquestion].incorrect_answers[j];
      j--;
    }
    if (!isshowanswer) {
      answers[currentquestion] = null;
      inputansewer.forEach((value, key) => {
        value.disabled = false;
        value.checked = false;
        labeloption.item(key).className = "inputlabel";
      })
      //btnNext.disabled = true;
      localStorage.removeItem("Useranswer");
      localStorage.removeItem("RandomCorrectanswer");
      let i = parseInt(localStorage.getItem("Timer") ?? "15");
      timer = setInterval(() => {
        document.querySelector("#timer").textContent = `زمان پاسخ سوال ( ${--i} )`;
        localStorage.setItem("Timer", i);
        if (i == 0) {
          showanswer();
        }
      }, 1000);
      showscore();
      savestatus();
    } else {
      showanswer();
    }

    //console.log(localStorage.getItem("Questions"));
  }
  function showscore() {
    currANDtotal.textContent = `سوال ${currentquestion + 1} از ${questions.length}`;
    curresult.textContent = `امتیاز ${resultCurrectAnswer * 10} از ${questions.length * 10}`;
  }
  const showanswer = () => {
    clearInterval(timer);
    localStorage.removeItem("Timer");
    localStorage.removeItem("RandomCorrectanswer");
    //ofter refresh or close tab
    let useranswer = localStorage.getItem("Useranswer");
    if (useranswer != null) {
      inputansewer.item(useranswer).checked = true;
    }
    inputansewer.forEach((option, key) => {
      if (option.checked && useranswer == null) {
        localStorage.setItem("Useranswer", key);
        if (key == indexcorrectanswer) {
          answers[currentquestion] = true;
          resultCurrectAnswer++
        }
      }
      if (key == indexcorrectanswer)
        labeloption.item(key).className = "show-answer";
      else if (option.checked) {
        labeloption.item(key).className = "show-incorrect";
        answers[currentquestion] = labeloption.item(key).textContent;
      }

      option.disabled = true;
    })
    //btnNext.disabled = false;
    btnNext.textContent = "سوال بعد"
    isshowanswer = true;
    savestatus();
    showscore();
    //console.log("answers:", answers);

    currentquestion++;
    if ((currentquestion == questions.length)) {
      btnNext.removeEventListener("click", nextquestion);
      btnNext.textContent = "نتیجه تست";
      btnNext.className = "btnresult";
      btnNext.addEventListener("click", resultPage);
    }
  }
  localStorage.setItem("Page", "questionsPage");
  const pquestion = document.getElementsByClassName("question");
  const inputansewer = document.getElementsByName("option");
  const labeloption = document.getElementsByTagName("label");
  const currANDtotal = document.getElementById("currANDtotal");
  const curresult = document.getElementById("curresult");
  displaynone("section1");
  displayelement("section2", "section2 borderbox");

  /* inputansewer.forEach((option) => option.addEventListener("click", () =>
    btnNext.disabled = false
  )); */

  btnNext.addEventListener("click", nextquestion)
  showquestion();
}

//start resultpage
function resultPage(result) {
  localStorage.setItem("Page", "resultPage");
  displaynone("section1");
  displaynone("section2");
  displayelement("section3", "section3 borderbox");
  const getuseranswer = function (answer) {
    const spananswer = document.createElement("span");

    if (answer === true) {
      spananswer.className = "correctAnswer";
      spananswer.innerHTML = "جواب صحیح بود \✔";
      return spananswer;
    }
    if (answer == null) {
      spananswer.className = "voidAnswer";
      spananswer.innerHTML = "بدون جواب \🕘";
      return spananswer;
    }
    spananswer.className = "incorrectAnswer";
    spananswer.innerHTML = `${answer}\❌`;
    return spananswer;
  }
  document.getElementById("result").innerHTML = `امتیاز: ${resultCurrectAnswer * 10}\ از ${questions.length * 10}`;

  const listquestion = document.getElementById("list-question");
  let li, div, span1, span2;
  let i = 0;
  for (const objquestion of questions) {
    li = document.createElement("li");
    li.className="question2";
    div = document.createElement("div");
    div.className = "Answer"
    span1 = document.createElement("span");
    span1.className = "correctAnswer";
    span1.append(objquestion.correct_answer);
   
    li.innerHTML = `${objquestion.question}`;
    div.innerHTML = `<div>correctAnswer:\ ${span1.outerHTML}</div>
    <div>userAnswer:\ ${getuseranswer(answers[i]).outerHTML}</div>`;
    li.append(div);
    listquestion.appendChild(li);
    i++;
  }

  document.querySelector("#reload").addEventListener("click", () => {
    localStorage.clear();
    window.location.reload()
  });
}
//end resultpage


