import 'topic_model.dart';

class TermModel {
  final String id;
  final String title;
  final int orderIndex;
  final List<TopicModel> topics;

  TermModel({
    required this.id,
    required this.title,
    required this.orderIndex,
    this.topics = const [],
  });

  factory TermModel.fromJson(Map<String, dynamic> json) {
    var rawTopics = json['topics'] as List?;
    List<TopicModel> topicsList = rawTopics != null
        ? rawTopics.map((t) => TopicModel.fromJson(t as Map<String, dynamic>)).toList()
        : [];

    return TermModel(
      id: json['id'] as String,
      title: json['title'] as String,
      orderIndex: (json['order_index'] as num?)?.toInt() ?? 0,
      topics: topicsList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'order_index': orderIndex,
      'topics': topics.map((t) => t.toJson()).toList(),
    };
  }
}
