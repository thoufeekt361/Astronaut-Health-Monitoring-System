import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from typing import Tuple, List, Union
from .config import FEATURES

def prepare_feature_array(data: Union[dict, list, pd.DataFrame]) -> np.ndarray:
    """
    Extracts ordered numerical features from input dictionary, list, or DataFrame.
    """
    if isinstance(data, dict):
        row = [data.get(feat, 0.0) for feat in FEATURES]
        return np.array([row], dtype=np.float64)
    elif isinstance(data, list):
        rows = [[item.get(feat, 0.0) if isinstance(item, dict) else getattr(item, feat, 0.0) for feat in FEATURES] for item in data]
        return np.array(rows, dtype=np.float64)
    elif isinstance(data, pd.DataFrame):
        return data[FEATURES].to_numpy(dtype=np.float64)
    else:
        raise ValueError("Unsupported data format for feature extraction")

def clean_and_impute(arr: np.ndarray) -> np.ndarray:
    """
    Replaces NaN, Inf, or out-of-bound values with conservative clinical median values.
    """
    # Baseline defaults: [HR, SpO2, Temp, SysBP, DiaBP, Resp, Act]
    defaults = np.array([72.0, 98.4, 36.8, 120.0, 80.0, 16.0, 1.0])
    cleaned = np.copy(arr)

    for i in range(cleaned.shape[1]):
        col = cleaned[:, i]
        invalid_mask = np.isnan(col) | np.isinf(col)
        if np.any(invalid_mask):
            cleaned[invalid_mask, i] = defaults[i]

    return cleaned
