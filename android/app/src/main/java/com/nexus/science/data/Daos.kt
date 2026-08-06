package com.nexus.science.data

import androidx.room.*
import com.nexus.science.model.*
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    @Query("SELECT * FROM profiles LIMIT 1")
    fun getUserFlow(): Flow<UserEntity?>

    @Query("SELECT * FROM profiles LIMIT 1")
    suspend fun getUser(): UserEntity?

    @Query("SELECT * FROM profiles WHERE id = :id LIMIT 1")
    suspend fun getUserById(id: String): UserEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)

    @Query("DELETE FROM profiles")
    suspend fun clearUserSession()
}

@Dao
interface QuestionDao {
    @Query("SELECT * FROM questions WHERE term = :term")
    suspend fun getQuestionsByTerm(term: Int): List<QuestionEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuestions(questions: List<QuestionEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuestion(question: QuestionEntity)
}

@Dao
interface QuizResultDao {
    @Query("SELECT * FROM quiz_results ORDER BY timestamp DESC")
    fun getAllResultsFlow(): Flow<List<QuizResultEntity>>

    @Query("SELECT * FROM quiz_results ORDER BY timestamp DESC")
    suspend fun getAllResults(): List<QuizResultEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertResult(result: QuizResultEntity)
}

@Dao
interface AchievementDao {
    @Query("SELECT * FROM achievements")
    fun getAllAchievementsFlow(): Flow<List<AchievementEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAchievements(achievements: List<AchievementEntity>)

    @Query("UPDATE achievements SET isUnlocked = 1, unlockedAt = :timestamp WHERE id = :id")
    suspend fun unlockAchievement(id: String, timestamp: Long = System.currentTimeMillis())
}
