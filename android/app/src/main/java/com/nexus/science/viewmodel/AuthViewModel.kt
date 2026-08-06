package com.nexus.science.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nexus.science.data.NexusRepository
import com.nexus.science.model.UserEntity
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class AuthViewModel(private val repository: NexusRepository) : ViewModel() {

    val currentUser = repository.userFlow

    private val _isTeacherLoggedIn = MutableStateFlow(false)
    val isTeacherLoggedIn: StateFlow<Boolean> = _isTeacherLoggedIn

    private val _teacherError = MutableStateFlow<String?>(null)
    val teacherError: StateFlow<String?> = _teacherError

    fun saveStudentProfile(name: String, grade: String, section: String, photoUri: String?) {
        viewModelScope.launch {
            val user = UserEntity(
                id = java.util.UUID.randomUUID().toString(),
                role = "student",
                name = name,
                gradeLevel = grade,
                section = section,
                photoUri = photoUri
            )
            repository.saveUser(user)
        }
    }

    fun loginTeacher(name: String, passcode: String): Boolean {
        if (name.isBlank()) {
            _teacherError.value = "Please enter teacher name"
            return false
        }
        if (passcode == "123456" || passcode == "NEXUS10") {
            _isTeacherLoggedIn.value = true
            _teacherError.value = null
            viewModelScope.launch {
                val teacherUser = UserEntity(
                    id = java.util.UUID.randomUUID().toString(),
                    role = "teacher",
                    name = name
                )
                repository.saveUser(teacherUser)
            }
            return true
        } else {
            _teacherError.value = "Invalid Passcode"
            return false
        }
    }

    fun logout() {
        viewModelScope.launch {
            _isTeacherLoggedIn.value = false
            repository.clearUserSession()
        }
    }

    fun logoutTeacher() {
        logout()
    }
}
