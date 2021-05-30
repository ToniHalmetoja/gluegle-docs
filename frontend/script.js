const inputForm = document.getElementById("inputForm");
const loginStatus = document.getElementById("loginStatus");
const buttons = document.getElementById("buttons");
const titleList = document.getElementById("titles");
const docs = document.getElementById("doc");
const userMsg = document.getElementById("userMsg");
const fetchURL = "http://127.0.0.1:3000";
let timeOut;

if(document.cookie){
    localStorage.setItem('userId', getCookie("userId"));
    loginStatus.innerHTML = "You are logged in as " + getCookie("userEmail")+ "!";
    showLoggedIn();
}
else{
    showNotLoggedIn();
}

function getCookie(cname) {
    var cookie = decodeURIComponent(document.cookie);
    var name = cname + "=";
    var ca = cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        let value = c.substring(name.length, c.length).match(/^s:(.*)\..*$/)[1]; /*Get rid of the signed stuff*/
        return value;
      }
    }
    return "";
  }

/*Construction functions, to build whatever version of the website is required*/

function showLoggedIn() {
    let logoutButton = document.createElement("button");
    logoutButton.innerHTML = "Log out";
    logoutButton.id = "logoutButton";
    buttons.append(logoutButton);
    logoutButton.addEventListener("click", logOut);
    fetchDocList(localStorage.getItem("userId"));
    userMsg.innerHTML = "Your documents:";
    addNewButton();
}

function showNotLoggedIn() {
    let formEmail = document.createElement("input");
    formEmail.placeholder = "Email";
    formEmail.type = "text";
    formEmail.autoComplete = "off";
    formEmail.id = "formEmail";
    inputForm.append(formEmail);
    let formPass = document.createElement("input");
    formPass.placeholder = "Password";
    formPass.type = "password";
    formPass.autoComplete = "off";
    formPass.id = "formPass";
    inputForm.append(formPass);
    let loginButton = document.createElement("button");
    loginButton.innerHTML = "Log in";
    loginButton.id = "loginButton";
    loginButton.addEventListener("click", checkLogin);
    buttons.append(loginButton);
    let regButton = document.createElement("button");
    regButton.innerHTML = "Register";
    regButton.id = "regButton";
    regButton.addEventListener("click", showRegister);
    buttons.append(regButton);
    loginStatus.innerHTML = "Please log in, unknown user!";
}

function showRegister() {
    clearLogin();
    let newEmail = document.createElement("input");
    let newPass = document.createElement("input");
    let regBut = document.createElement("button");
    let cancelBut = document.createElement("button");
    newEmail.placeholder = "New email";
    newEmail.id = "newEmail";
    newPass.placeholder = "New password";
    newPass.id = "newPass";
    newPass.type = "password";
    newEmail.type = "text";
    cancelBut.innerHTML = "Cancel";
    cancelBut.addEventListener("click", cancel);
    cancelBut.id = "cancelBut";
    regBut.innerHTML = "Register!"
    regBut.addEventListener("click", register);
    regBut.id = "regBut";
    loginStatus.innerHTML = "Enter a new username and password!";
    docs.append(newEmail);
    docs.append(newPass);
    docs.append(regBut);
    docs.append(cancelBut);
}

function addBackButton() {
    let backButton = document.createElement("button")
    backButton.innerHTML = "Back";
    backButton.className = "documentButton";
    backButton.addEventListener("click", back);
    backButton.style.backgroundColor = "#ebaaa9";
    titleList.append(backButton);
}

function addSaveButton() {
    let saveButton = document.createElement("button");
    saveButton.innerHTML = "Save";
    saveButton.id = "saveButton";
    saveButton.className = "documentButton";
    saveButton.style.backgroundColor = "#aceba9";
    saveButton.addEventListener("click", save);
    titleList.append(saveButton);
}

function addNewButton() {
    let newButton = document.createElement("button");
    newButton.innerHTML = "New Document";
    newButton.id = "newButton";
    newButton.addEventListener("click", newDocument);
    buttons.append(newButton);
    let newTitle = document.createElement("input");
    newTitle.placeholder = "New document name";
    newTitle.type = "text";
    newTitle.id = "newTitle";
    buttons.append(newTitle);
}

function addEditButton() {
    let editButton = document.createElement("button");
    editButton.innerHTML = "Edit";
    editButton.className = "documentButton";
    editButton.style.backgroundColor = "#aceba9";
    editButton.addEventListener("click", function () {
        openDocEditable(true);
    });
    titleList.append(editButton);
}

