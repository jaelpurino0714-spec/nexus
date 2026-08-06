package com.nexus.science.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nexus.science.data.NexusRepository
import com.nexus.science.model.QuestionEntity
import com.nexus.science.model.QuizResultEntity
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class QuizState(
    val currentTerm: Int = 1,
    val mode: String = "pre-test",
    val questions: List<QuestionEntity> = emptyList(),
    val currentIndex: Int = 0,
    val timeRemainingSec: Int = 20,
    val correctCount: Int = 0,
    val incorrectCount: Int = 0,
    val currentStreak: Int = 0,
    val maxStreak: Int = 0,
    val scorePoints: Int = 0,
    val isQuizFinished: Boolean = false,
    val feedbackMessage: String? = null,
    val isFeedbackSuccess: Boolean = true
)

class QuizViewModel(private val repository: NexusRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(QuizState())
    val uiState: StateFlow<QuizState> = _uiState

    val allResults = repository.allResultsFlow
    val achievements = repository.achievementsFlow

    private var timerJob: Job? = null
    private var questionStartTime: Long = 0

    init {
        viewModelScope.launch {
            repository.seedAchievementsIfEmpty()
        }
    }

    fun startQuiz(term: Int, mode: String) {
        viewModelScope.launch {
            val list = repository.getQuestionsForTerm(term).shuffled().take(15)
            _uiState.value = QuizState(
                currentTerm = term,
                mode = mode,
                questions = list,
                currentIndex = 0,
                isQuizFinished = false
            )
            loadQuestion()
        }
    }

    private fun loadQuestion() {
        timerJob?.cancel()
        val state = _uiState.value
        if (state.currentIndex >= state.questions.size) {
            finishQuiz()
            return
        }

        _uiState.value = state.copy(
            timeRemainingSec = 20,
            feedbackMessage = null
        )
        questionStartTime = System.currentTimeMillis()

        timerJob = viewModelScope.launch {
            while (_uiState.value.timeRemainingSec > 0) {
                delay(1000)
                _uiState.value = _uiState.value.copy(
                    timeRemainingSec = _uiState.value.timeRemainingSec - 1
                )
            }
            onTimeOut()
        }
    }

    fun submitAnswer(selectedIndex: Int) {
        timerJob?.cancel()
        val state = _uiState.value
        val currentQ = state.questions.getOrNull(state.currentIndex) ?: return
        val isCorrect = (selectedIndex == currentQ.correctIndex)

        var newCorrect = state.correctCount
        var newIncorrect = state.incorrectCount
        var newStreak = state.currentStreak
        var newMaxStreak = state.maxStreak
        var newPoints = state.scorePoints

        if (isCorrect) {
            newCorrect++
            newStreak++
            if (newStreak > newMaxStreak) newMaxStreak = newStreak

            val multiplier = when {
                newStreak >= 5 -> 2.0
                newStreak >= 3 -> 1.5
                newStreak >= 2 -> 1.2
                else -> 1.0
            }
            val earned = ((100 + state.timeRemainingSec * 10) * multiplier).toInt()
            newPoints += earned

            _uiState.value = state.copy(
                correctCount = newCorrect,
                currentStreak = newStreak,
                maxStreak = newMaxStreak,
                scorePoints = newPoints,
                feedbackMessage = "Correct! +$earned pts",
                isFeedbackSuccess = true
            )
        } else {
            newIncorrect++
            newStreak = 0
            _uiState.value = state.copy(
                incorrectCount = newIncorrect,
                currentStreak = 0,
                feedbackMessage = "Incorrect!",
                isFeedbackSuccess = false
            )
        }

        viewModelScope.launch {
            delay(1200)
            _uiState.value = _uiState.value.copy(
                currentIndex = _uiState.value.currentIndex + 1
            )
            loadQuestion()
        }
    }

    private fun onTimeOut() {
        val state = _uiState.value
        _uiState.value = state.copy(
            incorrectCount = state.incorrectCount + 1,
            currentStreak = 0,
            feedbackMessage = "Time's Up!",
            isFeedbackSuccess = false
        )
        viewModelScope.launch {
            delay(1200)
            _uiState.value = _uiState.value.copy(
                currentIndex = _uiState.value.currentIndex + 1
            )
            loadQuestion()
        }
    }

    private fun finishQuiz() {
        timerJob?.cancel()
        val state = _uiState.value
        val totalQ = state.questions.size
        val percentage = if (totalQ > 0) (state.correctCount * 100) / totalQ else 0

        val result = QuizResultEntity(
            term = state.currentTerm,
            mode = state.mode,
            scorePercentage = percentage,
            pointsEarned = state.scorePoints,
            correctCount = state.correctCount,
            incorrectCount = state.incorrectCount,
            maxStreak = state.maxStreak,
            totalTimeSeconds = totalQ * 20 - state.timeRemainingSec
        )

        viewModelScope.launch {
            repository.saveQuizResult(result)
            checkAchievements(result)
            _uiState.value = state.copy(isQuizFinished = true)
        }
    }

    private suspend fun checkAchievements(result: QuizResultEntity) {
        repository.unlockAchievement("first_steps")
        if (result.maxStreak >= 5) repository.unlockAchievement("perfect_start")
        if (result.incorrectCount == 0 && result.correctCount >= 5) repository.unlockAchievement("zero_mistakes")
    }
}
