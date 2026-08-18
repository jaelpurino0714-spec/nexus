import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../providers/analytics_provider.dart';
import '../utils/csv_exporter.dart';

class TeacherDashboardScreen extends ConsumerWidget {
  const TeacherDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
            crossAxisAlignment: CrossAlignment.start,
            children: [
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
        crossAlignment: CrossAlignment.start,
        children: [
          Text(label, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(val, style: TextStyle(fontSize: 28, fontWeight: FontWeight.extrabold, color: color)),
        ],
      ),
    );
  }
}
