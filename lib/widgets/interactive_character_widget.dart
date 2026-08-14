import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/character_provider.dart';
import '../services/character_service.dart';

class InteractiveCharacterWidget extends ConsumerStatefulWidget {
  const InteractiveCharacterWidget({super.key});

  @override
  ConsumerState<InteractiveCharacterWidget> createState() => _InteractiveCharacterWidgetState();
}

class _InteractiveCharacterWidgetState extends ConsumerState<InteractiveCharacterWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _idleController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _idleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(begin: 0.98, end: 1.03).animate(
      CurvedAnimation(parent: _idleController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _idleController.dispose();
    super.dispose();
  }

  Color _parseHexColor(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    final charState = ref.watch(characterProvider);
    final profile = charState.profile;

    final stage = charState.stageConfig;
    final int xp = profile?.characterXp ?? 0;
    final int streak = profile?.currentStreak ?? 0;
    final String? gender = profile?.characterGender;

    final String assetPath = CharacterService.instance.getStageAssetPath(stage.id, gender);
    final Color stageColor = _parseHexColor(stage.colorHex);

    // Calculate level progress percentage
    double pct = 1.0;
    String xpProgressText = '$xp XP';
    String nextEvolutionText = '🏆 FINAL STAGE';

    if (stage.nextXP < 999999) {
      final prevMin = stage.minXP;
      final currentLevelXP = xp - prevMin;
      final neededXP = stage.nextXP - prevMin;
      pct = (currentLevelXP / neededXP).clamp(0.0, 1.0);
      xpProgressText = '$xp / ${stage.nextXP} XP';
      final diff = (stage.nextXP - xp).clamp(0, 999999);
      final nextStageTitle = CharacterService.stages[stage.stage].title;
      nextEvolutionText = '$diff XP until $nextStageTitle';
    }

    final genderBadge = (stage.id != 'baby' && gender != null && gender.isNotEmpty)
        ? (gender == 'female' ? ' 👧' : ' 👦')
        : '';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: stageColor.withOpacity(0.4), width: 2),
        boxShadow: [
          BoxShadow(
            color: stageColor.withOpacity(0.12),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header Row: Character Title & Stage Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'MY COMPANION',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.2,
                  color: Colors.grey,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: stageColor,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: stageColor.withOpacity(0.3),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  '${stage.icon} ${stage.title}$genderBadge',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.extrabold,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Speech Bubble
          AnimatedOpacity(
            duration: const Duration(milliseconds: 300),
            opacity: charState.showSpeechBubble ? 1.0 : 0.0,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFF3E8FF),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFD8B4FE)),
              ),
              child: Text(
                charState.speechMessage,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF6B21A8),
                ),
              ),
            ),
          ),

          // Quote Label Container (Character artwork floats on Home screen)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12.0),
            child: Text(
              '"${stage.defaultQuote}"',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontStyle: FontStyle.italic,
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: stageColor,
              ),
            ),
          ),

          // Streak & XP Badges Row
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // 🔥 Streak Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFFF6B6B), Color(0xFFFF8E53)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.deepOrange.withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('🔥', style: TextStyle(fontSize: 16)),
                    const SizedBox(width: 6),
                    Text(
                      '$streak DAY STREAK',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),

              // ⭐ XP Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF08A),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFFACC15)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('⭐', style: TextStyle(fontSize: 14)),
                    const SizedBox(width: 6),
                    Text(
                      '$xp XP',
                      style: const TextStyle(
                        color: Color(0xFF854D0E),
                        fontWeight: FontWeight.w900,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Progress Bar Container
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: pct,
              minHeight: 12,
              backgroundColor: Colors.grey[200],
              valueColor: AlwaysStoppedAnimation<Color>(stageColor),
            ),
          ),
          const SizedBox(height: 8),

          // Sub-text Progress Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                xpProgressText,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.black54,
                ),
              ),
              Text(
                nextEvolutionText,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.extrabold,
                  color: stageColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
