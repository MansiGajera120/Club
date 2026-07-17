/// Reusable form-field validators returning an error string or null (valid).
class Validators {
  const Validators._();

  // Requires a proper domain: labels of alphanumerics/hyphens separated by
  // single dots and a TLD — rejects trailing/consecutive dots (e.g. `a@b.c.`).
  static final RegExp _emailRegex =
      RegExp(r'^[\w.+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$');
  // 10–15 digits after stripping formatting; allows an optional country code.
  static final RegExp _phoneRegex = RegExp(r'^\d{10,15}$');

  static String? email(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Please enter your email';
    if (!_emailRegex.hasMatch(v)) return 'Enter a valid email';
    return null;
  }

  static final RegExp _hasLetter = RegExp(r'[A-Za-z]');
  static final RegExp _hasDigit = RegExp(r'\d');

  static String? password(String? value) {
    final v = value ?? '';
    if (v.isEmpty) return 'Please enter your password';
    if (v.length < 8) return 'Password must be at least 8 characters';
    if (!_hasLetter.hasMatch(v) || !_hasDigit.hasMatch(v)) {
      return 'Include at least one letter and one number';
    }
    return null;
  }

  static String? required(String? value, {String field = 'this field'}) {
    if ((value?.trim() ?? '').isEmpty) return 'Please enter $field';
    return null;
  }

  static String? name(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Please enter your name';
    if (v.length < 2) return 'Name is too short';
    return null;
  }

  static String? phone(String? value, {bool required = true}) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return required ? 'Please enter your phone number' : null;
    // Accept spaces, dashes, parentheses and an optional leading '+'.
    final digits = v.replaceAll(RegExp(r'[\s\-().]'), '');
    final normalized = digits.startsWith('+') ? digits.substring(1) : digits;
    if (!_phoneRegex.hasMatch(normalized)) {
      return 'Enter a valid phone number';
    }
    return null;
  }

  /// Confirm-password validator bound to the original value.
  static String? Function(String?) confirmPassword(String Function() original) {
    return (value) {
      if ((value ?? '').isEmpty) return 'Please confirm your password';
      if (value != original()) return 'Passwords do not match';
      return null;
    };
  }
}
