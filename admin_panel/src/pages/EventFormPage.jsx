import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageIcon from '@mui/icons-material/Image';

import { PageHeader, ContentCard, SectionHeading } from '@/components/ui';
import {
  useAdminClubs,
  useAdminEvent,
  useCreateEvent,
  useUpdateEvent,
  useUploadEventCover,
} from '@/hooks/useAdmin';
import { ROUTES } from '@/constants';

const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP'];

const isUrl = (v) => /^https?:\/\/.+/i.test(v.trim());

/** ISO string → value for <input type="datetime-local"> (local time). */
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

/** datetime-local value → ISO string (or null when empty). */
const toIso = (local) => (local ? new Date(local).toISOString() : null);

const EMPTY_FORM = {
  club: '',
  title: '',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
  price: '0',
  priceCurrency: 'USD',
  registrationLink: '',
  registrationStartDate: '',
  registrationEndDate: '',
  isActive: true,
};

function eventToForm(event) {
  return {
    club: event.club ?? '',
    title: event.title ?? '',
    description: event.description ?? '',
    location: event.location ?? '',
    startDate: toLocalInput(event.startDate),
    endDate: toLocalInput(event.endDate),
    price: String(event.price ?? 0),
    priceCurrency: event.priceCurrency || 'USD',
    registrationLink: event.registrationLink ?? '',
    registrationStartDate: toLocalInput(event.registrationStartDate),
    registrationEndDate: toLocalInput(event.registrationEndDate),
    isActive: Boolean(event.isActive),
  };
}

const dtField = {
  type: 'datetime-local',
  InputLabelProps: { shrink: true },
};

