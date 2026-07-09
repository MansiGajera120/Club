import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

/// Application roles, mapped to the backend's string values.
enum UserRole {
  @JsonValue('parent')
  parent,
  @JsonValue('club_owner')
  clubOwner,
  @JsonValue('admin')
  admin,
}

/// Authenticated user profile returned by the API.
@freezed
abstract class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String name,
    required String email,
    required UserRole role,
    @Default(false) bool isEmailVerified,
    String? avatarUrl,
    String? provider,
    String? status,
    DateTime? createdAt,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}