function addDeleteButton() {
    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.className = "documentButton";
    deleteButton.style.backgroundColor = "#ebaaa9";
    deleteButton.addEventListener("click", function () {
        deleteDoc(localStorage.getItem("currentKey"));
    });
    titleList.append(deleteButton);
}



/*Document-handling fetch functions, all triggered by clicking buttons on the website*/

function deleteDoc(){
    fetch(fetchURL + "/notes", {
        method: 'POST',
        body: JSON.stringify({
            action: "deleteDoc",
            keyid: localStorage.getItem("currentKey"),
            id: localStorage.getItem("userId"),
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(function (response) {
        back(true);
    })
}

function fetchDocList(id) {
    fetch(fetchURL + "/notes", {
            method: 'POST',
            body: JSON.stringify({
                action: "getTitles",
                id: id,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function (response) {
            if (response.status == 403) {
                response.text().then(function (text) {
                    errorOut(403, text);
                });

            } else {
                response.json().then((data) => {
                    if (data == false) {
                        userMsg.innerHTML = "No documents here!"
                    } else {
                        for (let i in data) {
                            let temporary = document.createElement("button");
                            temporary.innerHTML = data[i].title;
                            temporary.className = "documentButton";
                            temporary.addEventListener("click", function () {
                                openDoc(data[i].keyid)
                            });
                            titleList.appendChild(temporary);
                        }
                    }
                });
            }
        });
}

function openDoc(titleName) {
    clearTitles();
    fetch(fetchURL + "/notes", {
            method: 'POST',
            body: JSON.stringify({
                action: "getContent",
                keyid: titleName,
                id: localStorage.getItem("userId"),
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function (response) {
            if (response.status == 403) {
                response.text().then(function (text) {
                    errorOut(403, text);
                });
            }
            response.json().then((data) => {
                let noEditView = document.createElement("div");
                noEditView.id = "noEditView";
                docs.append(noEditView);
                userMsg.innerHTML = data.title;
                noEditView.innerHTML = data.content;
                localStorage.setItem('currentTitle', data.title);
                localStorage.setItem('currentKey', data.key);
            })
        })

    addEditButton();
    addBackButton();
    addDeleteButton();
}

function openDocEditable(fromEdit) {
    clearTitles();
    let textView = document.createElement("textarea");
    textView.id = "textView";
    doc.append(textView);
    tinymce.init({
        height: "600",
        selector: "#textView",
        setup: function (editor) {
            editor.on("change", function () {
                editor.save();
            })
            if (fromEdit == true) {
                editor.on('init', function (e) {
                    editor.setContent(noEditView.innerHTML);
                    document.getElementById("noEditView").remove();
                });
            }
        }
    })
    addBackButton();
    addSaveButton();
}



function save() {
    let content = tinyMCE.activeEditor.getContent();
    fetch(fetchURL + "/notes", {
        method: 'POST',
        body: JSON.stringify({
            action: "saveFile",
            id: localStorage.getItem("userId"),
            keyid: localStorage.getItem("currentKey"),
            content: content,
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    let old = userMsg.innerHTML;
    userMsg.innerHTML = "Document saved!"
    timeOut = setTimeout(function () {
        saveConfirm(old);
    }, 4000)

}

function newDocument() {
    if (document.getElementById("newTitle").value == false) {
        let old = userMsg.innerHTML;
        userMsg.innerHTML = "Please add a name to your document"
        timeOut = setTimeout(function () {
            saveConfirm(old);
        }, 4000)
    } else {
        fetch(fetchURL + "/notes", {
                method: 'POST',
                body: JSON.stringify({
                    action: "newFile",
                    id: localStorage.getItem("userId"),
                    title: document.getElementById("newTitle").value,
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(function (response) {
                if (response.status == 403) {
                    response.text().then(function (text) {
                        errorOut(403, text);
                    });
                } else {
                    response.json().then((data) => {
                    openDocEditable(false);
                    userMsg.innerHTML = document.getElementById("newTitle").value;
                    localStorage.setItem('currentTitle', document.getElementById("newTitle").value);
                    localStorage.setItem('currentKey', data);
                    document.getElementById("newTitle").value = "";
                    })
                }
            })
    }

}

/*Account validation functions - register and login*/

function checkLogin() {
    let attemptEmail = document.getElementById("formEmail").value;
    let attemptPass = document.getElementById("formPass").value;
    if (attemptEmail == false || attemptPass == false) {
        loginStatus.innerHTML = "Fields cannot be empty! Enter a new username and password to register.";
    } else {
        loginStatus.innerHTML = "Login request received. Waking up the backend...";
        fetch(fetchURL + "/users", {
                method: 'POST',
                body: JSON.stringify({
                    email: attemptEmail,
                    password: attemptPass
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            .then(function (response) {
                if (response.status == 403) {
                    response.text().then(function (text) {
                        errorOut(403, text);
                    });

                } else {
                    response.json().then((data) => {
                        localStorage.setItem('userId', data[0].id);
                        loginStatus.innerHTML = "You are logged in as " + data[0].email + "!";
                        clearLogin();
                        showLoggedIn();
                    });
                }
            })
    }
}

function register() {
    let newEmailT = document.getElementById("newEmail").value;
    let newPassT = document.getElementById("newPass").value;
    if (newEmailT == false || newPassT == false) {
        loginStatus.innerHTML = "Fields cannot be empty! Enter a new username and password to register.";
    } else if (validateEmail(newEmailT) == false) {
        loginStatus.innerHTML = "Invalid email address format! Please double-check it.";
    } else {
        loginStatus.innerHTML = "Registration request received. Waking up the backend...";
        fetch(fetchURL + "/users/reg", {
                method: 'POST',
                body: JSON.stringify({
                    id: 1,
                    email: newEmailT,
                    password: newPassT,

                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(function (response) {
                if (response.status == 409) {
                    response.text().then(function (text) {
                        errorOut(409, text);
                    });
                } else {
                    clearRegister();
                    showNotLoggedIn();
                    response.text().then(function (text) {
                        loginStatus.innerHTML = text;
                    });
                }
            })
    }
}

/*Maintenance functions that remove elements no longer required, as well as some basic error-handling and email validation*/

function logOut() {
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    clearTitles();
    if (document.getElementById("textView")) {
        tinyMCE.remove();
        document.getElementById("textView").remove();
    }
    if (document.getElementById("noEditView")) {
        noEditView.remove();
    }
    loginStatus.innerHTML = "You've been logged out!";
    localStorage.removeItem("userId");
    localStorage.removeItem("currentTitle");
    localStorage.removeItem('currentKey');
    document.getElementById("logoutButton").remove();
    userMsg.innerHTML = "";
    document.getElementById("newTitle").remove();
    document.getElementById("newButton").remove();
    showNotLoggedIn();
}

function back(fromDelete) {
    clearTimeout(timeOut);
    if (document.getElementById("noEditView")) {
        clearTitles();
        noEditView.remove();
        localStorage.removeItem('currentKey');
        localStorage.removeItem("currentTitle");
        if(fromDelete == true){
            userMsg.innerHTML = "File deleted! Your remaining documents:";
        }
        else{
            userMsg.innerHTML = "Your documents:";
        }
        fetchDocList(localStorage.getItem("userId"));
    }
    else if (document.getElementById("textView")) {
        userMsg.innerHTML = localStorage.getItem('currentTitle');
        let noEditView = document.createElement("div");
        noEditView.innerHTML = tinyMCE.activeEditor.getContent();
        noEditView.id = "noEditView";
        tinyMCE.remove();
        document.getElementById("textView").remove();
        docs.append(noEditView);
        addEditButton();
        addDeleteButton();
        document.getElementById("saveButton").remove();
    }
}

function saveConfirm(oldTitle) {
    userMsg.style.color = "#ccffff";
    userMsg.innerHTML = oldTitle;
}

function cancel() {
    clearRegister();
    showNotLoggedIn();
}

function clearLogin() {
    document.getElementById("formEmail").remove();
    document.getElementById("formPass").remove();
    document.getElementById("loginButton").remove();
    document.getElementById("regButton").remove();
}


function clearTitles() {
    let elements = document.getElementsByClassName("documentButton");
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function clearRegister() {
    document.getElementById("newEmail").remove();
    document.getElementById("newPass").remove();
    document.getElementById("regBut").remove();
    document.getElementById("cancelBut").remove();
}

function validateEmail(inputText) {
    var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (inputText.match(mailformat)) {
        return true;
    } else {
        return false;
    }
}

function errorOut(code, message) {
    let old = userMsg.innerHTML;
    userMsg.innerHTML = message + " Error code: " + code;
    userMsg.style.color = "#ebaaa9";
    timeOut = setTimeout(function () {
        saveConfirm(old);
    }, 4000)
}