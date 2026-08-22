import 'package:flutter/material.dart';

class MascotKeyTraitsCard extends StatelessWidget {
  const MascotKeyTraitsCard({super.key});

  static const List<Map<String, dynamic>> _traits = [
    {
      'icon': '⭐',
      'title': 'Friendly',
      'desc': 'Warm & approachable learning companion for students',
      'color': Color(0xFFF59E0B),
    },
    {
      'icon': '📖',
      'title': 'Smart',
      'desc': 'Packed with Grade 10 Science knowledge & terminology',
      'color': Color(0xFF3B82F6),
    },
    {
      'icon': '⚡',
      'title': 'Energetic',
      'desc': 'High-energy 3D animations and expressive reactions',
      'color': Color(0xFFEC4899),
    },
    {
      'icon': '❤️',
      'title': 'Motivating',
      'desc': 'Encourages daily study streaks and XP progression',
      'color': Color(0xFFEF4444),
    },
    {
      'icon': '⚛️',
      'title': 'Science-Inspired',
      'desc': 'Futuristic quantum atom emblem & DNA helix aura',
      'color': Color(0xFF06B6D4),
    },
    {
      'icon': '📈',
      'title': 'Evolves with Points',
      'desc': 'Transforms from Baby -> Student -> Scientist with XP',
      'color': Color(0xFFA855F7),
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF160B3A).withOpacity(0.92),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.35), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFA855F7).withOpacity(0.12),
            blurRadius: 16,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Column(
        crossAlignment: CrossAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFFA855F7).withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.psychology, color: Color(0xFFA855F7), size: 18),
              ),
              const SizedBox(width: 8),
              const Text(
                'KEY TRAITS',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _traits.length,
            separatorBuilder: (ctx, i) => const SizedBox(height: 10),
            itemBuilder: (ctx, idx) {
              final trait = _traits[idx];
              final traitColor = trait['color'] as Color;

              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: traitColor.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Container(
                      height: 34,
                      width: 34,
                      decoration: BoxDecoration(
                        color: traitColor.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Text(
                          trait['icon'],
                          style: const TextStyle(fontSize: 18),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAlignment: CrossAlignment.start,
                        children: [
                          Text(
                            trait['title'],
                            style: TextStyle(
                              color: traitColor,
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            trait['desc'],
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
