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
    @Default(0) num price,
    @Default('USD') String priceCurrency,
    String? registrationLink,
    DateTime? registrationStartDate,
    DateTime? registrationEndDate,
    @Default(true) bool isActive,
  }) = _Event;

  factory Event.fromJson(Map<String, dynamic> json) => _$EventFromJson(json);
}
