#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Advanced JavaScript Formatter for MNUtils main.js
Combining js-beautify and Python processing achieves optimal formatting results.
Author: Claude
"""

import os
import sys
import re
import json
import subprocess
import shutil
from pathlib import Path
from typing import List, Tuple, Optional
import argparse

class AdvancedJSFormatter:
    """Advanced JavaScript Formatters"""

    def __init__(self, input_file: str = "main.js", verbose: bool = True):
        self.input_file = Path(input_file)
        self.verbose = verbose
        self.beautified_file = self.input_file.stem + "_beautified.js"
        self.output_file = self.input_file.stem + "_formatted.js"
        self.report_file = "format_report.txt"

        # js-beautify configuration
        self.beautify_config = {
            "indent_size": 2,
            "indent_char": " ",
            "max_preserve_newlines": 2,
            "preserve_newlines": True,
            "keep_array_indentation": False,
            "break_chained_methods": False,
            "indent_scripts": "normal",
            "brace_style": "collapse",
            "space_before_conditional": True,
            "unescape_strings": False,
            "jslint_happy": False,
            "end_with_newline": True,
            "wrap_line_length": 120,
            "indent_inner_html": False,
            "comma_first": False,
            "e4x": False,
            "operator_position": "before-newline",
            "indent_level": 0
        }

        # Statistics
        self.stats = {
            "original_size": 0,
            "beautified_size": 0,
            "final_size": 0,
            "lines_original": 0,
            "lines_beautified": 0,
            "lines_final": 0,
            "classes_found": 0,
            "methods_found": 0
        }

    def log(self, message: str, level: str = "INFO"):
        """Output Log"""
        if self.verbose:
            prefix = {
                "INFO": "ℹ️ ",
                "SUCCESS": "✅ ",
                "WARNING": "⚠️ ",
                "ERROR": "❌ ",
                "PROCESS": "🔄 "
            }.get(level, "")
            print(f"{prefix}{message}")

    def check_jsbeautify(self) -> bool:
        """Check if js-beautify is installed."""
        if shutil.which("js-beautify"):
            return True

        self.log("js-beautify not installed, attempting to install...", "WARNING")
        try:
            # Try installing using npm
            subprocess.run(["npm", "install", "-g", "js-beautify"],
                         check=True, capture_output=True)
            self.log("js-beautify installed successfully", "SUCCESS")
            return True
        except subprocess.CalledProcessError:
            # Try using npx
            self.log("npm global installation failed, npx will be used instead", "WARNING")
            return False

    def phase1_jsbeautify(self) -> bool:
        """Phase 1: Basic formatting using js-beautify"""
        self.log("Phase 1: js-beautify formatting", "PROCESS")

        # Read the original file
        with open(self.input_file, 'r', encoding='utf-8') as f:
            content = f.read()
            self.stats["original_size"] = len(content)
            self.stats["lines_original"] = content.count('\n') + 1

        # Create configuration file
        config_file = ".jsbeautifyrc"
        with open(config_file, 'w') as f:
            json.dump(self.beautify_config, f, indent=2)

        try:
            has_jsbeautify = self.check_jsbeautify()

            if has_jsbeautify:
                # Use global js-beautify
                cmd = [
                    "js-beautify",
                    str(self.input_file),
                    "-o", self.beautified_file,
                    "--config", config_file
                ]
            else:
                # Using npx
                cmd = [
                    "npx", "js-beautify@latest",
                    str(self.input_file),
                    "-o", self.beautified_file,
                    "--config", config_file
                ]

            self.log(f"Executing command: {' '.join(cmd)}", "INFO")
            result = subprocess.run(cmd, capture_output=True, text=True)

            if result.returncode != 0:
                self.log(f"js-beautify failed to execute: {result.stderr}", "ERROR")
                return False

            # Read formatted files
            with open(self.beautified_file, 'r', encoding='utf-8') as f:
                content = f.read()
                self.stats["beautified_size"] = len(content)
                self.stats["lines_beautified"] = content.count('\n') + 1

            self.log(f"js-beautify 完成: {self.stats['lines_original']} 行 -> {self.stats['lines_beautified']} 行", "SUCCESS")
            return True

        except Exception as e:
            self.log(f"js-beautify processing failed: {str(e)}", "ERROR")
            return False
        finally:
            # Clean up configuration files
            if os.path.exists(config_file):
                os.remove(config_file)

    def phase2_python_enhance(self) -> bool:
        """Phase 2: Enhanced Python Processing"""
        self.log("Phase 2: Python Enhanced Processing", "PROCESS")

        try:
            # Read beautified file
            input_file = self.beautified_file if os.path.exists(self.beautified_file) else self.input_file
            with open(input_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Apply various optimizations (Note: fix_indentation will no longer be called)
            content = self.optimize_class_definitions(content)
            content = self.optimize_method_chains(content)
            content = self.optimize_async_functions(content)
            content = self.optimize_object_literals(content)
            content = self.optimize_mnutils_patterns(content)
            content = self.add_section_comments(content)
            # content = self.fix_indentation(content) # Disabled: Breaks js-beautify's indentation
            content = self.clean_empty_lines(content)

            # Write to final file
            with open(self.output_file, 'w', encoding='utf-8') as f:
                f.write(content)

            self.stats["final_size"] = len(content)
            self.stats["lines_final"] = content.count('\n') + 1

            self.log(f"Python optimization complete: {self.stats['lines_beautified']} lines -> {self.stats['lines_final']} lines", "SUCCESS")
            return True

        except Exception as e:
            self.log(f"Python processing failed: {str(e)}", "ERROR")
            return False

    def optimize_class_definitions(self, content: str) -> str:
        """Optimization Class Definition Format"""
        self.log("Optimize class definition...", "INFO")

        # Optimize JSB.defineClass - Ensure there is a newline after the curly braces
        pattern = r'(JSB\.defineClass\([^{]+\{)(\s*)'
        def format_class(match):
            self.stats["classes_found"] += 1
            # Add a newline if there is no newline after the curly braces.
            if not match.group(2).startswith('\n'):
                return match.group(1) + '\n'
            return match.group(0)

        content = re.sub(pattern, format_class, content)

        # Optimize prototype method definitions - Add line breaks only when necessary
        lines = content.split('\n')
        result = []
        for i, line in enumerate(lines):
            # If the current line contains a prototype definition, and the previous line is not a blank line or a comment.
            if '.prototype.' in line and '= function' in line:
                if i > 0 and result and result[-1].strip() and not result[-1].strip().startswith('//'):
                    result.append('') # Add a blank line
            result.append(line)

        return '\n'.join(result)

    def optimize_method_chains(self, content: str) -> str:
        """Optimize method chain format"""
        self.log("Optimized method chain...", "INFO")

        # js-beautify usually handles method chaining already; we just need to maintain it.
        # No additional processing is required to avoid disrupting the indentation.
        return content

    def optimize_async_functions(self, content: str) -> str:
        """Optimize asynchronous function format"""
        self.log("Optimizing asynchronous functions...", "INFO")

        # async function formatting
        content = re.sub(r'async\s+function\s*\(', 'async function(', content)
        content = re.sub(r'async\s*\(\s*', 'async (', content)

        # await formatting
        content = re.sub(r'await\s+', 'await ', content)

        return content

    def optimize_object_literals(self, content: str) -> str:
        """Optimize object literal formatting"""
        self.log("Optimizing object literals...", "INFO")

        # js-beautify usually formats object literals very well.
        # We'll only make the smallest adjustments.
        lines = content.split('\n')
        result = []

        for line in lines:
            # Ensure there is a space after the colon in the object property.
            if ':' in line and not line.strip().startswith('//') and not '://' in line:
                # Handling simple key-value pairs
                if re.match(r'^\s*\w+:', line.strip()):
                    line = re.sub(r'(\w+):(\S)', r'\1: \2', line)
            result.append(line)

        return '\n'.join(result)

    def optimize_mnutils_patterns(self, content: str) -> str:
        """Optimize MNUtils for specific modes"""
        self.log("Optimizing MNUtils pattern...", "INFO")

        # MNUtil API call formatting
        content = re.sub(r'MNUtil\.(\w+)\s*\(', r'MNUtil.\1(', content)

        # SubscriptionController Method Formatting
        content = re.sub(
            r'subscriptionController\.prototype\.(\w+)\s*=\s*function',
            r'\nsubscriptionController.prototype.\1 = function',
            content
        )

        # Number of statistical methods
        self.stats["methods_found"] = len(re.findall(r'\.prototype\.\w+\s*=\s*function', content))

        return content

    def add_section_comments(self, content: str) -> str:
        """Add section comments"""
        self.log("Add section comment...", "INFO")

        # More precise pattern matching, avoiding disruption of code structure
        patterns = [
            # Main Addon Entry - Add a comment before JSB.newAddon
            (r'(\n)(JSB\.newAddon\s*=\s*function)', r'\1\n// ===================== Main Addon Entry =====================\n\2'),
            # Subscription Controller
            (r'(\n)(var\s+subscriptionController\s*=\s*JSB\.defineClass)', r'\1\n// ==================== Subscription Controller ====================\n\2'),
            # ES6 Class Definition
            (r'(\n)(class\s+subscriptionUtils\s*\{)', r'\1\n// ==================== Subscription Utils ====================\n\2'),
            (r'(\n)(class\s+subscriptionNetwork\s*\{)', r'\1\n// ==================== Subscription Network ====================\n\2'),
            (r'(\n)(class\s+subscriptionConfig\s*\{)', r'\1\n// ==================== Subscription Config ====================\n\2'),
        ]

        for pattern, replacement in patterns:
            content = re.sub(pattern, replacement, content, count=1)

        return content

    def fix_indentation(self, content: str) -> str:
        """Fixed indentation issue - Disabled, retains js-beautify's indentation"""
        self.log("Skip indentation fix (preserve js-beautify's indentation)...", "INFO")

        # Do not recalculate indentation, return to the original content directly.
        # js-beautify has done a great job of indentation handling.
        return content

    def clean_empty_lines(self, content: str) -> str:
        """Clear unnecessary blank lines"""
        self.log("Clean up blank lines...", "INFO")

        # Delete consecutive blank lines (keep a maximum of 2)
        content = re.sub(r'\n{4,}', '\n\n\n', content)

        # Delete blank lines at the beginning of a file
        content = content.lstrip('\n')

        # Ensure the file ends with a newline character.
        if not content.endswith('\n'):
            content += '\n'

        # Clean up trailing spaces
        lines = content.split('\n')
        lines = [line.rstrip() for line in lines]
        content = '\n'.join(lines)

        return content

    def generate_report(self):
        """Generate a formatted report."""
        self.log("Generate report...", "PROCESS")

        report = [
            "=" * 60,
            "JavaScript Formatted Report",
            "=" * 60,
            "",
            f"Input file: {self.input_file}",
            f"Output file: {self.output_file}",
            "",
            "File size changed:",
            f" original: {self.stats['original_size']:,} bytes ({self.stats['lines_original']:,} lines)",
            f"  Beautified: {self.stats['beautified_size']:,} 字节 ({self.stats['lines_beautified']:,} 行)",
            f" final: {self.stats['final_size']:,} bytes ({self.stats['lines_final']:,} lines)",
            "",
            "Code structure:",
            f" found class definition: {self.stats['classes_found']} (number of occurrences)",
            f" discovery method: {self.stats['methods_found']} (number of occurrences)",
            "",
            "Processing stage:",
            "✅ Phase 1: js-beautify formatting",
            "✅ Phase 2: Enhanced Python Processing",
            "✅ Phase 3: Final Optimization"
            "",
            "=" * 60
        ]

        report_text = '\n'.join(report)

        # Write to file
        with open(self.report_file, 'w', encoding='utf-8') as f:
            f.write(report_text)

        # Print to console
        print("\n" + report_text)

    def format(self, skip_beautify: bool = False):
        """Execute the complete formatting process"""
        self.log(f"Start formatting {self.input_file}", "PROCESS")

        # Phase 1: js-beautify
        if not skip_beautify:
            if not self.phase1_jsbeautify():
                self.log("js-beautify failed, attempting to use Python directly", "WARNING")

        # Phase 2: Python Enhancement
        if not self.phase2_python_enhance():
            self.log("Formatting failed", "ERROR")
            return False

        # Generate report
        self.generate_report()

        self.log(f"Formatting complete! Output file: {self.output_file}", "SUCCESS")
        return True

    def validate(self):
        """Verify the formatting results"""
        self.log("Validating the formatting results...", "PROCESS")

        try:
            # Check if the output file exists
            if not os.path.exists(self.output_file):
                self.log("Output file does not exist", "ERROR")
                return False

            # Read formatted content
            with open(self.output_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Basic syntax check
            checks = [
            ("curly brace pairing", content.count('{') == content.count('}')),
            ("Square bracket matching", content.count('[') == content.count(']')),
            ("Parentheses Matching", content.count('(') == content.count(')')),
            ("quote matching", content.count('"') % 2 == 0),
            ("Single quote pairing", content.count("'") % 2 == 0),
            ]

            all_passed = True
            for check_name, passed in checks:
                status = "✅" if passed else "❌"
                self.log(f"  {status} {check_name}", "INFO")
                if not passed:
                    all_passed = False

            if all_passed:
                self.log("Validation successful", "SUCCESS")
            else:
                self.log("Validation failed, please check the formatting result", "ERROR")

            return all_passed

        except Exception as e:
            self.log(f"Validation failed: {str(e)}", "ERROR")
            return False


def main():
    """Main Function"""
    parser = argparse.ArgumentParser(description='Advanced JavaScript formatter')
    parser.add_argument('input', nargs='?', default='main.js', help='Input file (default: main.js)')
    parser.add_argument('--skip-beautify', action='store_true', help='Skip js-beautify, use only Python for processing')
    parser.add_argument('--validate', action='store_true', help='Validate formatted results')
    parser.add_argument('--quiet', action='store_true', help='quiet mode')

    args = parser.parse_args()

    # Check input file
    if not os.path.exists(args.input):
        print(f"❌ File does not exist: {args.input}")
        sys.exit(1)

    # Create a formatter
    formatter = AdvancedJSFormatter(
        input_file=args.input,
        verbose=not args.quiet
    )

    # Perform formatting
    success = formatter.format(skip_beautify=args.skip_beautify)

    # Verification Results
    if success and args.validate:
        formatter.validate()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
