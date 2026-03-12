'use client';
import { Box, Drawer, List, ListItem, ListItemText, TextField, Typography, Stack, IconButton } from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import CloseIcon from '@mui/icons-material/Close';

/**
 * SearchDrawer
 * Bottom sheet for searching campus locations.
 * Props: open, onClose, query, onQueryChange, results, onSelect
 */
export default function SearchDrawer({ open, onClose, query, onQueryChange, results, onSelect }) {    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: {
                borderRadius: '24px 24px 0 0',
                height: '80dvh',
                pb: 'env(safe-area-inset-bottom)',
            }}}
        >
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Locations</Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Stack>

                <TextField
                    fullWidth autoFocus
                    placeholder="Search by name or room code..."
                    value={query}
                    onChange={e => onQueryChange(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#f1f5f9' } }}
                />

                <List sx={{ flex: 1, overflowY: 'auto' }}>
                    {results.map(loc => (
                        <ListItem key={loc.id} onClick={() => onSelect(loc)} sx={{
                            mb: 1.5, borderRadius: '16px',
                            border: '1px solid #f1f5f9',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#f8fafc' },
                        }}>
                            <ListItemText
                                primary={<Typography sx={{ fontWeight: 700 }}>{loc.name}</Typography>}
                                secondary={loc.id}
                            />
                            <NavigationIcon sx={{ color: '#1BA39C' }} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
}