import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

const Map<int, List<String>> termTopicsMap = {
  1: [
    'Physical vs. Chemical Change',
    'Chemical Reactions',
    'Acids, Bases, and Salts',
    'Chemical Equations',
    'Balancing Chemical Equations',
    'Rates of Reactions',
    'Homeostasis',
    'Mechanisms of Evolution',
  ],
  2: [
    'Ecosystem\'s Carrying Capacity and Population Growth',
    'Biotechnology',
    'Plate Tectonics',
    'Global Climate',
    'Global Interactions (ENSO)',
    'Global and Local Sustainability',
  ],
  3: [
    'Projectile Motion',
    'Momentum and Collisions',
    'Large-Scale Generation and Distribution of Electricity',
    'Renewable and Non-Renewable Energy Sources',
  ],
};

class TopicSelectionScreen extends StatelessWidget {
  final int termNum;

  const TopicSelectionScreen({super.key, required this.termNum});

  @override
  Widget build(BuildContext context) {
    final topics = termTopicsMap[termNum] ?? [];

    return Scaffold(
      appBar: AppBar(
        title: Text('Term $termNum Topics'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAlignment.stretch,
          children: [
            Text(
              'Select Topic for Term $termNum',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.builder(
                itemCount: topics.length,
                itemBuilder: (context, index) {
                  final topicTitle = topics[index];
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
                        topicTitle,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        context.push('/student/test-mode', extra: {
                          'termNum': termNum,
                          'topicTitle': topicTitle,
                          'topicId': 'topic_${termNum}_${index + 1}',
                        });
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
