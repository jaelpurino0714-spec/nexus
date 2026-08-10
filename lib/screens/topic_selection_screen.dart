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

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAlignment.start,
              children: [
                // Top Warm-Up Banner matching user design
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF4C1D95), Color(0xFF6D28D9), Color(0xFF5B21B6)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF4C1D95).withOpacity(0.35),
                        blurRadius: 18,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              'TERM $termNum TOPICS WARM-UP',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.18),
                              borderRadius: BorderRadius.circular(30),
                              border: Border.all(color: Colors.white.withOpacity(0.3)),
                            ),
                            child: const Text(
                              '15 Questions Drill',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Comprehensive 15-question assessment across all lessons',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.85),
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Topics List
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: topics.length,
                  itemBuilder: (context, index) {
                    final topic = topics[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        leading: CircleAvatar(
                          backgroundColor: const Color(0xFFDDD6FE),
                          child: Text(
                            '${index + 1}',
                            style: const TextStyle(color: Color(0xFF5B21B6), fontWeight: FontWeight.bold),
                          ),
                        ),
                        title: Text(
                          topic.title,
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                        ),
                        subtitle: topic.description != null ? Text(topic.description!) : null,
                        trailing: const Icon(Icons.chevron_right, color: Color(0xFF6D28D9)),
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
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error loading topics: $err')),
      ),
    );
  }
}
