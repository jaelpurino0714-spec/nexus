/* ==========================================================================
   NEXUS TEACHER ANALYTICS & CUSTOM QUIZ BUILDER
   Renders performance summaries, class accuracy tables, custom quiz drafting & CSV export
   ========================================================================== */

const Analytics = {
  draftQuestions: [],

  switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    if (tabName === 'analytics') {
      document.getElementById('tabAnalyticsBtn').classList.add('active');
      document.getElementById('teacherAnalyticsTab').classList.add('active');
    } else {
      document.getElementById('tabCustomQuizBtn').classList.add('active');
      document.getElementById('teacherCustomQuizTab').classList.add('active');
    }
  },

  renderDashboard() {
    const student = DB.getStudentProfile();
    const results = DB.getQuizResults();

    document.getElementById('totalStudentsCount').textContent = student ? '1' : '0';
    document.getElementById('totalQuizzesTaken').textContent = results.length;

    let avgScore = 0;
    if (results.length > 0) {
      const sum = results.reduce((acc, r) => acc + (r.scorePct || 0), 0);
      avgScore = Math.round(sum / results.length);
    }
    document.getElementById('classAverageScore').textContent = `${avgScore}%`;

    const tableBody = document.getElementById('studentResultsTableBody');
    tableBody.innerHTML = '';

    if (!student) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#757575;">No student data available yet</td></tr>`;
      return;
    }

    const highestStreak = results.reduce((max, r) => Math.max(max, r.maxStreak || 0), student.streak || 0);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><b>${student.name}</b></td>
      <td>${student.section}</td>
      <td>${results.length} rounds</td>
      <td><span class="tag" style="background:${avgScore >= 50 ? '#4CAF50' : '#F44336'}">${avgScore}%</span></td>
      <td>🔥 ${highestStreak}</td>
    `;
    tableBody.appendChild(row);
  },

  addQuestionToDraft() {
    const prompt = document.getElementById('newQText').value.trim();
    const optA = document.getElementById('newQOptionA').value.trim();
    const optB = document.getElementById('newQOptionB').value.trim();
    const optC = document.getElementById('newQOptionC').value.trim();
    const optD = document.getElementById('newQOptionD').value.trim();
    const correct = parseInt(document.getElementById('correctOptionSelect').value);

    if (!prompt || !optA || !optB || !optC || !optD) {
      alert('Please fill out all question prompt and option fields.');
      return;
    }

    const qObj = {
      id: 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      question: prompt,
      options: [optA, optB, optC, optD],
      answer: correct,
      type: 'mc'
    };

    this.draftQuestions.push(qObj);

    // Clear inputs
    document.getElementById('newQText').value = '';
    document.getElementById('newQOptionA').value = '';
    document.getElementById('newQOptionB').value = '';
    document.getElementById('newQOptionC').value = '';
    document.getElementById('newQOptionD').value = '';

    this.renderDraftList();
  },

  renderDraftList() {
    document.getElementById('draftQCount').textContent = this.draftQuestions.length;
    const ul = document.getElementById('draftQuestionsUl');
    ul.innerHTML = '';

    this.draftQuestions.forEach((q, index) => {
      const li = document.createElement('li');
      li.innerHTML = `<b>Q${index+1}:</b> ${q.question} <i style="color:#673ab7;">(Ans: ${['A','B','C','D'][q.answer]})</i>`;
      ul.appendChild(li);
    });
  },

  saveCustomQuiz() {
    const title = document.getElementById('quizTitleInput').value.trim();
    const term = parseInt(document.getElementById('quizTermSelect').value);

    if (!title) {
      alert('Please enter a quiz title.');
      return;
    }

    if (this.draftQuestions.length === 0) {
      alert('Please add at least 1 question to the quiz.');
      return;
    }

    const quizObj = {
      id: 'quiz_' + Date.now(),
      title: title,
      term: term,
      questions: this.draftQuestions,
      createdAt: new Date().toISOString()
    };

    DB.saveCustomQuiz(quizObj);
    alert(`Custom Quiz "${title}" saved successfully for Term ${term}!`);

    this.draftQuestions = [];
    document.getElementById('quizTitleInput').value = '';
    this.renderDraftList();
  },

  exportCSV() {
    const student = DB.getStudentProfile();
    const results = DB.getQuizResults();

    if (!student && results.length === 0) {
      alert('No data available to export.');
      return;
    }

    let csv = 'Student Name,Grade Level,Section,Term,Mode,Score (%),Total Points,Correct Answers,Incorrect Answers,Max Streak,Timestamp\n';

    results.forEach(r => {
      csv += `"${student ? student.name : 'Anonymous'}","${student ? student.gradeLevel : '10'}","${student ? student.section : 'N/A'}",Term ${r.term},${r.mode},${r.scorePct}%,${r.scorePoints},${r.correctCount},${r.incorrectCount},${r.maxStreak},"${r.timestamp}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `NEXUS_Science_Warmup_Results_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
