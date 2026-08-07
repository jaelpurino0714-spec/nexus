class TopicModel {
  final String id;
  final String termId;
  final String title;
  final String? description;
  final String? icon;
  final int orderIndex;

  TopicModel({
    required this.id,
    required this.termId,
    required this.title,
    this.description,
    this.icon,
    required this.orderIndex,
  });

  factory TopicModel.fromJson(Map<String, dynamic> json) {
    return TopicModel(
      id: json['id'] as String,
      termId: json['term_id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      icon: json['icon'] as String?,
      orderIndex: (json['order_no'] ?? json['order_index'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'term_id': termId,
      'title': title,
      'description': description,
      'icon': icon,
      'order_index': orderIndex,
    };
  }
}
