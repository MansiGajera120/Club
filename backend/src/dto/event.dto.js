import { buildUploadUrl } from '../utils/url.js';

const idOf = (v) => (v && v._id ? v._id.toString() : (v?.toString?.() ?? v));

/**
 * Event representation for API responses (absolute cover-image URL).
 * @param {object} event
 */
export const toEventResponse = (event) => ({
  id: idOf(event._id ?? event.id),
  club: idOf(event.club),
  title: event.title,
  description: event.description ?? null,
  coverImage: buildUploadUrl(event.coverImage),
  location: event.location ?? null,
  startDate: event.startDate,
  endDate: event.endDate ?? null,
  price: event.price ?? 0,
  priceCurrency: event.priceCurrency ?? 'USD',
  registrationLink: event.registrationLink ?? null,
  registrationStartDate: event.registrationStartDate ?? null,
  registrationEndDate: event.registrationEndDate ?? null,
  isActive: Boolean(event.isActive),
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
});

export default toEventResponse;
