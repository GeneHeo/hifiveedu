
let currentLang = 'en';

// Replace these with your actual admin emails
const ADMIN_EMAILS = ['hifsteamedu@gmail.com', 'geneheo21@gmail.com'];
let currentUser = null;

// In-memory "database" for demo
let homeworkDB = {}; // { 'studentEmail': [{ desc, date }] }

// Handle Google Sign-In (GSI)
window.handleCredentialResponse = function(response) {
    const decoded = parseJwt(response.credential);
    currentUser = { email: decoded.email, name: decoded.name, picture: decoded.picture };
    document.getElementById('user-info').innerText = `Logged in as: ${currentUser.email}`;
    document.getElementById('logout-btn').style.display = 'inline-block';
    showRoleBasedUI(currentUser.email);
}

// JWT parser for Google ID token
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Logout
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('logout-btn')) {
        document.getElementById('logout-btn').onclick = function() {
            google.accounts.id.disableAutoSelect();
            currentUser = null;
            window.location.reload();
        }
    }
});

// Show UI based on role
function showRoleBasedUI(email) {
    const isAdmin = ADMIN_EMAILS.includes(email);
    if (isAdmin) {
        document.getElementById('admin-section').style.display = 'block';
        document.getElementById('student-section').style.display = 'none';
        loadAdminPanel();
    } else {
        document.getElementById('admin-section').style.display = 'none';
        document.getElementById('student-section').style.display = 'block';
        loadStudentPanel(email);
    }
}

// Admin: Assign homework
if (document.getElementById('assign-btn')) {
    document.getElementById('assign-btn').onclick = function() {
        const studentEmail = document.getElementById('student-email').value.trim();
        const desc = document.getElementById('homework-desc').value.trim();
        const date = document.getElementById('homework-date').value;
        if (!studentEmail || !desc || !date) {
            alert('All fields are required!');
            return;
        }
        if (!homeworkDB[studentEmail]) homeworkDB[studentEmail] = [];
        homeworkDB[studentEmail].push({ desc, date });
        loadAdminPanel();
    }
}

// Admin: Load student/homework table
function loadAdminPanel() {
    const tbody = document.querySelector('#student-list tbody');
    tbody.innerHTML = '';
    Object.entries(homeworkDB).forEach(([student, hwArr]) => {
        const thisWeek = hwArr.filter(hw => isThisWeek(hw.date));
        const hwList = thisWeek.map(hw => `<li>${hw.desc} (${hw.date})</li>`).join('');
        tbody.innerHTML += `<tr><td>${student}</td><td><ul>${hwList}</ul></td></tr>`;
    });
}

// Student: Load their homework
function loadStudentPanel(email) {
    const ul = document.getElementById('student-homework');
    ul.innerHTML = '';
    const hwArr = (homeworkDB[email] || []).filter(hw => isThisWeek(hw.date));
    if (hwArr.length === 0) ul.innerHTML = '<li>No homework assigned for this week.</li>';
    hwArr.forEach(hw => ul.innerHTML += `<li>${hw.desc} (${hw.date})</li>`);
}

// Helper: Check if a date is in this week
function isThisWeek(dateStr) {
    const now = new Date();
    const d = new Date(dateStr);
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return d >= weekStart && d <= weekEnd;
}

// ---- Google Drive Picker Integration Placeholder ----
if (document.getElementById('drive-admin-btn')) {
    document.getElementById('drive-admin-btn').onclick = function() {
        alert('Google Drive integration coming soon!');
        // Here, implement Google Picker API for admins
    }
}
if (document.getElementById('drive-student-btn')) {
    document.getElementById('drive-student-btn').onclick = function() {
        alert('Google Drive integration coming soon!');
        // Here, implement Google Picker API for students
    }
}

const demoBooks = [
  {
    title: {en: "AI Revolution", ko: "AI 혁명"},
    author: {en: "John Kim", ko: "김존"},
    description: {
      en: "A comprehensive look at artificial intelligence.",
      ko: "인공지능에 대한 종합적 고찰"
    }
  },
  {
    title: {en: "Learning Python", ko: "파이썬 배우기"},
    author: {en: "Jane Park", ko: "박제인"},
    description: {
      en: "Beginner to advanced Python programming.",
      ko: "파이썬 초급부터 고급까지"
    }
  },
  {
    title: {en: "Deep Learning Magic", ko: "딥러닝 매직"},
    author: {en: "Sung Lee", ko: "이성"},
    description: {
      en: "Hands-on deep learning projects.",
      ko: "실전 딥러닝 프로젝트"
    }
  },
  {
    title: {en: "Korean Education Trends", ko: "한국 교육 트렌드"},
    author: {en: "Min Cho", ko: "조민"},
    description: {
      en: "Insights into modern Korean education.",
      ko: "현대 한국 교육의 인사이트"
    }
  }
];

function renderRecommendations(list) {
  const recommendSection = document.getElementById('recommend-section');
  if (!recommendSection) return;
  recommendSection.innerHTML = `
    <h4 style="grid-column:1/-1;font-size:1.2rem;font-weight:bold;color:#3086e9;">
      ${currentLang === 'ko' ? '추천 도서' : 'Recommended Books'}
    </h4>
    ${list.map(b =>
      `<div class="book-card">
        <h3>${b.title[currentLang]}</h3>
        <p>${b.author[currentLang]}</p>
        <small>${b.description[currentLang]}</small>
      </div>`
    ).join('')}
  `;
}

function filterBooks(keyword) {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return demoBooks;
  return demoBooks.filter(
    b =>
      b.title[currentLang].toLowerCase().includes(kw)
      || b.author[currentLang].toLowerCase().includes(kw)
      || b.description[currentLang].toLowerCase().includes(kw)
  );
}

function setLangUI() {
  // Menu bilingual
  document.getElementById('menu-purchase').textContent = currentLang === 'ko' ? '구매' : 'Purchase';
  document.getElementById('menu-student-manage').textContent = currentLang === 'ko' ? '학생 관리' : 'Student Manage';
  document.getElementById('menu-support').textContent = currentLang === 'ko' ? '고객지원' : 'Support';
  document.getElementById('menu-consulting').textContent = currentLang === 'ko' ? '상담' : 'Consulting';
  document.getElementById('menu-admission').textContent = currentLang === 'ko' ? '입학 안내' : 'Admission';

  // Hero
  document.getElementById('hero-title').textContent = currentLang === 'ko'
    ? '추천 도서' : 'Book Recommendation';
  document.getElementById('hero-desc').textContent = currentLang === 'ko'
    ? '추천 도서를 검색해보세요!' : 'Check out our top picks or search your next read below!';
  document.getElementById('search-input').placeholder = currentLang === 'ko'
    ? '추천 도서 검색...' : 'Search recommended books...';

  renderRecommendations(filterBooks(document.getElementById('search-input').value));
}

document.addEventListener('DOMContentLoaded', () => {
  // Language toggle
  const toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.value = currentLang;
    toggle.onchange = function() {
      currentLang = this.value;
      setLangUI();
    };
  }
  // Book search
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');
  if (searchBtn && searchInput) {
    searchBtn.onclick = function() {
      renderRecommendations(filterBooks(searchInput.value));
    };
    searchInput.addEventListener('input', function() {
      renderRecommendations(filterBooks(this.value));
    });
    searchInput.addEventListener('keypress', function(e){
      if(e.key==="Enter") searchBtn.click();
    });
  }
  setLangUI();
});
