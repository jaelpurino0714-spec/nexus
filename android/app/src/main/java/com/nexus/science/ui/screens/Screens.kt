package com.nexus.science.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nexus.science.model.AchievementEntity
import com.nexus.science.model.UserEntity
import com.nexus.science.ui.theme.*
import com.nexus.science.viewmodel.QuizState

// ---------------- 1. LOGIN SELECTION SCREEN ----------------
@Composable
fun LoginSelectionScreen(
    onSelectStudent: () -> Unit,
    onSelectTeacher: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgMain)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = BgCard),
            elevation = CardDefaults.cardElevation(8.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterAlignment
            ) {
                Text(text = "👋", fontSize = 48.sp)
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "Welcome to NEXUS",
                    style = MaterialTheme.typography.titleLarge,
                    color = PrimaryPurpleDark
                )
                Text(
                    text = "How do you want to log in?",
                    style = MaterialTheme.typography.bodyMedium
                )
                Spacer(modifier = Modifier.height(24.dp))

                // Student Role Card
                Surface(
                    onClick = onSelectStudent,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    color = BgSubtle
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "👨‍🎓", fontSize = 32.sp)
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Student", fontWeight = FontWeight.Bold, color = PrimaryPurpleDark)
                            Text("Join warm-ups, earn badges", fontSize = 12.sp, color = TextMuted)
                        }
                        Icon(Icons.Default.ArrowForward, contentDescription = null, tint = PrimaryPurple)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Teacher Role Card
                Surface(
                    onClick = onSelectTeacher,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    color = BgSubtle
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "👩‍🏫", fontSize = 32.sp)
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Teacher", fontWeight = FontWeight.Bold, color = PrimaryPurpleDark)
                            Text("Manage quizzes & view analytics", fontSize = 12.sp, color = TextMuted)
                        }
                        Icon(Icons.Default.ArrowForward, contentDescription = null, tint = PrimaryPurple)
                    }
                }
            }
        }
    }
}

// ---------------- 2. STUDENT PROFILE SETUP SCREEN ----------------
@Composable
fun StudentSetupScreen(
    onSaveProfile: (String, String, String, String?) -> Unit,
    onBack: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var gradeLevel by remember { mutableStateOf("Grade 10") }
    var section by remember { mutableStateOf("") }
    var photoSelected by remember { mutableStateOf(false) }

    // PRD Validation Rule: Profile Photo, Name, Grade Level, Section required
    val isFormComplete = name.isNotBlank() && gradeLevel.isNotBlank() && section.isNotBlank() && photoSelected

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgMain)
            .padding(24.dp)
    ) {
        IconButton(onClick = onBack) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = PrimaryPurpleDark)
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = BgCard),
            elevation = CardDefaults.cardElevation(8.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Student Profile Setup",
                    style = MaterialTheme.typography.titleLarge,
                    color = PrimaryPurpleDark
                )
                Spacer(modifier = Modifier.height(16.dp))

                // Top Center Circular Profile Photo with Camera Badge
                Box(
                    modifier = Modifier
                        .size(90.dp)
                        .clip(CircleShape)
                        .background(AccentLight)
                        .border(3.dp, PrimaryPurple, CircleShape)
                        .clickable { photoSelected = true },
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = if (photoSelected) "👤" else "📷", fontSize = 36.sp)
                }
                Text(
                    text = if (photoSelected) "Photo Added" else "Tap icon to upload photo",
                    fontSize = 12.sp,
                    color = TextMuted,
                    modifier = Modifier.padding(top = 4.dp)
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Name *") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = gradeLevel,
                    onValueChange = { gradeLevel = it },
                    label = { Text("Grade Level *") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = section,
                    onValueChange = { section = it },
                    label = { Text("Section *") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Warning message when form is incomplete
                if (!isFormComplete) {
                    Text(
                        text = "Identification Requirements Unsatisfied",
                        color = ErrorRed,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }

                Button(
                    onClick = {
                        if (isFormComplete) {
                            onSaveProfile(name, gradeLevel, section, "avatar_preset")
                        }
                    },
                    enabled = isFormComplete,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryPurple)
                ) {
                    Text("Save Profile", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// ---------------- 2B. TEACHER LOGIN SCREEN ----------------
@Composable
fun TeacherLoginScreen(
    onLoginTeacher: (String, String) -> Boolean,
    errorMessage: String?,
    onBack: () -> Unit,
    onSuccess: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var passcode by remember { mutableStateOf("") }
    var localError by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgMain)
            .padding(24.dp)
    ) {
        IconButton(onClick = onBack) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = PrimaryPurpleDark)
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = BgCard),
            elevation = CardDefaults.cardElevation(8.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = "🔐", fontSize = 48.sp)
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "Teacher Access",
                    style = MaterialTheme.typography.titleLarge,
                    color = PrimaryPurpleDark
                )
                Text(
                    text = "Enter your name & teacher passcode",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextMuted
                )
                Spacer(modifier = Modifier.height(20.dp))

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Teacher Name") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = passcode,
                    onValueChange = { passcode = it },
                    label = { Text("Teacher Passcode") },
                    visualTransformation = PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth()
                )

                val activeError = localError ?: errorMessage
                if (activeError != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = activeError,
                        color = ErrorRed,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = {
                        val success = onLoginTeacher(name, passcode)
                        if (success) {
                            onSuccess()
                        } else {
                            localError = if (name.isBlank()) "Please enter teacher name" else "Invalid Passcode"
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryPurple)
                ) {
                    Text("Enter Teacher Portal", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun TeacherDashboardScreen(
    teacherName: String,
    onLogout: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgMain)
            .padding(24.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(text = "👩‍🏫 Teacher Portal", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = PrimaryPurpleDark)
                Text(text = "Welcome, $teacherName", fontSize = 14.sp, color = TextMuted)
            }
            Button(
                onClick = onLogout,
                colors = ButtonDefaults.buttonColors(containerColor = ErrorRed)
            ) {
                Text("Log Out", color = Color.White)
            }
        }
        Spacer(modifier = Modifier.height(24.dp))
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = BgCard)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text("Classroom Analytics & Quizzes", fontWeight = FontWeight.Bold, color = PrimaryPurpleDark)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Manage DepEd Science warmth-ups and export classroom data.", fontSize = 13.sp, color = TextMuted)
            }
        }
    }
}

