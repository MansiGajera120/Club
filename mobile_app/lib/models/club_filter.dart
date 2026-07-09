/// Immutable search/filter criteria for browsing clubs. Maps directly to the
/// backend's `GET /clubs` query parameters.
class ClubFilter {
  final String? search;
  final String? city;
  final String? sport;
  final String? gender; // male | female | mixed
  final int? age;
  final num? minPrice;
  final num? maxPrice;
  final bool? featured;
  final String sort; // newest | oldest | price_asc | price_desc | popular

  const ClubFilter({
    this.search,
    this.city,
    this.sport,
    this.gender,
    this.age,
    this.minPrice,
    this.maxPrice,
    this.featured,
    this.sort = 'newest',
  });

  ClubFilter copyWith({
    String? search,
    bool clearSearch = false,
    String? city,
    String? sport,
    String? gender,
    int? age,
    num? minPrice,
    num? maxPrice,
    bool? featured,
    String? sort,
  }) {
    return ClubFilter(
      search: clearSearch ? null : (search ?? this.search),
      city: city ?? this.city,
      sport: sport ?? this.sport,
      gender: gender ?? this.gender,
      age: age ?? this.age,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      featured: featured ?? this.featured,
      sort: sort ?? this.sort,
    );
  }

  /// Whether any filter (excluding the free-text search + sort) is active.
  bool get hasActiveFilters =>
      city != null ||
      sport != null ||
      gender != null ||
      age != null ||
      minPrice != null ||
      maxPrice != null ||
      (featured ?? false);

  /// True when the catalog API should be queried (search term or filters).
  bool get shouldQueryCatalog {
    final term = search?.trim() ?? '';
    return hasActiveFilters || term.length >= 2;
  }

  /// Build the query-parameter map, omitting null/empty values.
  Map<String, dynamic> toQuery({int page = 1, int limit = 20}) {
    return {
      'page': page,
      'limit': limit,
      'sort': sort,
      if (search != null && search!.isNotEmpty) 'search': search,
      if (city != null && city!.isNotEmpty) 'city': city,
      if (sport != null && sport!.isNotEmpty) 'sport': sport,
      if (gender != null) 'gender': gender,
      if (age != null) 'age': age,
      if (minPrice != null) 'minPrice': minPrice,
      if (maxPrice != null) 'maxPrice': maxPrice,
      if (featured == true) 'featured': true,
    };
  }
}
