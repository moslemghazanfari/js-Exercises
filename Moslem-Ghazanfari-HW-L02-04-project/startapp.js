//start common variable
const btnStart = document.querySelector("button");
btnStart.disabled=true;
const btnNext = document.getElementById("btnnext");
//end common variable

//start app
switch (localStorage.getItem("Page")) {
  case "questionsPage":
    questionsPage((localStorage.getItem("Isshowanswer") == "true") ? true : false);
    break
  case "resultPage": resultPage();
    break
  default: initPage();
}


