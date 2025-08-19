#!/usr/bin/env python3
"""
تشغيل سريع للواجهة المستقلة
Quick Launch for Standalone Interface
"""

import sys
from pathlib import Path

# إضافة المجلد الحالي إلى مسار Python
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

if __name__ == "__main__":
    from run import run_standalone
    run_standalone()


