import 'package:freezed_annotation/freezed_annotation.dart';

import 'user_model.dart';

part 'auth_response.freezed.dart';
part 'auth_response.g.dart';

/// Payload returned by login/signup/refresh/social endpoints:
/// `{ user, accessToken, refreshToken }`.
@freezed
abstract class AuthResponse with _$AuthResponse {
  const factory AuthResponse({
    required UserModel user,
    required String accessToken,
    required String refreshToken,
  }) = _AuthResponse;

  factory AuthResponse.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseFromJson(json);
}
