"use client";
import PersonIcon from "@mui/icons-material/Person";
import {
  Avatar,
  Box,
  Paper,
  Tab,
  Tabs,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Employee } from "../models/Employee";
import { useCallback, useState, useEffect } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
  similar: "似ている社員",
  others: "その他",
};

type TabPanelValue = keyof typeof tabPanelValue;

interface TabContentProps {
  value: TabPanelValue;
  selectedValue: TabPanelValue;
  children: React.ReactNode;
}

function TabContent({ value, selectedValue, children }: TabContentProps) {
  const isVisible = value === selectedValue;

  return (
    <Box
      role="tabpanel"
      hidden={!isVisible}
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      sx={{
        display: isVisible ? "block" : "none",
        width: "100%",
      }}
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

export type SimilarEmployee = {
  id: string;
  name: string;
  age: number;
  department: string;
  position: string;
  score: number;
};

export type EmployeeWithSimilar = Employee & {
  similarEmployees?: SimilarEmployee[];
};

export type EmployeeDetailsProps = {
  employee: EmployeeWithSimilar;
};

export function EmployeeDetails(prop: EmployeeDetailsProps) {
  const [selectedTabValue, setSelectedTabValue] = useState<TabPanelValue>("basicInfo");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const employee = prop.employee;

  console.log("EmployeeDetails rendered:", {
    selectedTab: selectedTabValue,
    isCreateFormOpen,
    employeeId: employee.id,
    employeeName: employee.name,
  });

  const {
    data: recommendations,
    error,
    isLoading,
    mutate,
  } = useSWR<Recommendation[], Error>(
    `/api/employees/${employee.id}/recommendations`,
    recommendationsFetcher
  );

  const [employees, setEmployees] = useState<Map<string, Employee>>(new Map());

  useEffect(() => {
    if (recommendations) {
      const fetchEmployees = async () => {
        const employeeMap = new Map<string, Employee>();

        for (const recommendation of recommendations) {
          if (!recommendation.isAnonymous && !employeeMap.has(recommendation.fromEmployeeId)) {
            try {
              const response = await fetch(`/api/employees/${recommendation.fromEmployeeId}`);
              if (response.ok) {
                const fromEmployee = await response.json();
                employeeMap.set(recommendation.fromEmployeeId, fromEmployee);
              }
            } catch (error) {
              console.error(
                `Failed to fetch from employee ${recommendation.fromEmployeeId}:`,
                error
              );
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
      console.log("Tab changed from", selectedTabValue, "to", newValue);
      setSelectedTabValue(newValue);
    },
    [selectedTabValue]
  );

  const handleRecommendationSuccess = () => {
    mutate();
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ p: 1, mb: 2, bgcolor: "warning.light", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          デバッグ: 選択中のタブ = {selectedTabValue}, 推薦フォーム開いている = {isCreateFormOpen.toString()}
        </Typography>
      </Box>

      <Box display={"flex"} flexDirection="column" alignItems="flex-start" gap={1}>
        <Button
          href="/"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          color="primary"
        >
          検索画面に戻る
        </Button>

        <Box display="flex" flexDirection="row" alignItems="center" p={2} gap={2}>
          <Avatar sx={{ width: 128, height: 128 }}>
            <PersonIcon sx={{ fontSize: 128 }} />
          </Avatar>
          <Typography variant="h5">{employee.name}</Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider", width: "100%", mb: 2 }}>
          <Tabs
            value={selectedTabValue}
            onChange={handleTabValueChange}
            aria-label="employee details tabs"
            sx={{
              minHeight: 48,
              "& .MuiTab-root": {
                minHeight: 48,
                fontSize: "1rem",
                fontWeight: 500,
              },
              "& .Mui-selected": {
                color: "primary.main",
                fontWeight: 600,
              },
            }}
          >
            <Tab label={tabPanelValue.basicInfo} value="basicInfo" id="tab-basicInfo" aria-controls="tabpanel-basicInfo" />
            <Tab label={tabPanelValue.recommendations} value="recommendations" id="tab-recommendations" aria-controls="tabpanel-recommendations" />
            <Tab label={tabPanelValue.similar} value="similar" id="tab-similar" aria-controls="tabpanel-similar" />
            <Tab label={tabPanelValue.others} value="others" id="tab-others" aria-controls="tabpanel-others" />
          </Tabs>
        </Box>

        <Box sx={{ p: 1, mb: 1, bgcolor: "info.light", borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            タブ状態: 基本情報={selectedTabValue === "basicInfo" ? "表示中" : "非表示"}, 推薦={selectedTabValue === "recommendations" ? "表示中" : "非表示"}, 似ている社員={selectedTabValue === "similar" ? "表示中" : "非表示"}, その他={selectedTabValue === "others" ? "表示中" : "非表示"}
          </Typography>
        </Box>

        <TabContent value="basicInfo" selectedValue={selectedTabValue}>
          <Box p={2} display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">基本情報</Typography>
            <Typography>年齢：{employee.age}歳</Typography>
          </Box>
        </TabContent>

        <TabContent value="recommendations" selectedValue={selectedTabValue}>
          <Box p={2} display="flex" flexDirection="column" gap={2}>
            <Box sx={{ p: 1, mb: 1, bgcolor: "success.light", borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                推薦タブ接続状況: データ取得中={isLoading.toString()}, エラー={error ? "あり" : "なし"}, 推薦数={recommendations ? recommendations.length : "不明"}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">推薦一覧</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  console.log("推薦作成ボタンがクリックされました");
                  setIsCreateFormOpen(true);
                }}
                sx={{
                  zIndex: 1,
                  minHeight: 40,
                  px: 2,
                  py: 1,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
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
              <Alert severity="error">推薦の取得に失敗しました: {error.message}</Alert>
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

        <TabContent value="similar" selectedValue={selectedTabValue}>
          <Box p={2} display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">似ている社員</Typography>
            {employee.similarEmployees && employee.similarEmployees.length > 0 ? (
              <ul>
                {employee.similarEmployees.map((sim: SimilarEmployee) => (
                  <li key={sim.id}>
                    {sim.name}（{sim.age}歳 / {sim.position} / {sim.department}） スコア: {sim.score}
                  </li>
                ))}
              </ul>
            ) : (
              <Typography color="text.secondary">似ている社員はいません</Typography>
            )}
          </Box>
        </TabContent>

        <TabContent value="others" selectedValue={selectedTabValue}>
          <Box p={2} display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">その他</Typography>
            <Typography>このタブには追加情報が表示されます。</Typography>
          </Box>
        </TabContent>
      </Box>

      <CreateRecommendationForm
        open={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        toEmployeeId={employee.id}
        toEmployeeName={employee.name}
        fromEmployeeId="1"
        onSuccess={handleRecommendationSuccess}
      />
    </Paper>
  );
}
