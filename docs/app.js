const apiBase = 'http://localhost:3000';

let token = localStorage.getItem('token');

// Show toast
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastBody = document.getElementById('toastBody');
    toastBody.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// User login
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${apiBase}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        token = data.token;
        showToast('Logged in successfully!');
        showApp();
    } else {
        showToast('Login failed');
    }
}

// User registration
async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${apiBase}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (res.ok) {
        showToast('User registered successfully! You can now login.');
    } else {
        const error = await res.json();
        showToast('Registration failed: ' + error.message);
    }
}

// Show app if logged in
function showApp() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('appSection').style.display = 'block';
    loadSummaries();
}

// Logout
function logout() {
    localStorage.removeItem('token');
    token = null;
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('appSection').style.display = 'none';
    showToast('Logged out');
}

// Submit paragraph to summarize
async function submitParagraph() {
    const text = document.getElementById('inputText').value;

    // Minimum length validation (we’ll improve this in step 2)
    if (text.trim().length < 30) {
        showToast('Please enter at least 30 characters.');
        return;
    }

    // Show spinner
    document.getElementById('loadingSpinner').classList.remove('hidden');

    const res = await fetch(`${apiBase}/summarize`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
    });

    // Hide spinner
    document.getElementById('loadingSpinner').classList.add('hidden');


    if (res.ok) {
        const data = await res.json();
        document.getElementById('summaryResult').textContent = data.summaryText;
        showToast('Summarization successful!');
        loadSummaries();
    } else {
        const error = await res.json();
        showToast('Error: ' + (error.message || 'Summarization failed'));
    }
}


// Load previous summaries
async function loadSummaries() {
    const res = await fetch(`${apiBase}/summaries`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
        showToast('Failed to load summaries');
        return;
    }

    const summaries = await res.json();
    const list = document.getElementById('summaryList');
    list.innerHTML = '';
    summaries.forEach(s => {
        const li = document.createElement('li');
        li.className = "list-group-item";
        li.innerHTML = `
    <div class="p-3 bg-gray-50 rounded shadow-sm">
        <strong class="text-gray-700">Original:</strong> ${s.originalText}<br>
        <strong class="text-gray-700">Summary:</strong> ${s.summaryText}<br>
        <button class="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            onclick="deleteSummary('${s.id}')">Delete</button>
    </div>
`;
        list.appendChild(li);
    });
}

async function deleteSummary(id) {
    const res = await fetch(`${apiBase}/summaries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
        showToast('Summary deleted');
        loadSummaries();
    } else {
        showToast('Failed to delete summary');
    }
}

// Auto-show app if already logged in
if (token) {
    showApp();
}
