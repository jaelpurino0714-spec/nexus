import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/character_provider.dart';
import '../services/character_service.dart';

class OutfitSelectionModal extends ConsumerStatefulWidget {
  const OutfitSelectionModal({super.key});

  @override
  ConsumerState<OutfitSelectionModal> createState() => _OutfitSelectionModalState();
}

class _OutfitSelectionModalState extends ConsumerState<OutfitSelectionModal> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final charState = ref.watch(characterProvider);
    final profile = charState.profile;
    final currentOutfit = charState.characterOutfit;
    final currentStage = charState.stageConfig.stage;
    final int coins = profile?.coins ?? 50;
    final List<String> unlockedOutfits = profile?.unlockedOutfits ?? const ['default'];

    final String assetPath = CharacterService.instance.getStageAssetPath(
      charState.stageConfig.id,
      profile?.characterGender,
    );

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      child: Container(
        constraints: const BoxConstraints(maxHeight: 620, maxWidth: 460),
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAlignment: CrossAlignment.stretch,
          children: [
            // 1. Header Row (Title, Coin Pill, Close X)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Text('👕', style: TextStyle(fontSize: 22)),
                    SizedBox(width: 8),
                    Text(
                      'Pet Outfits Shop',
                      style: TextStyle(
                        fontSize: 19,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF4C1D95),
                      ),
                    ),
                  ],
                ),

                Row(
                  children: [
                    // Coin Counter Pill
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF08A),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFFACC15), width: 1.5),
                      ),
                      child: Row(
                        children: [
                          const Text('🪙', style: TextStyle(fontSize: 14)),
                          const SizedBox(width: 4),
                          Text(
                            '$coins',
                            style: const TextStyle(
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF854D0E),
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),
                    IconButton(
                      icon: const Icon(Icons.close, size: 22),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),

            // 2. Character Live Outfit Preview Container
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFF3E8FF),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFDDD6FE)),
              ),
              child: Row(
                children: [
                  Container(
                    height: 60,
                    width: 60,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                    ),
                    padding: const EdgeInsets.all(4),
                    child: Image.asset(
                      assetPath,
                      fit: BoxFit.contain,
                      errorBuilder: (ctx, err, stack) => Center(
                        child: Text(
                          charState.stageConfig.icon,
                          style: const TextStyle(fontSize: 32),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAlignment: CrossAlignment.start,
                      children: [
                        Text(
                          'Equipped: ${CharacterService.outfits.firstWhere((o) => o.id == currentOutfit, orElse: () => CharacterService.outfits.first).name}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 14,
                            color: Color(0xFF5B21B6),
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Earn Science Coins by answering quiz questions correctly!',
                          style: TextStyle(fontSize: 11, color: Colors.black54),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // 3. Tab Bar (My Wardrobe / Outfit Shop)
            Container(
              height: 42,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(14),
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: const Color(0xFF673AB7),
                ),
                labelColor: Colors.white,
                unselectedLabelColor: Colors.black54,
                labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                tabs: const [
                  Tab(text: '🎒 My Wardrobe'),
                  Tab(text: '🛍️ Outfit Shop'),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // 4. Tab Bar View Content
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  // --- TAB 1: MY WARDROBE ---
                  ListView(
                    shrinkWrap: true,
                    children: CharacterService.outfits.map((outfit) {
                      final bool isUnlockedByStage = currentStage >= outfit.requiredStage;
                      final bool isUnlockedByPurchase = unlockedOutfits.contains(outfit.id);
                      final bool isOwned = isUnlockedByStage || isUnlockedByPurchase;
                      final bool isEquipped = currentOutfit == outfit.id;

                      if (!isOwned) return const SizedBox.shrink();

                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        decoration: BoxDecoration(
                          color: isEquipped ? const Color(0xFFF0FDF4) : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isEquipped ? const Color(0xFF22C55E) : Colors.grey[300]!,
                            width: isEquipped ? 2 : 1,
                          ),
                        ),
                        child: ListTile(
                          leading: Text(outfit.icon, style: const TextStyle(fontSize: 28)),
                          title: Text(
                            outfit.name,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          subtitle: Text(outfit.description, style: const TextStyle(fontSize: 12)),
                          trailing: isEquipped
                              ? const ContainerBadge(label: 'Equipped', color: Color(0xFF22C55E))
                              : ElevatedButton(
                                  onPressed: () {
                                    ref.read(characterProvider.notifier).selectOutfit(outfit.id);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text('Equipped ${outfit.name}!')),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF673AB7),
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                  child: const Text('Equip'),
                                ),
                        ),
                      );
                    }).toList(),
                  ),

                  // --- TAB 2: OUTFIT SHOP ---
                  ListView(
                    shrinkWrap: true,
                    children: CharacterService.outfits.map((outfit) {
                      final bool isUnlockedByStage = currentStage >= outfit.requiredStage;
                      final bool isUnlockedByPurchase = unlockedOutfits.contains(outfit.id);
                      final bool isOwned = isUnlockedByStage || isUnlockedByPurchase;
                      final bool isEquipped = currentOutfit == outfit.id;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        decoration: BoxDecoration(
                          color: isEquipped
                              ? const Color(0xFFF0FDF4)
                              : (isOwned ? const Color(0xFFFAF5FF) : Colors.white),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isEquipped
                                ? const Color(0xFF22C55E)
                                : (isOwned ? const Color(0xFFC084FC) : Colors.grey[300]!),
                            width: isEquipped ? 2 : 1,
                          ),
                        ),
                        child: ListTile(
                          leading: Text(outfit.icon, style: const TextStyle(fontSize: 28)),
                          title: Row(
                            children: [
                              Text(outfit.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              if (outfit.priceCoins > 0 && !isOwned) ...[
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFEF08A),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    '🪙 ${outfit.priceCoins}',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.extrabold,
                                      color: Color(0xFF854D0E),
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                          subtitle: Text(
                            isOwned
                                ? outfit.description
                                : '${outfit.description} (Requires Stage ${outfit.requiredStage} or 🪙 ${outfit.priceCoins})',
                            style: const TextStyle(fontSize: 12),
                          ),
                          trailing: isEquipped
                              ? const ContainerBadge(label: 'Active', color: Color(0xFF22C55E))
                              : (isOwned
                                  ? OutlinedButton(
                                      onPressed: () {
                                        ref.read(characterProvider.notifier).selectOutfit(outfit.id);
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(content: Text('Equipped ${outfit.name}!')),
                                        );
                                      },
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: const Color(0xFF673AB7),
                                        side: const BorderSide(color: Color(0xFF673AB7)),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      ),
                                      child: const Text('Equip'),
                                    )
                                  : ElevatedButton(
                                      onPressed: () async {
                                        final success = await ref
                                            .read(characterProvider.notifier)
                                            .buyOutfit(outfit.id);
                                        if (success) {
                                          if (mounted) {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(content: Text('🎉 Purchased & Equipped ${outfit.name}!')),
                                            );
                                          }
                                        } else {
                                          if (mounted) {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              const SnackBar(
                                                content: Text('❌ Not enough Science Coins! Play quizzes to earn more.'),
                                                backgroundColor: Colors.redAccent,
                                              ),
                                            );
                                          }
                                        }
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFFD97706),
                                        foregroundColor: Colors.white,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      ),
                                      child: Text('Buy 🪙${outfit.priceCoins}'),
                                    )),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ContainerBadge extends StatelessWidget {
  final String label;
  final Color color;

  const ContainerBadge({super.key, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12),
      ),
    );
  }
}

