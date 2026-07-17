import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
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
  { value: 'male', label: 'Boys' },
  { value: 'female', label: 'Girls' },
  { value: 'mixed', label: 'Mixed' },
];

const STATUSES = [
  { value: 'approved', label: 'Approved (live)' },
  { value: 'pending', label: 'Pending review' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'hidden', label: 'Hidden' },
];


const EMPTY_FORM = {
  name: '',
  description: '',
  sport: '',
  services: '',
  address: '',
  gender: 'mixed',
  ageMin: '0',
  ageMax: '100',
  price: '0',
  priceCurrency: 'INR',
  phone: '',
  email: '',
  website: '',
  instagram: '',
  tiktok: '',
  registrationLink: '',
  status: 'approved',
  isFeatured: false,
};

const isUrl = (v) => /^https?:\/\/.+/i.test(v.trim());
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** Map a loaded club DTO into the flat form state. */
function clubToForm(club) {
  return {
    name: club.name ?? '',
    description: club.description ?? '',
    sport: club.sport ?? '',
    services: (club.services ?? []).join(', '),
    address: club.address ?? '',
    gender: club.gender ?? 'mixed',
    ageMin: String(club.ageMin ?? 0),
    ageMax: String(club.ageMax ?? 100),
    price: String(club.price ?? 0),
    priceCurrency: club.priceCurrency || 'INR',
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

  // Media staged locally (create mode) — uploaded straight after the record is
  // created. In edit mode uploads happen immediately since the club exists.
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [staged, setStaged] = useState([]); // [{ file, url }]
  const [mediaError, setMediaError] = useState('');

  const logoInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Prefill when the club loads (edit mode).
  useEffect(() => {
    if (club) setForm(clubToForm(club));
  }, [club]);

  // Revoke object URLs on unmount to avoid leaks.
  useEffect(
    () => () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      staged.forEach((s) => URL.revokeObjectURL(s.url));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const set = (key) => (e) => {
    const value =
      e?.target?.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Phone accepts digits only, capped at 10.
  const setPhone = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm((prev) => ({ ...prev, phone: digits }));
  };

  const validate = () => {
    const next = {};
    const req = (key, label) => {
      if (!String(form[key]).trim()) next[key] = `Please enter ${label}`;
    };

    req('name', 'a name');
    if (!next.name && form.name.trim().length < 2) next.name = 'Min 2 characters';
    req('description', 'a description');
    req('services', 'at least one service');
    req('city', 'a city');
    req('address', 'an address');
    if (!form.phone.trim()) next.phone = 'Please enter a phone number';
    else if (!/^\d{10}$/.test(form.phone)) next.phone = 'Enter a 10-digit number';

    if (!form.email.trim()) next.email = 'Please enter an email';
    else if (!isEmail(form.email)) next.email = 'Enter a valid email';

    if (!form.website.trim()) next.website = 'Please enter a website';
    else if (!isUrl(form.website)) next.website = 'Start with http:// or https://';

    if (!form.registrationLink.trim())
      next.registrationLink = 'Please enter a registration link';
    else if (!isUrl(form.registrationLink))
      next.registrationLink = 'Start with http:// or https://';

    req('instagram', 'an Instagram link');
    req('tiktok', 'a TikTok link');

    const min = Number(form.ageMin);
    const max = Number(form.ageMax);
    if (form.ageMin === '' || Number.isNaN(min) || min < 0 || min > 100)
      next.ageMin = 'Age 0–100';
    if (form.ageMax === '' || Number.isNaN(max) || max < 0 || max > 100)
      next.ageMax = 'Age 0–100';
    if (!next.ageMin && !next.ageMax && max < min)
      next.ageMax = 'Max age must be ≥ min age';

    if (form.price === '' || Number(form.price) < 0)
      next.price = 'Enter a price (0 for free)';

    // Media is mandatory on create; on edit it already exists on the server.
    let media = '';
    if (!isEdit) {
      if (!logoFile) media = 'Please add a logo';
      else if (staged.length === 0) media = 'Please add at least one photo';
    }
    setMediaError(media);

    setErrors(next);
    return Object.keys(next).length === 0 && !media;
  };

  const buildPayload = () => {
    const servicesList = form.services
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      name: form.name.trim(),
      description: form.description.trim(),
      sport: servicesList[0] ?? '',
      services: servicesList,
      address: form.address.trim(),
      gender: form.gender,
      ageMin: Number(form.ageMin) || 0,
      ageMax: Number(form.ageMax) || 100,
      price: Number(form.price) || 0,
      priceCurrency: 'INR',
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
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = buildPayload();

    if (isEdit) {
      updateClub.mutate({ id, body: payload });
      return;
    }

    // Create + upload logo + upload photos as one flow.
    try {
      const created = await createClub.mutateAsync(payload);
      if (logoFile) await uploadLogo.mutateAsync({ id: created.id, file: logoFile });
      if (staged.length)
        await addGallery.mutateAsync({
          id: created.id,
          files: staged.map((s) => s.file),
        });
      navigate(clubEditPath(created.id));
    } catch {
      // Individual hooks already surface a toast on failure.
    }
  };

  const onLogoPicked = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (isEdit) {
      uploadLogo.mutate({ id, file });
      return;
    }
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setMediaError('');
  };

  const onGalleryPicked = (e) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    if (isEdit) {
      addGallery.mutate({ id, files });
      return;
    }
    setStaged((prev) => [
      ...prev,
      ...files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
    setMediaError('');
  };

  const removeStaged = (url) => {
    URL.revokeObjectURL(url);
    setStaged((prev) => prev.filter((s) => s.url !== url));
  };

  const saving =
    createClub.isPending ||
    updateClub.isPending ||
    uploadLogo.isPending ||
    addGallery.isPending;

  const serverGallery = club?.gallery ?? [];
  const logoSrc = isEdit ? club?.logo : logoPreview;

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

  // Field cell that spans the full width of the grid.
  const full = { gridColumn: '1 / -1' };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <PageHeader
        eyebrow="Organizations"
        title={title}
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

      {/* Details */}
      <ContentCard sx={{ p: 3, mb: 2.5 }}>
        <SectionHeading title="Details" />
        <Box
          sx={{
            mt: 2.5,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            columnGap: 2.5,
            rowGap: 2.5,
          }}
        >
          <TextField
            sx={full}
            label="Club name"
            required
            value={form.name}
            onChange={set('name')}
            error={Boolean(errors.name)}
            helperText={errors.name}
            slotProps={{ htmlInput: { maxLength: 120 } }}
          />
          <TextField
            sx={full}
            label="Services offered (comma-separated)"
            required
            placeholder="Coaching, Summer camp, Trials"
            value={form.services}
            onChange={set('services')}
            error={Boolean(errors.services)}
            helperText={errors.services}
            slotProps={{ htmlInput: { maxLength: 500 } }}
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
        </Box>
      </ContentCard>

      {/* Location */}
      <ContentCard sx={{ p: 3, mb: 2.5 }}>
        <SectionHeading title="Location" />
        <Box sx={{ mt: 2.5 }}>
          <TextField
            fullWidth
            label="Address"
            required
            value={form.address}
            onChange={set('address')}
            error={Boolean(errors.address)}
            helperText={errors.address}
            slotProps={{ htmlInput: { maxLength: 300 } }}
          />
        </Box>
      </ContentCard>

      {/* Audience & pricing */}
      <ContentCard sx={{ p: 3, mb: 2.5 }}>
        <SectionHeading title="Audience & pricing" />
        <Box
          sx={{
            mt: 2.5,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
            columnGap: 2.5,
            rowGap: 2.5,
          }}
        >
          <TextField
            sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}
            select
            label="Gender"
            value={form.gender}
            onChange={set('gender')}
          >
            {GENDERS.map((g) => (
              <MenuItem key={g.value} value={g.value}>
                {g.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Price"
            type="number"
            required
            value={form.price}
            onChange={set('price')}
            error={Boolean(errors.price)}
            helperText={errors.price || '0 for free'}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField
              label="Min age"
              type="number"
              required
              value={form.ageMin}
              onChange={set('ageMin')}
              error={Boolean(errors.ageMin)}
              helperText={errors.ageMin}
            />
            <TextField
              label="Max age"
              type="number"
              required
              value={form.ageMax}
              onChange={set('ageMax')}
              error={Boolean(errors.ageMax)}
              helperText={errors.ageMax}
            />
          </Box>
        </Box>
      </ContentCard>

      {/* Contact & links */}
      <ContentCard sx={{ p: 3, mb: 2.5 }}>
        <SectionHeading title="Contact & social links" />
        <Box
          sx={{
            mt: 2.5,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            columnGap: 2.5,
            rowGap: 2.5,
          }}
        >
          <TextField
            label="Phone"
            required
            value={form.phone}
            onChange={setPhone}
            error={Boolean(errors.phone)}
            helperText={errors.phone || '10-digit number'}
            slotProps={{
              htmlInput: { maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' },
            }}
          />
          <TextField
            label="Email"
            required
            value={form.email}
            onChange={set('email')}
            error={Boolean(errors.email)}
            helperText={errors.email}
            slotProps={{ htmlInput: { maxLength: 160 } }}
          />
          <TextField
            label="Website"
            required
            placeholder="https://…"
            value={form.website}
            onChange={set('website')}
            error={Boolean(errors.website)}
            helperText={errors.website}
            slotProps={{ htmlInput: { maxLength: 300 } }}
          />
          <TextField
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
            label="Instagram"
            required
            value={form.instagram}
            onChange={set('instagram')}
            error={Boolean(errors.instagram)}
            helperText={errors.instagram}
            slotProps={{ htmlInput: { maxLength: 300 } }}
          />
          <TextField
            label="TikTok"
            required
            value={form.tiktok}
            onChange={set('tiktok')}
            error={Boolean(errors.tiktok)}
            helperText={errors.tiktok}
            slotProps={{ htmlInput: { maxLength: 300 } }}
          />
        </Box>
      </ContentCard>

      {/* Visibility */}
      <ContentCard sx={{ p: 3, mb: 2.5 }}>
        <SectionHeading title="Visibility" />
        <Box
          sx={{
            mt: 2.5,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            columnGap: 2.5,
            rowGap: 2.5,
            alignItems: 'center',
          }}
        >
          <TextField
            select
            label="Status"
            value={form.status}
            onChange={set('status')}
          >
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
                <StarIcon
                  fontSize="small"
                  color={form.isFeatured ? 'primary' : 'disabled'}
                />
                <span>Featured organization</span>
              </Stack>
            }
          />
        </Box>
      </ContentCard>

      {/* Media */}
      <ContentCard sx={{ p: 3, mb: 2.5 }}>
        <SectionHeading title="Logo & photos" />
        {mediaError && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {mediaError}
          </Typography>
        )}
        <Stack spacing={3} sx={{ mt: 2.5 }}>
          {/* Logo */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Logo *
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 88,
                  height: 88,
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
                {logoSrc ? (
                  <Box
                    component="img"
                    src={logoSrc}
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
                {logoSrc ? 'Replace logo' : 'Upload logo'}
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
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <Typography variant="subtitle2">
                Photos * ({isEdit ? serverGallery.length : staged.length})
              </Typography>
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

            <GalleryGrid
              items={
                isEdit
                  ? serverGallery.map((url) => ({ url, key: url }))
                  : staged.map((s) => ({ url: s.url, key: s.url }))
              }
              onRemove={(item) =>
                isEdit
                  ? removeGallery.mutate({ id, image: item.url })
                  : removeStaged(item.url)
              }
              removing={removeGallery.isPending}
            />
          </Box>
        </Stack>
      </ContentCard>

      {/* Save bar */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 4 }}>
        <Button color="inherit" onClick={() => navigate(ROUTES.clubs)} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Submit for approval'}
        </Button>
      </Stack>
    </Box>
  );
}

/** Square thumbnail grid with a remove button on each photo. */
function GalleryGrid({ items, onRemove, removing }) {
  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No photos yet.
      </Typography>
    );
  }
  return (
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
      {items.map((item) => (
        <Box
          key={item.key}
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
            src={item.url}
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
            onClick={() => onRemove(item)}
            disabled={removing}
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
  );
}

export default ClubFormPage;
