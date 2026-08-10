import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/topic_provider.dart';

class TermSelectionScreen extends ConsumerWidget {
  const TermSelectionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final termsAsync = ref.watch(termsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Term'),
      ),
      body: termsAsync.when(
        data: (terms) {
          if (terms.isEmpty) {
            return const Center(child: Text('No terms found in database.'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: terms.length,
            itemBuilder: (context, index) {
              final term = terms[index];
              final colors = [
                const Color(0xFFEF4444), // Term 1: Red
                const Color(0xFFF59E0B), // Term 2: Yellow
                const Color(0xFF10B981), // Term 3: Green
                Colors.purple,
              ];
              final cardColor = colors[index % colors.length];

              return Padding(
                padding: const EdgeInsets.only(bottom: 16.0),
                child: _buildTermCard(
                  context,
                  termId: term.id,
                  termNum: term.orderIndex > 0 ? term.orderIndex : index + 1,
                  title: term.title,
                  subtitle: '${term.topics.length} Topics',
                  color: cardColor,
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error loading terms: $err')),
      ),
    );
  }

  Widget _buildTermCard(
    BuildContext context, {
    required String termId,
    required int termNum,
    required String title,
    required String subtitle,
    required Color color,
  }) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: color,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          context.push('/student/topics', extra: {
            'termId': termId,
            'termNum': termNum,
            'termTitle': title,
          });
        },
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios, color: Colors.white),
            ],
          ),
        ),
      ),
    );
  }
}
