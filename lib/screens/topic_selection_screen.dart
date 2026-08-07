import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/topic_provider.dart';

class TopicSelectionScreen extends ConsumerWidget {
  final String? termId;
  final int termNum;
  final String? termTitle;

  const TopicSelectionScreen({
    super.key,
    this.termId,
    required this.termNum,
    this.termTitle,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final termsAsync = ref.watch(termsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(termTitle ?? 'Term $termNum Topics'),
      ),
      body: termsAsync.when(
        data: (terms) {
          final matchedTerm = terms.firstWhere(
            (t) => (termId != null && t.id == termId) || t.orderIndex == termNum,
            orElse: () => terms.isNotEmpty ? terms.first : throw Exception('Term not found'),
          );

          final topics = matchedTerm.topics;
          if (topics.isEmpty) {
            return const Center(child: Text('No topics found for this term.'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: topics.length,
            itemBuilder: (context, index) {
              final topic = topics[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Colors.indigo.shade100,
                    child: Text(
                      '${index + 1}',
                      style: TextStyle(color: Colors.indigo.shade800, fontWeight: FontWeight.bold),
                    ),
                  ),
                  title: Text(
                    topic.title,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  subtitle: topic.description != null ? Text(topic.description!) : null,
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    context.push('/student/test-mode', extra: {
                      'termNum': termNum,
                      'topicTitle': topic.title,
                      'topicId': topic.id,
                    });
                  },
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error loading topics: $err')),
      ),
    );
  }
}
