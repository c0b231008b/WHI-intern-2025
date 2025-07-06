import PersonIcon from "@mui/icons-material/Person";
import { Avatar, Box, Paper, Tab, Tabs, Typography, Button, Alert, CircularProgress } from "@mui/material";
import { Employee } from "../models/Employee";
import { useCallback, useState, useEffect } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // 戻るアイコン
import AddIcon from "@mui/icons-material/Add";
import { Recommendation } from "../models/Recommendation";
import { RecommendationCard } from "./RecommendationCard";
import { CreateRecommendationForm } from "./CreateRecommendationForm";
import useSWR from "swr";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";

const tabPanelValue = {
  basicInfo: "基本情報",
  recommendations: "推薦",
  others: "その他",
};

type TabPanelValue = keyof typeof tabPanelValue;

interface TabContentProps {
  value: TabPanelValue;
  selectedValue: TabPanelValue;
  children: React.ReactNode;
}

function TabContent({ value, selectedValue, children }: TabContentProps) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== selectedValue}
      id={`tabpanel-${value}`}
    >
      {children}
    </Box>
  );
}

const recommendationsFetcher = async (url: string): Promise<Recommendation[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations at ${url}`);
  }
  const body = await response.json();
  const decoded = t.array(t.any).decode(body);
  if (isLeft(decoded)) {
    throw new Error(`Failed to decode recommendations ${JSON.stringify(body)}`);
  }
  return decoded.right;
};

export type EmployeeDetailsProps = {
  employee: Employee;
};

export function EmployeeDetails(prop: EmployeeDetailsProps) {
  const [selectedTabValue, setSelectedTabValue] =
    useState<TabPanelValue>("basicInfo");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const employee = prop.employee;

  const { data: recommendations, error, isLoading, mutate } = useSWR<Recommendation[], Error>(
    `/api/employees/${employee.id}/recommendations`,
    recommendationsFetcher
  );

  const [employees, setEmployees] = useState<Map<string, Employee>>(new Map());

  useEffect(() => {
    if (recommendations) {
      const fetchEmployees = async () => {
        const employeeMap = new Map<string, Employee>();
        
        for (const recommendation of recommendations) {
          // 推薦者情報を取得
          if (!recommendation.isAnonymous && !employeeMap.has(recommendation.fromEmployeeId)) {
            try {
              const response = await fetch(`/api/employees/${recommendation.fromEmployeeId}`);
              if (response.ok) {
                const fromEmployee = await response.json();
                employeeMap.set(recommendation.fromEmployeeId, fromEmployee);
              }
            } catch (error) {
              console.error(`Failed to fetch from employee ${recommendation.fromEmployeeId}:`, error);
            }
          }
        }
        
        setEmployees(employeeMap);
      };

      fetchEmployees();
    }
  }, [recommendations]);

  const handleTabValueChange = useCallback(
    (event: React.SyntheticEvent, newValue: TabPanelValue) => {
      setSelectedTabValue(newValue);
    },
    []
  );

  const handleRecommendationSuccess = () => {
    mutate(); // 推薦一覧を再取得
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box
        display={"flex"}
        flexDirection="column"
        alignItems="flex-start"
        gap={1}
      >
        <Button
          href="/"
          variant="outlined"
          startIcon={<ArrowBackIcon />} 
          color="primary"
        >
          検索画面に戻る
        </Button>
        
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          p={2}
          gap={2}
        >
          <Avatar sx={{ width: 128, height: 128 }}>
            <PersonIcon sx={{ fontSize: 128 }} />
          </Avatar>
          <Typography variant="h5">{employee.name}</Typography>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: "divider", width: "100%" }}>
          <Tabs value={selectedTabValue} onChange={handleTabValueChange}>
            <Tab label={tabPanelValue.basicInfo} value={"basicInfo"} />
            <Tab label={tabPanelValue.recommendations} value={"recommendations"} />
            <Tab label={tabPanelValue.others} value={"others"} />
          </Tabs>
        </Box>

        <TabContent value={"basicInfo"} selectedValue={selectedTabValue}>
          <Box p={2} display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">基本情報</Typography>
            <Typography>年齢：{employee.age}歳</Typography>
          </Box>
        </TabContent>

        <TabContent value={"recommendations"} selectedValue={selectedTabValue}>
          <Box p={2} display="flex" flexDirection="column" gap={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">推薦一覧</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateFormOpen(true)}
              >
                推薦を作成
              </Button>
            </Box>

            {isLoading && (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error">
                推薦の取得に失敗しました: {error.message}
              </Alert>
            )}

            {recommendations && recommendations.length > 0 ? (
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="subtitle1" color="text.secondary">
                  {recommendations.length}件の推薦があります
                </Typography>
                {recommendations.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    fromEmployee={employees.get(recommendation.fromEmployeeId)}
                    toEmployee={employee}
                    showFromEmployee={true}
                    showToEmployee={false}
                  />
                ))}
              </Box>
            ) : (
              <Box display="flex" justifyContent="center" p={3}>
                <Typography color="text.secondary">
                  {isLoading ? "読み込み中..." : "まだ推薦がありません"}
                </Typography>
              </Box>
            )}
          </Box>
        </TabContent>

        <TabContent value={"others"} selectedValue={selectedTabValue}>
          <Box p={2} display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">その他</Typography>
          </Box>
        </TabContent>
      </Box>

      <CreateRecommendationForm
        open={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        toEmployeeId={employee.id}
        toEmployeeName={employee.name}
        fromEmployeeId="1" // 実際のユーザーIDに置き換える（仮にID "1" を使用）
        onSuccess={handleRecommendationSuccess}
      />
    </Paper>
  );
}