// ---------------- 3. HOME NAVIGATION HUB ----------------
@Composable
fun HomeScreen(
    user: UserEntity?,
    onPlay: () -> Unit,
    onCustomPlay: () -> Unit,
    onSettings: () -> Unit,
    onLogout: () -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgMain)
            .padding(16.dp)
    ) {
        // Welcome Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = PrimaryPurpleDark)
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(modifier = Modifier.size(48.dp), shape = CircleShape, color = AccentLight) {
                    Box(contentAlignment = Alignment.Center) {
                        Text("👤", fontSize = 24.sp)
                    }
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Welcome, ${user?.name ?: "Student"}!",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                    Text(
                        text = "${user?.gradeLevel ?: "Grade 10"} • Section ${user?.section ?: "A"}",
                        color = Color.White.copy(alpha = 0.8f),
                        fontSize = 12.sp
                    )
                }
                IconButton(onClick = onLogout) {
                    Icon(Icons.Default.ExitToApp, contentDescription = "Log Out", tint = Color.White)
                }
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        // PRD Requirement: Navigation buttons at bottom of Home screen
        Column(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Play Button: Light Green, White text
            Button(
                onClick = onPlay,
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PlayGreen)
            ) {
                Text("🎮 Play", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }

            // Custom Play Button: Purple, White text
            Button(
                onClick = onCustomPlay,
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = CustomPurple)
            ) {
                Text("✨ Custom Play", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }

            // Settings Button: Gray, White text
            Button(
                onClick = onSettings,
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = SettingsGray)
            ) {
                Text("⚙️ Settings", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
        }
    }
}

// ---------------- 4. PLAY UI (TERM SELECTION) ----------------
@Composable
fun PlayTermScreen(
    onSelectTerm: (Int) -> Unit,
    onBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgSubtle)
            .padding(16.dp)
    ) {
        IconButton(onClick = onBack) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = PrimaryPurpleDark)
        }

        Text(
            text = "Select Your Science Challenge",
            style = MaterialTheme.typography.titleLarge,
            color = PrimaryPurpleDark,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp)
        )

        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            // Term 1: Red Button, White text
            Button(
                onClick = { onSelectTerm(1) },
                modifier = Modifier.fillMaxWidth().height(90.dp),
                shape = RoundedCornerShape(20.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Term1Red)
            ) {
                Column(horizontalAlignment = Alignment.Start, modifier = Modifier.fillMaxWidth()) {
                    Text("TERM 1", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text("Earth Science & Plate Tectonics", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                }
            }

            // Term 2: Blue Button, White text
            Button(
                onClick = { onSelectTerm(2) },
                modifier = Modifier.fillMaxWidth().height(90.dp),
                shape = RoundedCornerShape(20.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Term2Blue)
            ) {
                Column(horizontalAlignment = Alignment.Start, modifier = Modifier.fillMaxWidth()) {
                    Text("TERM 2", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text("Biology & EM Spectrum", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                }
            }

            // Term 3: Yellow Button, White text
            Button(
                onClick = { onSelectTerm(3) },
                modifier = Modifier.fillMaxWidth().height(90.dp),
                shape = RoundedCornerShape(20.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Term3Yellow)
            ) {
                Column(horizontalAlignment = Alignment.Start, modifier = Modifier.fillMaxWidth()) {
                    Text("TERM 3", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text("Chemistry & Physics Mechanics", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// ---------------- 5. 4-COLUMN ACHIEVEMENTS GRID SCREEN ----------------
@Composable
fun AchievementsGridScreen(
    achievements: List<AchievementEntity>,
    onBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgMain)
            .padding(16.dp)
    ) {
        IconButton(onClick = onBack) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = PrimaryPurpleDark)
        }

        Text(
            text = "Achievements & Badges",
            style = MaterialTheme.typography.titleLarge,
            color = PrimaryPurpleDark,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // PRD Requirement: 4-Column Grid, Icon top, Name/Desc below
        LazyVerticalGrid(
            columns = GridCells.Fixed(4),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(achievements) { ach ->
                Card(
                    modifier = Modifier.height(100.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (ach.isUnlocked) Color.White else Color(0xFFE0E0E0)
                    )
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize().padding(4.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(text = "🏆", fontSize = 24.sp)
                        Text(
                            text = ach.name,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center,
                            maxLines = 2
                        )
                    }
                }
            }
        }
    }
}
