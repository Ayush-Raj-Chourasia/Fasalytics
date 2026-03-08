"""
CropHealthCNNLSTM model architecture.
Must match EXACTLY the architecture used when training crop_health_model.pth.

Actual architecture recovered from checkpoint state_dict keys:
  cnn: Sequential(Linear→BN→ReLU→Dropout→Linear→BN→ReLU→Dropout→Linear)
  lstm: 2-layer LSTM, input=256, hidden=256
  classifier: Sequential(Linear→ReLU→Dropout→Linear)
"""

import torch
import torch.nn as nn


class CropHealthCNNLSTM(nn.Module):
    def __init__(self, input_size=208, hidden_size=256, num_classes=2, sequence_length=10):
        super(CropHealthCNNLSTM, self).__init__()

        self.sequence_length = sequence_length
        self.hidden_size = hidden_size

        # Dense feature extractor — matches training architecture
        # Keys in checkpoint: cnn.0, cnn.1, cnn.4, cnn.5, cnn.8
        self.cnn = nn.Sequential(
            nn.Linear(input_size, 1024),   # cnn.0
            nn.BatchNorm1d(1024),          # cnn.1
            nn.ReLU(),                     # cnn.2
            nn.Dropout(0.3),               # cnn.3
            nn.Linear(1024, 512),          # cnn.4
            nn.BatchNorm1d(512),           # cnn.5
            nn.ReLU(),                     # cnn.6
            nn.Dropout(0.3),               # cnn.7
            nn.Linear(512, 256),           # cnn.8
        )

        # LSTM: input_size=256 (cnn output), hidden_size=256
        self.lstm = nn.LSTM(
            input_size=256,
            hidden_size=hidden_size,
            num_layers=2,
            batch_first=True,
            dropout=0.3,
        )

        # Classifier — keys: classifier.0, classifier.3
        self.classifier = nn.Sequential(
            nn.Linear(hidden_size, 256),   # classifier.0
            nn.ReLU(),                     # classifier.1
            nn.Dropout(0.3),               # classifier.2
            nn.Linear(256, num_classes),   # classifier.3
        )

    def forward(self, x):
        # x: (batch, sequence_length, input_size)
        batch_size, seq_len, _ = x.shape

        # Apply dense feature extractor to each timestep
        x_flat = x.view(batch_size * seq_len, -1)   # (batch*seq, input_size)
        feat = self.cnn(x_flat)                      # (batch*seq, 256)
        feat = feat.view(batch_size, seq_len, -1)    # (batch, seq, 256)

        # LSTM
        lstm_out, _ = self.lstm(feat)
        x = lstm_out[:, -1, :]  # last timestep

        # Classify
        return self.classifier(x)
