import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';

import { PageHeader, ContentCard, SectionHeading } from '@/components/ui';
import {
  useAdminClub,
  useCreateClub,
  useUpdateClub,
  useUploadClubLogo,
  useAddClubGallery,
  useRemoveClubGallery,
} from '@/hooks/useAdmin';
import { ROUTES, clubEditPath } from '@/constants';

const GENDERS = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const STATUSES = [
  { value: 'approved', label: 'Approved (live)' },
  { value: 'pending', label: 'Pending review' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'hidden', label: 'Hidden' },
];

const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP'];

const EMPTY_FORM = {
  name: '',
  description: '',
  sport: '',
  services: '',
  city: '',
  address: '',
  gender: 'mixed',
  ageMin: '0',
  ageMax: '100',
  price: '0',
  priceCurrency: 'USD',
  phone: '',
  email: '',
  website: '',
  instagram: '',
  tiktok: '',
  registrationLink: '',
  status: 'approved',
  isFeatured: false,
};

/** Map a loaded club DTO into the flat form state. */
function clubToForm(club) {
  return {
    name: club.name ?? '',
    description: club.description ?? '',
    sport: club.sport ?? '',
    services: (club.services ?? []).join(', '),
    city: club.city ?? '',
    address: club.address ?? '',
    gender: club.gender ?? 'mixed',
    ageMin: String(club.ageMin ?? 0),
    ageMax: String(club.ageMax ?? 100),
    price: String(club.price ?? 0),
    priceCurrency: club.priceCurrency || 'USD',
    phone: club.contact?.phone ?? '',
    email: club.contact?.email ?? '',
    website: club.contact?.website ?? '',
    instagram: club.contact?.instagram ?? '',
    tiktok: club.contact?.tiktok ?? '',
    registrationLink: club.registrationLink ?? '',
    status: club.status ?? 'approved',
    isFeatured: Boolean(club.isFeatured),
  };
}

/** Two-column responsive grid for form fields. */
function FieldGrid({ children, columns = 2 }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: `repeat(${columns}, 1fr)` },
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}

