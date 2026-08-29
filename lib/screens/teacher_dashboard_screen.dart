import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../providers/analytics_provider.dart';
import '../providers/audio_provider.dart';
import '../utils/csv_exporter.dart';

class TeacherDashboardScreen extends ConsumerStatefulWidget {
  const TeacherDashboardScreen({super.key});

  @override
  ConsumerState<TeacherDashboardScreen> createState() => _TeacherDashboardScreenState();
}

class _TeacherDashboardScreenState extends ConsumerState<TeacherDashboardScreen> {
  @override
  void initState() {
    super.initState();
    // Instantly trigger looping background music zero-delay
    ref.read(audioProvider.notifier).playBgm();
  }

  @override
  Widget build(BuildContext context) {
    final analyticsAsync = ref.watch(teacherAnalyticsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Teacher Analytics Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.download),
            tooltip: 'Export CSV',
            onPressed: () {
              final stats = analyticsAsync.value;
              if (stats != null) {
                final csv = CsvExporter.exportTeacherAnalyticsToCsv(stats);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('CSV Exported (${csv.length} bytes)')),
                );
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
      body: analyticsAsync.when(
        data: (stats) => SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Teacher Quick Actions & Student Features (Except Custom)
              Container(
                margin: const EdgeInsets.only(bottom: 20),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF4F46E5), Color(0xFF3730A3)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '👩‍🏫 Teacher Navigation & Tools',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        ActionChip(
                          avatar: const Text('👑'),
                          label: const Text('Host Game'),
                          onPressed: () => context.push('/student/host-quiz'),
                        ),
                        ActionChip(
                          avatar: const Text('🔑'),
                          label: const Text('Join Game'),
                          onPressed: () => context.push('/student/join-quiz'),
                        ),
                        ActionChip(
                          avatar: const Text('🎮'),
                          label: const Text('Play Science Quiz'),
                          onPressed: () => context.push('/student/terms'),
                        ),
                        ActionChip(
                          avatar: const Text('⚙️'),
                          label: const Text('Settings'),
                          onPressed: () => context.push('/student/analytics'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              Row(
                children: [
                  Expanded(child: _card('Class Average', '${stats.classAverage.toStringAsFixed(1)}%', Colors.blue)),
                  const SizedBox(width: 12),
                  Expanded(child: _card('Total Students', '${stats.totalStudents}', Colors.purple)),
                ],
              ),
              const SizedBox(height: 24),

              const Text('Most Missed Questions', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              stats.mostMissedQuestions.isEmpty
                  ? const Text('No quiz data available yet.')
                  : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: stats.mostMissedQuestions.length,
                      itemBuilder: (context, idx) {
                        final q = stats.mostMissedQuestions[idx];
                        return Card(
                          child: ListTile(
                            title: Text(q.question),
                            subtitle: Text('Missed ${q.timesMissed} of ${q.totalAttempts} attempts'),
                            trailing: Text(
                              '${q.missRate.toStringAsFixed(0)}% Missed',
                              style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                            ),
                          ),
                        );
                      },
                    ),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error loading teacher dashboard: $err')),
      ),
    );
  }

  Widget _card(String label, String val, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(val, style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: color)),
        ],
      ),
    );
  }
}
