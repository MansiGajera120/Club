import 'package:dio/dio.dart';

import '../core/network/api_endpoints.dart';
import '../core/network/dio_client.dart';
import '../core/network/paginated.dart';
import '../models/club_model.dart';

/// Data layer for favorites (parent only).
class FavoriteRepository {
  final Dio _dio;

  FavoriteRepository(this._dio);

  Future<T> _guard<T>(Future<T> Function() request) async {
    try {
      return await request();
    } on DioException catch (e) {
      throw DioClient.mapError(e);
    }
  }

  Future<Paginated<Club>> list({int page = 1, int limit = 20}) {
    return _guard(() async {
      final res = await _dio.get(
        ApiEndpoints.favorites,
        queryParameters: {'page': page, 'limit': limit},
      );
      final list = (res.data['data']['clubs'] as List)
          .map((e) => Club.fromJson(e as Map<String, dynamic>))
          .toList();
      final meta = res.data['meta'] != null
          ? PageMeta.fromJson(res.data['meta'] as Map<String, dynamic>)
          : PageMeta.empty;
      return Paginated(items: list, meta: meta);
    });
  }

  Future<void> add(String clubId) {
    return _guard(() async {
      await _dio.post('${ApiEndpoints.favorites}/$clubId');
    });
  }

  Future<void> remove(String clubId) {
    return _guard(() async {
      await _dio.delete('${ApiEndpoints.favorites}/$clubId');
    });
  }
}
