import { User } from '../models/user.model.js';

/**
 * Data-access layer for users. Controllers/services never touch the model
 * directly — they go through this repository.
 */
export const userRepository = {
  create(data) {
    return User.create(data);
  },

  findById(id) {
    return User.findById(id);
  },

  findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
  },

  /** Include the password hash (needed for login). */
  findByEmailWithPassword(email) {
    return User.findOne({ email: email.toLowerCase() }).select('+password');
  },

  /** Include the hashed email-verification OTP + expiry (needed to verify a code). */
  findByEmailWithVerification(email) {
    return User.findOne({ email: email.toLowerCase() }).select(
      '+emailVerificationToken +emailVerificationExpires +emailVerificationAttempts'
    );
  },

  /** Include the hashed password-reset OTP + expiry + attempts (to verify a code). */
  findByEmailWithReset(email) {
    return User.findOne({ email: email.toLowerCase() }).select(
      '+passwordResetToken +passwordResetExpires +passwordResetAttempts +password'
    );
  },

  findByProviderId(provider, providerId) {
    return User.findOne({ provider, providerId });
  },

  /**
   * Find a user by a hashed single-use token that has not yet expired.
   * @param {'emailVerification'|'passwordReset'} kind
   * @param {string} tokenHash
   */
  findByActiveToken(kind, tokenHash) {
    const tokenField =
      kind === 'emailVerification' ? 'emailVerificationToken' : 'passwordResetToken';
    const expiresField =
      kind === 'emailVerification' ? 'emailVerificationExpires' : 'passwordResetExpires';

    return User.findOne({
      [tokenField]: tokenHash,
      [expiresField]: { $gt: new Date() },
    }).select(`+${tokenField} +${expiresField} +password`);
  },

  existsByEmail(email) {
    return User.exists({ email: email.toLowerCase() });
  },

  updateById(id, update) {
    return User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  },

  count(filter = {}) {
    return User.countDocuments(filter);
  },

  async paginate(filter, { skip, limit, sort = { createdAt: -1 } }) {
    const [items, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
    return { items, total };
  },
};

export default userRepository;
