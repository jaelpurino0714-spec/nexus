package com.nexus.science.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.nexus.science.model.*

@Database(
    entities = [UserEntity::class, QuestionEntity::class, QuizResultEntity::class, AchievementEntity::class],
    version = 1,
    exportSchema = false
)
abstract class NexusDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun questionDao(): QuestionDao
    abstract fun quizResultDao(): QuizResultDao
    abstract fun achievementDao(): AchievementDao

    companion object {
        @Volatile
        private var INSTANCE: NexusDatabase? = null

        fun getDatabase(context: Context): NexusDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    NexusDatabase::class.java,
                    "nexus_science_db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