export function ClubFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: club, isLoading } = useAdminClub(id);
  const createClub = useCreateClub();
  const updateClub = useUpdateClub();
  const uploadLogo = useUploadClubLogo();
  const addGallery = useAddClubGallery();
  const removeGallery = useRemoveClubGallery();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const logoInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Prefill when the club loads (edit mode).
  useEffect(() => {
    if (club) setForm(clubToForm(club));
  }, [club]);

  const set = (key) => (e) => {
    const value =
      e?.target?.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      next.name = 'Name is required (min 2 characters)';
    }
    const min = Number(form.ageMin);
    const max = Number(form.ageMax);
    if (Number.isNaN(min) || min < 0 || min > 100) next.ageMin = 'Age 0–100';
    if (Number.isNaN(max) || max < 0 || max > 100) next.ageMax = 'Age 0–100';
    if (!next.ageMin && !next.ageMax && max < min) {
      next.ageMax = 'Max age must be ≥ min age';
    }
    if (Number(form.price) < 0) next.price = 'Price cannot be negative';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    description: form.description.trim(),
    sport: form.sport.trim(),
    services: form.services
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    city: form.city.trim(),
    address: form.address.trim(),
    gender: form.gender,
    ageMin: Number(form.ageMin) || 0,
    ageMax: Number(form.ageMax) || 100,
    price: Number(form.price) || 0,
    priceCurrency: form.priceCurrency,
    contact: {
      phone: form.phone.trim(),
      email: form.email.trim(),
      website: form.website.trim(),
      instagram: form.instagram.trim(),
      tiktok: form.tiktok.trim(),
    },
    registrationLink: form.registrationLink.trim(),
    status: form.status,
    isFeatured: form.isFeatured,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = buildPayload();

    if (isEdit) {
      updateClub.mutate({ id, body: payload });
    } else {
      createClub.mutate(payload, {
        // After creating, jump into edit mode so logo & photos can be added.
        onSuccess: (created) => navigate(clubEditPath(created.id)),
      });
    }
  };

  const onLogoPicked = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadLogo.mutate({ id, file });
    e.target.value = '';
  };

  const onGalleryPicked = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) addGallery.mutate({ id, files });
    e.target.value = '';
  };

  const saving = createClub.isPending || updateClub.isPending;
  const gallery = club?.gallery ?? [];

  const title = useMemo(
    () => (isEdit ? 'Edit organization' : 'Add organization'),
    [isEdit]
  );

  if (isEdit && isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <PageHeader
        eyebrow="Organizations"
        title={title}
        subtitle={
          isEdit
            ? 'Update details, media and visibility for this organization.'
            : 'Register a new organization directly. It goes live immediately unless you pick another status.'
        }
        actions={
          <Button
            startIcon={<ArrowBackIcon />}
            color="inherit"
            onClick={() => navigate(ROUTES.clubs)}
          >
            Back to list
          </Button>
        }
      />

      {/* Basic details */}
      <ContentCard sx={{ p: 3, mb: 2 }}>
        <SectionHeading title="Details" />
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Organization name"
            required
            value={form.name}
            onChange={set('name')}
            error={Boolean(errors.name)}
            helperText={errors.name}
            fullWidth
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={set('description')}
            multiline
            minRows={3}
            fullWidth
          />
          <FieldGrid>
            <TextField label="Sport" value={form.sport} onChange={set('sport')} fullWidth />
            <TextField
              label="Services (comma separated)"
              placeholder="Coaching, Summer camp, Trials"
              value={form.services}
              onChange={set('services')}
              fullWidth
            />
          </FieldGrid>
        </Stack>
      </ContentCard>

      {/* Location */}
      <ContentCard sx={{ p: 3, mb: 2 }}>
        <SectionHeading title="Location" />
        <FieldGrid>
          <TextField label="City" value={form.city} onChange={set('city')} fullWidth />
          <TextField label="Address" value={form.address} onChange={set('address')} fullWidth />
        </FieldGrid>
      </ContentCard>

      {/* Audience & pricing */}
      <ContentCard sx={{ p: 3, mb: 2 }}>
        <SectionHeading title="Audience & pricing" />
        <FieldGrid>
          <TextField select label="Gender category" value={form.gender} onChange={set('gender')} fullWidth>
            {GENDERS.map((g) => (
              <MenuItem key={g.value} value={g.value}>
                {g.label}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Min age"
              type="number"
              value={form.ageMin}
              onChange={set('ageMin')}
              error={Boolean(errors.ageMin)}
              helperText={errors.ageMin}
              fullWidth
            />
            <TextField
              label="Max age"
              type="number"
              value={form.ageMax}
              onChange={set('ageMax')}
              error={Boolean(errors.ageMax)}
              helperText={errors.ageMax}
              fullWidth
            />
          </Box>
          <TextField
            label="Price"
            type="number"
            value={form.price}
            onChange={set('price')}
            error={Boolean(errors.price)}
            helperText={errors.price || 'Use 0 for free'}
            fullWidth
          />
          <TextField
            select
            label="Currency"
            value={form.priceCurrency}
            onChange={set('priceCurrency')}
            fullWidth
          >
            {CURRENCIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </FieldGrid>
      </ContentCard>

      {/* Contact & links */}
      <ContentCard sx={{ p: 3, mb: 2 }}>
        <SectionHeading title="Contact & social links" />
        <FieldGrid>
          <TextField label="Phone" value={form.phone} onChange={set('phone')} fullWidth />
          <TextField label="Email" value={form.email} onChange={set('email')} fullWidth />
          <TextField label="Website" placeholder="https://…" value={form.website} onChange={set('website')} fullWidth />
          <TextField label="Registration link" placeholder="https://…" value={form.registrationLink} onChange={set('registrationLink')} fullWidth />
          <TextField label="Instagram" value={form.instagram} onChange={set('instagram')} fullWidth />
          <TextField label="TikTok" value={form.tiktok} onChange={set('tiktok')} fullWidth />
        </FieldGrid>
      </ContentCard>

      {/* Visibility */}
      <ContentCard sx={{ p: 3, mb: 2 }}>
        <SectionHeading title="Visibility" />
        <FieldGrid>
          <TextField select label="Status" value={form.status} onChange={set('status')} fullWidth>
            {STATUSES.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            sx={{ ml: 0 }}
            control={<Switch checked={form.isFeatured} onChange={set('isFeatured')} />}
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <StarIcon fontSize="small" color={form.isFeatured ? 'primary' : 'disabled'} />
                <span>Featured organization</span>
              </Stack>
            }
          />
        </FieldGrid>
      </ContentCard>

      {/* Media — only available once the club exists */}
      <ContentCard sx={{ p: 3, mb: 2 }}>
        <SectionHeading title="Logo & photos" />
        {!isEdit ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Save the organization first, then you can upload a logo and gallery photos.
          </Typography>
        ) : (
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Logo */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Logo
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 88,
                    height: 88,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                    display: 'grid',
                    placeItems: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {club?.logo ? (
                    <Box
                      component="img"
                      src={club.logo}
                      alt="logo"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <PhotoCameraIcon color="disabled" />
                  )}
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadLogo.isPending}
                >
                  {club?.logo ? 'Replace logo' : 'Upload logo'}
                </Button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={onLogoPicked}
                />
              </Stack>
            </Box>

            <Divider />

            {/* Gallery */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Photos ({gallery.length})</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddPhotoAlternateIcon />}
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={addGallery.isPending}
                >
                  Add photos
                </Button>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={onGalleryPicked}
                />
              </Stack>
              {gallery.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No photos yet.
                </Typography>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(3, 1fr)',
                      sm: 'repeat(4, 1fr)',
                      md: 'repeat(6, 1fr)',
                    },
                    gap: 1.5,
                  }}
                >
                  {gallery.map((url) => (
                    <Box
                      key={url}
                      sx={{
                        position: 'relative',
                        paddingTop: '100%',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        component="img"
                        src={url}
                        alt="gallery"
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeGallery.mutate({ id, image: url })}
                        disabled={removeGallery.isPending}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.55)',
                          color: '#fff',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Stack>
        )}
      </ContentCard>

      {/* Save bar */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 4 }}>
        <Button color="inherit" onClick={() => navigate(ROUTES.clubs)} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create organization'}
        </Button>
      </Stack>
    </Box>
  );
}

export default ClubFormPage;
