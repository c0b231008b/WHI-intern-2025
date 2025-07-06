"use client";
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import { Recommendation, RecommendationCategory, RecommendationImpact, CategoryLabels, ImpactLabels } from "../models/Recommendation";

interface CreateRecommendationFormProps {
  open: boolean;
  onClose: () => void;
  toEmployeeId: string;
  toEmployeeName: string;
  fromEmployeeId: string;
  onSuccess: () => void;
}

export function CreateRecommendationForm({
  open,
  onClose,
  toEmployeeId,
  toEmployeeName,
  fromEmployeeId,
  onSuccess,
}: CreateRecommendationFormProps) {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: Recommendation['category'];
    impact: Recommendation['impact'];
    isAnonymous: boolean;
    tags: string[];
  }>({
    title: "",
    description: "",
    category: RecommendationCategory.KNOWLEDGE_SHARING,
    impact: RecommendationImpact.MEDIUM,
    isAnonymous: false,
    tags: [],
  });
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("タイトルと説明は必須です");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // id, createdAtはバックエンドで自動生成されるため送信しない
      const { title, description, category, impact, isAnonymous, tags } = formData;
      const recommendationData = {
        fromEmployeeId,
        toEmployeeId,
        title,
        description,
        category,
        impact,
        isAnonymous,
        tags,
      };

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recommendationData),
      });

      if (!response.ok) {
        throw new Error("推薦の作成に失敗しました");
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: RecommendationCategory.KNOWLEDGE_SHARING,
      impact: RecommendationImpact.MEDIUM,
      isAnonymous: false,
      tags: [],
    });
    setNewTag("");
    setError("");
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>推薦を作成 - {toEmployeeName}さん</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="タイトル"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            fullWidth
            required
          />

          <TextField
            label="説明"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            multiline
            rows={4}
            fullWidth
            required
            placeholder="具体的な貢献内容や影響について詳しく記述してください"
          />

          <FormControl fullWidth>
            <InputLabel>カテゴリ</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Recommendation['category'] }))}
              label="カテゴリ"
            >
              {Object.entries(CategoryLabels).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>影響度</InputLabel>
            <Select
              value={formData.impact}
              onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value as Recommendation['impact'] }))}
              label="影響度"
            >
              {Object.entries(ImpactLabels).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              タグ
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <TextField
                size="small"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="タグを入力"
                sx={{ flexGrow: 1 }}
              />
              <Button variant="outlined" onClick={handleAddTag} disabled={!newTag.trim()}>
                追加
              </Button>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                />
              ))}
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isAnonymous}
                onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
              />
            }
            label="匿名で投稿する"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          キャンセル
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
        >
          {isSubmitting ? "作成中..." : "推薦を作成"}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 