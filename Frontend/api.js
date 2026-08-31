/* =====================================================
   API HELPER — connects frontend to FastAPI backend
   Base: http://127.0.0.1:8000
===================================================== */

const API_BASE = "http://127.0.0.1:8000";


/* =====================================================
   TOKEN STORAGE
===================================================== */

function saveToken(token) {
    localStorage.setItem("authToken", token);
}

function getToken() {
    return localStorage.getItem("authToken");
}

function clearToken() {
    localStorage.removeItem("authToken");
}


/* Check if user is logged in (use on protected pages) */

function isLoggedIn() {
    return getToken() !== null;
}


/* Logout — clears everything and goes to login page */

function logout() {
    clearToken();
    localStorage.removeItem("userName");
    window.location.href = "login.html";
}


/* =====================================================
   CENTRAL FETCH WRAPPER
   - auto-converts body object → JSON
   - auto-attaches Authorization: Bearer <token>
   - redirects to login on 401
===================================================== */

async function apiFetch(path, options = {}) {

    const headers = options.headers || {};

    /* JSON body */
    if (options.body && typeof options.body === "object") {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(options.body);
    }

    /* Auth token if we have one */
    const token = getToken();
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    let response;

    try {
        response = await fetch(API_BASE + path, {
            ...options,
            headers: headers
        });
    } catch (networkError) {
        throw new Error(
            "Cannot reach server. Is the backend running on port 8000?"
        );
    }

    /* Token expired / invalid */
    if (response.status === 401) {
        clearToken();
        window.location.href = "login.html";
        throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || ("Request failed (" + response.status + ")"));
    }

    return response.json();
}


/* =====================================================
   AUTH API
===================================================== */

/* Login — backend returns { token, user } */

async function apiLogin(email, password) {

    const response = await apiFetch("/auth/login", {
        method: "POST",
        body: {
            email: email,
            password: password
        }
    });

    saveToken(response.token);
    localStorage.setItem("userName", response.user.name);

    return response;
}


/* Signup — adjust field names if backend differs */

async function apiSignup(name, email, password) {

    return await apiFetch("/auth/signup", {
        method: "POST",
        body: {
            name: name,
            email: email,
            password: password
        }
    });
}


/* =====================================================
   CHAT API (AI assistant)
===================================================== */

async function apiChat(message) {

    return await apiFetch("/assistant/chat", {
        method: "POST",
        body: {
            message: message,
            user_id: 0
        }
    });
}
