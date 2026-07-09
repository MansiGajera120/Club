import 'package:dio/dio.dart';

import '../core/network/api_endpoints.dart';
import '../core/network/dio_client.dart';
import '../models/user_model.dart';

/// Data layer for the current user's profile.
class UserRepository {
  final Dio _dio;

  UserRepository(this._dio);

  Future<T> _guard<T>(Future<T> Function() request) async {
    try {
      return await request();
    } on DioException catch (e) {
      throw DioClient.mapError(e);
    }
  }

  Future<UserModel> updateProfile({required String name}) {
    return _guard(() async {
      final res = await _dio.patch(ApiEndpoints.me, data: {'name': name});
      return UserModel.fromJson(res.data['data']['user'] as Map<String, dynamic>);
    });
  }

  Future<UserModel> uploadAvatar(String filePath) {
    return _guard(() async {
      final form = FormData.fromMap({
        'avatar': await MultipartFile.fromFile(filePath),
      });
      final res = await _dio.post('${ApiEndpoints.me}/avatar', data: form);
      return UserModel.fromJson(res.data['data']['user'] as Map<String, dynamic>);
    });
  }
}
