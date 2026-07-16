import 'package:dio/dio.dart';

import '../core/network/api_endpoints.dart';
import '../core/network/dio_client.dart';
import '../models/auth_response.dart';
import '../models/user_model.dart';

/// Data layer for authentication. Wraps the API in typed methods and converts
/// Dio failures into the app's [AppException]s (via [DioClient.mapError]) so the
/// controller/UI never depend on transport details.
class AuthRepository {
  final Dio _dio;

  AuthRepository(this._dio);

  Future<T> _guard<T>(Future<T> Function() request) async {
    try {
      return await request();
    } on DioException catch (e) {
      throw DioClient.mapError(e);
    }
  }

  AuthResponse _authFromResponse(Response response) =>
      AuthResponse.fromJson(response.data['data'] as Map<String, dynamic>);

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) {
    return _guard(() async {
      final res = await _dio.post(
        ApiEndpoints.login,
        data: {'email': email, 'password': password},
      );
      return _authFromResponse(res);
    });
  }

  Future<AuthResponse> signup({
    required String name,
    required String email,
    required String password,
    required String role,
  }) {
    return _guard(() async {
      final res = await _dio.post(
        ApiEndpoints.signup,
        data: {
          'name': name,
          'email': email,
          'password': password,
          'role': role,
        },
      );
      return _authFromResponse(res);
    });
  }

  Future<AuthResponse> googleLogin(String idToken) {
    return _guard(() async {
      final res = await _dio.post(
        ApiEndpoints.googleLogin,
        data: {'idToken': idToken},
      );
      return _authFromResponse(res);
    });
  }

  Future<AuthResponse> appleLogin({
    required String identityToken,
    String? name,
  }) {
    return _guard(() async {
      final res = await _dio.post(
        ApiEndpoints.appleLogin,
        data: {'identityToken': identityToken, 'name': ?name},
      );
      return _authFromResponse(res);
    });
  }

  Future<UserModel> getMe() {
    return _guard(() async {
      final res = await _dio.get(ApiEndpoints.me);
      return UserModel.fromJson(res.data['data']['user'] as Map<String, dynamic>);
    });
  }

  Future<void> logout(String? refreshToken) {
    return _guard(() async {
      await _dio.post(
        ApiEndpoints.logout,
        data: {'refreshToken': refreshToken},
      );
    });
  }

  Future<void> forgotPassword(String email) {
    return _guard(() async {
      await _dio.post(ApiEndpoints.forgotPassword, data: {'email': email});
    });
  }

  /// Complete a password reset with the 6-digit OTP emailed to [email].
  Future<void> resetPassword({
    required String email,
    required String otp,
    required String password,
  }) {
    return _guard(() async {
      await _dio.post(
        ApiEndpoints.resetPassword,
        data: {'email': email, 'code': otp, 'password': password},
      );
    });
  }

  Future<void> verifyEmail(String token) {
    return _guard(() async {
      await _dio.post(ApiEndpoints.verifyEmail, data: {'token': token});
    });
  }

  /// Confirm the signup email address with the 6-digit OTP the user received.
  Future<void> verifyOtp({required String email, required String code}) {
    return _guard(() async {
      await _dio.post(
        ApiEndpoints.verifyOtp,
        data: {'email': email, 'code': code},
      );
    });
  }

  Future<void> resendVerification(String email) {
    return _guard(() async {
      await _dio.post(ApiEndpoints.resendVerification, data: {'email': email});
    });
  }
}
