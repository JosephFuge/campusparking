async function loginUser() {
    if (document.cookie.includes('token')) {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    const userName = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const response = await fetch(`/api/login`, {
        method: 'post',
        body: JSON.stringify({ username: userName, password: password }),
        headers: {
        'Content-type': 'application/json; charset=UTF-8',
        },
    });

    if (response.ok) {
        localStorage.setItem('username', userName);
        window.location.href = '/auth/map';
    } else {
        const body = await response.json();
        const bodyText = body.message;
        const loginError = document.getElementById('loginError')
        loginError.innerHTML = bodyText;
        loginError.style.display = 'block';
    }
}

async function registerUser() {
    const username = document.getElementById("email").value;
    const userPassword = document.getElementById("password").value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const venmo = document.getElementById('venmo').value;
    const phoneNum = document.getElementById('phoneNumber').value;

    let registerResponse = await fetch('/api/createUser', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({username: username, password: userPassword, firstName: firstName, lastName: lastName, venmo: venmo, phoneNumber: phoneNum}),
      });
    
    if (registerResponse.ok) {
        localStorage.setItem("username", username);
        window.location.href = "/auth/map";
    } else {
        const loginError = document.getElementById('loginErrorText')
        loginError.innerHTML = 'Couldn\'t register user - try a different email';
        loginError.style.display = 'block';
    }
}

function showLogin() {
    const loginSignupChoiceEle = document.getElementById('loginRegisterBox'); 
    loginSignupChoiceEle.style.display = "none";
    document.getElementById('registerBoxes').style.display = "none";
    
    const loginEle = document.getElementById('loginBox');
    loginEle.style.display = 'block';
}

function showLoginRegister() {
    document.getElementById('loginRegisterBox').style.display = "block";
    document.getElementById('registerLeft').style.display = "none";

    const loginEle = document.getElementById('loginBox')
    if (loginEle.style.display != 'none') {
        loginEle.style.display = "none";
    }
}

function showRegister() {
    const loginSignupChoiceEle = document.getElementById('loginRegisterBox'); 
    loginSignupChoiceEle.style.display = "none";
    
    const registerBoxesEle = document.getElementById('registerBoxes');
    const registerLeftEle = document.getElementById('registerLeft');
    
    registerLeftEle.style.display = "inline-block";
    
    registerBoxesEle.style.display = "flex";
}
