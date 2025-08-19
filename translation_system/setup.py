"""
نظام الترجمة المكتبي - ملف التثبيت
Translation Office System - Setup Script
"""

from setuptools import setup, find_packages
from pathlib import Path

# قراءة ملف README
this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text(encoding='utf-8')

# قراءة متطلبات التثبيت
requirements = []
requirements_file = this_directory / "requirements.txt"
if requirements_file.exists():
    requirements = requirements_file.read_text().splitlines()

setup(
    name="translation-office-system",
    version="1.0.0",
    author="Translation Office Team",
    author_email="info@translation-office.com",
    description="نظام متكامل لإدارة الترجمة المكتبية",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/translation-office/system",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Legal Industry",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Office/Business",
        "Topic :: Text Processing :: Linguistic",
    ],
    python_requires=">=3.8",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=6.0",
            "pytest-cov>=2.0",
            "black>=21.0",
            "flake8>=3.8",
            "mypy>=0.800",
        ],
    },
    entry_points={
        "console_scripts": [
            "translation-system=main:main",
            "translation-server=verification_server:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["*.md", "*.txt", "*.html", "*.css", "*.js"],
    },
    keywords="translation, office, arabic, pdf, word, google-drive, qr-code",
    project_urls={
        "Bug Reports": "https://github.com/translation-office/system/issues",
        "Source": "https://github.com/translation-office/system",
        "Documentation": "https://docs.translation-office.com",
    },
)



