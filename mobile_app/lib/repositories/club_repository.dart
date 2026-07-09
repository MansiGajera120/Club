import 'package:dio/dio.dart';

import '../core/network/api_endpoints.dart';
import '../core/network/dio_client.dart';
import '../core/network/paginated.dart';
import '../models/club_filter.dart';
import '../models/club_model.dart';

/// Data layer for clubs. Wraps the API and maps failures to typed exceptions.
class ClubRepository {
  final Dio _dio;

  ClubRepository(this._dio);

  Future<T> _guard<T>(Future<T> Function() request) async {
    try {
      return await request();
    } on DioException catch (e) {
      throw DioClient.mapError(e);
    }
  }

  Paginated<Club> _parseList(Response res) {
    final data = res.data['data'] as Map<String, dynamic>;
    final list = (data['clubs'] as List)
        .map((e) => Club.fromJson(e as Map<String, dynamic>))
        .toList();
    final meta = res.data['meta'] != null
        ? PageMeta.fromJson(res.data['meta'] as Map<String, dynamic>)
        : PageMeta.empty;
    return Paginated(items: list, meta: meta);
  }

  /// Public browse/search/filter with pagination.
  Future<Paginated<Club>> listClubs(
    ClubFilter filter, {
    int page = 1,
    int limit = 20,
  }) {
    return _guard(() async {
      final res = await _dio.get(
        ApiEndpoints.clubs,
        queryParameters: filter.toQuery(page: page, limit: limit),
      );
      return _parseList(res);
    });
  }

  /// Featured clubs for the home screen.
  Future<List<Club>> featuredClubs({int limit = 10}) {
    return _guard(() async {
      final res = await _dio.get(
        ApiEndpoints.clubs,
        queryParameters: const ClubFilter(featured: true)
            .toQuery(page: 1, limit: limit),
      );
      return _parseList(res).items;
    });
  }

  Future<Club> getClub(String id) {
    return _guard(() async {
      final res = await _dio.get(ApiEndpoints.club(id));
      return Club.fromJson(res.data['data']['club'] as Map<String, dynamic>);
    });
  }

  /// Clubs owned by the current user (any status).
  Future<List<Club>> myClubs() {
    return _guard(() async {
      final res = await _dio.get('${ApiEndpoints.clubs}/me');
      return (res.data['data']['clubs'] as List)
          .map((e) => Club.fromJson(e as Map<String, dynamic>))
          .toList();
    });
  }

  Future<Club> createClub(Map<String, dynamic> body) {
    return _guard(() async {
      final res = await _dio.post(ApiEndpoints.clubs, data: body);
      return Club.fromJson(res.data['data']['club'] as Map<String, dynamic>);
    });
  }

  Future<Club> updateClub(String id, Map<String, dynamic> body) {
    return _guard(() async {
      final res = await _dio.patch(ApiEndpoints.club(id), data: body);
      return Club.fromJson(res.data['data']['club'] as Map<String, dynamic>);
    });
  }

  Future<Club> uploadLogo(String id, String filePath) {
    return _guard(() async {
      final form = FormData.fromMap({
        'logo': await MultipartFile.fromFile(filePath),
      });
      final res = await _dio.post('${ApiEndpoints.club(id)}/logo', data: form);
      return Club.fromJson(res.data['data']['club'] as Map<String, dynamic>);
    });
  }

  Future<void> deleteClub(String id) {
    return _guard(() async {
      await _dio.delete(ApiEndpoints.club(id));
    });
  }
}
