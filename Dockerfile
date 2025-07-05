FROM mcr.microsoft.com/devcontainers/base:jammy

# Node.js, AWS CLI, npm, jq などのツールをインストール
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs awscli jq git vim \
    && npm install -g npm \
    && npm install -g tsx next

# 作業ディレクトリ
WORKDIR /workspace

# プロジェクト全体をコピー
COPY . .

# 各ディレクトリで依存インストール
RUN cd backend-ts && npm ci && cd - && \
    cd frontend && npm ci && cd - && \
    cd cdk-ts && npm ci && cd -

# frontend と backend を同時に起動
CMD ["bash", "-c", "npm --prefix backend-ts run dev & npm --prefix frontend run dev && wait"]
