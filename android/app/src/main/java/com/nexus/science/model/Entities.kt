package com.nexus.science.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "profiles")
data class UserEntity(
    @PrimaryKey val id: String = java.util.UUID.randomUUID().toString(),
    val role: String = "student",
    val name: String,
    val gradeLevel: String? = null,
    val section: String? = null,
    val photoUri: String? = null,
    val deviceId: String? = null,
    val totalPoints: Int = 0,
    val highestStreak: Int = 0,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "questions")
data class QuestionEntity(
    @PrimaryKey val id: String,
    val term: Int,
    val topic: String,
    val questionText: String,
    val optionA: String,
    val optionB: String,
    val optionC: String,
    val optionD: String,
    val correctIndex: Int,
    val type: String = "mc", // "mc", "tf", "id"
    val isCustom: Boolean = false
)

@Entity(tableName = "quiz_results")
data class QuizResultEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val term: Int,
    val mode: String,
    val scorePercentage: Int,
    val pointsEarned: Int,
    val correctCount: Int,
    val incorrectCount: Int,
    val maxStreak: Int,
    val totalTimeSeconds: Int,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "achievements")
data class AchievementEntity(
    @PrimaryKey val id: String,
    val name: String,
    val description: String,
    val iconName: String,
    val isUnlocked: Boolean = false,
    val unlockedAt: Long? = null
)
