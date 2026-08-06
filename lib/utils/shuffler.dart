import 'dart:math';

class Shuffler {
  static List<T> shuffleList<T>(List<T> items) {
    final copy = List<T>.from(items);
    copy.shuffle(Random());
    return copy;
  }
}
