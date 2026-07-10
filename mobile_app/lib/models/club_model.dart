import 'package:freezed_annotation/freezed_annotation.dart';

part 'club_model.freezed.dart';
part 'club_model.g.dart';

/// Contact / social links for a club (parents act on these).
@freezed
abstract class ClubContact with _$ClubContact {
  const factory ClubContact({
    String? phone,
    String? email,
    String? website,
    String? instagram,
    String? tiktok,
  }) = _ClubContact;

  factory ClubContact.fromJson(Map<String, dynamic> json) =>
      _$ClubContactFromJson(json);
}

/// A sports club as returned by the API (list-item and detail shapes share this
/// model; detail-only fields are nullable).
@freezed
abstract class Club with _$Club {
  const factory Club({
    required String id,
    required String name,
    String? description,
    String? sport,
    @Default(<String>[]) List<String> services,
    String? city,
    String? address,
    @Default('mixed') String gender,
    @Default(0) int ageMin,
    @Default(100) int ageMax,
    @Default(0) num price,
    @Default('INR') String priceCurrency,
    String? logo,
    @Default(<String>[]) List<String> gallery,
    ClubContact? contact,
    String? registrationLink,
    @Default('pending') String status,
    String? rejectionReason,
    @Default(false) bool isFeatured,
    @Default(0) int favoritesCount,
    @Default(false) bool isFavorite,
    DateTime? createdAt,
  }) = _Club;

  factory Club.fromJson(Map<String, dynamic> json) => _$ClubFromJson(json);
}
