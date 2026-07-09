import 'package:freezed_annotation/freezed_annotation.dart';

part 'event_model.freezed.dart';
part 'event_model.g.dart';

/// A club event as returned by the API.
@freezed
abstract class Event with _$Event {
  const factory Event({
    required String id,
    required String club,
    required String title,
    String? description,
    String? coverImage,
    String? location,
    required DateTime startDate,
    DateTime? endDate,
    String? registrationLink,
    @Default(true) bool isActive,
  }) = _Event;

  factory Event.fromJson(Map<String, dynamic> json) => _$EventFromJson(json);
}
