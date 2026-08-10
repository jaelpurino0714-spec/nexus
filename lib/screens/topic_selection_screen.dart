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
              final String descText = topic.description ?? 'Comprehensive 15-question assessment across all lessons';

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: InkWell(
                  onTap: () {
                    context.push('/student/test-mode', extra: {
                      'termNum': termNum,
                      'topicTitle': topic.title,
                      'topicId': topic.id,
                    });
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF4C1D95), Color(0xFF6D28D9), Color(0xFF5B21B6)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF4C1D95).withOpacity(0.22),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAlignment.center,
                          children: [
                            Expanded(
                              child: Text(
                                topic.title,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  height: 1.3,
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.18),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Colors.white.withOpacity(0.3)),
                              ),
                              child: const Text(
                                '15 Questions Drill',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          descText,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.85),
                            fontSize: 12,
                            fontWeight: FontWeight.w400,
                            height: 1.35,
                          ),
                        ),
                      ],
                    ),
                  ),
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
