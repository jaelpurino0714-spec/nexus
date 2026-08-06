import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/term_model.dart';
import '../repositories/topic_repository.dart';

final topicRepositoryProvider = Provider<TopicRepository>((ref) {
  return TopicRepositoryImpl();
});

final termsProvider = FutureProvider<List<TermModel>>((ref) async {
  final repo = ref.watch(topicRepositoryProvider);
  return await repo.getTermsWithTopics();
});