export function EventFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: event, isLoading } = useAdminEvent(id);
  const { data: clubsData } = useAdminClubs({ page: 1, limit: 100 });
  const clubs = clubsData?.items ?? [];

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const uploadCover = useUploadEventCover();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverError, setCoverError] = useState('');
  const coverInputRef = useRef(null);

  useEffect(() => {
    if (event) setForm(eventToForm(event));
  }, [event]);

  useEffect(
    () => () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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

    if (!form.endDate) next.endDate = 'End date is required';
    else if (form.startDate && form.endDate < form.startDate)
      next.endDate = 'End must be on or after start';

    if (form.price === '' || Number(form.price) < 0)
      next.price = 'Enter a price (0 for free)';

    if (!form.registrationLink.trim())
      next.registrationLink = 'Registration link is required';
    else if (!isUrl(form.registrationLink))
      next.registrationLink = 'Start with http:// or https://';

    if (!form.registrationStartDate)
      next.registrationStartDate = 'Registration open date is required';
    else if (form.startDate && form.registrationStartDate >= form.startDate)
      next.registrationStartDate = 'Must be before the event start';

    if (!form.registrationEndDate)
      next.registrationEndDate = 'Registration close date is required';
    else if (form.startDate && form.registrationEndDate >= form.startDate)
      next.registrationEndDate = 'Must be before the event start';
    else if (
      form.registrationStartDate &&
      form.registrationEndDate < form.registrationStartDate
    )
      next.registrationEndDate = 'Close must be on or after open';

    // Cover is mandatory; on edit it already exists on the server.
    let cover = '';
    if (!isEdit && !coverFile) cover = 'A cover image is required.';
    setCoverError(cover);

    setErrors(next);
    return Object.keys(next).length === 0 && !cover;
  };

  const buildPayload = () => {
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      startDate: toIso(form.startDate),
      price: Number(form.price) || 0,
      priceCurrency: form.priceCurrency,
      registrationLink: form.registrationLink.trim(),
      registrationStartDate: form.registrationStartDate
        ? toIso(form.registrationStartDate)
        : null,
      registrationEndDate: form.registrationEndDate
        ? toIso(form.registrationEndDate)
        : null,
      isActive: form.isActive,
    };
    if (form.endDate) payload.endDate = toIso(form.endDate);
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
      const created = await createEvent.mutateAsync(payload);
      if (coverFile) await uploadCover.mutateAsync({ id: created.id, file: coverFile });
      navigate(ROUTES.events);
    } catch {
      // Hooks surface their own error toast.
    }
  };

  const onCoverPicked = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (isEdit) {
      uploadCover.mutate({ id, file });
      return;
    }
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setCoverError('');
  };

  const saving =
    createEvent.isPending || updateEvent.isPending || uploadCover.isPending;
  const coverSrc = isEdit ? event?.coverImage : coverPreview;

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
        subtitle={
          isEdit
            ? 'Update this event’s details, schedule and registration window.'
            : 'Create an event for an organization. All fields are required; the registration window must close before the event starts.'
        }
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
        <SectionHeading title="Details" />
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
            label="Event title"
            required
            value={form.title}
            onChange={set('title')}
            error={Boolean(errors.title)}
            helperText={errors.title}
            slotProps={{ htmlInput: { maxLength: 160 } }}
          />
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

      {/* Schedule */}
      <ContentCard sx={{ p: 3, mb: 2.5 }}>
        <SectionHeading title="Schedule" />
        <Box sx={gridSx}>
          <TextField
            {...dtField}
            label="Starts"
            required
            value={form.startDate}
            onChange={set('startDate')}
            error={Boolean(errors.startDate)}
            helperText={errors.startDate}
          />
          <TextField
            {...dtField}
            label="Ends"
            required
            value={form.endDate}
            onChange={set('endDate')}
            error={Boolean(errors.endDate)}
            helperText={errors.endDate}
          />
        </Box>
      </ContentCard>

      {/* Pricing */}
      <ContentCard sx={{ p: 3, mb: 2.5 }}>
        <SectionHeading title="Pricing" />
        <Box sx={gridSx}>
          <TextField
            label="Price"
            type="number"
            value={form.price}
            onChange={set('price')}
            error={Boolean(errors.price)}
            helperText={errors.price || '0 for free'}
          />
          <TextField
            select
            label="Currency"
            value={form.priceCurrency}
            onChange={set('priceCurrency')}
          >
            {CURRENCIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </ContentCard>

      {/* Registration */}
      <ContentCard sx={{ p: 3, mb: 2.5 }}>
        <SectionHeading
          title="Registration"
          subtitle="Where parents register, and the window during which registration is open. The window must close before the event starts."
        />
        <Box sx={gridSx}>
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
          <TextField
            {...dtField}
            label="Registration opens"
            required
            value={form.registrationStartDate}
            onChange={set('registrationStartDate')}
            error={Boolean(errors.registrationStartDate)}
            helperText={errors.registrationStartDate}
          />
          <TextField
            {...dtField}
            label="Registration closes"
            required
            value={form.registrationEndDate}
            onChange={set('registrationEndDate')}
            error={Boolean(errors.registrationEndDate)}
            helperText={errors.registrationEndDate}
          />
        </Box>
      </ContentCard>

      {/* Cover & visibility */}
      <ContentCard sx={{ p: 3, mb: 2.5 }}>
        <SectionHeading title="Cover & visibility" />
        {coverError && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {coverError}
          </Typography>
        )}
        <Stack spacing={3} sx={{ mt: 2.5 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Cover image *
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 160,
                  height: 90,
                  flexShrink: 0,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.default',
                  display: 'grid',
                  placeItems: 'center',
                  overflow: 'hidden',
                }}
              >
                {coverSrc ? (
                  <Box
                    component="img"
                    src={coverSrc}
                    alt="cover"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <ImageIcon color="disabled" />
                )}
              </Box>
              <Button
                variant="outlined"
                startIcon={<ImageIcon />}
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadCover.isPending}
              >
                {coverSrc ? 'Replace cover' : 'Upload cover'}
              </Button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={onCoverPicked}
              />
            </Stack>
          </Box>

          <Divider />

          <FormControlLabel
            sx={{ ml: 0 }}
            control={<Switch checked={form.isActive} onChange={set('isActive')} />}
            label="Active (visible to parents)"
          />
        </Stack>
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
