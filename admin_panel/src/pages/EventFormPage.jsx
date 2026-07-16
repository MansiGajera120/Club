import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { PageHeader, ContentCard, SectionHeading } from '@/components/ui';
import {
  useAdminClubs,
  useAdminEvent,
  useCreateEvent,
  useUpdateEvent,
} from '@/hooks/useAdmin';
import { ROUTES } from '@/constants';

const EVENT_TYPES = ['Camps', 'Clinics', 'Events'];

const isUrl = (v) => /^https?:\/\/.+/i.test(v.trim());

/** ISO string → value for <input type="date"> */
const toDateInput = (iso) => {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
};

/** date input value → ISO string (or null when empty). */
const toIso = (dateStr) => (dateStr ? new Date(dateStr).toISOString() : null);

const EMPTY_FORM = {
  club: '',
  title: '',
  type: 'Events',
  description: '',
  location: '',
  startDate: '',
  price: '0',
  registrationLink: '',
  isActive: true,
};

function eventToForm(event) {
  return {
    club: event.club ?? '',
    title: event.title ?? '',
    type: event.type ?? 'Events',
    description: event.description ?? '',
    location: event.location ?? '',
    startDate: toDateInput(event.startDate),
    price: String(event.price ?? 0),
    registrationLink: event.registrationLink ?? '',
    isActive: Boolean(event.isActive),
  };
}

export function EventFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: event, isLoading } = useAdminEvent(id);
  const { data: clubsData } = useAdminClubs({ page: 1, limit: 100 });
  const clubs = clubsData?.items ?? [];

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) setForm(eventToForm(event));
  }, [event]);

  const set = (key) => (e) => {
    const value =
      e?.target?.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next = {};
    if (!isEdit && !form.club) next.club = 'Select an organization';

    if (!form.title.trim()) next.title = 'Title is required';
    else if (form.title.trim().length < 2) next.title = 'Min 2 characters';

    if (!form.description.trim()) next.description = 'Description is required';
    if (!form.location.trim()) next.location = 'Location is required';

    if (!form.startDate) next.startDate = 'Start date is required';

    if (form.price === '' || Number(form.price) < 0)
      next.price = 'Enter a price (0 for free)';

    if (!form.registrationLink.trim())
      next.registrationLink = 'Registration link is required';
    else if (!isUrl(form.registrationLink))
      next.registrationLink = 'Start with http:// or https://';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => {
    const payload = {
      title: form.title.trim(),
      type: form.type,
      description: form.description.trim(),
      location: form.location.trim(),
      startDate: toIso(form.startDate),
      price: Number(form.price) || 0,
      priceCurrency: 'INR',
      registrationLink: form.registrationLink.trim(),
      registrationStartDate: null,
      registrationEndDate: null,
      endDate: null,
      isActive: form.isActive,
    };
    if (!isEdit) payload.club = form.club;
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = buildPayload();

    if (isEdit) {
      updateEvent.mutate({ id, body: payload });
      return;
    }
    try {
      await createEvent.mutateAsync(payload);
      navigate(ROUTES.events);
    } catch {
      // Hooks surface their own error toast.
    }
  };

  const saving = createEvent.isPending || updateEvent.isPending;

  const clubName = useMemo(() => {
    if (!isEdit) return '';
    return clubs.find((c) => c.id === form.club)?.name ?? form.club;
  }, [isEdit, clubs, form.club]);

  const title = isEdit ? 'Edit event' : 'Add event';

  if (isEdit && isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const gridSx = {
    mt: 2.5,
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
    columnGap: 2.5,
    rowGap: 2.5,
  };
  const full = { gridColumn: '1 / -1' };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <PageHeader
        eyebrow="Events"
        title={title}
        actions={
          <Button
            startIcon={<ArrowBackIcon />}
            color="inherit"
            onClick={() => navigate(ROUTES.events)}
          >
            Back to list
          </Button>
        }
      />

      {/* Details */}
      <ContentCard sx={{ p: 3, mb: 2.5 }}>
        <SectionHeading title="Event details" />
        <Box sx={gridSx}>
          {isEdit ? (
            <TextField sx={full} label="Organization" value={clubName} disabled />
          ) : (
            <TextField
              sx={full}
              select
              required
              label="Organization"
              value={form.club}
              onChange={set('club')}
              error={Boolean(errors.club)}
              helperText={errors.club || 'Which organization is this event for?'}
            >
              {clubs.length === 0 && (
                <MenuItem value="" disabled>
                  No organizations found
                </MenuItem>
              )}
              {clubs.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                  {c.status && c.status !== 'approved' ? ` (${c.status})` : ''}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            sx={full}
            label="Title"
            required
            value={form.title}
            onChange={set('title')}
            error={Boolean(errors.title)}
            helperText={errors.title}
            slotProps={{ htmlInput: { maxLength: 160 } }}
          />
          <TextField
            sx={full}
            select
            label="Event type"
            value={form.type}
            onChange={set('type')}
          >
            {EVENT_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            sx={full}
            label="Description"
            required
            value={form.description}
            onChange={set('description')}
            error={Boolean(errors.description)}
            helperText={errors.description}
            multiline
            minRows={3}
            slotProps={{ htmlInput: { maxLength: 4000 } }}
          />
          <TextField
            sx={full}
            label="Location"
            required
            value={form.location}
            onChange={set('location')}
            error={Boolean(errors.location)}
            helperText={errors.location}
            slotProps={{ htmlInput: { maxLength: 300 } }}
          />
        </Box>
      </ContentCard>

      {/* Schedule & registration */}
      <ContentCard sx={{ p: 3, mb: 2.5 }}>
        <SectionHeading title="Schedule & registration" />
        <Box sx={gridSx}>
          <Box sx={{ maxWidth: 220 }}>
            <TextField
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              label="Start date"
              required
              value={form.startDate}
              onChange={set('startDate')}
              error={Boolean(errors.startDate)}
              helperText={errors.startDate}
            />
          </Box>
          <TextField
            sx={full}
            label="Registration link"
            required
            placeholder="https://…"
            value={form.registrationLink}
            onChange={set('registrationLink')}
            error={Boolean(errors.registrationLink)}
            helperText={errors.registrationLink}
            slotProps={{ htmlInput: { maxLength: 300 } }}
          />
        </Box>
      </ContentCard>

      {/* Pricing */}
      <ContentCard sx={{ p: 3, mb: 2.5 }}>
        <SectionHeading title="Pricing" />
        <Box sx={{ mt: 2.5, maxWidth: 240 }}>
          <TextField
            fullWidth
            label="Price (₹)"
            type="number"
            value={form.price}
            onChange={set('price')}
            error={Boolean(errors.price)}
            helperText={errors.price || '0 for free'}
          />
        </Box>
      </ContentCard>

      {/* Save bar */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 4 }}>
        <Button color="inherit" onClick={() => navigate(ROUTES.events)} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create event'}
        </Button>
      </Stack>
    </Box>
  );
}

export default EventFormPage;
