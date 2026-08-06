import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../providers/topic_provider.dart';

class StudentHomeScreen extends ConsumerWidget {
  const StudentHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final termsAsync = ref.watch(termsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('Welcome, ${authState.profile?.name ?? "Student"}!'),
        actions: [
          IconButton(
            icon: const Icon(Icons.analytics),
            onPressed: () => context.push('/student/analytics'),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
      body: termsAsync.when(
        data: (terms) => ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: terms.length,
          itemBuilder: (context, index) {
            final term = terms[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 16),
              child: ExpansionTile(
                title: Text(
                  term.title,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                children: term.topics.map((topic) {
                  return ListTile(
                    leading: Text(topic.icon ?? '🧪', style: const TextStyle(fontSize: 24)),
                    title: Text(topic.title),
                    subtitle: Text(topic.description ?? ''),
                    trailing: ElevatedButton(
                      onPressed: () {
                        context.push('/student/quiz', extra: {
                          'topicId': topic.id,
                          'quizType': 'practice',
                        });
                      },
                      child: const Text('Start Quiz'),
                    ),
                  );
                }).toList(),
              ),
            );
          },
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error loading topics: $err')),
      ),
    );
  }
}
