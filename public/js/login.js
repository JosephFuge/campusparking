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
        window.location.href = '/map';
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

    let registerResponse = await fetch('/createUser', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({username: username, password: userPassword}),
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