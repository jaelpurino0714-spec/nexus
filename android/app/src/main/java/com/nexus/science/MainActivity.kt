package com.nexus.science

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.nexus.science.data.NexusDatabase
import com.nexus.science.data.NexusRepository
import com.nexus.science.ui.screens.*
import com.nexus.science.ui.theme.NEXUSTheme
import com.nexus.science.viewmodel.AuthViewModel
import com.nexus.science.viewmodel.QuizViewModel

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val database = NexusDatabase.getDatabase(this)
        val repository = NexusRepository(database)

        val authViewModel = AuthViewModel(repository)
        val quizViewModel = QuizViewModel(repository)

        setContent {
            NEXUSTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    val userState by authViewModel.currentUser.collectAsState(initial = null)

                    val startDestination = when {
                        userState?.role == "teacher" -> "teacher_dashboard"
                        userState != null -> "home"
                        else -> "login_selection"
                    }

                    NavHost(navController = navController, startDestination = startDestination) {
                        composable("login_selection") {
                            LoginSelectionScreen(
                                onSelectStudent = {
                                    if (userState != null && userState?.role == "student") {
                                        navController.navigate("home")
                                    } else {
                                        navController.navigate("student_setup")
                                    }
                                },
                                onSelectTeacher = { navController.navigate("teacher_login") }
                            )
                        }

                        composable("student_setup") {
                            StudentSetupScreen(
                                onSaveProfile = { name, grade, section, photo ->
                                    authViewModel.saveStudentProfile(name, grade, section, photo)
                                    navController.navigate("home") {
                                        popUpTo("login_selection") { inclusive = true }
                                    }
                                },
                                onBack = { navController.popBackStack() }
                            )
                        }

                        composable("teacher_login") {
                            val teacherError by authViewModel.teacherError.collectAsState()
                            TeacherLoginScreen(
                                onLoginTeacher = { name, passcode ->
                                    authViewModel.loginTeacher(name, passcode)
                                },
                                errorMessage = teacherError,
                                onBack = { navController.popBackStack() },
                                onSuccess = {
                                    navController.navigate("teacher_dashboard") {
                                        popUpTo("login_selection") { inclusive = true }
                                    }
                                }
                            )
                        }

                        composable("teacher_dashboard") {
                            TeacherDashboardScreen(
                                teacherName = userState?.name ?: "Teacher",
                                onLogout = {
                                    authViewModel.logout()
                                    navController.navigate("login_selection") {
                                        popUpTo(0) { inclusive = true }
                                    }
                                }
                            )
                        }

                        composable("home") {
                            HomeScreen(
                                user = userState,
                                onPlay = { navController.navigate("play_term") },
                                onCustomPlay = { quizViewModel.startQuiz(1, "custom"); navController.navigate("gameplay") },
                                onSettings = { navController.navigate("achievements") },
                                onLogout = {
                                    authViewModel.logout()
                                    navController.navigate("login_selection") {
                                        popUpTo(0) { inclusive = true }
                                    }
                                }
                            )
                        }

                        composable("play_term") {
                            PlayTermScreen(
                                onSelectTerm = { term ->
                                    quizViewModel.startQuiz(term, "pre-test")
                                    navController.navigate("gameplay")
                                },
                                onBack = { navController.popBackStack() }
                            )
                        }

                        composable("achievements") {
                            val list by quizViewModel.achievements.collectAsState(initial = emptyList())
                            AchievementsGridScreen(
                                achievements = list,
                                onBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }
}
