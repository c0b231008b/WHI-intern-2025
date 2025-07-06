"use client";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  Avatar,
  IconButton,
  Collapse,
  Button,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ThumbUp as ThumbUpIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { Recommendation, CategoryLabels, ImpactLabels, ImpactColors } from "../models/Recommendation";
import { Employee } from "../models/Employee";

interface RecommendationCardProps {
  recommendation: Recommendation;
  fromEmployee?: Employee;
  toEmployee?: Employee;
  showFromEmployee?: boolean;
  showToEmployee?: boolean;
}

export function RecommendationCard({
  recommendation,
  fromEmployee,
  toEmployee,
  showFromEmployee = true,
  showToEmployee = false,
}: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getImpactColor = (impact: Recommendation["impact"]) => {
    return ImpactColors[impact];
  };

  return (
    <Card sx={{ mb: 2, position: "relative" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {recommendation.title}
            </Typography>
            
            <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
              <Chip
                label={CategoryLabels[recommendation.category]}
                size="small"
                variant="outlined"
                color="primary"
              />
              <Chip
                label={ImpactLabels[recommendation.impact]}
                size="small"
                sx={{
                  backgroundColor: getImpactColor(recommendation.impact),
                  color: "white",
                  fontWeight: "bold",
                }}
              />
            </Box>

            {recommendation.tags.length > 0 && (
              <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
                {recommendation.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.7rem" }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
            {recommendation.description}
          </Typography>
        </Collapse>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {showFromEmployee && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: "0.8rem" }}>
                  {recommendation.isAnonymous ? "?" : fromEmployee?.name?.charAt(0) || "?"}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {recommendation.isAnonymous ? "匿名" : fromEmployee?.name || "不明"}
                </Typography>
              </Box>
            )}
            
            {showToEmployee && toEmployee && (
              <>
                <Typography variant="caption" color="text.secondary">
                  →
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: "0.8rem" }}>
                    {toEmployee.name.charAt(0)}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    {toEmployee.name}
                  </Typography>
                </Box>
              </>
            )}
          </Box>

          <Typography variant="caption" color="text.secondary">
            {formatDate(recommendation.createdAt)}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ pt: 0 }}>
        <Button
          size="small"
          startIcon={<ThumbUpIcon />}
          onClick={() => {
            // TODO: いいね機能を実装
            console.log("Like recommendation:", recommendation.id);
          }}
        >
          いいね
        </Button>
      </CardActions>
    </Card>
  );
} 