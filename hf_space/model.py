"""
CropHealthCNNLSTM model architecture.
Must match EXACTLY the architecture used when training crop_health_model.pth.
"""

import torch
import torch.nn as nn


class CropHealthCNNLSTM(nn.Module):
    def __init__(self, input_size=208, hidden_size=128, num_classes=2, sequence_length=10):
        super(CropHealthCNNLSTM, self).__init__()

        self.sequence_length = sequence_length
        self.hidden_size = hidden_size

        # CNN feature extractor
        self.conv1 = nn.Conv1d(in_channels=1, out_channels=32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv1d(in_channels=32, out_channels=64, kernel_size=3, padding=1)
        self.pool = nn.MaxPool1d(kernel_size=2, stride=2)
        self.dropout_cnn = nn.Dropout(0.3)

        # Calculate CNN output size
        cnn_out_size = (input_size // 2) * 64

        # LSTM
        self.lstm = nn.LSTM(
            input_size=cnn_out_size,
            hidden_size=hidden_size,
            num_layers=2,
            batch_first=True,
            dropout=0.3,
        )

        # Classifier
        self.fc1 = nn.Linear(hidden_size, 64)
        self.fc2 = nn.Linear(64, num_classes)
        self.relu = nn.ReLU()
        self.dropout_fc = nn.Dropout(0.5)

    def forward(self, x):
        # x: (batch, sequence_length, input_size)
        batch_size = x.size(0)
        seq_len = x.size(1)

        # Reshape for CNN: (batch * seq_len, 1, input_size)
        x = x.view(batch_size * seq_len, 1, -1)
        x = self.relu(self.conv1(x))
        x = self.relu(self.conv2(x))
        x = self.pool(x)
        x = self.dropout_cnn(x)

        # Flatten CNN output: (batch * seq_len, cnn_out_size)
        x = x.view(batch_size * seq_len, -1)

        # Reshape for LSTM: (batch, seq_len, cnn_out_size)
        x = x.view(batch_size, seq_len, -1)

        # LSTM
        lstm_out, _ = self.lstm(x)
        x = lstm_out[:, -1, :]  # last timestep

        # Classifier
        x = self.relu(self.fc1(x))
        x = self.dropout_fc(x)
        x = self.fc2(x)
        return x
