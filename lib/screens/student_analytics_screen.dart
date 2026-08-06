import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../providers/analytics_provider.dart';

class StudentAnalyticsScreen extends ConsumerWidget {
  const StudentAnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final studentId = authState.profile?.id ?? '';
    final analyticsAsync = ref.watch(studentAnalyticsProvider(studentId));

    return Scaffold(
      appBar: AppBar(title: const Text('My Learning Analytics')),
      body: analyticsAsync.when(
        data: (stats) => SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(child: _metricCard('Average Score', '${stats.averageScore.toStringAsFixed(1)}%', Colors.purple)),
                  const SizedBox(width: 12),
                  Expanded(child: _metricCard('Streak', '🔥 ${stats.currentStreak}', Colors.deepOrange)),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _metricCard('Highest Score', '${stats.highestScore.toStringAsFixed(1)}%', Colors.green)),
                  const SizedBox(width: 12),
                  Expanded(child: _metricCard('Accuracy', '${stats.accuracyPercentage.toStringAsFixed(1)}%', Colors.blue)),
                ],
              ),
              const SizedBox(height: 24),

              const Text('Quiz History', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: stats.quizHistory.length,
                itemBuilder: (context, idx) {
                  final attempt = stats.quizHistory[idx];
                  return Card(
                    child: ListTile(
                      title: Text('Topic: ${attempt.topicId}'),
                      subtitle: Text('${attempt.createdAt.toLocal()}'.split('.')[0]),
                      trailing: Text(
                        '${attempt.percentage.toStringAsFixed(0)}%',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: attempt.percentage >= 75 ? Colors.green : Colors.red,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error loading analytics: $err')),
      ),
    );
  }

  Widget _metricCard(String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAlignment: CrossAlignment.start,
        children: [
          Text(title, style: TextStyle(color: color, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}
