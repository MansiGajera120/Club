/// Pagination metadata returned alongside list responses.
class PageMeta {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const PageMeta({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  bool get hasMore => page < totalPages;

  factory PageMeta.fromJson(Map<String, dynamic> json) => PageMeta(
        page: (json['page'] as num?)?.toInt() ?? 1,
        limit: (json['limit'] as num?)?.toInt() ?? 20,
        total: (json['total'] as num?)?.toInt() ?? 0,
        totalPages: (json['totalPages'] as num?)?.toInt() ?? 1,
      );

  static const empty = PageMeta(page: 1, limit: 20, total: 0, totalPages: 1);
}

/// A page of items plus its metadata.
class Paginated<T> {
  final List<T> items;
  final PageMeta meta;

  const Paginated({required this.items, required this.meta});

  bool get hasMore => meta.hasMore;
}
