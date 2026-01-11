'use client';

import { Drawer, Box, Typography, Button } from '@mui/material';

export default function InfoPanel({ location, onClose }) {
  return (
    <Drawer anchor="bottom" open={Boolean(location)} onClose={onClose}>
      <Box sx={{ p: 2 }}>
        {location ? (
          <>
            <Typography variant="h6">{location.name}</Typography>
            <Typography>{location.description}</Typography>
            <Typography sx={{ mt: 1 }}>
              Accessibility: {location.accessibility}
            </Typography>
            <Button sx={{ mt: 2 }} onClick={onClose}>
              Close
            </Button>
          </>
        ) : null}
      </Box>
    </Drawer>
  );
}
