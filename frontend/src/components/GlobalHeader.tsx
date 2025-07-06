"use client";
import { AppBar, Box, Toolbar, Typography, IconButton } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";

export interface GlobalHeaderProps {
  title: string;
}

export function GlobalHeader({ title }: GlobalHeaderProps) {
  const { mode, toggleTheme } = useTheme();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar
          variant="dense"
          sx={{
            background: mode === "light" 
              ? "linear-gradient(45deg, rgb(0, 91, 172), rgb(94, 194, 198))"
              : "linear-gradient(45deg, rgb(25, 118, 210), rgb(76, 175, 80))",
          }}
        >
          <Link href="/">
            <PeopleIcon fontSize={"large"} sx={{ mr: 2, color: "white" }} />
          </Link>
          <Link href="/">
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1, color: "white" }}>
              {title}
            </Typography>
          </Link>
          <IconButton 
            onClick={toggleTheme} 
            color="inherit"
            sx={{ color: "white" }}
          >
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
