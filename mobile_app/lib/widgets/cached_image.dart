import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../theme/app_colors.dart';

/// Network image with rounded corners and a warm branded fallback.
class CachedImage extends StatelessWidget {
  final String? url;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final IconData placeholderIcon;

  const CachedImage({
    super.key,
    required this.url,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.placeholderIcon = Icons.sports_soccer,
  });

  @override
  Widget build(BuildContext context) {
    String? resolveUrl(String? raw) {
      if (raw == null || raw.trim().isEmpty) return null;
      final value = raw.trim();
      final parsed = Uri.tryParse(value);
      final apiUri = Uri.parse(AppConfig.apiBaseUrl);
      final origin = Uri(
        scheme: apiUri.scheme,
        host: apiUri.host,
        port: apiUri.hasPort ? apiUri.port : null,
      );

      if (parsed != null && parsed.hasScheme) {
        final host = parsed.host.toLowerCase();
        final isLocalBackendUrl = host == 'localhost' || host == '127.0.0.1';
        if (!isLocalBackendUrl) return value;

        return origin
            .replace(
              path: parsed.path,
              query: parsed.hasQuery ? parsed.query : null,
            )
            .toString();
      }

      if (value.startsWith('/')) {
        return origin.resolve(value).toString();
      }
      return origin.resolve('/$value').toString();
    }

    final resolvedUrl = resolveUrl(url);

    Widget fallback() => Container(
          width: width,
          height: height,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.primary.withValues(alpha: 0.12),
                AppColors.secondary.withValues(alpha: 0.10),
              ],
            ),
          ),
          child: Icon(
            placeholderIcon,
            color: AppColors.primary.withValues(alpha: 0.85),
            size: 28,
          ),
        );

    final Widget image = (resolvedUrl == null || resolvedUrl.isEmpty)
        ? fallback()
        : CachedNetworkImage(
            imageUrl: resolvedUrl,
            cacheKey: resolvedUrl,
            width: width,
            height: height,
            fit: fit,
            placeholder: (_, _) => Container(
              width: width,
              height: height,
              color: AppColors.surfaceMuted,
            ),
            errorWidget: (_, _, _) => fallback(),
          );

    return borderRadius != null
        ? ClipRRect(borderRadius: borderRadius!, child: image)
        : image;
  }
}
