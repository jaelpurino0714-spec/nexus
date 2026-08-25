import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/audio_provider.dart';

class SettingsModal extends ConsumerWidget {
  const SettingsModal({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final audioState = ref.watch(audioProvider);
    final audioNotifier = ref.read(audioProvider.notifier);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAlignment: CrossAlignment.start,
          children: [
            // Top Drag Handle
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Header Title
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF8B5CF6).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.settings, color: Color(0xFFA855F7), size: 24),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Settings & Audio',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // --- AUDIO & BACKGROUND MUSIC SECTION ---
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF8B5CF6).withOpacity(0.3)),
              ),
              child: Column(
                crossAlignment: CrossAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            audioState.isMuted
                                ? Icons.volume_off
                                : (audioState.volume > 0.5
                                    ? Icons.volume_up
                                    : Icons.volume_down),
                            color: const Color(0xFF38BDF8),
                            size: 22,
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'Background Music',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      // Mute Toggle Button
                      IconButton(
                        icon: Icon(
                          audioState.isMuted ? Icons.volume_off_outlined : Icons.volume_up_outlined,
                          color: audioState.isMuted ? Colors.redAccent : const Color(0xFF38BDF8),
                        ),
                        tooltip: audioState.isMuted ? 'Unmute' : 'Mute',
                        onPressed: () => audioNotifier.toggleMute(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Volume Slider
                  Row(
                    children: [
                      const Icon(Icons.volume_mute, color: Colors.white54, size: 18),
                      Expanded(
                        child: SliderTheme(
                          data: SliderThemeData(
                            activeTrackColor: const Color(0xFF8B5CF6),
                            inactiveTrackColor: Colors.white12,
                            thumbColor: const Color(0xFF38BDF8),
                            overlayColor: const Color(0xFF38BDF8).withOpacity(0.2),
                            trackHeight: 6,
                          ),
                          child: Slider(
                            value: audioState.volume,
                            min: 0.0,
                            max: 1.0,
                            divisions: 20,
                            label: '${(audioState.volume * 100).round()}%',
                            onChanged: (val) {
                              audioNotifier.setVolume(val);
                            },
                          ),
                        ),
                      ),
                      const Icon(Icons.volume_up, color: Colors.white70, size: 18),
                    ],
                  ),

                  // Volume Percentage Display
                  Center(
                    child: Text(
                      audioState.isMuted
                          ? 'Muted (0%)'
                          : 'Volume: ${(audioState.volume * 100).round()}%',
                      style: TextStyle(
                        color: audioState.isMuted ? Colors.redAccent : const Color(0xFFC084FC),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Close Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  backgroundColor: const Color(0xFF8B5CF6),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                onPressed: () => Navigator.pop(context),
                child: const Text(
                  'Done',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
