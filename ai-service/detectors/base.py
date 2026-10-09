from abc import ABC, abstractmethod
from typing import List, Dict, Any
import numpy as np

class BaseDetector(ABC):
    @abstractmethod
    def detect(self, frame: np.ndarray, **kwargs) -> List[Dict[str, Any]]:
        pass
