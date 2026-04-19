"use client";

import { useState } from "react";
import { Lock, User, ShieldCheck, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions";
import { Box, Container, Typography, TextField, Button, InputAdornment, Paper, Alert } from "@mui/material";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const res = await loginAction(username, password);
    
    if (res.success) {
      if (res.role === "superadmin") {
        router.push("/admin");
      } else {
        router.push(`/admin/${res.slug}`);
      }
    } else {
      setError(res.error || "Invalid credentials");
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f8f9fa', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      p: 3
    }}>
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{ w: 40, h: 40, bgcolor: '#22c55e', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'white', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)' }}>
              <Utensils size={24} style={{ margin: 'auto' }} />
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.75rem', tracking: '-0.02em', color: '#1c1c1c' }}>
              Menu<Box component="span" sx={{ color: '#22c55e' }}>Go</Box>
            </Typography>
          </Box>
          
          <Box sx={{ 
            w: 64, h: 64, 
            bgcolor: '#22c55e', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mx: 'auto',
            mb: 2,
            boxShadow: '0 8px 16px rgba(34, 197, 94, 0.2)',
            color: 'white'
          }}>
            <ShieldCheck size={32} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1c1c1c', mb: 1 }}>
            Admin Portal
          </Typography>
          <Typography sx={{ color: '#666', fontWeight: 500 }}>
            Sign in to manage your restaurant
          </Typography>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            borderRadius: 4, 
            border: '1px solid', 
            borderColor: 'divider',
            boxShadow: '0 10px 40px rgba(0,0,0,0.04)'
          }}
        >
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {error && (
              <Alert severity="error" variant="filled" sx={{ borderRadius: 2, fontWeight: 700 }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Username"
              fullWidth
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={20} color="#22c55e" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3 }
                }
              }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color="#22c55e" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3 }
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
              variant="contained"
              sx={{
                bgcolor: '#22c55e',
                color: 'white',
                py: 2,
                borderRadius: 3,
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)',
                '&:hover': {
                  bgcolor: '#16a34a',
                  boxShadow: '0 10px 28px rgba(34, 197, 94, 0.4)',
                }
              }}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
