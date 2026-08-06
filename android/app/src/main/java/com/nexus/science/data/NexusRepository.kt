package com.nexus.science.data

import com.nexus.science.model.*
import kotlinx.coroutines.flow.Flow

class NexusRepository(private val db: NexusDatabase) {
    val userFlow: Flow<UserEntity?> = db.userDao().getUserFlow()
    val allResultsFlow: Flow<List<QuizResultEntity>> = db.quizResultDao().getAllResultsFlow()
    val achievementsFlow: Flow<List<AchievementEntity>> = db.achievementDao().getAllAchievementsFlow()

    suspend fun saveUser(user: UserEntity) = db.userDao().insertUser(user)

    suspend fun clearUserSession() = db.userDao().clearUserSession()

    suspend fun getQuestionsForTerm(term: Int): List<QuestionEntity> {
        val questions = db.questionDao().getQuestionsByTerm(term)
        if (questions.isEmpty()) {
            val defaultList = getDefaultQuestionsForTerm(term)
            db.questionDao().insertQuestions(defaultList)
            return defaultList
        }
        return questions
    }

    suspend fun saveQuizResult(result: QuizResultEntity) {
        db.quizResultDao().insertResult(result)
        
        // Update user stats
        val currentUser = db.userDao().getUser()
        if (currentUser != null) {
            val updatedUser = currentUser.copy(
                totalPoints = currentUser.totalPoints + result.pointsEarned,
                highestStreak = maxOf(currentUser.highestStreak, result.maxStreak)
            )
            db.userDao().insertUser(updatedUser)
        }
    }

    suspend fun insertCustomQuestion(question: QuestionEntity) {
        db.questionDao().insertQuestion(question)
    }

    suspend fun seedAchievementsIfEmpty() {
        val initialList = listOf(
            AchievementEntity("first_steps", "First Steps", "Complete your very first round", "open_book"),
            AchievementEntity("perfect_start", "Perfect Start", "Answer your first 5 questions correctly", "checkmark"),
            AchievementEntity("zero_mistakes", "Zero Mistakes", "Finish a round with 0 wrong answers", "shield"),
            AchievementEntity("rising_star", "Rising Star", "Reach 1,000 total points", "star"),
            AchievementEntity("nexus_champion", "Nexus Champion", "Reach 5,000 total points", "trophy"),
            AchievementEntity("curious_mind", "Curious Mind", "Try all 4 science topics once", "microscope"),
            AchievementEntity("science_grandmaster", "Science Grandmaster", "Unlock all topic badges", "crown"),
            AchievementEntity("early_bird", "Early Bird", "Play before 7:00 AM", "sunrise"),
            AchievementEntity("lightning_reflex", "Lightning Reflex", "Answer a question in under 2 seconds", "lightning"),
            AchievementEntity("quick_thinker", "Quick Thinker", "Answer 5 questions in under 3 seconds each", "runner"),
            AchievementEntity("lightning_tap", "Lightning Tap", "Maintain an average of under 4s per question", "finger_tap"),
            AchievementEntity("speedster", "Speedster", "Answer all 10 questions in under 60 seconds", "rocket"),
            AchievementEntity("blazing_fast", "Blazing Fast", "Finish a round in under 45 seconds", "tornado"),
            AchievementEntity("speed_champion", "Speed Champion", "Rank among the Top 5 fastest times this week", "speed_car")
        )
        db.achievementDao().insertAchievements(initialList)
    }

    suspend fun unlockAchievement(id: String) {
        db.achievementDao().unlockAchievement(id)
    }

    private fun getDefaultQuestionsForTerm(term: Int): List<QuestionEntity> {
        return when (term) {
            1 -> listOf(
                QuestionEntity("t1_1", 1, "Plate Tectonics", "Which boundary is formed when two tectonic plates move away from each other?", "Divergent Boundary", "Convergent Boundary", "Transform Fault", "Subduction Zone", 0),
                QuestionEntity("t1_2", 1, "Plate Tectonics", "What geological feature is formed when an oceanic plate subducts under a continental plate?", "Rift Valley", "Volcanic Arc", "Mid-Ocean Ridge", "Transform Fault", 1),
                QuestionEntity("t1_3", 1, "Earth's Interior", "Which seismic wave can travel through both solids and liquids?", "S-wave", "P-wave", "Love wave", "Rayleigh wave", 1),
                QuestionEntity("t1_4", 1, "Earth's Interior", "Liquid layer responsible for Earth's magnetic field:", "Inner Core", "Outer Core", "Asthenosphere", "Mantle", 1),
                QuestionEntity("t1_5", 1, "Plate Tectonics", "San Andreas Fault is an example of which boundary?", "Divergent", "Convergent", "Transform Fault", "Collision", 2)
            )
            2 -> listOf(
                QuestionEntity("t2_1", 2, "EM Spectrum", "Which EM wave has the shortest wavelength and highest frequency?", "Radio waves", "Microwaves", "Gamma rays", "UV rays", 2),
                QuestionEntity("t2_2", 2, "Nervous System", "Part of the brain controlling posture and voluntary muscle balance:", "Cerebrum", "Cerebellum", "Brainstem", "Hypothalamus", 1),
                QuestionEntity("t2_3", 2, "Endocrine System", "Known as the Master Gland of the human body:", "Thyroid", "Adrenal", "Pituitary Gland", "Pancreas", 2),
                QuestionEntity("t2_4", 2, "Reproductive System", "Where fertilization typically occurs in females:", "Uterus", "Ovary", "Fallopian Tube", "Cervix", 2),
                QuestionEntity("t2_5", 2, "Molecular Genetics", "In DNA structure, Adenine (A) always pairs with:", "Cytosine", "Guanine", "Thymine", "Uracil", 2)
            )
            else -> listOf(
                QuestionEntity("t3_1", 3, "Gas Laws", "Boyle's Law states pressure and volume are:", "Directly proportional", "Inversely proportional", "Equal", "Unrelated", 1),
                QuestionEntity("t3_2", 3, "Optics & Light", "Mirror type that produces virtual, upright, diminished images:", "Concave Mirror", "Convex Mirror", "Plane Mirror", "Parabolic Mirror", 1),
                QuestionEntity("t3_3", 3, "Chemical Reactions", "Law stating mass is neither created nor destroyed in a reaction:", "Definite Proportions", "Conservation of Mass", "Multiple Proportions", "Gay-Lussac's Law", 1),
                QuestionEntity("t3_4", 3, "Biomolecules", "Macromolecule that serves as primary immediate energy source:", "Proteins", "Lipids", "Carbohydrates", "Nucleic Acids", 2),
                QuestionEntity("t3_5", 3, "Electromagnetism", "Discovered electric current induces a magnetic field:", "Faraday", "Oersted", "Maxwell", "Hertz", 1)
            )
        }
    }
}
