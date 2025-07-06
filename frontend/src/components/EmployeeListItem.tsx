import PersonIcon from "@mui/icons-material/Person";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { Avatar, Box, Card, CardContent, Typography, Button, Chip } from "@mui/material";
import { Employee } from "../models/Employee";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Recommendation } from "../models/Recommendation";

export type EmployeeListItemProps = {
  employee: Employee;
};

export function EmployeeListItem(prop: EmployeeListItemProps) {
  const employee = prop.employee;
  const [recommendationCount, setRecommendationCount] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);

  useEffect(() => {
    const fetchRecommendationCount = async () => {
      try {
        const response = await fetch(`/api/employees/${employee.id}/recommendations`);
        if (response.ok) {
          const recommendations: Recommendation[] = await response.json();
          setRecommendationCount(recommendations.length);
        }
      } catch (error) {
        console.error("Failed to fetch recommendation count:", error);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchRecommendationCount();
  }, [employee.id]);

  return (
    <Card
      sx={{
        transition: "background-color 0.2s",
        "&:hover": {
          backgroundColor: "#f0f0f0",
        },
      }}
    >
      <CardContent>
        <Box display="flex" flexDirection="row" alignItems="center" gap={2}>
          <Link
            href={`/employee/${employee.id}`}
            style={{ textDecoration: "none", flexGrow: 1 }}
          >
            <Box display="flex" flexDirection="row" alignItems="center" gap={2}>
              <Avatar sx={{ width: 48, height: 48 }}>
                <PersonIcon sx={{ fontSize: 48 }} />
              </Avatar>
              <Box display="flex" flexDirection="column">
                <Typography variant="h6">{employee.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {employee.age}歳
                </Typography>
              </Box>
            </Box>
          </Link>
          
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
            <Chip
              icon={<ThumbUpIcon />}
              label={isLoadingCount ? "..." : `${recommendationCount}件の推薦`}
              color={recommendationCount > 0 ? "primary" : "default"}
              variant={recommendationCount > 0 ? "filled" : "outlined"}
              size="small"
            />
            <Link href="/recommendations" style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ThumbUpIcon />}
              >
                推薦を見る
              </Button>
            </Link>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
