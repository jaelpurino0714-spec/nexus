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

    fun logout() {
        viewModelScope.launch {
            repository.clearUserSession()
        }
    }
}
