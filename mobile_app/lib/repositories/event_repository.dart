import 'package:dio/dio.dart';

import '../core/network/api_endpoints.dart';
import '../core/network/dio_client.dart';
import '../core/network/paginated.dart';
import '../models/event_model.dart';

/// Data layer for events.
class EventRepository {
  final Dio _dio;

  EventRepository(this._dio);

  Future<T> _guard<T>(Future<T> Function() request) async {
    try {
      return await request();
    } on DioException catch (e) {
      throw DioClient.mapError(e);
    }
  }

  Paginated<Event> _parseList(Response res) {
    final data = res.data['data'] as Map<String, dynamic>;
    final list = (data['events'] as List)
        .map((e) => Event.fromJson(e as Map<String, dynamic>))
        .toList();
    final meta = res.data['meta'] != null
        ? PageMeta.fromJson(res.data['meta'] as Map<String, dynamic>)
        : PageMeta.empty;
    return Paginated(items: list, meta: meta);
  }

  /// Upcoming events feed (across approved clubs).
  Future<Paginated<Event>> upcoming({int page = 1, int limit = 20}) {
    return _guard(() async {
      final res = await _dio.get(
        ApiEndpoints.events,
        queryParameters: {'page': page, 'limit': limit},
      );
      return _parseList(res);
    });
  }

  /// All events across the current owner's clubs (authenticated).
  Future<Paginated<Event>> myEvents({int page = 1, int limit = 100}) {
    return _guard(() async {
      final res = await _dio.get(
        '${ApiEndpoints.events}/mine',
        queryParameters: {'page': page, 'limit': limit},
      );
      return _parseList(res);
    });
  }

  /// Events for a specific club.
  Future<Paginated<Event>> forClub(String clubId, {int page = 1, int limit = 50}) {
    return _guard(() async {
      final res = await _dio.get(
        ApiEndpoints.events,
        queryParameters: {'club': clubId, 'page': page, 'limit': limit},
      );
      return _parseList(res);
    });
  }

  Future<Event> createEvent(Map<String, dynamic> body) {
    return _guard(() async {
      final res = await _dio.post(ApiEndpoints.events, data: body);
      return Event.fromJson(res.data['data']['event'] as Map<String, dynamic>);
    });
  }

  Future<Event> updateEvent(String id, Map<String, dynamic> body) {
    return _guard(() async {
      final res = await _dio.patch('${ApiEndpoints.events}/$id', data: body);
      return Event.fromJson(res.data['data']['event'] as Map<String, dynamic>);
    });
  }

  /// Upload/replace the event cover image (field name `cover`).
  Future<Event> uploadCover(String id, String filePath) {
    return _guard(() async {
      final form = FormData.fromMap({
        'cover': await MultipartFile.fromFile(filePath),
      });
      final res = await _dio.post('${ApiEndpoints.events}/$id/cover', data: form);
      return Event.fromJson(res.data['data']['event'] as Map<String, dynamic>);
    });
  }

  Future<void> deleteEvent(String id) {
    return _guard(() async {
      await _dio.delete('${ApiEndpoints.events}/$id');
    });
  }
}
