import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class TermSelectionScreen extends StatelessWidget {
  const TermSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Term'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAlignment.stretch,
          children: [
            const Text(
              'Choose a Grade 10 Science Term',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            _buildTermCard(
              context,
              termNum: 1,
              title: 'Term 1',
              subtitle: 'Changes, Reactions, Equations & Homeostasis',
              color: Colors.deepOrange,
            ),
            const SizedBox(height: 16),
            _buildTermCard(
              context,
              termNum: 2,
              title: 'Term 2',
              subtitle: 'Ecosystems, Plate Tectonics & Climate',
              color: Colors.blueAccent,
            ),
            const SizedBox(height: 16),
            _buildTermCard(
              context,
              termNum: 3,
              title: 'Term 3',
              subtitle: 'Physics Mechanics & Electricity',
              color: Colors.amber.shade800,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTermCard(
    BuildContext context, {
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
          context.push('/student/topics', extra: {'termNum': termNum});
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
                        fontSize: 22,
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
