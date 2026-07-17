import 'package:intl/intl.dart';

/// Display formatters for prices, ages, dates and enum-like labels.
class Formatters {
  const Formatters._();

  static const Map<String, String> _currencySymbols = {
    'INR': '₹',
    'USD': '\$',
    'EUR': '€',
    'GBP': '£',
  };

  static String price(num value, String currency) {
    if (value <= 0) return 'Free';
    final raw = currency.trim().toUpperCase();
    // Respect the currency the backend actually sends; only fall back to USD
    // when it's missing. (Previously USD was silently rewritten to INR.)
    final code = raw.isEmpty ? 'USD' : raw;
    final symbol = _currencySymbols[code];
    // Indian rupees use Indian digit grouping (e.g. ₹1,00,000).
    final locale = code == 'INR' ? 'en_IN' : 'en_US';
    final nf = NumberFormat.decimalPattern(locale);
    // Non-round amounts always show exactly two decimals (₹1,000.50, not 1,000.5).
    if (value % 1 != 0) {
      nf.minimumFractionDigits = 2;
      nf.maximumFractionDigits = 2;
    }
    final formatted = nf.format(value);
    return symbol != null ? '$symbol$formatted' : '$code $formatted';
  }

  static String ageRange(int min, int max) => 'Ages $min–$max';

  static String date(DateTime d) => DateFormat.yMMMd().format(d.toLocal());

  static String dateTime(DateTime d) =>
      DateFormat.yMMMd().add_jm().format(d.toLocal());

  static String genderLabel(String gender) {
    switch (gender) {
      case 'male':
        return 'Boys';
      case 'female':
        return 'Girls';
      default:
        return 'Mixed';
    }
  }
}
