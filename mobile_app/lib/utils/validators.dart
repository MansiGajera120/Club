/// Reusable form-field validators returning an error string or null (valid).
class Validators {
  const Validators._();

  static final RegExp _emailRegex =
      RegExp(r'^[\w.+-]+@[\w-]+\.[\w.-]+$');
  static final RegExp _phoneRegex = RegExp(r'^\d{10}$');

  static String? email(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Email is required';
    if (!_emailRegex.hasMatch(v)) return 'Enter a valid email';
    return null;
  }

  static String? password(String? value) {
    final v = value ?? '';
    if (v.isEmpty) return 'Password is required';
    if (v.length < 8) return 'Password must be at least 8 characters';
    return null;
  }

  static String? required(String? value, {String field = 'This field'}) {
    if ((value?.trim() ?? '').isEmpty) return '$field is required';
    return null;
  }

  static String? name(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Name is required';
    if (v.length < 2) return 'Name is too short';
    return null;
  }

  static String? phone(String? value, {bool required = true}) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return required ? 'Phone number is required' : null;
    if (!_phoneRegex.hasMatch(v)) return 'Enter a valid 10-digit mobile number';
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
