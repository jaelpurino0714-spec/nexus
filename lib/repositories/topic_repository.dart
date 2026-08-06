import '../models/term_model.dart';
import '../models/topic_model.dart';
import '../services/supabase_service.dart';

abstract class TopicRepository {
  Future<List<TermModel>> getTermsWithTopics();
  Future<void> addTerm(String title, int orderIndex);
  Future<void> addTopic(String termId, String title, String description, String icon, int orderIndex);
}

class TopicRepositoryImpl implements TopicRepository {
  final _client = SupabaseService.instance.client;

  @override
  Future<List<TermModel>> getTermsWithTopics() async {
    final response = await _client
        .from('terms')
        .select('*, topics(*)')
        .order('order_index', ascending: true);

    return (response as List).map((t) => TermModel.fromJson(t)).toList();
  }

  @override
  Future<void> addTerm(String title, int orderIndex) async {
    await _client.from('terms').insert({'title': title, 'order_index': orderIndex});
  }

  @override
  Future<void> addTopic(String termId, String title, String description, String icon, int orderIndex) async {
    await _client.from('topics').insert({
      'term_id': termId,
      'title': title,
      'description': description,
      'icon': icon,
      'order_index': orderIndex,
    });
  }
}
