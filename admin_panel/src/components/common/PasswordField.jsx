import { forwardRef, useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

/**
 * Password input with a show/hide toggle. A drop-in replacement for MUI's
 * <TextField type="password" />: it forwards all props (including a
 * react-hook-form `register()` spread and its ref) to the underlying field.
 */
const PasswordField = forwardRef(function PasswordField(props, ref) {
  const [show, setShow] = useState(false);

  return (
    <TextField
      {...props}
      ref={ref}
      type={show ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={show ? 'Hide password' : 'Show password'}
                onClick={() => setShow((s) => !s)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
                tabIndex={-1}
              >
                {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
});

export default PasswordField;
